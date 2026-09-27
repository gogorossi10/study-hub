import sqlite3
from datetime import datetime

def get_database_connection():
    """Create and return a database connection"""
    conn = sqlite3.connect('resume_data.db')
    return conn

def init_database():
    """Initialize database tables"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    # Create resume_data table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS resume_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        linkedin TEXT,
        github TEXT,
        portfolio TEXT,
        summary TEXT,
        target_role TEXT,
        target_category TEXT,
        education TEXT,
        experience TEXT,
        projects TEXT,
        skills TEXT,
        template TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create resume_skills table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS resume_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resume_id INTEGER,
        skill_name TEXT NOT NULL,
        skill_category TEXT NOT NULL,
        proficiency_score REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (resume_id) REFERENCES resume_data (id)
    )
    ''')
    
    # Create resume_analysis table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS resume_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resume_id INTEGER,
        ats_score REAL,
        keyword_match_score REAL,
        format_score REAL,
        section_score REAL,
        missing_skills TEXT,
        recommendations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (resume_id) REFERENCES resume_data (id)
    )
    ''')
    
    # Create admin_logs table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admin_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_email TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create admin table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Create user_notes table (per-user)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL,
        content TEXT,
        category TEXT DEFAULT 'General',
        tags TEXT DEFAULT '[]',
        color TEXT DEFAULT '#3b82f6',
        is_pinned INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Create daily_checkpoints table (per-user per-date)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS daily_checkpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL,
        target_focus TEXT DEFAULT '',
        tasks TEXT DEFAULT '[]',
        habit_water INTEGER DEFAULT 0,
        habit_study_mins INTEGER DEFAULT 0,
        habit_code_mins INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_email, date)
    )
    ''')

    # Create personal_diary table (per-user)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS personal_diary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        entry TEXT NOT NULL,
        mood TEXT DEFAULT '😊',
        productivity_rating INTEGER DEFAULT 5,
        tags TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Migration: add user_email column if missing from older DB
    for tbl in ['user_notes', 'daily_checkpoints', 'personal_diary']:
        try:
            cursor.execute(f"PRAGMA table_info({tbl})")
            cols = [row[1] for row in cursor.fetchall()]
            if 'user_email' not in cols:
                cursor.execute(f"ALTER TABLE {tbl} ADD COLUMN user_email TEXT NOT NULL DEFAULT ''")
        except Exception:
            pass

    conn.commit()
    conn.close()

def save_resume_data(data):
    """Save resume data to database and sync to Supabase"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        personal_info = data.get('personal_info', {})
        full_name = personal_info.get('full_name', '')
        email = personal_info.get('email', '')
        phone = personal_info.get('phone', '')
        linkedin = personal_info.get('linkedin', '')
        github = personal_info.get('github', '')
        portfolio = personal_info.get('portfolio', '')
        summary = data.get('summary', '')
        target_role = data.get('target_role', '')
        target_category = data.get('target_category', '')
        education = data.get('education', [])
        experience = data.get('experience', [])
        projects = data.get('projects', [])
        skills = data.get('skills', [])
        template = data.get('template', '')

        cursor.execute('''
        INSERT INTO resume_data (
            name, email, phone, linkedin, github, portfolio,
            summary, target_role, target_category, education, 
            experience, projects, skills, template
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            full_name, email, phone, linkedin, github, portfolio,
            summary, target_role, target_category,
            str(education), str(experience), str(projects), str(skills), template
        ))
        
        conn.commit()
        last_id = cursor.lastrowid

        # Sync to Supabase
        try:
            from config.supabase_client import supabase_insert
            supabase_insert('resume_data', {
                'name': full_name or 'Unknown',
                'email': email or 'unknown@student.hub',
                'phone': phone,
                'linkedin': linkedin,
                'github': github,
                'portfolio': portfolio,
                'summary': summary,
                'target_role': target_role,
                'target_category': target_category,
                'education': education if isinstance(education, list) else [],
                'experience': experience if isinstance(experience, list) else [],
                'projects': projects if isinstance(projects, list) else [],
                'skills': skills if isinstance(skills, list) else [],
                'template': template or 'Modern'
            })
        except Exception as s_err:
            print(f"Supabase sync warning: {s_err}")

        return last_id
    except Exception as e:
        print(f"Error saving resume data: {str(e)}")
        conn.rollback()
        return None
    finally:
        conn.close()

def save_analysis_data(resume_id, analysis):
    """Save resume analysis data and sync to Supabase"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    ats = float(analysis.get('ats_score', 0))
    kw = float(analysis.get('keyword_match_score', 0))
    fmt = float(analysis.get('format_score', 0))
    sec = float(analysis.get('section_score', 0)) if isinstance(analysis.get('section_score'), (int, float)) else 0
    missing = analysis.get('missing_skills', '')
    recs = analysis.get('recommendations', '')

    try:
        cursor.execute('''
        INSERT INTO resume_analysis (
            resume_id, ats_score, keyword_match_score,
            format_score, section_score, missing_skills,
            recommendations
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            resume_id, ats, kw, fmt, sec,
            str(missing), str(recs)
        ))
        
        conn.commit()

        # Sync to Supabase
        try:
            from config.supabase_client import supabase_insert
            supabase_insert('resume_analysis', {
                'resume_id': resume_id,
                'ats_score': ats,
                'keyword_match_score': kw,
                'format_score': fmt,
                'section_score': analysis.get('section_scores') or {},
                'missing_skills': missing if isinstance(missing, list) else [missing] if missing else [],
                'recommendations': recs if isinstance(recs, list) else [recs] if recs else []
            })
        except Exception as s_err:
            print(f"Supabase sync warning: {s_err}")

    except Exception as e:
        print(f"Error saving analysis data: {str(e)}")
        conn.rollback()
    finally:
        conn.close()

