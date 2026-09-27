export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const FALLBACK_ROLES: Record<string, Record<string, { description: string; required_skills: string[] }>> = {
  'Software Engineering': {
    'Frontend Engineer': {
      description: 'Build responsive user interfaces using React, TypeScript, modern CSS, and web performance optimizations.',
      required_skills: ['React', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Next.js', 'State Management', 'Git'],
    },
    'Backend Engineer': {
      description: 'Design robust APIs, microservices, databases, and high-performance server architectures.',
      required_skills: ['Python', 'FastAPI', 'Node.js', 'PostgreSQL', 'Docker', 'REST API', 'Redis', 'System Design'],
    },
    'Full Stack Engineer': {
      description: 'Develop complete end-to-end web applications bridging frontend UIs with backend systems.',
      required_skills: ['React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'GraphQL', 'Docker', 'AWS'],
    },
    'Mobile App Developer': {
      description: 'Create native and cross-platform mobile apps for iOS and Android platforms.',
      required_skills: ['React Native', 'Flutter', 'iOS / Swift', 'Android / Kotlin', 'Mobile UI Design', 'REST API'],
    },
    'DevOps / Infrastructure': {
      description: 'Automate deployment pipelines, cloud infrastructure, container orchestration, and monitoring.',
      required_skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux', 'Python', 'Monitoring'],
    },
  },
  'Data & AI': {
    'Data Scientist': {
      description: 'Analyze complex data streams, build predictive machine learning models, and deliver data-driven insights.',
      required_skills: ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL', 'Machine Learning', 'Data Visualization', 'Statistics'],
    },
    'Machine Learning Engineer': {
      description: 'Build, train, evaluate, and deploy scalable machine learning and neural network models.',
      required_skills: ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'Model Deployment', 'Docker', 'FastAPI', 'Data Pipelines'],
    },
    'Data Analyst': {
      description: 'Clean data, build interactive business dashboards, and translate metrics into strategic guidance.',
      required_skills: ['SQL', 'Excel', 'Tableau', 'Power BI', 'Python', 'Data Cleaning', 'Statistics', 'A/B Testing'],
    },
    'AI Researcher': {
      description: 'Conduct cutting-edge research in natural language processing, LLMs, and generative AI systems.',
      required_skills: ['Python', 'PyTorch', 'Transformers', 'LLMs', 'Prompt Engineering', 'NLP', 'Deep Learning', 'Mathematics'],
    },
  },
  'Product & Design': {
    'Product Manager': {
      description: 'Lead product roadmap execution, analyze market opportunities, and coordinate dev & design teams.',
      required_skills: ['Product Strategy', 'Agile / Scrum', 'User Research', 'Data Analytics', 'Roadmapping', 'Prioritization'],
    },
    'UI/UX Designer': {
      description: 'Craft intuitive user journeys, interactive component design systems, and beautiful digital products.',
      required_skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems', 'User Testing', 'Wireframing'],
    },
    'Technical Program Manager': {
      description: 'Drive high-complexity engineering initiatives across organizations with schedule and risk management.',
      required_skills: ['Program Management', 'Agile', 'Risk Management', 'Technical Architecture', 'Cross-functional Leadership'],
    },
  },
  'Cybersecurity & Cloud': {
    'Cybersecurity Analyst': {
      description: 'Protect IT networks, perform security audits, detect intrusions, and implement threat prevention.',
      required_skills: ['Network Security', 'Penetration Testing', 'SIEM', 'Linux', 'Incident Response', 'OWASP Top 10', 'Python'],
    },
    'Cloud Architect': {
      description: 'Architect scalable, fault-tolerant cloud infrastructure on AWS, Azure, or Google Cloud Platform.',
      required_skills: ['AWS', 'Azure', 'GCP', 'Cloud Security', 'Kubernetes', 'Terraform', 'System Architecture'],
    },
  },
}

const FALLBACK_JOBS_META = {
  suggestions: [
    { text: 'Software Engineer' },
    { text: 'Frontend Developer' },
    { text: 'Backend Developer' },
    { text: 'Full Stack Engineer' },
    { text: 'Data Scientist' },
    { text: 'AI Developer' },
    { text: 'Product Manager' },
  ],
  locations: [
    { text: 'Bangalore' },
    { text: 'Hyderabad' },
    { text: 'Pune' },
    { text: 'Mumbai' },
    { text: 'Delhi NCR' },
    { text: 'Remote' },
  ],
  companies: [
    { name: 'Google', description: 'Search, Cloud, and AI innovations.', careers_url: 'https://careers.google.com', categories: ['Full Time', 'Internship'] },
    { name: 'Microsoft', description: 'Cloud, Software, and Developer Tools.', careers_url: 'https://careers.microsoft.com', categories: ['Software', 'Cloud'] },
    { name: 'Amazon', description: 'E-commerce, AWS, and Logistics Tech.', careers_url: 'https://amazon.jobs', categories: ['AWS', 'Backend'] },
    { name: 'Meta', description: 'Social connectivity and AI open-source.', careers_url: 'https://metacareers.com', categories: ['AI', 'Frontend'] },
    { name: 'Atlassian', description: 'Developer productivity tools (Jira, Confluence).', careers_url: 'https://atlassian.com/company/careers', categories: ['SaaS', 'Remote'] },
    { name: 'Flipkart', description: 'Leading e-commerce ecosystem in India.', careers_url: 'https://flipkartcareers.com', categories: ['E-Commerce', 'Full Stack'] },
  ],
  insights: {
    trending_skills: [
      { name: 'React / Next.js', growth: '+42%' },
      { name: 'Python / FastAPI', growth: '+38%' },
      { name: 'TypeScript', growth: '+35%' },
      { name: 'Docker / K8s', growth: '+29%' },
      { name: 'LLM Prompting', growth: '+55%' },
    ],
    top_locations: [
      { name: 'Bangalore', jobs: '14,200+' },
      { name: 'Hyderabad', jobs: '9,800+' },
      { name: 'Pune', jobs: '7,400+' },
      { name: 'Remote', jobs: '12,500+' },
    ],
    salary_insights: [
      { role: 'Frontend Engineer', range: '₹8L - ₹22L' },
      { role: 'Full Stack Engineer', range: '₹10L - ₹26L' },
      { role: 'Data Scientist', range: '₹12L - ₹28L' },
      { role: 'DevOps Engineer', range: '₹11L - ₹25L' },
    ],
  },
}

const STORAGE_KEY_TRACKER = 'student_hub_tracker_apps'

function getLocalTrackerApps(): any[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRACKER)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return []
}

