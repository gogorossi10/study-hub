import { useState } from 'react'
import {
  Sparkles,
  BookOpen,
  BrainCircuit,
  HelpCircle,
  FileCheck2,
  FileText,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react'
import { Card, FadeIn, Button, Field, Dropzone, Stat, EmptyState } from '../components/ui/Primitives'
import { GuidedPageHeader } from '../components/ui/GuidedPageHeader'
import {
  explainConcept,
  generateQuiz,
  solveQuestions,
  evaluateAnswers,
  sgpaSummarize,
  type SGPAResult,
} from '../lib/api'
import { useToast } from '../context/ToastContext'
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer'

type StudyHelpMode = 'explainer' | 'quiz_gen' | 'solver' | 'evaluator' | 'summarizer'

const QUICK_TOPICS = [
  'Deadlock Handling & Bankers Algorithm in OS',
  'Database Normalization (1NF to BCNF)',
  'B-Trees vs B+ Trees Indexing',
  'Dijkstras Shortest Path Algorithm',
  'CAP Theorem & Distributed Consistency',
  'TCP Handshake & Congestion Control',
]

const pageSteps = [
  { title: 'Select mode', description: 'Explainer, Quiz, Solver, Evaluator' },
  { title: 'Provide topic / material', description: 'Enter topic, paste text or questions' },
  { title: 'Study & revise', description: 'Get high-yield AI responses' },
]

export function StudyHelpAIPage() {
  const toast = useToast()
  const [activeMode, setActiveMode] = useState<StudyHelpMode>('explainer')

  // Explainer states
  const [concept, setConcept] = useState('')
  const [academicLevel, setAcademicLevel] = useState('Undergraduate')
  const [includeVisuals, setIncludeVisuals] = useState(true)

  // Quizzer states
  const [quizMaterial, setQuizMaterial] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)

  // Solver states
  const [examQuestions, setExamQuestions] = useState('')
  const [wordLimit, setWordLimit] = useState(120)
  const [marksCategory, setMarksCategory] = useState('Short Answer (2-3 Marks)')

  // Evaluator states
  const [evalQuestions, setEvalQuestions] = useState('')
  const [evalStudentAnswers, setEvalStudentAnswers] = useState('')

  // Summarizer states
  const [summaryMaterial, setSummaryMaterial] = useState('')
  const [summaryFocus, setSummaryFocus] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // Result & loading states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SGPAResult | null>(null)
  const [copied, setCopied] = useState(false)

  const currentStep = result ? 2 : (concept || quizMaterial || examQuestions || evalQuestions || summaryMaterial) ? 1 : 0

  const handleFileUpload = async (file: File | null) => {
    setUploadedFile(file)
    if (!file) return
    try {
      const text = await file.text()
      const clean = text.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, ' ')
      if (activeMode === 'summarizer') {
        setSummaryMaterial(clean)
      } else if (activeMode === 'quiz_gen') {
        setQuizMaterial(clean)
      } else {
        setConcept(clean.slice(0, 500))
      }
      toast.push(`Loaded content from ${file.name}`)
    } catch {
      toast.push('Could not read file directly, you can paste text below.')
    }
  }

  async function handleRun() {
    setError('')
    setLoading(true)
    try {
      let res: SGPAResult
      if (activeMode === 'explainer') {
        if (!concept.trim()) throw new Error('Please enter a concept or topic to explain.')
        res = await explainConcept(concept, '', includeVisuals, academicLevel)
      } else if (activeMode === 'quiz_gen') {
        if (!quizMaterial.trim()) throw new Error('Please enter study material or a topic for the quiz.')
        res = await generateQuiz(quizMaterial, numQuestions, '', includeVisuals)
      } else if (activeMode === 'solver') {
        if (!examQuestions.trim()) throw new Error('Please enter at least one question to solve.')
        res = await solveQuestions(examQuestions, wordLimit, marksCategory)
      } else if (activeMode === 'evaluator') {
        if (!evalQuestions.trim() || !evalStudentAnswers.trim()) {
          throw new Error('Please provide both the question(s) and your answers to evaluate.')
        }
        res = await evaluateAnswers(evalQuestions, evalStudentAnswers, '', includeVisuals)
      } else {
        if (!summaryMaterial.trim()) throw new Error('Please provide notes or study material to summarize.')
        res = await sgpaSummarize(summaryMaterial, summaryFocus, '', includeVisuals)
      }
      setResult(res)
      toast.push('Study Help AI is ready with your answer!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during generation.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!result?.response) return
    navigator.clipboard.writeText(result.response)
    setCopied(true)
    toast.push('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setResult(null)
    setError('')
  }

  return (
    <div>
      <GuidedPageHeader
        icon={Sparkles}
        kicker="Academic AI"
        title="Study Help AI"
        subtitle="Your smart academic companion: explain complex topics, generate self-assessment quizzes, solve exam questions, and grade practice answers in real-time."
        color="#6366f1"
        gradient="linear-gradient(135deg, #4f46e5, #7c3aed)"
        steps={pageSteps}
        currentStep={currentStep}
      />

      {/* Mode Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${activeMode === 'explainer' ? 'primary' : 'secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => { setActiveMode('explainer'); handleReset() }}
        >
          <BrainCircuit size={16} />
          🧠 Concept Explainer
        </button>

        <button
          className={`btn ${activeMode === 'quiz_gen' ? 'primary' : 'secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => { setActiveMode('quiz_gen'); handleReset() }}
        >
          <HelpCircle size={16} />
          📝 Quiz Generator
        </button>

        <button
          className={`btn ${activeMode === 'solver' ? 'primary' : 'secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => { setActiveMode('solver'); handleReset() }}
        >
          <FileText size={16} />
          📖 Exam Solver
        </button>

        <button
          className={`btn ${activeMode === 'evaluator' ? 'primary' : 'secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => { setActiveMode('evaluator'); handleReset() }}
        >
          <FileCheck2 size={16} />
          ✅ Answer Evaluator
        </button>

        <button
          className={`btn ${activeMode === 'summarizer' ? 'primary' : 'secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => { setActiveMode('summarizer'); handleReset() }}
        >
          <BookOpen size={16} />
          📄 Exam Summarizer
        </button>
      </div>

      <div className="grid grid-2">
        {/* Left Column: Interactive Inputs */}
        <FadeIn>
          <Card>
            {/* Mode 1: Explainer */}
            {activeMode === 'explainer' && (
              <>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BrainCircuit size={20} style={{ color: 'var(--primary)' }} />
                  Concept & Topic Explainer
                </h3>
                <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Get crisp definitions, real-world analogies, step-by-step breakdowns, and sketchable diagrams for revision.
                </p>

                <Field label="Topic or Academic Concept">
                  <input
                    className="input"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="e.g., Deadlocks in Operating Systems, Dijkstra Algorithm..."
                  />
                </Field>

                <div className="grid grid-2" style={{ marginTop: '1rem' }}>
                  <Field label="Academic Level">
                    <select className="input" value={academicLevel} onChange={(e) => setAcademicLevel(e.target.value)}>
                      <option value="Undergraduate">Undergraduate (B.Tech / B.Sc)</option>
                      <option value="Postgraduate">Postgraduate (M.Tech / M.Sc)</option>
                      <option value="High School">High School / Foundation</option>
                      <option value="Beginner">Beginner / Intuitive</option>
                    </select>
                  </Field>
                  <Field label="Visuals & Diagrams">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={includeVisuals}
                        onChange={(e) => setIncludeVisuals(e.target.checked)}
                      />
                      <span>Include ASCII / Mermaid diagrams</span>
                    </label>
                  </Field>
                </div>

                {/* Quick Topic Chips */}
                <div style={{ marginTop: '1.2rem' }}>
                  <span className="muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>
                    Quick Sample Topics:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {QUICK_TOPICS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className="chip"
                        style={{ cursor: 'pointer', textAlign: 'left' }}
                        onClick={() => setConcept(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Mode 2: Quiz Generator */}
            {activeMode === 'quiz_gen' && (
              <>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={20} style={{ color: 'var(--primary)' }} />
                  Self-Assessment Quiz Generator
                </h3>
                <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Generate MCQs, True/False, and analytical questions with separated answer keys.
                </p>

                <Dropzone
                  file={uploadedFile}
                  hint="Upload study notes or chapter (optional)"
                  accept=".txt,.pdf,.md"
                  onFile={handleFileUpload}
                />

                <Field label="Notes or Topic for Quiz">
                  <textarea
                    className="input"
                    rows={4}
                    value={quizMaterial}
                    onChange={(e) => setQuizMaterial(e.target.value)}
                    placeholder="Paste chapter notes, lecture text, or specify a subject syllabus..."
                  />
                </Field>

                <div className="grid grid-2" style={{ marginTop: '1rem' }}>
                  <Field label={`Number of Questions (${numQuestions})`}>
                    <input
                      type="range"
                      min={3}
                      max={12}
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      style={{ width: '100%', marginTop: '0.5rem' }}
                    />
                  </Field>
                  <Field label="Answer Key & Matrix">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={includeVisuals}
                        onChange={(e) => setIncludeVisuals(e.target.checked)}
                      />
                      <span>Include difficulty scorecard matrix</span>
                    </label>
                  </Field>
                </div>
              </>
            )}

            {/* Mode 3: Exam Solver */}
            {activeMode === 'solver' && (
              <>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} style={{ color: 'var(--primary)' }} />
                  Exam & Assignment Question Solver
                </h3>
                <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Get structured, point-wise solutions calibrated for university exam mark schemes.
                </p>

                <Field label="Exam / Assignment Questions">
                  <textarea
                    className="input"
                    rows={5}
                    value={examQuestions}
                    onChange={(e) => setExamQuestions(e.target.value)}
                    placeholder="Paste one or more exam questions (e.g., '1. Differentiate between paging and segmentation. 2. Explain 2-phase locking in DBMS.')"
                  />
                </Field>

                <div className="grid grid-2" style={{ marginTop: '1rem' }}>
                  <Field label="Marks Allocation">
                    <select className="input" value={marksCategory} onChange={(e) => setMarksCategory(e.target.value)}>
                      <option value="Short Answer (2-3 Marks)">Short Answer (2-3 Marks)</option>
                      <option value="Long Answer (5-10 Marks)">Long Answer (5-10 Marks)</option>
                      <option value="Objective / 1 Mark">Objective / 1 Mark</option>
                    </select>
                  </Field>
                  <Field label="Target Words per Answer">
                    <select className="input" value={wordLimit} onChange={(e) => setWordLimit(Number(e.target.value))}>
                      <option value={40}>~40 words (Objective / Quick)</option>
                      <option value={120}>~120 words (Standard Short)</option>
                      <option value={220}>~220 words (Long Comprehensive)</option>
                    </select>
                  </Field>
                </div>
              </>
            )}

            {/* Mode 4: Answer Evaluator */}
            {activeMode === 'evaluator' && (
              <>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCheck2 size={20} style={{ color: 'var(--primary)' }} />
                  Answer Evaluator & Grader
                </h3>
                <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Submit test questions and your written answers to receive scores, critique, and missing keyword insights.
                </p>

                <Field label="Original Question(s)">
                  <textarea
                    className="input"
                    rows={3}
                    value={evalQuestions}
                    onChange={(e) => setEvalQuestions(e.target.value)}
                    placeholder="Enter the question you attempted..."
                  />
                </Field>

                <Field label="Your Submitted Answer(s)">
                  <textarea
                    className="input"
                    rows={4}
                    value={evalStudentAnswers}
                    onChange={(e) => setEvalStudentAnswers(e.target.value)}
                    placeholder="Type or paste your written answer here..."
                  />
                </Field>
              </>
            )}

            {/* Mode 5: Exam Summarizer */}
            {activeMode === 'summarizer' && (
              <>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={20} style={{ color: 'var(--primary)' }} />
                  High-Yield Exam Summarizer
                </h3>
                <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Distill textbooks and lecture notes into high-yield exam briefs with active recall questions.
                </p>

                <Dropzone
                  file={uploadedFile}
                  hint="Upload lecture notes or slides (optional)"
                  accept=".txt,.pdf,.md"
                  onFile={handleFileUpload}
                />

                <Field label="Study Material">
                  <textarea
                    className="input"
                    rows={4}
                    value={summaryMaterial}
                    onChange={(e) => setSummaryMaterial(e.target.value)}
                    placeholder="Paste your study notes or chapter text here..."
                  />
                </Field>

                <Field label="Special Exam Focus (Optional)">
                  <input
                    className="input"
                    value={summaryFocus}
                    onChange={(e) => setSummaryFocus(e.target.value)}
                    placeholder="e.g., Focus on numerical derivations or core definitions..."
                  />
                </Field>
              </>
            )}

            {error && <p style={{ color: 'var(--danger)', marginTop: '0.8rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
              <Button onClick={() => void handleRun()} disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Generating with Study Help AI…' : '🚀 Ask Study Help AI'}
              </Button>
              {result && (
                <Button variant="secondary" onClick={handleReset} title="Reset">
                  <RotateCcw size={16} />
                </Button>
              )}
            </div>
          </Card>
        </FadeIn>

        {/* Right Column: AI Output Display */}
        <FadeIn delay={0.08}>
          {!result ? (
            <Card>
              <EmptyState
                title="Study Help AI Ready"
                copy="Select a study mode on the left and enter your topic or questions. Your AI academic explanations, quizzes, and scorecards will appear here instantly."
              />
            </Card>
          ) : (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="chip" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', fontWeight: 600 }}>
                  🎓 Study Help AI Analysis
                </span>
                <Button variant="secondary" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Output'}
                </Button>
              </div>

              {result.original_words ? (
                <div className="grid grid-3" style={{ margin: '0.8rem 0 1.2rem' }}>
                  <Stat value={result.original_words} label="Source Words" />
                  <Stat value={result.summary_words || 0} label="Output Words" />
                  <Stat value={`${result.compression_pct || 0}%`} label="Condensed" />
                </div>
              ) : null}

              {/* Formatted Markdown Output */}
              <div
                style={{
                  background: 'var(--surface-sunken, rgba(99, 102, 241, 0.03))',
                  padding: '1.4rem',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                }}
              >
                <MarkdownRenderer content={result.response} />
              </div>
            </Card>
          )}
        </FadeIn>
      </div>
    </div>
  )
}

export const SGPAPage = StudyHelpAIPage