def get_resume_stats():
    """Get statistics about resumes"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        # Get total resumes
        cursor.execute('SELECT COUNT(*) FROM resume_data')
        total_resumes = cursor.fetchone()[0]
        
        # Get average ATS score
        cursor.execute('SELECT AVG(ats_score) FROM resume_analysis')
        avg_ats_score = cursor.fetchone()[0] or 0
        
        # Get recent activity
        cursor.execute('''
        SELECT name, target_role, created_at 
        FROM resume_data 
        ORDER BY created_at DESC 
        LIMIT 5
        ''')
        recent_activity = cursor.fetchall()
        
        return {
            'total_resumes': total_resumes,
            'avg_ats_score': round(avg_ats_score, 2),
            'recent_activity': recent_activity
        }
    except Exception as e:
        print(f"Error getting resume stats: {str(e)}")
        return None
    finally:
        conn.close()

def log_admin_action(admin_email, action):
    """Log admin login/logout actions"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        INSERT INTO admin_logs (admin_email, action)
        VALUES (?, ?)
        ''', (admin_email, action))
        conn.commit()
    except Exception as e:
        print(f"Error logging admin action: {str(e)}")
    finally:
        conn.close()

def get_admin_logs():
    """Get all admin login/logout logs"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        SELECT admin_email, action, timestamp
        FROM admin_logs
        ORDER BY timestamp DESC
        ''')
        return cursor.fetchall()
    except Exception as e:
        print(f"Error getting admin logs: {str(e)}")
        return []
    finally:
        conn.close()

def get_all_resume_data():
    """Get all resume data for admin dashboard"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        # Get resume data joined with analysis data
        cursor.execute('''
        SELECT 
            r.id,
            r.name,
            r.email,
            r.phone,
            r.linkedin,
            r.github,
            r.portfolio,
            r.target_role,
            r.target_category,
            r.created_at,
            a.ats_score,
            a.keyword_match_score,
            a.format_score,
            a.section_score
        FROM resume_data r
        LEFT JOIN resume_analysis a ON r.id = a.resume_id
        ORDER BY r.created_at DESC
        ''')
        return cursor.fetchall()
    except Exception as e:
        print(f"Error getting resume data: {str(e)}")
        return []
    finally:
        conn.close()

def verify_admin(email, password):
    """Verify admin credentials"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT * FROM admin WHERE email = ? AND password = ?', (email, password))
        result = cursor.fetchone()
        return bool(result)
    except Exception as e:
        print(f"Error verifying admin: {str(e)}")
        return False
    finally:
        conn.close()