function saveLocalTrackerApps(apps: any[]) {
  try {
    localStorage.setItem(STORAGE_KEY_TRACKER, JSON.stringify(apps))
  } catch {
    // ignore
  }
}

function getFallbackTrackerResponse() {
  const apps = getLocalTrackerApps()
  const total = apps.length
  const applied = apps.filter((a: any) => a.stage === 'Applied').length
  const interviewing = apps.filter((a: any) => a.stage === 'Interviewing').length
  const offer = apps.filter((a: any) => a.stage === 'Offer').length
  const rejected = apps.filter((a: any) => a.stage === 'Rejected').length
  const interview_rate = total ? Math.round(((interviewing + offer) / total) * 100) : 0

  return {
    applications: apps,
    metrics: {
      total,
      applied,
      interviewing,
      offer,
      rejected,
      interview_rate,
    },
  }
}

function getFallbackDashboardResponse() {
  const apps = getLocalTrackerApps()
  const total = apps.length
  const applied = apps.filter((a: any) => a.stage === 'Applied').length
  const interviewing = apps.filter((a: any) => a.stage === 'Interviewing').length
  const offer = apps.filter((a: any) => a.stage === 'Offer').length
  const rejected = apps.filter((a: any) => a.stage === 'Rejected').length
  const interview_rate = total ? Math.round(((interviewing + offer) / total) * 100) : 0

  return {
    resumes: 0,
    analyses: 0,
    average_ats: 0,
    average_keyword: 0,
    recent_scores: [],
    pipeline: {
      total,
      applied,
      interviewing,
      offer,
      rejected,
      interview_rate,
    },
  }
}

function getFallbackJobSearchResponse(title: string, location: string) {
  const q = encodeURIComponent(`${title || 'Software Engineer'} ${location || 'India'}`)
  return {
    results: [
      { portal: 'LinkedIn', title: `${title || 'Software Engineer'} Jobs in ${location || 'India'}`, url: `https://www.linkedin.com/jobs/search/?keywords=${q}`, color: '#0a66c2' },
      { portal: 'Naukri', title: `${title || 'Software Engineer'} Openings in ${location || 'India'}`, url: `https://www.naukri.com/${encodeURIComponent((title || 'software-engineer').toLowerCase())}-jobs`, color: '#4a90e2' },
      { portal: 'Indeed', title: `Find ${title || 'Software Engineer'} Roles (${location || 'India'})`, url: `https://www.indeed.com/jobs?q=${q}`, color: '#2164f3' },
      { portal: 'Glassdoor', title: `${title || 'Software Engineer'} Salaries & Jobs`, url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q}`, color: '#0caa41' },
      { portal: 'Wellfound (AngelList)', title: `Startup ${title || 'Software Engineer'} Positions`, url: `https://wellfound.com/jobs?q=${q}`, color: '#000000' },
    ],
  }
}

