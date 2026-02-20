import type { ReceiptItem } from '../types'
import { formatPrice } from '../utils/format'
import { getColorForItem } from '../utils/colors'

interface Props {
  item: ReceiptItem
  zIndex?: number
}

export default function ItemCard({ item, zIndex = 0 }: Props) {
  const color = getColorForItem(item.id)

  return (
    <div
      className="absolute inset-0 border-2 rounded-2xl shadow-xl p-6 flex flex-col select-none"
      style={{
        zIndex,
        backgroundColor: color.dark,
        borderColor: color.borderDark,
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-2xl font-medium text-slate-100 mb-4">
          {item.name}
        </p>
        <p className="text-4xl font-bold text-slate-200">
          {formatPrice(item.price)} €
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-center text-slate-300 pt-4 border-t border-slate-500/50">
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

      <p className="text-xs text-center text-slate-400 mt-2">
        Swipe down to ignore
      </p>
    </div>
  )
}
