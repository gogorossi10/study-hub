import { useEffect, useState } from 'react'
import {
    NotebookPen,
    Calendar,
    CheckCircle2,
    Plus,
    Trash2,
    Pin,
    Tag,
    Search,
    BookOpen,
    Sparkles,
    Flame,
    Star,
    Target,
    Droplet,
    Clock,
    Code,
    Edit3,
} from 'lucide-react'
import { Card, FadeIn, Button, Field, Stat } from '../components/ui/Primitives'
import { GuidedPageHeader } from '../components/ui/GuidedPageHeader'
import { apiGet, apiSend } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

type Note = {
    id?: number
    title: string
    content: string
    category: string
    tags: string[]
    color: string
    is_pinned: boolean
    created_at?: string
    updated_at?: string
}

type Task = {
    id: string
    text: string
    completed: boolean
    category: string
    priority: 'High' | 'Medium' | 'Low'
}

type Checkpoint = {
    id?: number
    date: string
    target_focus: string
    tasks: Task[]
    habit_water: number
    habit_study_mins: number
    habit_code_mins: number
}

type DiaryEntry = {
    id?: number
    date: string
    title: string
    entry: string
    mood: string
    productivity_rating: number
    tags: string[]
    created_at?: string
}

const CATEGORIES = ['All', 'Study & Tech', 'Career', 'Personal', 'Ideas', 'General']
const MOODS = ['🔥 Mindblown', '😊 Happy', '⚡ Energetic', '🎯 Focused', '😴 Tired']

const WORKSPACE_STEPS = [
    { title: 'Notes Saver', description: 'Store & tag study & tech notes' },
    { title: 'Daily Checkpoint', description: 'Track missions, tasks & habits' },
    { title: 'Personal Diary', description: 'Journal reflections & mood' },
]

