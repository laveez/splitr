import type { ReceiptItem } from '../types'

const SKIP_PATTERNS = [
  /^(sub)?total/i,
  /^tax/i,
  /^tip/i,
  /^balance/i,
  /^change/i,
  /^cash/i,
  /^card/i,
  /^credit/i,
  /^debit/i,
  /^visa/i,
  /^mastercard/i,
  /^amount\s*(due|paid)?/i,
  /^grand\s*total/i,
  /^discount/i,
  /^savings/i,
  /^thank\s*you/i,
  /^date/i,
  /^time/i,
  /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/, // dates
  /^\d{1,2}:\d{2}/, // times
]

function shouldSkipLine(text: string): boolean {
  const trimmed = text.trim()
  return SKIP_PATTERNS.some((pattern) => pattern.test(trimmed))
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function parseReceipt(ocrText: string): ReceiptItem[] {
  const lines = ocrText.split('\n').filter((line) => line.trim())
  const items: ReceiptItem[] = []

  // Price patterns to match various formats: $12.99, 12.99, 12,99, €12.99, etc.
  const pricePattern = /[$€£]?\s*(\d{1,4}[.,]\d{2})\s*$/

  for (const line of lines) {
    if (shouldSkipLine(line)) continue

    const match = line.match(pricePattern)
    if (match) {
      const priceStr = match[1].replace(',', '.')
      const price = parseFloat(priceStr)

      if (price > 0 && price < 10000) {
        // Reasonable price range
        const name = line
          .replace(pricePattern, '')
          .replace(/^\s*\d+\s*x?\s*/i, '') // remove quantity prefix like "2 x" or "2"
          .replace(/\s+/g, ' ')
          .trim()

        if (name.length > 1) {
          items.push({
            id: generateId(),
            name,
            price,
          })
        }
      }
    }
  }

  return items
}

export function formatPrice(price: number): string {
  return price.toFixed(2)
}