def add_admin(email, password):
    """Add a new admin"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('INSERT INTO admin (email, password) VALUES (?, ?)', (email, password))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error adding admin: {str(e)}")
        return False
    finally:
        conn.close()

def save_ai_analysis_data(resume_id, analysis_data):
    """Save AI analysis data to the database"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        # Check if the ai_analysis table exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ai_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                resume_id INTEGER,
                model_used TEXT,
                resume_score INTEGER,
                job_role TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (resume_id) REFERENCES resume_data (id)
            )
        """)
        
        # Insert the analysis data
        cursor.execute("""
            INSERT INTO ai_analysis (
                resume_id, model_used, resume_score, job_role
            ) VALUES (?, ?, ?, ?)
        """, (
            resume_id,
            analysis_data.get('model_used', ''),
            analysis_data.get('resume_score', 0),
            analysis_data.get('job_role', '')
        ))
        
        conn.commit()
        return cursor.lastrowid
    except Exception as e:
        print(f"Error saving AI analysis data: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

def get_ai_analysis_stats():
    """Get statistics about AI analyzer usage"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        # Check if the ai_analysis table exists
        cursor.execute("""
            SELECT name FROM sqlite_master WHERE type='table' AND name='ai_analysis'
        """)
        
        if not cursor.fetchone():
            return {
                "total_analyses": 0,
                "model_usage": [],
                "average_score": 0,
                "top_job_roles": []
            }
        
        # Get total number of analyses
        cursor.execute("SELECT COUNT(*) FROM ai_analysis")
        total_analyses = cursor.fetchone()[0]
        
        # Get model usage statistics
        cursor.execute("""
            SELECT model_used, COUNT(*) as count
            FROM ai_analysis
            GROUP BY model_used
            ORDER BY count DESC
        """)
        model_usage = [{"model": row[0], "count": row[1]} for row in cursor.fetchall()]
        
        # Get average resume score
        cursor.execute("SELECT AVG(resume_score) FROM ai_analysis")
        average_score = cursor.fetchone()[0] or 0
        
        # Get top job roles
        cursor.execute("""
            SELECT job_role, COUNT(*) as count
            FROM ai_analysis
            GROUP BY job_role
            ORDER BY count DESC
            LIMIT 5
        """)
        top_job_roles = [{"role": row[0], "count": row[1]} for row in cursor.fetchall()]
        
        return {
            "total_analyses": total_analyses,
            "model_usage": model_usage,
            "average_score": round(average_score, 1),
            "top_job_roles": top_job_roles
        }
    except Exception as e:
        print(f"Error getting AI analysis stats: {e}")
        return {
            "total_analyses": 0,
            "model_usage": [],
            "average_score": 0,
            "top_job_roles": []
        }
    finally:
        conn.close()

def get_detailed_ai_analysis_stats():
    """Get detailed statistics about AI analyzer usage including daily trends"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        # Check if the ai_analysis table exists
        cursor.execute("""
            SELECT name FROM sqlite_master WHERE type='table' AND name='ai_analysis'
        """)
        
        if not cursor.fetchone():
            return {
                "total_analyses": 0,
                "model_usage": [],
                "average_score": 0,
                "top_job_roles": [],
                "daily_trend": [],
                "score_distribution": [],
                "recent_analyses": []
            }
        
        # Get total number of analyses
        cursor.execute("SELECT COUNT(*) FROM ai_analysis")
        total_analyses = cursor.fetchone()[0]
        
        # Get model usage statistics
        cursor.execute("""
            SELECT model_used, COUNT(*) as count
            FROM ai_analysis
            GROUP BY model_used
            ORDER BY count DESC
        """)
        model_usage = [{"model": row[0], "count": row[1]} for row in cursor.fetchall()]
        
        # Get average resume score
        cursor.execute("SELECT AVG(resume_score) FROM ai_analysis")
        average_score = cursor.fetchone()[0] or 0
        
        # Get top job roles
        cursor.execute("""
            SELECT job_role, COUNT(*) as count
            FROM ai_analysis
            GROUP BY job_role
            ORDER BY count DESC
            LIMIT 5
        """)
        top_job_roles = [{"role": row[0], "count": row[1]} for row in cursor.fetchall()]
        
        # Get daily trend for the last 7 days
        cursor.execute("""
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM ai_analysis
            WHERE created_at >= date('now', '-7 days')
            GROUP BY DATE(created_at)
            ORDER BY date
        """)
        daily_trend = [{"date": row[0], "count": row[1]} for row in cursor.fetchall()]
        
        # Get score distribution
        score_ranges = [
            {"min": 0, "max": 20, "range": "0-20"},
            {"min": 21, "max": 40, "range": "21-40"},
            {"min": 41, "max": 60, "range": "41-60"},
            {"min": 61, "max": 80, "range": "61-80"},
            {"min": 81, "max": 100, "range": "81-100"}
        ]
        
        score_distribution = []
        for range_info in score_ranges:
            cursor.execute("""
                SELECT COUNT(*) FROM ai_analysis 
                WHERE resume_score >= ? AND resume_score <= ?
            """, (range_info["min"], range_info["max"]))
            count = cursor.fetchone()[0]
            score_distribution.append({"range": range_info["range"], "count": count})
        
        # Get recent analyses
        cursor.execute("""
            SELECT model_used, resume_score, job_role, datetime(created_at) as date
            FROM ai_analysis
            ORDER BY created_at DESC
            LIMIT 5
        """)
        recent_analyses = [
            {
                "model": row[0],
                "score": row[1],
                "job_role": row[2],
                "date": row[3]
            } for row in cursor.fetchall()
        ]
        
        return {
            "total_analyses": total_analyses,
            "model_usage": model_usage,
            "average_score": round(average_score, 1),
            "top_job_roles": top_job_roles,
            "daily_trend": daily_trend,
            "score_distribution": score_distribution,
            "recent_analyses": recent_analyses
        }
    except Exception as e:
        print(f"Error getting detailed AI analysis stats: {e}")
        return {
            "total_analyses": 0,
            "model_usage": [],
            "average_score": 0,
            "top_job_roles": [],
            "daily_trend": [],
            "score_distribution": [],
            "recent_analyses": []
        }
    finally:
        conn.close()

def reset_ai_analysis_stats():
    """Reset AI analysis statistics by truncating the ai_analysis table"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        # Check if the ai_analysis table exists
        cursor.execute("""
            SELECT name FROM sqlite_master WHERE type='table' AND name='ai_analysis'
        """)
        
        if not cursor.fetchone():
            return {"success": False, "message": "AI analysis table does not exist"}
        
        # Delete all records from the ai_analysis table
        cursor.execute("DELETE FROM ai_analysis")
        conn.commit()
        
        return {"success": True, "message": "AI analysis statistics have been reset successfully"}
    except Exception as e:
        conn.rollback()
        print(f"Error resetting AI analysis stats: {e}")
        return {"success": False, "message": f"Error resetting AI analysis statistics: {str(e)}"}
    finally:
        conn.close()


