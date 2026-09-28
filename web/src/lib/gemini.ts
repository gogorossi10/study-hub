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

  const envKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim()
  if (envKey) return envKey

  return ''
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

  const models = ['gemini-3.1-flash-lite', 'gemini-3.7-flash', 'gemini-flash-lite-latest', 'gemini-3.8-flash']
  for (const model of models) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToTest}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with OK.' }] }],
          }),
        }
      )
      clearTimeout(timeoutId)
      if (res.ok) {
        const data = await res.json()
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return true
        }
      }
    } catch {
      // try next model
    }
  }
  return false
}

export async function generateWithGemini(prompt: string, customApiKey?: string): Promise<string> {
  const apiKey = (customApiKey || getStoredGeminiKey()).trim()
  
  if (!apiKey) {
    throw new Error('NO_KEY_AVAILABLE')
  }

  // Fast & stable model priority: gemini-3.1-flash-lite is sub-3s
  const models = [
    'gemini-3.1-flash-lite',
    'gemini-3.7-flash',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
  ]
  let lastError = ''

  for (const model of models) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
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
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return text.trim()
      } else {
        const errorData = await res.json().catch(() => ({}))
        lastError = errorData?.error?.message || `HTTP ${res.status}: ${res.statusText}`
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Network timeout'
    }
  }

  throw new Error(`Gemini API Error: ${lastError || 'Could not generate response'}`)
}
