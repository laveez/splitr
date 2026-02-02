import type { ReceiptItem } from '../types'

// Skip patterns for header/footer content
const SKIP_PATTERNS = [
  /kuitti tilauksestasi/i,
  /ostostesi kokonaishinta/i,
  /^tuotteet\s+kuvaus/i,
  /kuvaus\s+määrä\s+yhteensä/i,
  /yhteensä/i,
  /vrreensä/i,  // OCR misread of yhteensä
  /^kuvaus$/i,
  /^määrä$/i,
  /^maksukortti/i,
  /^plussa-kortti/i,
  /^kuittinumero/i,
  /^tilaus:/i,
  /^säästit/i,
  /toimitusmaksun verolliset/i,
  // Physical receipt patterns
  /^kanta-asiakas/i,
  /^kortti:/i,
  /plussaa/i,
  /kerryttävät/i,
  /ostot\s*$/i,
  /^card\s+transaction/i,
  /^card:/i,
  /^application:/i,
  /^tr\.nr/i,
  /^payee/i,
  /^reference:/i,
  /^debit\/charge/i,
  /^paypass/i,
  /^alv\s+\d/i,
  /^veroton/i,
  /^kiitos käynnistä/i,
  /^avoinna/i,
  /^ma-pe/i,
  /supermarket/i,
  /^\d{4}\s+\*{4}/i,  // Card numbers like "xxxx **** xxxx"
  /^k\d{3}\s+m/i,     // Receipt codes like "K009 M065..."
  /m\d{5,}/i,         // Receipt codes like "M065146"
  /^\d{2}:\d{2}\s/,   // Lines starting with time
  /puh\./i,
  /y-tunnus/i,
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

  // Find where the tax summary section starts (works for both online and physical receipts)
  // Also handle OCR misreads like "KANTA-ASTAKAS" for "KANTA-ASIAKAS"
  const taxSectionMatch = ocrText.match(/alv\s+veroton\s+vero\s+verollinen/i)
    || ocrText.match(/card\s+transaction/i)
    || ocrText.match(/kanta.?asi?a?kas/i)
    || ocrText.match(/yhteensä|vrreensä/i)
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

  // Pattern for items with € symbol (online receipts like K-Ruoka)
  const pricePatternWithEuro = /([A-ZÄÖÅa-zäöå][A-ZÄÖÅa-zäöå0-9\s\-\/%.,:]+?)\s+(?:(\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml|kpl|rl|pack|p|-p|eur)?)\s+)?(-?\d{1,3}[.,]\d{2})\s*€/g

  // Pattern for items without € symbol (physical receipts)
  // Matches: "Item name    3,99" at end of line
  const pricePatternNoEuro = /^(.+?)\s{2,}(-?\d{1,3}[.,]\d{2})$/gm

  // First pass: try pattern with € symbol
  let match
  while ((match = pricePatternWithEuro.exec(mainSectionText)) !== null) {
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

  // Second pass: if no items found with €, try without € (physical receipts)
  if (items.length === 0) {
    while ((match = pricePatternNoEuro.exec(mainSectionText)) !== null) {
      let name = cleanItemName(match[1].trim())
      const priceStr = match[2].replace(',', '.')
      const price = normalizePrice(parseFloat(priceStr))

      if (price === 0) continue
      if (name.length > 80) continue
      if (name.length < 3) continue

      if (!shouldSkipItem(name)) {
        const key = `${name}|${price}`
        if (!seen.has(key)) {
          seen.add(key)
          items.push({ id: generateId(), name, price })
        }
      }
    }
  }

  // Third pass: noisy OCR fallback - parse line by line, take LAST price on each line
  if (items.length === 0) {
    const lines = mainSectionText.split(/\n/)

    for (const line of lines) {
      // Find all prices on the line (format: d.dd or d,dd)
      const priceMatches = [...line.matchAll(/(\d{1,2})[.,](\d{2})(?=\s|$|[.,;:])/g)]
      if (priceMatches.length === 0) continue

      // Take the LAST price on the line (usually the actual price)
      const lastMatch = priceMatches[priceMatches.length - 1]
      const priceStr = `${lastMatch[1]}.${lastMatch[2]}`
      const price = normalizePrice(parseFloat(priceStr))

      // Get the text before the last price as the item name
      const priceIndex = lastMatch.index!
      let name = line.substring(0, priceIndex).trim()
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/[^A-ZÄÖÅa-zäöå0-9\s\-\/%.,:]/g, '') // Remove garbage chars
        .trim()

      // Clean up common patterns
      name = name.replace(/^[^A-ZÄÖÅa-zäöå]*/, '') // Remove leading non-letters
      name = name.replace(/^\d+[:\-.\s]+\d*\s*/i, '') // Remove receipt codes like "K009 M065..."
      name = name.replace(/\d{1,2}[:.]\d{2}\s*$/i, '') // Remove trailing time patterns
      name = name.replace(/\d{1,2}[.,]\d{1,2}[.,]\d{2,4}\s*$/i, '') // Remove trailing dates

      // Filter reasonable prices (0.10 to 99.99)
      if (price < 0.10 || price > 99.99) continue
      if (name.length > 60) continue
      if (name.length < 3) continue

      if (!shouldSkipItem(name)) {
        const key = `${name}|${price}`
        if (!seen.has(key)) {
          seen.add(key)
          items.push({ id: generateId(), name, price })
        }
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