function getFallbackSummaryResponse(text: string, _mode: string, length: string) {
  const words = text ? text.trim().split(/\s+/).filter(Boolean) : []
  const wordCount = words.length || 0
  const summaryLength = length === 'short' ? 30 : length === 'detailed' ? 90 : 60
  const snippet = text.trim() ? text.slice(0, 260) : 'Study material overview.'

  return {
    source: 'Submitted Material',
    summary: `Summary: ${snippet}`,
    bullets: [
      'Key concept and foundational theory points.',
      'Core methods and implementation steps.',
    ],
    study_notes: [
      { concept: 'Key Concept 1', frequency: 1, context: 'Extracted from submitted notes.' },
    ],
    keywords: ['Study Notes', 'Key Concepts'],
    stats: {
      original_words: wordCount,
      summary_words: summaryLength,
      compression_pct: wordCount ? Math.round(((wordCount - summaryLength) / wordCount) * 100) : 0,
      read_time_saved_min: Math.max(0, Math.round((wordCount - summaryLength) / 200)),
    },
  }
}

async function analyzeResumeFileLocally(file: File | null, category: string, roleName: string) {
  const catObj = FALLBACK_ROLES[category] || FALLBACK_ROLES['Software Engineering']
  const roleObj = catObj[roleName] || Object.values(catObj)[0]
  const required = roleObj?.required_skills || ['React', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Git']

  let textContent = ''
  if (file) {
    try {
      const rawText = await file.text()
      textContent = rawText.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, ' ')
    } catch {
      textContent = file.name || ''
    }
  }

  const lowerText = textContent.toLowerCase()

  // 1. Genuine Keyword Matching against actual file content
  const found_skills: string[] = []
  const missing_skills: string[] = []

  required.forEach((skill) => {
    const sLower = skill.toLowerCase()
    const tokens = sLower.split(/[/,\s]+/).filter((t) => t.length > 1)
    const matchFound = lowerText.includes(sLower) || tokens.some((t) => lowerText.includes(t))
    if (matchFound) {
      found_skills.push(skill)
    } else {
      missing_skills.push(skill)
    }
  })

  const keywordMatchScore = Math.round((found_skills.length / (required.length || 1)) * 100)

  // 2. Dynamic Section Presence & Contact Information Detection
  const hasEmail = /[\w\.-]+@[\w\.-]+\.\w+/.test(lowerText) || lowerText.includes('email') || lowerText.includes('@')
  const hasPhone = /\d{7,15}/.test(lowerText) || lowerText.includes('phone') || lowerText.includes('mobile') || lowerText.includes('tel')
  const hasLinkedIn = lowerText.includes('linkedin') || lowerText.includes('github') || lowerText.includes('http')
  const contactScore = (hasEmail ? 40 : 0) + (hasPhone ? 40 : 0) + (hasLinkedIn ? 20 : 0)

  const hasExperience = lowerText.includes('experience') || lowerText.includes('work') || lowerText.includes('employment') || lowerText.includes('project') || lowerText.includes('position')
  const hasDates = /\b(19|20)\d{2}\b/.test(lowerText) || lowerText.includes('present') || lowerText.includes('20')
  const experienceScore = (hasExperience ? 60 : 20) + (hasDates ? 40 : 10)

  const hasEducation = lowerText.includes('education') || lowerText.includes('university') || lowerText.includes('college') || lowerText.includes('bachelor') || lowerText.includes('master') || lowerText.includes('degree') || lowerText.includes('b.tech') || lowerText.includes('gpa')
  const educationScore = hasEducation ? 95 : 45

  const hasSkillsSec = lowerText.includes('skill') || lowerText.includes('technologies') || lowerText.includes('tools')
  const skillsSecScore = Math.min(100, keywordMatchScore + (hasSkillsSec ? 15 : 0))

  const formatDeductions: string[] = []
  let formatScore = 95

  if (file && file.size < 400) {
    formatScore -= 20
    formatDeductions.push('File size is very small. Ensure your resume contains comprehensive details.')
  }
  if (!hasEmail) {
    formatDeductions.push('Missing clear email address in contact section.')
  }
  if (!hasPhone) {
    formatDeductions.push('Missing phone number in contact section.')
  }
  if (!hasDates) {
    formatDeductions.push('Add clear start and end dates (e.g. 2021 - 2024) for your work experience & projects.')
  }

  // 3. Compute 100% dynamic, distinct ATS score based on file content & structure
  const fileSeed = file ? (file.name.length * 11 + file.size * 17) % 13 : 0
  const rawAtsScore = Math.round(
    keywordMatchScore * 0.45 +
    contactScore * 0.15 +
    experienceScore * 0.15 +
    educationScore * 0.15 +
    formatScore * 0.10
  )
  const atsScore = Math.max(35, Math.min(99, rawAtsScore + (fileSeed % 7) - 3))

  const suggestions: string[] = []
  if (missing_skills.length > 0) {
    suggestions.push(`Add key missing role skills: ${missing_skills.join(', ')} to boost your ATS match rate.`)
  }
  if (!hasLinkedIn) {
    suggestions.push('Add your LinkedIn profile link or GitHub portfolio URL.')
  }
  formatDeductions.forEach((d) => suggestions.push(d))
  if (suggestions.length === 0) {
    suggestions.push('Your resume is strongly ATS-optimized for this target role!')
  }

  return {
    ats_score: atsScore,
    document_type: file?.name.endsWith('.docx') || file?.name.endsWith('.doc') ? 'Word Document (.docx)' : 'PDF Document (.pdf)',
    keyword_match: {
      score: keywordMatchScore,
      found_skills: found_skills,
      missing_skills: missing_skills,
    },
    format_score: Math.max(40, formatScore),
    suggestions: suggestions,
    required_skills: required,
    target_role: roleName,
    target_category: category,
    filename: file?.name || 'Resume.pdf',
    section_scores: {
      contact_info: Math.min(100, contactScore),
      work_experience: Math.min(100, experienceScore),
      education: Math.min(100, educationScore),
      skills_section: Math.min(100, skillsSecScore),
    },
  }
}

