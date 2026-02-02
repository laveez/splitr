import type { ReceiptItem } from '../types'
import { formatPrice } from '../utils/receiptParser'

interface Props {
  item: ReceiptItem
}

export default function ItemCard({ item }: Props) {
  return (
    <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-2xl font-medium text-slate-800 dark:text-slate-100 mb-4">
          {item.name}
        </p>
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
          ${formatPrice(item.price)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-center text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-700">
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

      <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2">
        Swipe down to ignore
      </p>
    </div>
  )
}
