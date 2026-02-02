import { useState, useEffect } from 'react'
import type { ReceiptItem } from '../types'
import { formatPrice } from '../utils/receiptParser'

// Modern pastel color palette for cards
const CARD_COLORS = [
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

function getColorForItem(id: string): typeof CARD_COLORS[0] {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash = hash & hash
  }
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length]
}

function useDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return isDark
}

interface Props {
  item: ReceiptItem
  zIndex?: number
}

export default function ItemCard({ item, zIndex = 0 }: Props) {
  const color = getColorForItem(item.id)
  const isDark = useDarkMode()

  return (
    <div
      className="absolute inset-0 border-2 rounded-2xl shadow-xl p-6 flex flex-col select-none"
      style={{
        zIndex,
        backgroundColor: isDark ? color.dark : color.light,
        borderColor: isDark ? color.borderDark : color.borderLight,
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-2xl font-medium text-slate-800 dark:text-slate-100 mb-4">
          {item.name}
        </p>
        <p className="text-4xl font-bold text-slate-700 dark:text-slate-200">
          {formatPrice(item.price)} €
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-center text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-300/50 dark:border-slate-500/50">
        <div className="flex flex-col items-center">
          <span className="text-lg mb-1">👈</span>
          <span>Me</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg mb-1">👆</span>
          <span>Common</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg mb-1">👉</span>
          <span>You</span>
        </div>
      </div>

      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
        Swipe down to ignore
      </p>
    </div>
  )
}