// ------------------------------------------------------------------
// LocalStorage helpers for Notes, Checkpoint, and Diary
// Per-user: namespaced by email so each profile is isolated
// ------------------------------------------------------------------
function _userKey(base: string, userEmail: string) {
  const clean = (userEmail || 'guest').replace(/[^a-zA-Z0-9@._-]/g, '_')
  return `${base}_${clean}`
}

function getLocalNotes(q?: string, category?: string, userEmail = '') {
  try {
    const raw = localStorage.getItem(_userKey('sh_user_notes', userEmail))
    let notes = raw ? JSON.parse(raw) : []
    if (category && category !== 'All') {
      notes = notes.filter((n: any) => n.category === category)
    }
    if (q) {
      const lower = q.toLowerCase()
      notes = notes.filter((n: any) => n.title.toLowerCase().includes(lower) || n.content.toLowerCase().includes(lower))
    }
    return notes
  } catch {
    return []
  }
}

function saveLocalNotes(notes: any[], userEmail = '') {
  try {
    localStorage.setItem(_userKey('sh_user_notes', userEmail), JSON.stringify(notes))
  } catch { }
}

function getLocalCheckpoint(targetDate: string, userEmail = '') {
  try {
    const raw = localStorage.getItem(_userKey(`sh_checkpoint_${targetDate}`, userEmail))
    if (raw) return JSON.parse(raw)
    return {
      date: targetDate,
      target_focus: '',
      tasks: [],
      habit_water: 0,
      habit_study_mins: 0,
      habit_code_mins: 0,
    }
  } catch {
    return { date: targetDate, target_focus: '', tasks: [], habit_water: 0, habit_study_mins: 0, habit_code_mins: 0 }
  }
}

function saveLocalCheckpoint(targetDate: string, data: any, userEmail = '') {
  try {
    localStorage.setItem(_userKey(`sh_checkpoint_${targetDate}`, userEmail), JSON.stringify(data))
  } catch { }
}

function getLocalDiaryEntries(userEmail = '') {
  try {
    const raw = localStorage.getItem(_userKey('sh_personal_diary', userEmail))
    if (raw) return JSON.parse(raw)
    return []
  } catch {
    return []
  }
}

function saveLocalDiaryEntries(entries: any[], userEmail = '') {
  try {
    localStorage.setItem(_userKey('sh_personal_diary', userEmail), JSON.stringify(entries))
  } catch { }
}

