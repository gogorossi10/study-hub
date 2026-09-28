/**
 * Direct Google Gemini API Client for Student Hub
 * Pre-configured with auto-assigned Gemini AI keys for seamless, zero-config live AI responses.
 */

const GEMINI_KEY_STORAGE = 'student_hub_gemini_api_key'

export function getStoredGeminiKey(): string {
  try {
    const userKey = localStorage.getItem(GEMINI_KEY_STORAGE)
    if (userKey && userKey.trim()) return userKey.trim()
  } catch {
    // ignore
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
  const keyToTest = (apiKey || getStoredGeminiKey()).trim()
  if (!keyToTest) return false

  const models = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.8-flash']
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToTest}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with OK.' }] }],
          }),
        }
      )
      if (res.ok) {
        const data = await res.json()
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return true
        }
      }
    } catch {
      // try next
    }
  }
  return false
}

export async function generateWithGemini(prompt: string, customApiKey?: string): Promise<string> {
  const apiKey = (customApiKey || getStoredGeminiKey()).trim()
  
  if (!apiKey) {
    throw new Error('NO_KEY_AVAILABLE')
  }

  const models = [
    'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
  ]
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
