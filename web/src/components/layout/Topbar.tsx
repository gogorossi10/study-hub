import { useState } from 'react'
import { Menu, Moon, Search, Sun, Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { pageMeta } from '../../lib/nav'
import { getStoredGeminiKey } from '../../lib/gemini'
import { GeminiKeyModal } from '../ui/GeminiKeyModal'

export function Topbar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const meta = pageMeta(pathname)
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false)
  const hasKey = !!getStoredGeminiKey()

  return (
    <>
      <header className="topbar">
        <button className="icon-btn mobile-toggle" onClick={onMenu} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div className="crumb">
          <span>{meta.group}</span>
          <strong>{meta.label}</strong>
        </div>
        <button className="search-chip" onClick={onSearch}>
          <Search size={16} />
          Search tools
          <kbd>Ctrl K</kbd>
        </button>

        <button
          className="btn secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.4rem 0.75rem',
            fontSize: '0.82rem',
            borderRadius: '999px',
            border: hasKey ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)',
            background: hasKey ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface-sunken)',
            color: hasKey ? '#059669' : 'var(--text-secondary)',
          }}
          onClick={() => setIsKeyModalOpen(true)}
          title="Configure Google Gemini Live AI Key"
        >
          <Sparkles size={14} style={{ color: hasKey ? '#10b981' : '#6366f1' }} />
          <span>{hasKey ? 'Live AI: Active' : '🔑 Gemini Key'}</span>
        </button>

        <button className="icon-btn" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <GeminiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </>
  )
}