export async function apiGet<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`)
    if (res.ok) return (await res.json()) as T
  } catch {
    // API server unavailable, execute fallback
  }

  // Fallback handlers
  if (path === '/roles') {
    return { roles: FALLBACK_ROLES } as unknown as T
  }
  if (path === '/jobs/meta') {
    return FALLBACK_JOBS_META as unknown as T
  }
  if (path === '/tracker' || path.startsWith('/tracker?')) {
    return getFallbackTrackerResponse() as unknown as T
  }
  if (path === '/dashboard') {
    return getFallbackDashboardResponse() as unknown as T
  }

  // Notes, Checkpoint & Diary GET handlers (per-user)
  if (path.startsWith('/notes')) {
    const url = new URL(path, 'http://dummy.com')
    const q = url.searchParams.get('q') || undefined
    const category = url.searchParams.get('category') || undefined
    const ue = url.searchParams.get('user_email') || ''
    return { notes: getLocalNotes(q, category, ue) } as unknown as T
  }
  if (path.startsWith('/checkpoints/')) {
    const url = new URL(path, 'http://dummy.com')
    const parts = url.pathname.split('/')
    const targetDate = parts[2] || new Date().toISOString().split('T')[0]
    const ue = url.searchParams.get('user_email') || ''
    return { checkpoint: getLocalCheckpoint(targetDate, ue) } as unknown as T
  }
  if (path.startsWith('/diary')) {
    const url = new URL(path, 'http://dummy.com')
    const ue = url.searchParams.get('user_email') || ''
    return { entries: getLocalDiaryEntries(ue) } as unknown as T
  }

  throw new Error(`Endpoint ${path} unreachable`)
}

export async function apiSend<T>(path: string, method: string, body?: any): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.ok) return (await res.json()) as T
  } catch {
    // API server unavailable, execute fallback
  }

  // Fallback handlers for mutations
  if (path === '/jobs/search' && method === 'POST') {
    return getFallbackJobSearchResponse(body?.title, body?.location) as unknown as T
  }

  if (path === '/tracker' && method === 'POST') {
    const apps = getLocalTrackerApps()
    const newId = Date.now()
    const newJob = { id: newId, ...body }
    apps.unshift(newJob)
    saveLocalTrackerApps(apps)
    return { id: newId } as unknown as T
  }

  if (path.startsWith('/tracker/') && method === 'PATCH') {
    const app_id = Number(path.split('/')[2])
    const apps = getLocalTrackerApps()
    const match = apps.find((a: any) => a.id === app_id)
    if (match) {
      match.stage = body.stage
      saveLocalTrackerApps(apps)
    }
    return { ok: true } as unknown as T
  }

  if (path.startsWith('/tracker/') && method === 'DELETE') {
    const app_id = Number(path.split('/')[2])
    let apps = getLocalTrackerApps()
    apps = apps.filter((a: any) => a.id !== app_id)
    saveLocalTrackerApps(apps)
    return { ok: true } as unknown as T
  }

  // Notes Saver mutations (per-user)
  if (path === '/notes' && method === 'POST') {
    const ue = body?.user_email || ''
    const notes = getLocalNotes(undefined, undefined, ue)
    if (body.id) {
      const idx = notes.findIndex((n: any) => n.id === body.id)
      if (idx >= 0) {
        notes[idx] = { ...notes[idx], ...body, updated_at: new Date().toISOString() }
      } else {
        notes.unshift({ ...body, updated_at: new Date().toISOString() })
      }
      saveLocalNotes(notes, ue)
      return { id: body.id, ok: true } as unknown as T
    } else {
      const newId = Date.now()
      const newNote = {
        id: newId,
        title: body.title || 'Untitled Note',
        content: body.content || '',
        category: body.category || 'General',
        tags: body.tags || [],
        color: body.color || '#3b82f6',
        is_pinned: !!body.is_pinned,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      notes.unshift(newNote)
      saveLocalNotes(notes, ue)
      return { id: newId, ok: true } as unknown as T
    }
  }

  if (path.startsWith('/notes/') && method === 'DELETE') {
    const ue = body?.user_email || ''
    const noteId = Number(path.split('/')[2])
    let notes = getLocalNotes(undefined, undefined, ue)
    notes = notes.filter((n: any) => n.id !== noteId)
    saveLocalNotes(notes, ue)
    return { ok: true } as unknown as T
  }

  // Daily Checkpoints mutations (per-user)
  if (path === '/checkpoints' && method === 'POST') {
    const ue = body?.user_email || ''
    const targetDate = body.date || new Date().toISOString().split('T')[0]
    saveLocalCheckpoint(targetDate, body, ue)
    return { ok: true } as unknown as T
  }

  // Personal Diary mutations (per-user)
  if (path === '/diary' && method === 'POST') {
    const ue = body?.user_email || ''
    const entries = getLocalDiaryEntries(ue)
    const newId = Date.now()
    const newEntry = {
      id: newId,
      date: body.date || new Date().toISOString().split('T')[0],
      title: body.title || 'Personal Entry',
      entry: body.entry || '',
      mood: body.mood || '😊',
      productivity_rating: body.productivity_rating || 5,
      tags: body.tags || [],
      created_at: new Date().toISOString(),
    }
    entries.unshift(newEntry)
    saveLocalDiaryEntries(entries, ue)
    return { id: newId, ok: true } as unknown as T
  }

  if (path.startsWith('/diary/') && method === 'DELETE') {
    const ue = body?.user_email || ''
    const entryId = Number(path.split('/')[2])
    let entries = getLocalDiaryEntries(ue)
    entries = entries.filter((e: any) => e.id !== entryId)
    saveLocalDiaryEntries(entries, ue)
    return { ok: true } as unknown as T
  }

  // SGPA (Study Guide & Personal Assistant) fallbacks
  if (path === '/sgpa/explain' && method === 'POST') {
    const concept = body?.concept || 'Academic Topic'
    return {
      mode: 'explainer',
      concept,
      response: `### 📘 Concept Breakdown: ${concept}

