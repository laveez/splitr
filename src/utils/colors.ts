/**
 * Card color definition with light/dark mode variants
 */
export interface CardColor {
  light: string
  dark: string
  borderLight: string
  borderDark: string
}

/**
 * Modern pastel color palette for item cards
 */
export const CARD_COLORS: CardColor[] = [
  { light: '#FEE2E2', dark: '#4C1D1D', borderLight: '#FECACA', borderDark: '#7F1D1D' }, // rose
  { light: '#FFEDD5', dark: '#431407', borderLight: '#FED7AA', borderDark: '#7C2D12' }, // orange
  { light: '#FEF3C7', dark: '#422006', borderLight: '#FDE68A', borderDark: '#78350F' }, // amber
  { light: '#ECFCCB', dark: '#1A2E05', borderLight: '#D9F99D', borderDark: '#365314' }, // lime
  { light: '#D1FAE5', dark: '#022C22', borderLight: '#A7F3D0', borderDark: '#064E3B' }, // emerald
  { light: '#CCFBF1', dark: '#042F2E', borderLight: '#99F6E4', borderDark: '#115E59' }, // teal
  { light: '#CFFAFE', dark: '#083344', borderLight: '#A5F3FC', borderDark: '#155E75' }, // cyan
  { light: '#E0F2FE', dark: '#082F49', borderLight: '#BAE6FD', borderDark: '#0C4A6E' }, // sky
  { light: '#E0E7FF', dark: '#1E1B4B', borderLight: '#C7D2FE', borderDark: '#312E81' }, // indigo
  { light: '#EDE9FE', dark: '#2E1065', borderLight: '#DDD6FE', borderDark: '#4C1D95' }, // violet
  { light: '#FAE8FF', dark: '#4A044E', borderLight: '#F5D0FE', borderDark: '#701A75' }, // fuchsia
  { light: '#FCE7F3', dark: '#500724', borderLight: '#FBCFE8', borderDark: '#831843' }, // pink
]

/**
 * Get a consistent color for an item based on its ID
 * Uses a hash function to map IDs to colors deterministically
 */
export function getColorForItem(id: string): CardColor {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash = hash & hash
  }
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length]
}