# ------------------------------------------------------------------
# NOTES SAVER CRUD
# ------------------------------------------------------------------
def get_all_notes(q=None, category=None, user_email=''):
    conn = get_database_connection()
    cursor = conn.cursor()
    try:
        query = "SELECT id, title, content, category, tags, color, is_pinned, created_at, updated_at FROM user_notes WHERE user_email = ?"
        params = [user_email]
        if category and category != 'All':
            query += " AND category = ?"
            params.append(category)
        if q:
            query += " AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)"
            like_str = f"%{q}%"
            params.extend([like_str, like_str, like_str])
        query += " ORDER BY is_pinned DESC, updated_at DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        import json
        notes = []
        for r in rows:
            try:
                parsed_tags = json.loads(r[4]) if r[4] else []
            except Exception:
                parsed_tags = [t.strip() for t in str(r[4]).split(',') if t.strip()]
            notes.append({
                "id": r[0],
                "title": r[1],
                "content": r[2] or "",
                "category": r[3] or "General",
                "tags": parsed_tags,
                "color": r[5] or "#3b82f6",
                "is_pinned": bool(r[6]),
                "created_at": r[7],
                "updated_at": r[8]
            })
        return notes
    except Exception as e:
        print(f"Error reading notes: {e}")
        return []
    finally:
        conn.close()


