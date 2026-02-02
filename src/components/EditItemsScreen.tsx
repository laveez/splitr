import { useState, useCallback } from 'react'
import type { ReceiptItem } from '../types'
import { formatPrice } from '../utils/receiptParser'

interface Props {
  items: ReceiptItem[]
  onConfirm: (items: ReceiptItem[]) => void
  onBack: () => void
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export default function EditItemsScreen({ items: initialItems, onConfirm, onBack }: Props) {
  const [items, setItems] = useState<ReceiptItem[]>(initialItems)

  const updateItem = useCallback((id: string, field: 'name' | 'price', value: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        if (field === 'name') return { ...item, name: value }
        const price = parseFloat(value) || 0
        return { ...item, price }
      })
    )
  }, [])

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { id: generateId(), name: '', price: 0 },
    ])
  }, [])

  const validItems = items.filter((item) => item.name.trim() && item.price !== 0)
  const total = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ← Back
        </button>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {items.length} items
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Review and edit the detected items. You can fix names, adjust prices, or add missing items.
      </p>

      <div className="flex-1 space-y-3 overflow-auto mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm"
          >
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
              placeholder="Item name"
              className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
            <div className="flex items-center gap-1">
              <span className="text-slate-400">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={item.price || ''}
                onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                placeholder="0.00"
                className="w-20 bg-transparent border-none outline-none text-right text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-slate-400 hover:text-red-500 p-1"
              aria-label="Delete item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg py-3 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors mb-4"
      >
        + Add Item
      </button>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <div className="flex justify-between text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">
          <span>Total</span>
          <span>{formatPrice(total)} €</span>
        </div>

        <button
          onClick={() => onConfirm(items.filter((item) => item.name.trim()))}
          disabled={validItems.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Looks Good ({validItems.length} items)
        </button>
      </div>
    </div>
  )
}