export function WorkspacePage() {
    const toast = useToast()
    const { user } = useAuth()
    const userEmail = user?.email || ''
    const [tab, setTab] = useState<'notes' | 'checkpoint' | 'diary'>('notes')

    // Notes state
    const [notes, setNotes] = useState<Note[]>([])
    const [noteSearch, setNoteSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [showNoteModal, setShowNoteModal] = useState(false)
    const [editingNote, setEditingNote] = useState<Note | null>(null)
    const [noteTitle, setNoteTitle] = useState('')
    const [noteContent, setNoteContent] = useState('')
    const [noteCat, setNoteCat] = useState('General')
    const [noteTagsInput, setNoteTagsInput] = useState('')
    const [noteColor, setNoteColor] = useState('#3b82f6')
    const [notePinned, setNotePinned] = useState(false)

    // Daily Checkpoint state
    const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [checkpoint, setCheckpoint] = useState<Checkpoint>({
        date: new Date().toISOString().split('T')[0],
        target_focus: '',
        tasks: [],
        habit_water: 0,
        habit_study_mins: 0,
        habit_code_mins: 0,
    })
    const [newTaskText, setNewTaskText] = useState('')
    const [newTaskCat, setNewTaskCat] = useState('Core Work')
    const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium')

    // Personal Diary state
    const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
    const [diaryTitle, setDiaryTitle] = useState('')
    const [diaryEntry, setDiaryEntry] = useState('')
    const [diaryMood, setDiaryMood] = useState('😊 Happy')
    const [diaryRating, setDiaryRating] = useState(5)
    const [diaryTagsInput, setDiaryTagsInput] = useState('')

    // Load Data
    useEffect(() => {
        loadNotes()
        loadCheckpoint(targetDate)
        loadDiary()
    }, [targetDate, noteSearch, selectedCategory, userEmail])

    function loadNotes() {
        apiGet<{ notes: Note[] }>(`/notes?q=${encodeURIComponent(noteSearch)}&category=${encodeURIComponent(selectedCategory)}&user_email=${encodeURIComponent(userEmail)}`)
            .then((res) => setNotes(res.notes || []))
            .catch(() => { })
    }

    function loadCheckpoint(dateStr: string) {
        apiGet<{ checkpoint: Checkpoint }>(`/checkpoints/${dateStr}?user_email=${encodeURIComponent(userEmail)}`)
            .then((res) => setCheckpoint(res.checkpoint))
            .catch(() => { })
    }

    function loadDiary() {
        apiGet<{ entries: DiaryEntry[] }>(`/diary?user_email=${encodeURIComponent(userEmail)}`)
            .then((res) => setDiaryEntries(res.entries || []))
            .catch(() => { })
    }

    // Handle Note Save
    async function handleSaveNote() {
        if (!noteTitle.trim()) {
            toast.push('Note title is required.')
            return
        }
        const tags = noteTagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)

        const payload = {
            id: editingNote?.id,
            title: noteTitle,
            content: noteContent,
            category: noteCat,
            tags: tags,
            color: noteColor,
            is_pinned: notePinned,
            user_email: userEmail,
        }

        try {
            await apiSend('/notes', 'POST', payload)
            toast.push(editingNote ? 'Note updated successfully!' : 'New note saved!')
            setShowNoteModal(false)
            resetNoteForm()
            loadNotes()
        } catch {
            toast.push('Could not save note.')
        }
    }

    async function handleDeleteNote(id?: number) {
        if (!id) return
        try {
            await apiSend(`/notes/${id}`, 'DELETE', { user_email: userEmail })
            toast.push('Note deleted.')
            loadNotes()
        } catch {
            toast.push('Failed to delete note.')
        }
    }

    async function togglePinNote(note: Note) {
        try {
            await apiSend('/notes', 'POST', { ...note, is_pinned: !note.is_pinned, user_email: userEmail })
            toast.push(note.is_pinned ? 'Unpinned note' : 'Pinned note to top')
            loadNotes()
        } catch { }
    }

    function openNewNoteModal() {
        resetNoteForm()
        setShowNoteModal(true)
    }

    function openEditNoteModal(n: Note) {
        setEditingNote(n)
        setNoteTitle(n.title)
        setNoteContent(n.content)
        setNoteCat(n.category)
        setNoteTagsInput(n.tags ? n.tags.join(', ') : '')
        setNoteColor(n.color || '#3b82f6')
        setNotePinned(n.is_pinned)
        setShowNoteModal(true)
    }

    function resetNoteForm() {
        setEditingNote(null)
        setNoteTitle('')
        setNoteContent('')
        setNoteCat('General')
        setNoteTagsInput('')
        setNoteColor('#3b82f6')
        setNotePinned(false)
    }

    // Handle Checkpoint Save
    async function updateCheckpoint(updated: Checkpoint) {
        setCheckpoint(updated)
        try {
            await apiSend('/checkpoints', 'POST', { ...updated, user_email: userEmail })
        } catch { }
    }

    function addTask() {
        if (!newTaskText.trim()) return
        const newTask: Task = {
            id: String(Date.now()),
            text: newTaskText,
            completed: false,
            category: newTaskCat,
            priority: newTaskPriority,
        }
        const updated = { ...checkpoint, tasks: [...checkpoint.tasks, newTask] }
        updateCheckpoint(updated)
        setNewTaskText('')
        toast.push('Task added to daily checkpoint!')
    }

    function toggleTask(taskId: string) {
        const updatedTasks = checkpoint.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
        updateCheckpoint({ ...checkpoint, tasks: updatedTasks })
    }

    function deleteTask(taskId: string) {
        const updatedTasks = checkpoint.tasks.filter((t) => t.id !== taskId)
        updateCheckpoint({ ...checkpoint, tasks: updatedTasks })
    }

    // Handle Diary Entry Save
    async function handleSaveDiary() {
        if (!diaryEntry.trim()) {
            toast.push('Write your diary entry first!')
            return
        }
        const tags = diaryTagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)

        const payload = {
            date: targetDate,
            title: diaryTitle.trim() || `Diary Reflection (${targetDate})`,
            entry: diaryEntry,
            mood: diaryMood,
            productivity_rating: diaryRating,
            tags: tags,
            user_email: userEmail,
        }

        try {
            await apiSend('/diary', 'POST', payload)
            toast.push('Personal diary entry saved!')
            setDiaryTitle('')
            setDiaryEntry('')
            setDiaryTagsInput('')
            loadDiary()
        } catch {
            toast.push('Could not save diary entry.')
        }
    }

    async function handleDeleteDiary(id?: number) {
        if (!id) return
        try {
            await apiSend(`/diary/${id}`, 'DELETE', { user_email: userEmail })
            toast.push('Diary entry removed.')
            loadDiary()
        } catch { }
    }

    // Computations for Checkpoint
    const completedCount = checkpoint.tasks.filter((t) => t.completed).length
    const totalCount = checkpoint.tasks.length
    const completionPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

    const currentStepIndex = tab === 'notes' ? 0 : tab === 'checkpoint' ? 1 : 2

    return (
        <div>
            <GuidedPageHeader
                icon={NotebookPen}
                kicker="Academic & Productivity"
                title="Notes Saver, Daily Checkpoint & Task Diary"
                subtitle="Capture rich notes, organize daily focus targets, build habits, and keep a personal productivity diary."
                color="#3b82f6"
                gradient="linear-gradient(135deg, #3b82f6, #8b5cf6)"
                steps={WORKSPACE_STEPS}
                currentStep={currentStepIndex}
            />

            {/* NAVIGATION TABS */}
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setTab('notes')}
                    className="btn"
                    style={{
                        background: tab === 'notes' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'var(--panel)',
                        color: tab === 'notes' ? 'white' : 'var(--ink)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <BookOpen size={18} /> Notes Saver ({notes.length})
                </button>

                <button
                    onClick={() => setTab('checkpoint')}
                    className="btn"
                    style={{
                        background: tab === 'checkpoint' ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--panel)',
                        color: tab === 'checkpoint' ? 'white' : 'var(--ink)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <Target size={18} /> Daily Checkpoint ({completedCount}/{totalCount})
                </button>

                <button
                    onClick={() => setTab('diary')}
                    className="btn"
                    style={{
                        background: tab === 'diary' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'var(--panel)',
                        color: tab === 'diary' ? 'white' : 'var(--ink)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <Sparkles size={18} /> Personal Task Diary ({diaryEntries.length})
                </button>
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* TAB 1: NOTES SAVER */}
            {/* ------------------------------------------------------------------ */}
            {tab === 'notes' && (
                <FadeIn>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                        <div style={{ display: 'flex', gap: '0.6rem', flex: 1, minWidth: '260px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--ink-muted)' }} />
                                <input
                                    type="text"
                                    className="input"
                                    style={{ paddingLeft: '2.4rem' }}
                                    placeholder="Search notes by title, tag, or content…"
                                    value={noteSearch}
                                    onChange={(e) => {
                                        setNoteSearch(e.target.value)
                                        loadNotes()
                                    }}
                                />
                            </div>
                            <select
                                className="input"
                                style={{ width: 'auto' }}
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value)
                                    loadNotes()
                                }}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button onClick={openNewNoteModal} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                            <Plus size={18} /> Create New Note
                        </Button>
                    </div>

                    {/* NOTES GRID */}
                    {notes.length === 0 ? (
                        <Card style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                            <BookOpen size={48} style={{ color: '#3b82f6', margin: '0 auto 1rem auto' }} />
                            <h3>No Notes Saved Yet</h3>
                            <p className="soft">Click "Create New Note" to save code snippets, lecture notes, or career goals!</p>
                        </Card>
                    ) : (
                        <div className="grid grid-3">
                            {notes.map((n) => (
                                <Card key={n.id} style={{ borderTop: `4px solid ${n.color || '#3b82f6'}`, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                            <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: 'var(--ink)' }}>{n.title}</h3>
                                            <button
                                                onClick={() => togglePinNote(n)}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: n.is_pinned ? '#f59e0b' : 'var(--ink-muted)' }}
                                                title={n.is_pinned ? 'Unpin Note' : 'Pin to top'}
                                            >
                                                <Pin size={16} fill={n.is_pinned ? '#f59e0b' : 'none'} />
                                            </button>
                                        </div>

                                        <span className="badge" style={{ marginTop: '0.4rem', background: `${n.color}22`, color: n.color, border: `1px solid ${n.color}44` }}>
                                            {n.category}
                                        </span>

                                        <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>{n.content}</p>

                                        {n.tags && n.tags.length > 0 && (
                                            <div className="chip-row" style={{ marginTop: '0.8rem' }}>
                                                {n.tags.map((t) => (
                                                    <span className="chip" key={t} style={{ fontSize: '0.75rem' }}>
                                                        <Tag size={10} /> {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid var(--line)' }}>
                                        <small style={{ color: 'var(--ink-muted)', fontSize: '0.75rem' }}>
                                            {n.updated_at ? new Date(n.updated_at).toLocaleDateString() : 'Just now'}
                                        </small>

                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button
                                                onClick={() => openEditNoteModal(n)}
                                                className="btn secondary"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                            >
                                                <Edit3 size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(n.id)}
                                                className="btn secondary"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--danger)' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* CREATE / EDIT NOTE MODAL */}
                    {showNoteModal && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99 }}>
                            <Card style={{ width: '90%', maxWidth: '580px', padding: '1.8rem' }}>
                                <h3 style={{ marginTop: 0 }}>{editingNote ? 'Edit Note' : 'Create New Note'}</h3>

                                <Field label="Note Title">
                                    <input type="text" className="input" placeholder="e.g. FastAPI Async Patterns & DB Connections" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} />
                                </Field>

                                <div className="grid grid-2" style={{ marginTop: '0.8rem' }}>
                                    <Field label="Category">
                                        <select className="input" value={noteCat} onChange={(e) => setNoteCat(e.target.value)}>
                                            {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="Accent Color">
                                        <input type="color" className="input" style={{ padding: '2px', height: '42px', cursor: 'pointer' }} value={noteColor} onChange={(e) => setNoteColor(e.target.value)} />
                                    </Field>
                                </div>

                                <Field label="Note Content (Markdown supported)">
                                    <textarea className="input" rows={6} placeholder="Write your detailed note content here..." value={noteContent} onChange={(e) => setNoteContent(e.target.value)} />
                                </Field>

                                <Field label="Tags (comma separated)">
                                    <input type="text" className="input" placeholder="React, Python, Capstone, Exam" value={noteTagsInput} onChange={(e) => setNoteTagsInput(e.target.value)} />
                                </Field>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.8rem' }}>
                                    <input type="checkbox" id="pinCheck" checked={notePinned} onChange={(e) => setNotePinned(e.target.checked)} />
                                    <label htmlFor="pinCheck" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                                        Pin note to top of list
                                    </label>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' }}>
                                    <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => void handleSaveNote()}>Save Note</Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </FadeIn>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* TAB 2: DAILY CHECKPOINT ("What to do for a day") */}
            {/* ------------------------------------------------------------------ */}
            {tab === 'checkpoint' && (
                <FadeIn>
                    <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
                        <Card style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Calendar size={22} style={{ color: '#10b981' }} />
                                    <h3 style={{ margin: 0, color: 'white' }}>Daily Target Focus</h3>
                                </div>
                                <input type="date" className="input" style={{ width: 'auto', background: '#334155', color: 'white', border: '1px solid #475569' }} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                            </div>

                            <input
                                type="text"
                                className="input"
                                style={{ marginTop: '1rem', background: '#1e293b', color: 'white', border: '1px solid #334155' }}
                                placeholder="What is your main mission for today? (e.g. Master Resume Builder & Finish Backend)"
                                value={checkpoint.target_focus}
                                onChange={(e) => updateCheckpoint({ ...checkpoint, target_focus: e.target.value })}
                            />

                            {/* PROGRESS BAR */}
                            <div style={{ marginTop: '1.2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#94a3b8' }}>
                                    <span>Daily Task Completion</span>
                                    <strong style={{ color: '#10b981' }}>{completionPct}% Done</strong>
                                </div>
                                <div style={{ background: '#334155', height: '10px', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div style={{ width: `${completionPct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', transition: 'width 300ms ease' }} />
                                </div>
                            </div>
                        </Card>

                        {/* HABIT TRACKER COUNTERS */}
                        <Card>
                            <h3>Today's Habits & Productivity Trackers</h3>
                            <div className="grid grid-3" style={{ marginTop: '0.8rem' }}>
                                <Stat
                                    value={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>{checkpoint.habit_water}</span>
                                            <button onClick={() => updateCheckpoint({ ...checkpoint, habit_water: checkpoint.habit_water + 1 })} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer' }}>
                                                +
                                            </button>
                                        </div>
                                    }
                                    label="Water Glasses"
                                    icon={Droplet}
                                />

                                <Stat
                                    value={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>{checkpoint.habit_study_mins}m</span>
                                            <button onClick={() => updateCheckpoint({ ...checkpoint, habit_study_mins: checkpoint.habit_study_mins + 30 })} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer' }}>
                                                +30m
                                            </button>
                                        </div>
                                    }
                                    label="Study Session"
                                    icon={Clock}
                                />

                                <Stat
                                    value={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>{checkpoint.habit_code_mins}m</span>
                                            <button onClick={() => updateCheckpoint({ ...checkpoint, habit_code_mins: checkpoint.habit_code_mins + 30 })} style={{ background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer' }}>
                                                +30m
                                            </button>
                                        </div>
                                    }
                                    label="Coding Time"
                                    icon={Code}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* TASK CHECKLIST SECTION */}
                    <Card>
                        <h3>Daily Task Checklist</h3>

                        {/* ADD TASK INPUT */}
                        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                            <input type="text" className="input" style={{ flex: 2, minWidth: '220px' }} placeholder="Add a new action item for today..." value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} />

                            <select className="input" style={{ flex: 1, minWidth: '130px' }} value={newTaskCat} onChange={(e) => setNewTaskCat(e.target.value)}>
                                <option>Core Work</option>
                                <option>Academic</option>
                                <option>Career</option>
                                <option>Personal</option>
                            </select>

                            <select className="input" style={{ flex: 1, minWidth: '110px' }} value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as any)}>
                                <option value="High">🔴 High</option>
                                <option value="Medium">🟡 Medium</option>
                                <option value="Low">🟢 Low</option>
                            </select>

                            <Button onClick={addTask} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                <Plus size={18} /> Add Task
                            </Button>
                        </div>

                        {/* TASKS LIST */}
                        {checkpoint.tasks.length === 0 ? (
                            <p className="soft" style={{ textAlign: 'center', margin: '2rem 0' }}>
                                No tasks added for this date yet. Type a task above to start your daily plan!
                            </p>
                        ) : (
                            <div style={{ marginTop: '1.2rem', display: 'grid', gap: '0.6rem' }}>
                                {checkpoint.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.8rem 1rem',
                                            borderRadius: '10px',
                                            background: task.completed ? 'var(--panel-muted)' : 'var(--panel)',
                                            border: '1px solid var(--line)',
                                            opacity: task.completed ? 0.65 : 1,
                                            transition: 'all 200ms ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <button onClick={() => toggleTask(task.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }} aria-label="Toggle task">
                                                <CheckCircle2 size={20} style={{ color: task.completed ? '#10b981' : 'var(--ink-muted)' }} />
                                            </button>
                                            <span style={{ textDecoration: task.completed ? 'line-through' : 'none', fontWeight: task.completed ? 400 : 600, color: 'var(--ink)' }}>{task.text}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="badge" style={{ fontSize: '0.75rem' }}>
                                                {task.category}
                                            </span>
                                            <span className="badge" style={{ background: task.priority === 'High' ? '#ef444422' : task.priority === 'Medium' ? '#f59e0b22' : '#10b98122', color: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#10b981', fontSize: '0.75rem' }}>
                                                {task.priority}
                                            </span>
                                            <button onClick={() => deleteTask(task.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', marginLeft: '6px' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </FadeIn>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* TAB 3: PERSONAL TASK DIARY */}
            {/* ------------------------------------------------------------------ */}
            {tab === 'diary' && (
                <FadeIn>
                    <div className="grid grid-2">
                        {/* WRITE DIARY FORM */}
                        <Card>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <Flame size={22} style={{ color: '#8b5cf6' }} />
                                <h3 style={{ margin: 0 }}>Log Personal Diary Reflection</h3>
                            </div>

                            <Field label="Entry Title">
                                <input type="text" className="input" placeholder="e.g. Mastered ATS Parser & Prepared Resume Templates" value={diaryTitle} onChange={(e) => setDiaryTitle(e.target.value)} />
                            </Field>

                            <div className="grid grid-2" style={{ marginTop: '0.8rem' }}>
                                <Field label="Mood / Vibe">
                                    <select className="input" value={diaryMood} onChange={(e) => setDiaryMood(e.target.value)}>
                                        {MOODS.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Productivity Rating (1-5)">
                                    <select className="input" value={diaryRating} onChange={(e) => setDiaryRating(Number(e.target.value))}>
                                        <option value={5}>⭐⭐⭐⭐⭐ (5/5 - Phenomenal)</option>
                                        <option value={4}>⭐⭐⭐⭐ (4/5 - Great)</option>
                                        <option value={3}>⭐⭐⭐ (3/3 - Moderate)</option>
                                        <option value={2}>⭐⭐ (2/5 - Low Energy)</option>
                                        <option value={1}>⭐ (1/5 - Rest Day)</option>
                                    </select>
                                </Field>
                            </div>

                            <Field label="Personal Reflection & Task Learnings">
                                <textarea className="input" rows={6} placeholder="How was your productivity today? What key milestones did you achieve or overcome?" value={diaryEntry} onChange={(e) => setDiaryEntry(e.target.value)} />
                            </Field>

                            <Field label="Tags (comma separated)">
                                <input type="text" className="input" placeholder="Capstone, Win, Milestone, Learning" value={diaryTagsInput} onChange={(e) => setDiaryTagsInput(e.target.value)} />
                            </Field>

                            <Button onClick={() => void handleSaveDiary()} style={{ marginTop: '1.2rem', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                                <Sparkles size={18} /> Save Personal Diary Entry
                            </Button>
                        </Card>

                        {/* DIARY ENTRIES TIMELINE */}
                        <div>
                            <Card>
                                <h3>Personal Diary Timeline</h3>
                                {diaryEntries.length === 0 ? (
                                    <p className="soft" style={{ textAlign: 'center', margin: '2rem 0' }}>
                                        No diary reflections logged yet. Fill out the form to save your daily growth journal!
                                    </p>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                        {diaryEntries.map((entry) => (
                                            <div key={entry.id} style={{ padding: '1rem', borderRadius: '12px', background: 'var(--panel)', border: '1px solid var(--line)', borderLeft: '4px solid #8b5cf6' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <span className="badge" style={{ background: '#8b5cf622', color: '#8b5cf6', marginBottom: '0.4rem', display: 'inline-block' }}>
                                                            {entry.mood}
                                                        </span>
                                                        <h4 style={{ margin: '0.2rem 0 0.4rem 0', fontSize: '1.05rem' }}>{entry.title}</h4>
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <div style={{ color: '#f59e0b', display: 'flex', gap: '2px' }}>
                                                            {Array.from({ length: entry.productivity_rating || 5 }).map((_, i) => (
                                                                <Star key={i} size={14} fill="#f59e0b" />
                                                            ))}
                                                        </div>
                                                        <button onClick={() => handleDeleteDiary(entry.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', marginLeft: '8px' }}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p style={{ whiteSpace: 'pre-wrap', margin: '0.6rem 0', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>{entry.entry}</p>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                                                    <span>{entry.date}</span>
                                                    {entry.tags && entry.tags.length > 0 && (
                                                        <div className="chip-row">
                                                            {entry.tags.map((t) => (
                                                                <span className="chip" key={t} style={{ fontSize: '0.7rem' }}>
                                                                    #{t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </FadeIn>
            )}
        </div>
    )
}
