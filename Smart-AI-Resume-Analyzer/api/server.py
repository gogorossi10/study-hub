"""
Student Hub API — FastAPI layer over existing Python tools.
"""
from __future__ import annotations

import io
import json
import os
import sys
from datetime import datetime
from typing import Any, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from config.database import (
    init_database,
    get_database_connection,
    get_all_notes,
    add_or_update_note,
    delete_note_by_id,
    get_daily_checkpoint_by_date,
    save_daily_checkpoint_data,
    get_all_diary_entries,
    add_diary_entry_data,
    delete_diary_entry_by_id,
)
from config.job_roles import JOB_ROLES
from jobs.companies import get_featured_companies, get_market_insights
from jobs.job_portals import JobPortal
from jobs.job_tracker_manager import (
    add_job_application,
    delete_job_application,
    get_all_applications,
    get_tracker_metrics,
    init_job_tracker_table,
    update_job_stage,
)
from jobs.suggestions import EXPERIENCE_RANGES, JOB_SUGGESTIONS, JOB_TYPES, LOCATION_SUGGESTIONS, SALARY_RANGES
from utils.document_summarizer import DocumentSummarizer
from utils.resume_analyzer import ResumeAnalyzer
from utils.resume_builder import ResumeBuilder
from academic.sgpa_engine import SGPAStudyEngine

