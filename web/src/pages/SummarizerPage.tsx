import { useState } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import { Card, FadeIn, Button, Field, Dropzone, Stat, EmptyState } from '../components/ui/Primitives'
import { GuidedPageHeader } from '../components/ui/GuidedPageHeader'
import { apiForm } from '../lib/api'
import { extractTextFromFile } from '../lib/fileExtractor'
import { useToast } from '../context/ToastContext'
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer'

type SummaryResult = {
  summary: string
  bullets: string[]
  study_notes: { concept: string; frequency: number; context: string }[]
  keywords: string[]
  stats: {
    original_words: number
    summary_words: number
    compression_pct: number
    read_time_saved_min: number
  }
  source: string
}

const pageSteps = [
  { title: 'Add material', description: 'Upload PDF or paste notes' },
  { title: 'Choose format', description: 'Pick summary style' },
  { title: 'Review results', description: 'Get your study brief' },
]

export function SummarizerPage() {
  const toast = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [mode, setMode] = useState('executive')
  const [length, setLength] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SummaryResult | null>(null)

  const currentStep = result ? 2 : file || text ? 1 : 0

  const handleFile = async (selectedFile: File | null) => {
    setFile(selectedFile)
    if (!selectedFile) return
    setExtracting(true)
    try {
      const clean = await extractTextFromFile(selectedFile)
      if (clean && clean.trim()) {
        setText(clean)
        toast.push(`✨ Extracted text from "${selectedFile.name}"!`)
      }
    } catch (err) {
      toast.push('⚠️ Could not extract text from file, you can paste notes below.')
    } finally {
      setExtracting(false)
    }
  }

  async function run() {
    setError('')
    setLoading(true)
    try {
      const form = new FormData()
      if (file) form.append('file', file)
      form.append('text', text)
      form.append('mode', mode)
      form.append('length', length)
      setResult(await apiForm<SummaryResult>('/summarize', form))
      toast.push('Study brief is ready.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not summarize this document.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <GuidedPageHeader
        icon={BookOpen}
        kicker="Academic"
        title="Turn dense notes into a study brief"
        subtitle="Upload a lecture, paste a chapter, then choose the format you need. Your AI-generated summary, bullets, and flashcard concepts appear instantly."
        color="#6366f1"
        gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
        steps={pageSteps}
        currentStep={currentStep}
      />

      <div className="grid grid-2">
        <FadeIn>
          <Card>
            <Dropzone
              file={file}
              hint={extracting ? 'Extracting readable text from document…' : 'Drop a study document or PDF here'}
              accept=".pdf,.txt,.docx,.doc,.md"
              onFile={handleFile}
            />
            {extracting && (
              <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                <Loader2 size={14} className="animate-spin" /> Extracting document text...
              </p>
            )}
            <Field label="Or paste notes">
              <textarea
                className="input"
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste lecture notes, an article, or a chapter..."
              />
            </Field>
            <div className="grid grid-2" style={{ marginTop: '1rem' }}>
              <Field label="Summary style">
                <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="executive">Executive overview</option>
                  <option value="bullet_points">Key bullets</option>
                  <option value="study_notes">Study notes & flashcards</option>
                  <option value="comprehensive">Comprehensive synthesis</option>
                </select>
              </Field>
              <Field label="Length">
                <select className="input" value={length} onChange={(e) => setLength(e.target.value)}>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="detailed">Detailed</option>
                </select>
              </Field>
            </div>
            {error ? <p style={{ color: 'var(--danger)', marginTop: '0.8rem' }}>{error}</p> : null}
            <Button style={{ marginTop: '1rem' }} onClick={() => void run()} disabled={loading || extracting}>
              {loading ? 'Summarizing with AI…' : 'Create study summary'}
            </Button>
          </Card>
        </FadeIn>

        <FadeIn delay={0.08}>
          {!result ? (
            <Card>
              <EmptyState title="Nothing summarized yet" copy="Add a PDF or paste notes on the left. Your brief, bullets, and keywords will land here." />
            </Card>
          ) : (
            <Card>
              <p className="muted">Source: {result.source}</p>
              <div className="grid grid-4" style={{ margin: '0.8rem 0 1rem' }}>
                <Stat value={result.stats.original_words} label="Original words" />
                <Stat value={result.stats.summary_words} label="Summary words" />
                <Stat value={`${result.stats.compression_pct}%`} label="Compressed" />
                <Stat value={`${result.stats.read_time_saved_min}m`} label="Time saved" />
              </div>

              <h3>Summary</h3>
              <div style={{ background: 'var(--surface-sunken, rgba(99, 102, 241, 0.04))', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <MarkdownRenderer content={result.summary} />
              </div>

              <h3 style={{ marginTop: '1.2rem' }}>Key Takeaways</h3>
              <ul>
                {result.bullets.map((b, idx) => (
                  <li key={idx} style={{ marginBottom: '0.3rem' }}>
                    <MarkdownRenderer content={b.replace(/^•\s*/, '')} />
                  </li>
                ))}
              </ul>

              {result.study_notes?.length ? (
                <>
                  <h3 style={{ marginTop: '1.2rem' }}>Concepts to review</h3>
                  <div className="grid">
                    {result.study_notes.slice(0, 8).map((note) => (
                      <div key={note.concept} className="card" style={{ padding: '0.8rem', border: '1px solid var(--border)' }}>
                        <strong>{note.concept}</strong>
                        <p className="muted" style={{ margin: '0.3rem 0 0' }}>{note.context}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              <div className="chip-row" style={{ marginTop: '1.2rem' }}>
                {result.keywords.map((k) => (
                  <span className="chip" key={k}>{k}</span>
                ))}
              </div>
            </Card>
          )}
        </FadeIn>
      </div>
    </div>
  )
}
