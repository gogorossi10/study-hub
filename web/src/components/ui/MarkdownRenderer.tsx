import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const parseMarkdown = (raw: string): React.ReactNode[] => {
    if (!raw) return []

    // Normalize newlines and clean non-printable chars
    const cleaned = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    const lines = cleaned.split(/\r?\n/)
    const elements: React.ReactNode[] = []
    let i = 0

    const renderInline = (text: string): React.ReactNode[] => {
      if (!text) return []

      const parts: React.ReactNode[] = []
      // Match bold (**text** or __text__), inline code (`code`), math ($math$), italic (*text* or _text_), links [text](url) or URLs
      const regex = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\$[^$]+\$|\[([^\]]+)\]\(([^)]+)\)|\*[^*]+\*|_[^_]+_|https?:\/\/[^\s]+)/g
      let lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index))
        }

        const matchText = match[0]
        if ((matchText.startsWith('**') && matchText.endsWith('**')) || (matchText.startsWith('__') && matchText.endsWith('__'))) {
          parts.push(
            <strong key={`b-${match.index}`} style={{ fontWeight: 650, color: 'var(--text-primary)' }}>
              {matchText.slice(2, -2)}
            </strong>
          )
        } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
          parts.push(
            <code
              key={`c-${match.index}`}
              style={{
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#6366f1',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.88em',
                fontFamily: 'monospace',
              }}
            >
              {matchText.slice(1, -1)}
            </code>
          )
        } else if (matchText.startsWith('$') && matchText.endsWith('$')) {
          parts.push(
            <code
              key={`m-${match.index}`}
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                padding: '2px 5px',
                borderRadius: '4px',
                fontSize: '0.9em',
                fontFamily: 'monospace',
                fontStyle: 'italic',
              }}
            >
              {matchText.slice(1, -1)}
            </code>
          )
        } else if (matchText.startsWith('[') && match[2] && match[3]) {
          parts.push(
            <a
              key={`link-${match.index}`}
              href={match[3]}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#6366f1', textDecoration: 'underline' }}
            >
              {match[2]}
            </a>
          )
        } else if ((matchText.startsWith('*') && matchText.endsWith('*')) || (matchText.startsWith('_') && matchText.endsWith('_'))) {
          parts.push(
            <em key={`i-${match.index}`} style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
              {matchText.slice(1, -1)}
            </em>
          )
        } else if (matchText.startsWith('http')) {
          parts.push(
            <a
              key={`l-${match.index}`}
              href={matchText}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#6366f1', textDecoration: 'underline' }}
            >
              {matchText}
            </a>
          )
        }
        lastIndex = regex.lastIndex
      }

      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex))
      }

      return parts
    }

    while (i < lines.length) {
      const line = lines[i].trimEnd()

      // Blank line
      if (!line.trim()) {
        i++
        continue
      }

      // Horizontal divider
      if (/^(\-{3,}|\_{3,}|\*{3,})$/.test(line.trim())) {
        elements.push(
          <hr
            key={`hr-${i}`}
            style={{
              border: 'none',
              borderTop: '1px solid var(--border)',
              margin: '1.25rem 0',
            }}
          />
        )
        i++
        continue
      }

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={`h3-${i}`}
            style={{
              fontSize: '1.18rem',
              fontWeight: 700,
              margin: '1.2rem 0 0.5rem 0',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {renderInline(line.slice(4))}
          </h3>
        )
        i++
        continue
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={`h2-${i}`}
            style={{
              fontSize: '1.35rem',
              fontWeight: 750,
              margin: '1.4rem 0 0.6rem 0',
              color: 'var(--text-primary)',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '0.35rem',
            }}
          >
            {renderInline(line.slice(3))}
          </h2>
        )
        i++
        continue
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1
            key={`h1-${i}`}
            style={{
              fontSize: '1.55rem',
              fontWeight: 800,
              margin: '1.5rem 0 0.75rem 0',
              color: 'var(--text-primary)',
            }}
          >
            {renderInline(line.slice(2))}
          </h1>
        )
        i++
        continue
      }

      // Code blocks (e.g. ``` or ```mermaid)
      if (line.startsWith('```')) {
        const lang = line.slice(3).trim()
        const codeLines: string[] = []
        i++
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i])
        }
        if (i < lines.length) i++ // skip ending ```

        const codeContent = codeLines.join('\n')
        elements.push(
          <div
            key={`code-${i}`}
            style={{
              background: 'var(--surface-sunken, #0f172a)',
              color: '#e2e8f0',
              padding: '1rem',
              borderRadius: '10px',
              fontFamily: 'monospace',
              fontSize: '0.86rem',
              lineHeight: '1.5',
              overflowX: 'auto',
              margin: '0.85rem 0',
              border: '1px solid var(--border)',
            }}
          >
            {lang && (
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                }}
              >
                {lang}
              </div>
            )}
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{codeContent}</pre>
          </div>
        )
        continue
      }

      // Tables (Lines starting with |)
      if (line.startsWith('|') && line.endsWith('|')) {
        const tableLines: string[] = []
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim())
          i++
        }

        if (tableLines.length >= 2) {
          const headerRow = tableLines[0].split('|').slice(1, -1).map((c) => c.trim())
          // Skip divider row (e.g. |---|---|)
          const dataRows = tableLines
            .slice(2)
            .map((r) => r.split('|').slice(1, -1).map((c) => c.trim()))

          elements.push(
            <div key={`table-wrapper-${i}`} style={{ overflowX: 'auto', margin: '1rem 0' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.88rem',
                  textAlign: 'left',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                }}
              >
                <thead>
                  <tr style={{ background: 'var(--surface-sunken, rgba(99, 102, 241, 0.08))' }}>
                    {headerRow.map((h, idx) => (
                      <th
                        key={idx}
                        style={{
                          padding: '0.65rem 0.85rem',
                          fontWeight: 650,
                          borderBottom: '2px solid var(--border)',
                        }}
                      >
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: rIdx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)',
                      }}
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: '0.6rem 0.85rem' }}>
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
          continue
        }
      }

      // Blockquotes (> quote)
      if (line.startsWith('>')) {
        const quoteLines: string[] = []
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s*/, ''))
          i++
        }

        elements.push(
          <blockquote
            key={`quote-${i}`}
            style={{
              margin: '0.8rem 0',
              padding: '0.6rem 1rem',
              borderLeft: '4px solid #6366f1',
              background: 'rgba(99, 102, 241, 0.06)',
              borderRadius: '0 8px 8px 0',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
            }}
          >
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx} style={{ margin: '0.2rem 0' }}>
                {renderInline(ql)}
              </p>
            ))}
          </blockquote>
        )
        continue
      }

      // Bullet lists (*, -, •)
      if (/^[\*\-\•]\s+/.test(line)) {
        const listItems: string[] = []
        while (i < lines.length && /^[\*\-\•]\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^[\*\-\•]\s+/, ''))
          i++
        }

        elements.push(
          <ul
            key={`ul-${i}`}
            style={{
              paddingLeft: '1.4rem',
              margin: '0.6rem 0',
              lineHeight: '1.65',
              listStyleType: 'disc',
            }}
          >
            {listItems.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '0.35rem' }}>
                {renderInline(item)}
              </li>
            ))}
          </ul>
        )
        continue
      }

      // Numbered lists (1., 2., etc.)
      if (/^\d+[\.\)]\s+/.test(line)) {
        const listItems: string[] = []
        while (i < lines.length && /^\d+[\.\)]\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+[\.\)]\s+/, ''))
          i++
        }

        elements.push(
          <ol
            key={`ol-${i}`}
            style={{
              paddingLeft: '1.4rem',
              margin: '0.6rem 0',
              lineHeight: '1.65',
            }}
          >
            {listItems.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '0.35rem' }}>
                {renderInline(item)}
              </li>
            ))}
          </ol>
        )
        continue
      }

      // Standard Paragraph
      elements.push(
        <p
          key={`p-${i}`}
          style={{
            margin: '0.55rem 0',
            lineHeight: '1.65',
            color: 'var(--text-primary)',
          }}
        >
          {renderInline(line)}
        </p>
      )
      i++
    }

    return elements
  }

  return (
    <div
      className={className}
      style={{
        lineHeight: '1.65',
        fontSize: '0.94rem',
        color: 'var(--text-primary)',
      }}
    >
      {parseMarkdown(content)}
    </div>
  )
}
