import { useEffect, useState } from 'react'
import { useOCR } from '../hooks/useOCR'
import { parseReceipt } from '../utils/receiptParser'
import type { ReceiptItem } from '../types'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

interface Props {
  file: File
  onItemsExtracted: (items: ReceiptItem[]) => void
  onError: () => void
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
  const { progress, isProcessing, error, processImage } = useOCR()
  const [status, setStatus] = useState('Preparing...')
  const [localProgress, setLocalProgress] = useState(0)

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

        const items = parseReceipt(text)

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
    </div>
  )
}
