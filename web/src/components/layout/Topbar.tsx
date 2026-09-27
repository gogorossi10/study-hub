import { useState } from 'react'
import { Menu, Moon, Search, Sun, Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { pageMeta } from '../../lib/nav'
import { GeminiKeyModal } from '../ui/GeminiKeyModal'

export function Topbar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const meta = pageMeta(pathname)
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false)

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
            border: '1px solid rgba(16, 185, 129, 0.4)',
            background: 'rgba(16, 185, 129, 0.08)',
            color: '#059669',
          }}
          onClick={() => setIsKeyModalOpen(true)}
          title="Study Help AI (Gemini Live Engine Configured)"
        >
          <Sparkles size={14} style={{ color: '#10b981' }} />
          <span>✨ Study Help AI: Active</span>
        </button>

        <button className="icon-btn" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <GeminiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </>
  )
}

