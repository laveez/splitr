import { useEffect, useState } from 'react'
import { useOCR } from '../hooks/useOCR'
import { parseReceipt } from '../utils/receiptParser'
import type { ReceiptItem } from '../types'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

interface Props {
  file: File
  onItemsExtracted: (items: ReceiptItem[]) => void
  onError: () => void
}

async function pdfToImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(1)

  const scale = 2
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({ canvasContext: context, viewport, canvas }).promise
  return canvas.toDataURL('image/png')
}

export default function ProcessingScreen({ file, onItemsExtracted, onError }: Props) {
  const { progress, isProcessing, error, processImage } = useOCR()
  const [status, setStatus] = useState('Preparing...')

  useEffect(() => {
    let cancelled = false

    async function process() {
      try {
        let imageSource: string | File = file

        if (file.type === 'application/pdf') {
          setStatus('Converting PDF...')
          imageSource = await pdfToImage(file)
        }

        setStatus('Reading receipt...')
        const text = await processImage(imageSource)

        if (cancelled) return

        const items = parseReceipt(text || '')

        if (items.length === 0) {
          setStatus('No items found. Please try editing manually.')
          onItemsExtracted([
            { id: '1', name: 'Item 1', price: 0 },
          ])
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

  const progressPercent = Math.round(progress * 100)

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
            strokeDashoffset={251.2 * (1 - progress)}
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

      {isProcessing && (
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-4">
          This may take a moment...
        </p>
      )}
    </div>
  )
}