def add_or_update_note(data, user_email=''):
    conn = get_database_connection()
    cursor = conn.cursor()
    import json
    note_id = data.get("id")
    title = data.get("title", "Untitled Note")
    content = data.get("content", "")
    category = data.get("category", "General")
    tags = json.dumps(data.get("tags") or [])
    color = data.get("color", "#3b82f6")
    is_pinned = 1 if data.get("is_pinned") else 0
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        if note_id:
            cursor.execute('''
                UPDATE user_notes
                SET title=?, content=?, category=?, tags=?, color=?, is_pinned=?, updated_at=?
                WHERE id=? AND user_email=?
            ''', (title, content, category, tags, color, is_pinned, now, note_id, user_email))
            conn.commit()
            return note_id
        else:
            cursor.execute('''
                INSERT INTO user_notes (user_email, title, content, category, tags, color, is_pinned, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (user_email, title, content, category, tags, color, is_pinned, now, now))
            conn.commit()
            return cursor.lastrowid
    except Exception as e:
        print(f"Error saving note: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()


def delete_note_by_id(note_id, user_email=''):
    conn = get_database_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM user_notes WHERE id=? AND user_email=?", (note_id, user_email))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error deleting note: {e}")
        return False
    finally:
        conn.close()


# ------------------------------------------------------------------
# DAILY CHECKPOINTS CRUD
# ------------------------------------------------------------------
def get_daily_checkpoint_by_date(target_date, user_email=''):
    conn = get_database_connection()
    cursor = conn.cursor()
    import json
    try:
        cursor.execute("SELECT id, date, target_focus, tasks, habit_water, habit_study_mins, habit_code_mins, created_at FROM daily_checkpoints WHERE date=? AND user_email=?", (target_date, user_email))
        row = cursor.fetchone()
        if not row:
            return {
                "date": target_date,
                "target_focus": "",
                "tasks": [],
                "habit_water": 0,
                "habit_study_mins": 0,
                "habit_code_mins": 0
            }
        try:
            tasks = json.loads(row[3]) if row[3] else []
        except Exception:
            tasks = []
        return {
            "id": row[0],
            "date": row[1],
            "target_focus": row[2] or "",
            "tasks": tasks,
            "habit_water": row[4] or 0,
            "habit_study_mins": row[5] or 0,
            "habit_code_mins": row[6] or 0
        }
    except Exception as e:
        print(f"Error fetching checkpoint: {e}")
        return {
            "date": target_date,
            "target_focus": "",
            "tasks": [],
            "habit_water": 0,
            "habit_study_mins": 0,
            "habit_code_mins": 0
        }
    finally:
        conn.close()


def save_daily_checkpoint_data(data, user_email=''):
    conn = get_database_connection()
    cursor = conn.cursor()
    import json
    target_date = data.get("date") or datetime.now().strftime("%Y-%m-%d")
    focus = data.get("target_focus", "")
    tasks = json.dumps(data.get("tasks") or [])
    water = data.get("habit_water", 0)
    study = data.get("habit_study_mins", 0)
    code = data.get("habit_code_mins", 0)

    try:
        cursor.execute("SELECT id FROM daily_checkpoints WHERE date=? AND user_email=?", (target_date, user_email))
        existing = cursor.fetchone()
        if existing:
            cursor.execute('''
                UPDATE daily_checkpoints
                SET target_focus=?, tasks=?, habit_water=?, habit_study_mins=?, habit_code_mins=?
                WHERE date=? AND user_email=?
            ''', (focus, tasks, water, study, code, target_date, user_email))
        else:
            cursor.execute('''
                INSERT INTO daily_checkpoints (user_email, date, target_focus, tasks, habit_water, habit_study_mins, habit_code_mins)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (user_email, target_date, focus, tasks, water, study, code))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error saving checkpoint: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()


# ------------------------------------------------------------------
# PERSONAL DIARY CRUD
# ------------------------------------------------------------------
def get_all_diary_entries(user_email=''):
    conn = get_database_connection()
    cursor = conn.cursor()
    import json
    try:
        cursor.execute("SELECT id, date, title, entry, mood, productivity_rating, tags, created_at FROM personal_diary WHERE user_email=? ORDER BY date DESC, id DESC", (user_email,))
        rows = cursor.fetchall()
        entries = []
        for r in rows:
            try:
                tags = json.loads(r[6]) if r[6] else []
            except Exception:
                tags = []
            entries.append({
                "id": r[0],
                "date": r[1],
                "title": r[2],
                "entry": r[3],
                "mood": r[4] or "😊",
                "productivity_rating": r[5] or 5,
                "tags": tags,
                "created_at": r[7]
            })
        return entries
    except Exception as e:
        print(f"Error reading diary: {e}")
        return []
    finally:
        conn.close()


def add_diary_entry_data(data, user_email=''):
    conn = get_database_connection()
    cursor = conn.cursor()
    import json
    entry_date = data.get("date") or datetime.now().strftime("%Y-%m-%d")
    title = data.get("title") or f"Diary Entry for {entry_date}"
    entry = data.get("entry", "")
    mood = data.get("mood", "😊")
    rating = data.get("productivity_rating", 5)
    tags = json.dumps(data.get("tags") or [])

    try:
        cursor.execute('''
            INSERT INTO personal_diary (user_email, date, title, entry, mood, productivity_rating, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_email, entry_date, title, entry, mood, rating, tags))
        conn.commit()
        return cursor.lastrowid
    except Exception as e:
        print(f"Error saving diary entry: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()


def delete_diary_entry_by_id(entry_id, user_email=''):
    conn = get_database_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM personal_diary WHERE id=? AND user_email=?", (entry_id, user_email))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error deleting diary entry: {e}")
        return False
    finally:
        conn.close()