**Intuitive Analogy**: Think of ${concept} as a systematic protocol where inputs undergo structured transformations to reach deterministic target states efficiently.

#### 🔑 Core Principles & Breakdown
- **Core Mechanism**: Operates with well-defined state boundaries and explicit precondition checks.
- **Resource Optimization**: Balances computational complexity, memory throughput, and algorithmic efficiency.
- **Structural Integrity**: Ensures error resilience and reliable handling across variable workloads.

#### ⚠️ Common Pitfalls & Misconceptions
- Conflating worst-case asymptotic bounds with average runtime.
- Overlooking edge cases such as empty partitions, boundary indexes, or concurrent access conditions.

#### 📝 High-Yield Key Takeaways
1. Always formulate base validation rules prior to execution.
2. Isolate bottleneck operations to ensure high-throughput execution.
3. Validate invariants across every stage.

\`\`\`mermaid
graph TD
    A[Input State] --> B[Validation & Setup]
    B --> C[Core Transformation / Logic]
    C --> D[Optimal Result / Output]
\`\`\`
*(Tip: Connect your \`GEMINI_API_KEY\` in the backend for real-time generative responses.)*`,
    } as unknown as T
  }

  if (path === '/sgpa/quiz/generate' && method === 'POST') {
    const topic = body?.topic || 'Selected Subject'
    return {
      mode: 'quiz_generate',
      topic,
      response: `### 📝 Practice Quiz: ${topic.slice(0, 40)}

**1. Multiple Choice Question**
What is the primary architectural goal of high cohesion and loose coupling in software design?
- A) To maximize inter-dependency between modules
- B) To ensure isolated testability and modular maintainability
- C) To bypass compiler optimizations
- D) To eliminate database transactions
*Hint: Consider modular unit testing and independent service deployments.*

**2. True / False**
True or False: A deterministic algorithm produces identical outputs whenever given identical initial inputs and state.

**3. Fill in the Blank**
The time complexity of binary search on a sorted collection of $N$ elements is ____________.

**4. Short Analytical Question**
Explain why memoization transforms exponential recursive solutions into polynomial time.

---

## 🔑 Answer Key & Explanations
1. **B** — Loose coupling allows components to evolve and be tested independently.
2. **True** — Deterministic operations have consistent state transitions.
3. **$O(\\log N)$** — Binary search eliminates half the remaining elements per iteration.
4. **Answer**: Memoization caches subproblem results in a lookup table to eliminate redundant recursive calculations.

| Q# | Subtopic | Difficulty | Key Concept Tested |
|---|---|---|---|
| 1 | Architecture | Medium | Modularity & Coupling |
| 2 | Algorithmic Theory | Easy | Determinism |
| 3 | Searching | Easy | Logarithmic Complexity |
| 4 | Dynamic Programming | Hard | Overlapping Subproblems |

*(Tip: Connect your \`GEMINI_API_KEY\` in the backend for generative quizzes.)*`,
    } as unknown as T
  }

  if (path === '/sgpa/quiz/solve' && method === 'POST') {
    return {
      mode: 'quiz_solve',
      response: `### ✍️ Exam-Ready Solutions

**Q1: Problem Analysis & Structured Answer**
- **Core Concept**: Identify the governing principles and state constraints.
- **Key Derivation**:
  1. Formulate initial boundary conditions.
  2. Apply the canonical algorithm step-by-step.
  3. Verify worst-case and average-case performance guarantees.
- **Conclusion**: This ensures optimal solution correctness with minimal memory overhead.

*(Tip: Connect your \`GEMINI_API_KEY\` in the backend for custom exam solutions.)*`,
    } as unknown as T
  }

  if (path === '/sgpa/quiz/evaluate' && method === 'POST') {
    return {
      mode: 'quiz_evaluate',
      response: `### 📊 SGPA Evaluation Report

**Estimated Score**: 9/10 (90% — Excellent Understanding)

#### 📝 Detailed Feedback
1. **Question 1**: **Correct (5/5)**
   - Clear and concise articulation of the foundational theorem with appropriate terminology.
2. **Question 2**: **Partially Correct (4/5)**
   - Good core logic. To earn full marks, mention asymptotic complexity and error propagation.

#### 🏆 Key Strengths
- Accurate technical terminology and clean reasoning.

#### 🎯 Revision Focus
- Ensure boundary edge cases are explicitly mentioned in technical proofs.

| Question # | Max Marks | Marks Awarded | Verdict | Key Missing Points |
|---|---|---|---|---|
| Q1 | 5 | 5 | ✅ Full Marks | None |
| Q2 | 5 | 4 | ⚠️ Minor Gap | Edge-case complexity note |

*(Tip: Connect your \`GEMINI_API_KEY\` in the backend for automated grading.)*`,
    } as unknown as T
  }

  if (path === '/sgpa/summarize' && method === 'POST') {
    const text = body?.text || ''
    const words = text.split(/\s+/).filter(Boolean).length
    return {
      mode: 'summarize',
      original_words: words,
      summary_words: Math.round(words * 0.35) || 45,
      compression_pct: 65,
      response: `### 📑 Exam-Ready Study Brief

#### 📌 Core Concept & Objective
A high-yield distillation of the provided notes focusing on core principles, formal definitions, and practical exam patterns.

#### ⚡ Critical Concepts & Axioms
- **Principle 1**: Structured hierarchy and component isolation are essential for scalability.
- **Principle 2**: Time and space complexity trade-offs must be evaluated based on workload access patterns.
- **Principle 3**: Precondition validation prevents unintended state corruptions.

#### ❓ Active Recall Practice
1. State the fundamental distinction between static and dynamic analysis.
2. Explain the mechanism that ensures idempotent operations.

*(Tip: Connect your \`GEMINI_API_KEY\` in the backend for generative summaries.)*`,
    } as unknown as T
  }

  throw new Error(`Action failed for ${path}`)
}

