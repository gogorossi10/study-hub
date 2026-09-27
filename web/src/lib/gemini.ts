/**
 * Direct Google Gemini API Client for Student Hub
 * Pre-configured with auto-assigned Gemini AI keys for seamless, zero-config live AI responses.
 */

const GEMINI_KEY_STORAGE = 'student_hub_gemini_api_key'

const AUTO_ASSIGNED_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY || '',
].filter(Boolean)

export function getStoredGeminiKey(): string {
  try {
    const userKey = localStorage.getItem(GEMINI_KEY_STORAGE)
    if (userKey && userKey.trim()) return userKey.trim()
  } catch {
    // ignore
  }

  // Auto-assigned default key
  if (AUTO_ASSIGNED_KEYS.length > 0 && AUTO_ASSIGNED_KEYS[0]) {
    return AUTO_ASSIGNED_KEYS[0]
  }

  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim()
}

export function setStoredGeminiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(GEMINI_KEY_STORAGE, key.trim())
    } else {
      localStorage.removeItem(GEMINI_KEY_STORAGE)
    }
  } catch {
    // ignore
  }
}

export async function testGeminiKey(apiKey: string): Promise<boolean> {
  if (!apiKey.trim()) return false
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with the word "OK" only.' }] }],
        }),
      }
    )
    if (!res.ok) return false
    const data = await res.json()
    return !!data?.candidates?.[0]?.content?.parts?.[0]?.text
  } catch {
    return false
  }
}

export async function generateWithGemini(prompt: string, customApiKey?: string): Promise<string> {
  const apiKey = (customApiKey || getStoredGeminiKey()).trim()
  
  if (!apiKey) {
    // If no key is set yet, return undefined or throw to allow smart heuristic fallback
    throw new Error('NO_KEY_AVAILABLE')
  }

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-pro']
  let lastError = ''

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      )

      if (res.ok) {
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return text.trim()
      } else {
        const errorData = await res.json().catch(() => ({}))
        lastError = errorData?.error?.message || `HTTP ${res.status}: ${res.statusText}`
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Network error'
    }
  }

  throw new Error(`Gemini API Error: ${lastError || 'Could not generate response'}`)
}
