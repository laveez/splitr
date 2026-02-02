import { useEffect, useState } from 'react'
import { useOCR } from '../hooks/useOCR'
import { parseReceipt } from '../utils/receiptParser'
import { extractTextFromPdf } from '../utils/pdfExtractor'
import DebugPanel from './DebugPanel'
import type { ReceiptItem, DebugInfo } from '../types'

// Enable debug mode via URL param: ?debug=true
const DEBUG_MODE = new URLSearchParams(window.location.search).has('debug')

interface Props {
  file: File
  onItemsExtracted: (items: ReceiptItem[]) => void
  onError: () => void
}

export default function ProcessingScreen({ file, onItemsExtracted, onError }: Props) {
  const { progress, isProcessing, error, processImage, processedImageUrl } = useOCR()
  const [status, setStatus] = useState('Preparing...')
  const [localProgress, setLocalProgress] = useState(0)
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({})
  const [showDebug, setShowDebug] = useState(DEBUG_MODE)

  useEffect(() => {
    let cancelled = false

    async function process() {
      try {
        let text: string

        if (file.type === 'application/pdf') {
          setStatus('Reading PDF...')
          setLocalProgress(0.3)
          text = await extractTextFromPdf(file)
          setLocalProgress(1)
        } else {
          setStatus('Reading receipt...')
          text = (await processImage(file)) || ''
        }

        if (cancelled) return

        // Debug: log OCR output
        console.log('=== OCR TEXT ===')
        console.log(text)
        console.log('=== END OCR TEXT ===')

        const items = parseReceipt(text)
        console.log('Parsed items:', items)

        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          ocrText: text,
          parsedItems: items,
        }))

        if (DEBUG_MODE) {
          // In debug mode, don't auto-proceed
          setStatus('Debug mode - review results below')
          return
        }

        if (items.length === 0) {
          setStatus('No items found. Please try editing manually.')
          onItemsExtracted([{ id: '1', name: 'Item 1', price: 0 }])
        } else {
          onItemsExtracted(items)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Processing error:', err)
          setStatus('Error processing receipt')
        }
      }
    }

    process()
    return () => {
      cancelled = true
    }
  }, [file, processImage, onItemsExtracted])

  const displayProgress = file.type === 'application/pdf' ? localProgress : progress
  const progressPercent = Math.round(displayProgress * 100)

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-24 h-24 mb-6">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={251.2}
            strokeDashoffset={251.2 * (1 - displayProgress)}
            className="text-blue-600 transition-all duration-300"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-slate-700 dark:text-slate-200">
          {progressPercent}%
        </span>
      </div>

      <p className="text-slate-600 dark:text-slate-300 mb-2">{status}</p>

      {error && (
        <div className="mt-4 text-center">
          <p className="text-red-500 mb-4">Failed to process receipt</p>
          <button
            onClick={onError}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Try again
          </button>
        </div>
      )}

      {isProcessing && file.type !== 'application/pdf' && (
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-4">
          This may take a moment...
        </p>
      )}

      {(showDebug || DEBUG_MODE) && debugInfo.ocrText && (
        <DebugPanel
          debugInfo={debugInfo}
          processedImageUrl={processedImageUrl ?? undefined}
          isDebugMode={DEBUG_MODE}
          onContinue={onItemsExtracted}
        />
      )}

      {/* Toggle debug button */}
      {!DEBUG_MODE && debugInfo.ocrText && (
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="mt-4 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          {showDebug ? 'Hide debug info' : 'Show debug info'}
        </button>
      )}
    </div>
  )
}
