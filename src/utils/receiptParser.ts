import type { ReceiptItem } from '../types'

const SKIP_WORDS = [
  'yhteensä', 'alennus', 'plussa', 'tasaerä', 'plussasetti',
  'pantti', 'pullopantti', 'tölkkipantti', 'alv', 'vero',
  'maksukortti', 'kuitti', 'tilaus', 'säästit', 'ostostesi',
  'kuvaus', 'määrä', 'toimitusmaksu', 'henkilökohtainen',
  'total', 'subtotal', 'tax', 'discount', 'savings', 'change',
  'cash', 'card', 'credit', 'visa', 'mastercard', 'balance'
]

function shouldSkipItem(name: string): boolean {
  const lower = name.toLowerCase()
  // Skip if contains skip words
  if (SKIP_WORDS.some((word) => lower.includes(word))) return true
  // Skip if name is too short or starts with lowercase single letter + space/number
  if (name.length < 5) return true
  // Skip fragment names that don't start with proper word (at least 2 letters)
  if (!/^[A-ZÄÖÅa-zäöå]{2,}/.test(name)) return true
  // Skip names that are mostly numbers/units
  if (/^\d|^[a-z]\s+\d|tai alle/i.test(name)) return true
  return false
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function normalizePrice(price: number): number {
  return Math.round(price * 100) / 100
}

export function parseReceipt(ocrText: string): ReceiptItem[] {
  const items: ReceiptItem[] = []
  const seenPrices = new Map<number, string>() // price -> longest name for that price

  // Pattern: item name followed by quantity and price
  // Matches: "Pirkka mozzarella 200g/125g 3 4,17 €"
  const itemPattern = /([A-ZÄÖÅa-zäöå][A-ZÄÖÅa-zäöå0-9\s\-\/%.]+?)\s+(\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml|kpl|rl|pack|p|-p)?)\s+(\d{1,3}[.,]\d{2})\s*€/g

  let match
  while ((match = itemPattern.exec(ocrText)) !== null) {
    const name = match[1].trim()
    const priceStr = match[3].replace(',', '.')
    const price = normalizePrice(parseFloat(priceStr))

    if (price > 0 && price < 500 && !shouldSkipItem(name)) {
      // Keep the longer name for each price (avoid duplicates with truncated names)
      const existingName = seenPrices.get(price)
      if (!existingName || name.length > existingName.length) {
        seenPrices.set(price, name)
      }
    }
  }

  // Convert map to items array
  for (const [price, name] of seenPrices) {
    items.push({ id: generateId(), name, price })
  }

  // Sort by price descending for consistent order
  items.sort((a, b) => b.price - a.price)

  return items
}

export function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',')
}