app = FastAPI(title="Student Hub API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

summarizer = DocumentSummarizer()
analyzer = ResumeAnalyzer()
builder = ResumeBuilder()
job_portal = JobPortal()
sgpa_engine = SGPAStudyEngine()


@app.on_event("startup")
def startup() -> None:
    init_database()
    init_job_tracker_table()


def _json_safe(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(k): _json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_json_safe(v) for v in value]
    if isinstance(value, (int, float, str, bool)) or value is None:
        return value
    return str(value)


def _extract_resume_text(upload: UploadFile, raw: bytes) -> str:
    name = (upload.filename or "resume.pdf").lower()
    buffer = io.BytesIO(raw)
    buffer.name = upload.filename or "resume.pdf"
    if name.endswith(".pdf"):
        return analyzer.extract_text_from_pdf(buffer)
    if name.endswith(".docx") or name.endswith(".doc"):
        return analyzer.extract_text_from_docx(buffer)
    return raw.decode("utf-8", errors="ignore")


class SummarizeBody(BaseModel):
    text: str = ""
    mode: str = "executive"
    length: str = "medium"


class JobSearchBody(BaseModel):
    title: str
    location: str = "India"
    experience_id: str = "all"


class ApplicationBody(BaseModel):
    company: str
    role_title: str
    stage: str = "Saved"
    location: str = ""
    workplace_type: str = "Remote"
    salary: str = ""
    job_url: str = ""
    applied_date: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
    deadline: str = ""
    contact_person: str = ""
    notes: str = ""
    priority: str = "Medium"


class StageBody(BaseModel):
    stage: str


class ResumeBuildBody(BaseModel):
    template: str = "Modern"
    personal_info: dict
    summary: str = ""
    experience: list = []
    education: list = []
    projects: list = []
    skills: dict = {}


@app.get("/api/health")
def health() -> dict:
    return {"ok": True, "service": "student-hub"}


@app.get("/api/roles")
def roles() -> dict:
    return {"roles": JOB_ROLES}


@app.get("/api/jobs/meta")
def jobs_meta() -> dict:
    return {
        "suggestions": JOB_SUGGESTIONS,
        "locations": LOCATION_SUGGESTIONS,
        "experience": EXPERIENCE_RANGES,
        "salary": SALARY_RANGES,
        "types": JOB_TYPES,
        "companies": get_featured_companies(),
        "insights": get_market_insights(),
    }


@app.post("/api/jobs/search")
def jobs_search(body: JobSearchBody) -> dict:
    results = job_portal.search_jobs(
        body.title,
        body.location,
        {"id": body.experience_id, "text": body.experience_id},
    )
    return {"results": results}


@app.post("/api/summarize")
async def summarize(
    file: Optional[UploadFile] = File(default=None),
    text: str = Form(default=""),
    mode: str = Form(default="executive"),
    length: str = Form(default="medium"),
) -> dict:
    source = "Pasted notes"
    document_text = text.strip()
    if file is not None and file.filename:
        source = file.filename
        raw = await file.read()
        named = io.BytesIO(raw)
        named.name = file.filename
        document_text, _ = summarizer.extract_text(named)
    if not document_text.strip():
        raise HTTPException(status_code=400, detail="Provide a document or pasted text.")
    result = summarizer.generate_summary(document_text, mode=mode, length=length)
    result["source"] = source
    return result


@app.post("/api/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    category: str = Form(...),
    role: str = Form(...),
) -> dict:
    if category not in JOB_ROLES or role not in JOB_ROLES[category]:
        raise HTTPException(status_code=400, detail="Unknown role selection.")
    raw = await file.read()
    try:
        text = _extract_resume_text(file, raw)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read this file: {exc}") from exc
    if not text.strip():
        raise HTTPException(status_code=400, detail="No readable text was found in the file.")
    role_info = JOB_ROLES[category][role]
    analysis = analyzer.analyze_resume({"raw_text": text}, role_info)
    analysis["target_role"] = role
    analysis["target_category"] = category
    analysis["required_skills"] = role_info.get("required_skills", [])
    analysis["filename"] = file.filename
    safe = _json_safe(analysis)
    _store_analysis(safe)
    return safe


def _store_analysis(analysis: dict) -> None:
    try:
        conn = get_database_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO resume_data (name, email, phone, linkedin, github, portfolio, summary, target_role, target_category, education, experience, projects, skills, template)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                analysis.get("name") or analysis.get("full_name") or "Unknown",
                analysis.get("email") or "unknown@student.hub",
                analysis.get("phone") or "",
                analysis.get("linkedin") or "",
                analysis.get("github") or "",
                analysis.get("portfolio") or "",
                analysis.get("summary") or "",
                analysis.get("target_role") or "",
                analysis.get("target_category") or "",
                json.dumps(analysis.get("education") or []),
                json.dumps(analysis.get("experience") or []),
                json.dumps(analysis.get("projects") or []),
                json.dumps(analysis.get("skills") or []),
                "uploaded",
            ),
        )
        resume_id = cursor.lastrowid
        keyword = analysis.get("keyword_match") or {}
        cursor.execute(
            """
            INSERT INTO resume_analysis (resume_id, ats_score, keyword_match_score, format_score, section_score, missing_skills, recommendations)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                resume_id,
                analysis.get("ats_score") or 0,
                keyword.get("score") or 0,
                analysis.get("format_score") or 0,
                json.dumps(analysis.get("section_scores") or analysis.get("section_score") or {}),
                json.dumps(keyword.get("missing_skills") or []),
                json.dumps(analysis.get("suggestions") or []),
            ),
        )
        conn.commit()
        conn.close()
    except Exception:
        pass


@app.post("/api/builder")
def build_resume(body: ResumeBuildBody):
    data = body.model_dump()
    if not data.get("personal_info", {}).get("full_name"):
        raise HTTPException(status_code=400, detail="Full name is required.")
    buffer = builder.generate_resume(data)
    filename = f"{data['personal_info']['full_name'].replace(' ', '_')}_resume.docx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/api/tracker")
def list_tracker(stage: Optional[str] = None, q: Optional[str] = None) -> dict:
    init_job_tracker_table()
    apps = get_all_applications(stage_filter=stage, search_query=q)
    metrics = get_tracker_metrics()
    return {"applications": apps, "metrics": metrics}


@app.post("/api/tracker")
def create_application(body: ApplicationBody) -> dict:
    if not body.company.strip() or not body.role_title.strip():
        raise HTTPException(status_code=400, detail="Company and role are required.")
    new_id = add_job_application(body.model_dump())
    return {"id": new_id}


@app.patch("/api/tracker/{app_id}")
def move_application(app_id: int, body: StageBody) -> dict:
    update_job_stage(app_id, body.stage)
    return {"ok": True}


@app.delete("/api/tracker/{app_id}")
def remove_application(app_id: int) -> dict:
    delete_job_application(app_id)
    return {"ok": True}


@app.get("/api/dashboard")
def dashboard() -> dict:
    init_database()
    init_job_tracker_table()
    conn = get_database_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM resume_data")
    resumes = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*), AVG(ats_score), AVG(keyword_match_score) FROM resume_analysis")
    analyses, avg_ats, avg_kw = cursor.fetchone()
    cursor.execute("SELECT created_at, ats_score FROM resume_analysis ORDER BY id DESC LIMIT 12")
    recent_scores = [{"date": row[0], "score": row[1]} for row in cursor.fetchall()]
    conn.close()
    metrics = get_tracker_metrics()
    return {
        "resumes": resumes or 0,
        "analyses": analyses or 0,
        "average_ats": round(avg_ats or 0, 1),
        "average_keyword": round(avg_kw or 0, 1),
        "recent_scores": recent_scores,
        "pipeline": metrics,
    }


# ------------------------------------------------------------------
# NOTES SAVER, DAILY CHECKPOINT & PERSONAL DIARY API ENDPOINTS
# ------------------------------------------------------------------

class NoteBody(BaseModel):
    id: Optional[int] = None
    title: str = "Untitled Note"
    content: str = ""
    category: str = "General"
    tags: list = []
    color: str = "#3b82f6"
    is_pinned: bool = False
    user_email: str = ""


class CheckpointBody(BaseModel):
    date: str
    target_focus: str = ""
    tasks: list = []
    habit_water: int = 0
    habit_study_mins: int = 0
    habit_code_mins: int = 0
    user_email: str = ""


class DiaryBody(BaseModel):
    date: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
    title: str = ""
    entry: str
    mood: str = "😊"
    productivity_rating: int = 5
    tags: list = []
    user_email: str = ""


@app.get("/api/notes")
def list_notes(q: Optional[str] = None, category: Optional[str] = None, user_email: Optional[str] = "") -> dict:
    init_database()
    notes = get_all_notes(q=q, category=category, user_email=user_email or '')
    return {"notes": notes}


@app.post("/api/notes")
def save_note(body: NoteBody) -> dict:
    init_database()
    note_id = add_or_update_note(body.model_dump(), user_email=body.user_email or '')
    if not note_id:
        raise HTTPException(status_code=400, detail="Could not save note.")
    return {"id": note_id, "ok": True}


@app.delete("/api/notes/{note_id}")
def remove_note(note_id: int, user_email: Optional[str] = "") -> dict:
    init_database()
    ok = delete_note_by_id(note_id, user_email=user_email or '')
    return {"ok": ok}


@app.get("/api/checkpoints/{target_date}")
def get_checkpoint(target_date: str, user_email: Optional[str] = "") -> dict:
    init_database()
    checkpoint = get_daily_checkpoint_by_date(target_date, user_email=user_email or '')
    return {"checkpoint": checkpoint}


@app.post("/api/checkpoints")
def save_checkpoint(body: CheckpointBody) -> dict:
    init_database()
    ok = save_daily_checkpoint_data(body.model_dump(), user_email=body.user_email or '')
    return {"ok": ok}


@app.get("/api/diary")
def list_diary(user_email: Optional[str] = "") -> dict:
    init_database()
    entries = get_all_diary_entries(user_email=user_email or '')
    return {"entries": entries}


@app.post("/api/diary")
def create_diary(body: DiaryBody) -> dict:
    init_database()
    entry_id = add_diary_entry_data(body.model_dump(), user_email=body.user_email or '')
    if not entry_id:
        raise HTTPException(status_code=400, detail="Could not save diary entry.")
    return {"id": entry_id, "ok": True}


@app.delete("/api/diary/{entry_id}")
def remove_diary(entry_id: int, user_email: Optional[str] = "") -> dict:
    init_database()
    ok = delete_diary_entry_by_id(entry_id, user_email=user_email or '')
    return {"ok": ok}


# ─── SGPA (Study Guide & Personal Assistant) Endpoints ───

class SGPAExplainBody(BaseModel):
    concept: str
    context: Optional[str] = ""
    include_visuals: Optional[bool] = True
    academic_level: Optional[str] = "Undergraduate"


class SGPAQuizGenBody(BaseModel):
    topic: str
    num_questions: Optional[int] = 5
    context: Optional[str] = ""
    include_visuals: Optional[bool] = True


class SGPASolveBody(BaseModel):
    questions: str
    word_limit: Optional[int] = 120
    marks_category: Optional[str] = "Short Answer (2-3 Marks)"
    context: Optional[str] = ""


class SGPAEvaluateBody(BaseModel):
    questions: str
    student_answers: str
    context: Optional[str] = ""
    include_visuals: Optional[bool] = True


class SGPASummarizeBody(BaseModel):
    text: str
    user_focus: Optional[str] = ""
    extra_instruction: Optional[str] = ""
    include_visuals: Optional[bool] = True


@app.post("/api/sgpa/explain")
def sgpa_explain(body: SGPAExplainBody) -> dict:
    if not body.concept.strip():
        raise HTTPException(status_code=400, detail="Concept cannot be empty.")
    result = sgpa_engine.explain_concept(
        concept=body.concept,
        context=body.context or "",
        include_visuals=body.include_visuals if body.include_visuals is not None else True,
        academic_level=body.academic_level or "Undergraduate"
    )
    return result


@app.post("/api/sgpa/quiz/generate")
def sgpa_generate_quiz(body: SGPAQuizGenBody) -> dict:
    if not body.topic.strip():
        raise HTTPException(status_code=400, detail="Topic or material cannot be empty.")
    result = sgpa_engine.generate_quiz(
        text_or_topic=body.topic,
        num_questions=body.num_questions or 5,
        context=body.context or "",
        include_visuals=body.include_visuals if body.include_visuals is not None else True
    )
    return result


@app.post("/api/sgpa/quiz/solve")
def sgpa_solve_questions(body: SGPASolveBody) -> dict:
    if not body.questions.strip():
        raise HTTPException(status_code=400, detail="Questions cannot be empty.")
    result = sgpa_engine.solve_questions(
        questions=body.questions,
        word_limit=body.word_limit or 120,
        marks_category=body.marks_category or "short",
        context=body.context or ""
    )
    return result


@app.post("/api/sgpa/quiz/evaluate")
def sgpa_evaluate_answers(body: SGPAEvaluateBody) -> dict:
    if not body.questions.strip() or not body.student_answers.strip():
        raise HTTPException(status_code=400, detail="Questions and student answers are required.")
    result = sgpa_engine.evaluate_answers(
        questions=body.questions,
        student_answers=body.student_answers,
        context=body.context or "",
        include_visuals=body.include_visuals if body.include_visuals is not None else True
    )
    return result


@app.post("/api/sgpa/summarize")
def sgpa_summarize_doc(body: SGPASummarizeBody) -> dict:
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    result = sgpa_engine.exam_summarize(
        text=body.text,
        user_focus=body.user_focus or "",
        extra_instruction=body.extra_instruction or "",
        include_visuals=body.include_visuals if body.include_visuals is not None else True
    )
    return result


