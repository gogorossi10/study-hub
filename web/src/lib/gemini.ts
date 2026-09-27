/**
 * Direct Google Gemini API Client for Student Hub
 * Enables instant, client-side live AI generation across SGPA, Summarizer, and Analyzer.
 */

const GEMINI_KEY_STORAGE = 'student_hub_gemini_api_key'

export function getStoredGeminiKey(): string {
  try {
    return localStorage.getItem(GEMINI_KEY_STORAGE) || import.meta.env.VITE_GEMINI_API_KEY || ''
  } catch {
    return ''
  }
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
    throw new Error('MISSING_API_KEY')
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
