import type { ReceiptItem } from '../types'

// Skip patterns for header/footer content
const SKIP_PATTERNS = [
  /kuitti tilauksestasi/i,
  /ostostesi kokonaishinta/i,
  /^tuotteet\s+kuvaus/i,
  /kuvaus\s+määrä\s+yhteensä/i,
  /^yhteensä$/i,
  /^kuvaus$/i,
  /^määrä$/i,
  /^maksukortti/i,
  /^plussa-kortti/i,
  /^kuittinumero/i,
  /^tilaus:/i,
  /^säästit/i,
  /toimitusmaksun verolliset/i,
]

function shouldSkipItem(name: string): boolean {
  const trimmed = name.trim()
  if (trimmed.length < 3) return true
  return SKIP_PATTERNS.some((pattern) => pattern.test(trimmed))
}

function cleanItemName(name: string): string {
  return name
    .replace(/Tuotteet\s+Kuvaus\s+määrä\s+yhteensä\s*/gi, '')
    .replace(/Kuvaus\s+määrä\s+yhteensä\s*/gi, '')
    .trim()
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function normalizePrice(price: number): number {
  return Math.round(price * 100) / 100
}

export function parseReceipt(ocrText: string): ReceiptItem[] {
  const items: ReceiptItem[] = []
  const seen = new Set<string>()

  // Find where the tax summary section starts
  const taxSectionMatch = ocrText.match(/alv\s+veroton\s+vero\s+verollinen/i)
  const textBeforeTax = taxSectionMatch && taxSectionMatch.index !== undefined
    ? ocrText.substring(0, taxSectionMatch.index)
    : ocrText

  // Find where the discount breakdown section starts (Plussasetti, Plussa-tasaerä, Tasaerä followed by negative price)
  const discountBreakdownMatch = textBeforeTax.match(/(Plussasetti|Plussa-tasaerä|Tasaerä)\s+-\d{1,3}[.,]\d{2}\s*€/i)

  const mainSectionText = discountBreakdownMatch && discountBreakdownMatch.index !== undefined
    ? textBeforeTax.substring(0, discountBreakdownMatch.index)
    : textBeforeTax

  const discountBreakdownText = discountBreakdownMatch && discountBreakdownMatch.index !== undefined
    ? textBeforeTax.substring(discountBreakdownMatch.index)
    : ''

  // Pattern for main section items
  const pricePattern = /([A-ZÄÖÅa-zäöå][A-ZÄÖÅa-zäöå0-9\s\-\/%.,:]+?)\s+(?:(\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml|kpl|rl|pack|p|-p|eur)?)\s+)?(-?\d{1,3}[.,]\d{2})\s*€/g

  // First pass: main section items
  let match
  while ((match = pricePattern.exec(mainSectionText)) !== null) {
    let name = cleanItemName(match[1].trim())
    const priceStr = match[3].replace(',', '.')
    const price = normalizePrice(parseFloat(priceStr))

    if (price === 0) continue
    if (name.length > 80) continue

    const minLength = price < 0 ? 5 : 3

    if (!shouldSkipItem(name) && name.length >= minLength) {
      const key = `${name}|${price}`
      if (!seen.has(key)) {
        seen.add(key)
        items.push({ id: generateId(), name, price })
      }
    }
  }

  // Second pass: discount breakdown section
  // Pattern: "DiscountType -price € ProductName quantity"
  const discountBreakdownPattern = /(Plussa-tasaerä|Plussasetti|Tasaerä)\s+(-\d{1,3}[.,]\d{2})\s*€\s*([A-ZÄÖÅa-zäöå][A-ZÄÖÅa-zäöå0-9\s\-\/%.,:]+?)\s+(\d+)/g

  while ((match = discountBreakdownPattern.exec(discountBreakdownText)) !== null) {
    const discountType = match[1].trim()
    const priceStr = match[2].replace(',', '.')
    const price = normalizePrice(parseFloat(priceStr))
    const productName = match[3].trim()

    const name = `${productName} ${discountType}`

    const key = `${name}|${price}`
    if (!seen.has(key)) {
      seen.add(key)
      items.push({ id: generateId(), name, price })
    }
  }

  return items
}

export function formatPrice(price: number): string {
  const formatted = Math.abs(price).toFixed(2).replace('.', ',')
  return price < 0 ? `-${formatted}` : formatted
}
