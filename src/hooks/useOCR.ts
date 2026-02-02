import { useState, useCallback, useEffect, useRef } from 'react'
import Tesseract from 'tesseract.js'

interface OCRState {
  text: string | null
  progress: number
  isProcessing: boolean
  error: string | null
}

export function useOCR() {
  const [state, setState] = useState<OCRState>({
    text: null,
    progress: 0,
    isProcessing: false,
    error: null,
  })
  const workerRef = useRef<Tesseract.Worker | null>(null)

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const processImage = useCallback(async (imageSource: string | File | Blob) => {
    setState({
      text: null,
      progress: 0,
      isProcessing: true,
      error: null,
    })

    try {
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setState((prev) => ({ ...prev, progress: m.progress }))
          }
        },
      })
      workerRef.current = worker

      const result = await worker.recognize(imageSource)
      await worker.terminate()
      workerRef.current = null

      setState({
        text: result.data.text,
        progress: 1,
        isProcessing: false,
        error: null,
      })

      return result.data.text
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OCR failed'
      setState({
        text: null,
        progress: 0,
        isProcessing: false,
        error: errorMessage,
      })
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      text: null,
      progress: 0,
      isProcessing: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    processImage,
    reset,
  }
}