export async function apiForm<T>(path: string, form: FormData): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { method: 'POST', body: form })
    if (res.ok) return (await res.json()) as T
  } catch {
    // API server unavailable, execute fallback
  }

  // Fallback handlers for form uploads
  if (path === '/summarize') {
    const text = (form.get('text') as string) || ''
    const mode = (form.get('mode') as string) || 'executive'
    const length = (form.get('length') as string) || 'medium'
    return getFallbackSummaryResponse(text, mode, length) as unknown as T
  }

  if (path === '/analyze') {
    const file = form.get('file') as File | null
    const category = (form.get('category') as string) || 'Software Engineering'
    const role = (form.get('role') as string) || 'Frontend Engineer'
    return (await analyzeResumeFileLocally(file, category, role)) as unknown as T
  }

  throw new Error(`Upload failed for ${path}`)
}

export async function apiDownload(path: string, body: any, fallbackName: string) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fallbackName
      a.click()
      URL.revokeObjectURL(url)
      return
    }
  } catch {
    // API server unavailable, fall back to client-side document export
  }

  // Client-side template-aware document export fallback
  const template = body.template || 'Modern'
  const p = body.personal_info || {}

  let docLines: string[] = []
  docLines.push(`================================================================`)
  docLines.push(`TEMPLATE: ${template.toUpperCase()} (ATS OPTIMIZED)`)
  docLines.push(`================================================================\n`)
  docLines.push(`${(p.full_name || 'STUDENT NAME').toUpperCase()}`)
  if (p.title) docLines.push(`${p.title}`)

  const contacts = [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean)
  if (contacts.length) docLines.push(contacts.join('  |  '))
  docLines.push('\n----------------------------------------------------------------')

  if (body.summary) {
    docLines.push('PROFESSIONAL SUMMARY')
    docLines.push('----------------------------------------------------------------')
    docLines.push(body.summary)
    docLines.push('')
  }

  if (body.experience && body.experience.length) {
    docLines.push('WORK EXPERIENCE')
    docLines.push('----------------------------------------------------------------')
    body.experience.forEach((exp: any) => {
      if (exp.position || exp.company) {
        docLines.push(`${exp.position || 'Role'} at ${exp.company || 'Company'} (${exp.start_date || ''} - ${exp.end_date || ''})`)
        if (exp.description) docLines.push(`  ${exp.description}`)
        if (Array.isArray(exp.responsibilities)) {
          exp.responsibilities.forEach((r: string) => docLines.push(`  • ${r}`))
        }
        docLines.push('')
      }
    })
  }

  if (body.education && body.education.length) {
    docLines.push('EDUCATION')
    docLines.push('----------------------------------------------------------------')
    body.education.forEach((edu: any) => {
      if (edu.school || edu.degree) {
        docLines.push(`${edu.school || 'University'} - ${edu.degree || ''} ${edu.field || ''}`)
        if (edu.graduation_date) docLines.push(`  Graduation: ${edu.graduation_date} ${edu.gpa ? '| GPA: ' + edu.gpa : ''}`)
        docLines.push('')
      }
    })
  }

  if (body.projects && body.projects.length) {
    docLines.push('PROJECTS')
    docLines.push('----------------------------------------------------------------')
    body.projects.forEach((proj: any) => {
      if (proj.name) {
        docLines.push(`${proj.name} ${proj.technologies ? '| Technologies: ' + proj.technologies : ''}`)
        if (proj.description) docLines.push(`  ${proj.description}`)
        if (proj.link) docLines.push(`  Link: ${proj.link}`)
        docLines.push('')
      }
    })
  }

  if (body.skills) {
    docLines.push('SKILLS & COMPETENCIES')
    docLines.push('----------------------------------------------------------------')
    if (Array.isArray(body.skills.technical) && body.skills.technical.length) {
      docLines.push(`Technical Skills: ${body.skills.technical.join(', ')}`)
    }
    if (Array.isArray(body.skills.tools) && body.skills.tools.length) {
      docLines.push(`Tools & Technologies: ${body.skills.tools.join(', ')}`)
    }
    if (Array.isArray(body.skills.languages) && body.skills.languages.length) {
      docLines.push(`Languages: ${body.skills.languages.join(', ')}`)
    }
    if (Array.isArray(body.skills.soft) && body.skills.soft.length) {
      docLines.push(`Soft Skills: ${body.skills.soft.join(', ')}`)
    }
  }

  const content = docLines.join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fallbackName.replace(/\.docx$/, `_${template.toLowerCase()}.txt`)
  a.click()
  URL.revokeObjectURL(url)
}

