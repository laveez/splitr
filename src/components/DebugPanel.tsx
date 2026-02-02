import type { DebugInfo, ReceiptItem } from '../types'

interface Props {
  debugInfo: DebugInfo
  processedImageUrl?: string
  isDebugMode: boolean
  onContinue: (items: ReceiptItem[]) => void
}

export default function DebugPanel({ debugInfo, processedImageUrl, isDebugMode, onContinue }: Props) {
  const handleContinue = () => {
    if (debugInfo.parsedItems && debugInfo.parsedItems.length > 0) {
      onContinue(debugInfo.parsedItems)
    } else {
      onContinue([{ id: '1', name: 'Item 1', price: 0 }])
    }
  }

  return (
    <div className="w-full mt-8 border-t border-slate-200 dark:border-slate-700 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Debug Info</h3>
        {isDebugMode && (
          <button
            onClick={handleContinue}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            data-testid="debug-continue"
          >
            Continue ({debugInfo.parsedItems?.length || 0} items)
          </button>
        )}
      </div>

      {processedImageUrl && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Processed Image:</h4>
          <img
            src={processedImageUrl}
            alt="Processed receipt"
            className="w-full border border-slate-300 dark:border-slate-600 rounded"
          />
        </div>
      )}

      <div className="mb-4">
        <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
          Parsed Items ({debugInfo.parsedItems?.length || 0}):
        </h4>
        <div className="bg-slate-100 dark:bg-slate-800 rounded p-3 max-h-48 overflow-auto">
          {debugInfo.parsedItems && debugInfo.parsedItems.length > 0 ? (
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
              {debugInfo.parsedItems.map((item, i) => (
                <li key={i}>
                  <span className="font-mono">{item.price.toFixed(2)}€</span> - {item.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No items parsed</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Raw OCR Text:</h4>
        <pre className="bg-slate-100 dark:bg-slate-800 rounded p-3 text-xs text-slate-700 dark:text-slate-300 max-h-64 overflow-auto whitespace-pre-wrap">
          {debugInfo.ocrText}
        </pre>
      </div>
    </div>
  )
}
