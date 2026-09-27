import { useState, useEffect } from 'react'
import { KeyRound, Sparkles, CheckCircle2, AlertCircle, ExternalLink, X } from 'lucide-react'
import { getStoredGeminiKey, setStoredGeminiKey, testGeminiKey } from '../../lib/gemini'
import { useToast } from '../../context/ToastContext'

interface GeminiKeyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GeminiKeyModal({ isOpen, onClose }: GeminiKeyModalProps) {
  const toast = useToast()
  const [apiKey, setApiKey] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      const existing = getStoredGeminiKey()
      setApiKey(existing)
      setTestStatus(existing ? 'valid' : 'idle')
      setStatusMsg(existing ? 'Configured and active' : '')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleTestAndSave = async () => {
    if (!apiKey.trim()) {
      setStoredGeminiKey('')
      setTestStatus('idle')
      setStatusMsg('API key cleared. System will use standard heuristics.')
      toast.push('Gemini API key removed.')
      return
    }

    setIsTesting(true)
    setStatusMsg('Validating with Google Gemini API...')
    
    try {
      const isValid = await testGeminiKey(apiKey.trim())
      if (isValid) {
        setStoredGeminiKey(apiKey.trim())
        setTestStatus('valid')
        setStatusMsg('✅ Success! Your Gemini API key is valid and active.')
        toast.push('Gemini AI connected! Live generation active.')
      } else {
        setTestStatus('invalid')
        setStatusMsg('❌ Invalid API Key. Please check the key from Google AI Studio.')
      }
    } catch {
      setTestStatus('invalid')
      setStatusMsg('❌ Connection failed. Check your network or API key.')
    } finally {
      setIsTesting(false)
    }
  }

  const handleClear = () => {
    setApiKey('')
    setStoredGeminiKey('')
    setTestStatus('idle')
    setStatusMsg('API key removed.')
    toast.push('API key cleared.')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface-raised, #ffffff)',
          color: 'var(--text-primary, #1e293b)',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary, #64748b)',
            padding: '4px',
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              padding: '8px',
              borderRadius: '10px',
              color: 'white',
              display: 'flex',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Google Gemini Live AI Setup</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary, #64748b)' }}>
              Enable 100% real-time AI responses across SGPA & Student Hub
            </p>
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface-sunken, rgba(99, 102, 241, 0.06))',
            padding: '0.85rem',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            marginBottom: '1.2rem',
          }}
        >
          <strong>💡 Free Google AI Studio Key:</strong>
          <br />
          Google provides free Gemini API keys for students and developers.
          <br />
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#4f46e5',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px',
              textDecoration: 'none',
            }}
          >
            Get a Free Gemini Key at Google AI Studio <ExternalLink size={13} />
          </a>
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Enter Gemini API Key (starts with AIzaSy...)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              className="input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              style={{ flex: 1, fontFamily: 'monospace' }}
            />
          </div>
        </div>

        {statusMsg && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor:
                testStatus === 'valid'
                  ? 'rgba(16, 185, 129, 0.12)'
                  : testStatus === 'invalid'
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(99, 102, 241, 0.1)',
              color:
                testStatus === 'valid'
                  ? '#059669'
                  : testStatus === 'invalid'
                  ? '#dc2626'
                  : '#4f46e5',
              border: `1px solid ${
                testStatus === 'valid'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : testStatus === 'invalid'
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(99, 102, 241, 0.3)'
              }`,
            }}
          >
            {testStatus === 'valid' && <CheckCircle2 size={16} />}
            {testStatus === 'invalid' && <AlertCircle size={16} />}
            {testStatus === 'idle' && <KeyRound size={16} />}
            <span>{statusMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem' }}>
          {apiKey && (
            <button
              type="button"
              className="btn secondary"
              onClick={handleClear}
              style={{ fontSize: '0.85rem' }}
            >
              Clear Key
            </button>
          )}
          <div style={{ display: 'flex', gap: '0.8rem', marginLeft: 'auto' }}>
            <button type="button" className="btn secondary" onClick={onClose}>
              Done
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={handleTestAndSave}
              disabled={isTesting}
            >
              {isTesting ? 'Validating…' : 'Save & Enable Live AI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