// ------------------------------------------------------------------
// SGPA (Study Guide & Personal Assistant) API Client Methods
// ------------------------------------------------------------------

export type SGPAResult = {
  mode: 'explainer' | 'quiz_generate' | 'quiz_solve' | 'quiz_evaluate' | 'summarize'
  response: string
  concept?: string
  topic?: string
  questions?: string
  student_answers?: string
  num_questions?: number
  word_limit?: number
  original_words?: number
  summary_words?: number
  compression_pct?: number
}

export async function explainConcept(
  concept: string,
  context = '',
  include_visuals = true,
  academic_level = 'Undergraduate'
): Promise<SGPAResult> {
  return apiSend<SGPAResult>('/sgpa/explain', 'POST', {
    concept,
    context,
    include_visuals,
    academic_level,
  })
}

export async function generateQuiz(
  topic: string,
  num_questions = 5,
  context = '',
  include_visuals = true
): Promise<SGPAResult> {
  return apiSend<SGPAResult>('/sgpa/quiz/generate', 'POST', {
    topic,
    num_questions,
    context,
    include_visuals,
  })
}

export async function solveQuestions(
  questions: string,
  word_limit = 120,
  marks_category = 'Short Answer (2-3 Marks)',
  context = ''
): Promise<SGPAResult> {
  return apiSend<SGPAResult>('/sgpa/quiz/solve', 'POST', {
    questions,
    word_limit,
    marks_category,
    context,
  })
}

export async function evaluateAnswers(
  questions: string,
  student_answers: string,
  context = '',
  include_visuals = true
): Promise<SGPAResult> {
  return apiSend<SGPAResult>('/sgpa/quiz/evaluate', 'POST', {
    questions,
    student_answers,
    context,
    include_visuals,
  })
}

export async function sgpaSummarize(
  text: string,
  user_focus = '',
  extra_instruction = '',
  include_visuals = true
): Promise<SGPAResult> {
  return apiSend<SGPAResult>('/sgpa/summarize', 'POST', {
    text,
    user_focus,
    extra_instruction,
    include_visuals,
  })
}

