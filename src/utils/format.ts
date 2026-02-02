/**
 * Format a price as a string with comma decimal separator (e.g., "12,50")
 * Handles negative prices by prefixing with minus sign
 */
export function formatPrice(price: number): string {
  const formatted = Math.abs(price).toFixed(2).replace('.', ',')
  return price < 0 ? `-${formatted}` : formatted
}

/**
 * Format a price with euro symbol (e.g., "12,50 €")
 */
export function formatEuro(price: number): string {
  return `${formatPrice(price)} €`
}
