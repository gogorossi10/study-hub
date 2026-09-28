import * as pdfjsLib from 'pdfjs-dist'

// Configure worker for PDF.js in browser
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
} catch (e) {
  console.warn('Could not set pdf workerSrc:', e)
}

/**
 * Strips non-printable binary control characters, strange encoding artifacts, and excess whitespace
 */
export function sanitizeText(raw: string): string {
  if (!raw) return ''
  return raw
    // Remove binary control chars except newline (\n), carriage return (\r), and tab (\t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD]/g, ' ')
    // Normalize unicode spaces
    .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    // Remove repeated spaces
    .replace(/[ \t]+/g, ' ')
    // Remove excessive newlines (keep max 2)
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim()
}

/**
 * Extracts readable text from a PDF file using PDF.js
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  })

  const pdf = await loadingTask.promise
  const numPages = pdf.numPages
  const pageTexts: string[] = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageStr = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
    if (pageStr.trim()) {
      pageTexts.push(`--- Page ${i} ---\n` + pageStr.trim())
    }
  }

  const combined = pageTexts.join('\n\n')
  return sanitizeText(combined)
}

/**
 * Cleanly reads text from any supported file type (PDF, TXT, MD, DOCX/DOC text, JSON, CSV)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  
  if (name.endsWith('.pdf')) {
    try {
      const pdfText = await extractTextFromPDF(file)
      if (pdfText && pdfText.length > 20) {
        return pdfText
      }
    } catch (err) {
      console.warn('PDF.js parse failed, attempting fallback text extraction:', err)
    }
  }

  // Fallback for TXT, MD, Code, or if PDF is text-readable
  try {
    const raw = await file.text()
    // If it's a raw PDF binary that wasn't parsed by pdfjs, don't return raw '%PDF-' garbage
    if (raw.startsWith('%PDF-') || raw.includes('/Type /Catalog')) {
      // PDF was scanned/encrypted or failed pdfjs, extract printable sequences
      const cleanAscii = raw
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\b(obj|endobj|stream|endstream|xref|trailer|startxref)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      return sanitizeText(cleanAscii)
    }
    return sanitizeText(raw)
  } catch (err) {
    console.error('File extraction failed:', err)
    throw new Error(`Could not extract readable text from "${file.name}". Please paste text directly.`)
  }
}
