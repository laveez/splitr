/**
 * Generate a random ID for receipt items
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
