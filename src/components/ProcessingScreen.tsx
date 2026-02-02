import { useEffect, useState } from 'react'
import { useOCR } from '../hooks/useOCR'
import { parseReceipt } from '../utils/receiptParser'
import type { ReceiptItem } from '../types'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

// Enable debug mode via URL param: ?debug=true
const DEBUG_MODE = new URLSearchParams(window.location.search).has('debug')

interface Props {
  file: File
  onItemsExtracted: (items: ReceiptItem[]) => void
  onError: () => void
}

interface DebugInfo {
  processedImageUrl?: string
  ocrText?: string
  parsedItems?: ReceiptItem[]
}

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const textParts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    textParts.push(pageText)
  }

  return textParts.join('\n')
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

      {/* Debug Panel */}
      {(showDebug || DEBUG_MODE) && debugInfo.ocrText && (
        <div className="w-full mt-8 border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Debug Info</h3>
            {DEBUG_MODE && (
              <button
                onClick={() => {
                  if (debugInfo.parsedItems && debugInfo.parsedItems.length > 0) {
                    onItemsExtracted(debugInfo.parsedItems)
                  } else {
                    onItemsExtracted([{ id: '1', name: 'Item 1', price: 0 }])
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue ({debugInfo.parsedItems?.length || 0} items)
              </button>
            )}
          </div>

          {/* Processed Image */}
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

          {/* Parsed Items */}
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

          {/* OCR Text */}
          <div>
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Raw OCR Text:</h4>
            <pre className="bg-slate-100 dark:bg-slate-800 rounded p-3 text-xs text-slate-700 dark:text-slate-300 max-h-64 overflow-auto whitespace-pre-wrap">
              {debugInfo.ocrText}
            </pre>
          </div>
        </div>
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
