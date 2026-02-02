import { useState, useMemo, useCallback } from 'react'
import type { CategorizedItem } from '../types'
import { calculateSplit, formatSplitSummary } from '../utils/calculations'
import { formatPrice } from '../utils/receiptParser'

interface Props {
  categorizedItems: CategorizedItem[]
  onStartOver: () => void
}

export default function ResultsScreen({ categorizedItems, onStartOver }: Props) {
  const [showDetails, setShowDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => calculateSplit(categorizedItems), [categorizedItems])
  const halfCommon = result.commonTotal / 2
  const meOwes = result.meTotal + halfCommon
  const youOwes = result.youTotal + halfCommon

  const handleCopy = useCallback(async () => {
    const summary = formatSplitSummary(result)
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = summary
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [result])

  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 text-center">
        Split Results
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 text-center">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Me</p>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
            {formatPrice(meOwes)} €
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">You</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {formatPrice(youOwes)} €
          </p>
        </div>
      </div>

      {result.commonTotal > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 mb-4 text-center">
          <p className="text-sm text-purple-600 dark:text-purple-400">
            Shared items total: {formatPrice(result.commonTotal)} € ({formatPrice(halfCommon)} € each)
          </p>
        </div>
      )}

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-4"
      >
        <span>{showDetails ? '▼' : '▶'}</span>
        <span>{showDetails ? 'Hide' : 'Show'} breakdown</span>
      </button>

      {showDetails && (
        <div className="space-y-4 mb-6">
          {result.meItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                My Items ({result.meItems.length})
              </h3>
              <div className="space-y-1">
                {result.meItems.map(({ item }) => (
                  <div key={item.id} className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>{item.name}</span>
                    <span>{formatPrice(item.price)} €</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.youItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                Your Items ({result.youItems.length})
              </h3>
              <div className="space-y-1">
                {result.youItems.map(({ item }) => (
                  <div key={item.id} className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>{item.name}</span>
                    <span>{formatPrice(item.price)} €</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.commonItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                Shared Items ({result.commonItems.length})
              </h3>
              <div className="space-y-1">
                {result.commonItems.map(({ item }) => (
                  <div key={item.id} className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>{item.name}</span>
                    <span>{formatPrice(item.price)} €</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.ignoredItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 dark:text-slate-500 mb-2">
                Ignored ({result.ignoredItems.length})
              </h3>
              <div className="space-y-1">
                {result.ignoredItems.map(({ item }) => (
                  <div key={item.id} className="flex justify-between text-sm text-slate-400 dark:text-slate-500 line-through">
                    <span>{item.name}</span>
                    <span>{formatPrice(item.price)} €</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 mt-auto">
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200 text-white dark:text-slate-800 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <span>✓</span>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copy Summary</span>
            </>
          )}
        </button>

        <button
          onClick={onStartOver}
          className="w-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium py-3 px-4 transition-colors"
        >
          Split Another Receipt
        </button>
      </div>
    </div>
  )
}
