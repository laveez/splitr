import { useState, useCallback, useEffect, useRef } from 'react'
import Tesseract from 'tesseract.js'

// Preprocess image for better OCR results
async function preprocessImage(imageSource: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(imageSource)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Could not get canvas context'))
        return
      }

      // Scale up small images for better OCR
      const scale = Math.max(1, 2000 / Math.max(img.width, img.height))
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      // Draw original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Convert to grayscale and increase contrast (no hard threshold)
      for (let i = 0; i < data.length; i += 4) {
        // Grayscale
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

        // Increase contrast
        const contrast = 1.8
        const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100))
        let newGray = factor * (gray - 128) + 128

        // Clamp
        newGray = Math.max(0, Math.min(255, newGray))

        data[i] = newGray
        data[i + 1] = newGray
        data[i + 2] = newGray
      }

      ctx.putImageData(imageData, 0, 0)

      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

interface OCRState {
  text: string | null
  progress: number
  isProcessing: boolean
  error: string | null
  processedImageUrl: string | null
}

export function useOCR() {
  const [state, setState] = useState<OCRState>({
    text: null,
    progress: 0,
    isProcessing: false,
    error: null,
    processedImageUrl: null,
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
      processedImageUrl: null,
    })

    try {
      // Preprocess image for better OCR
      let processedImage: string | File | Blob = imageSource
      let processedImageUrl: string | null = null
      if (imageSource instanceof File || imageSource instanceof Blob) {
        try {
          setState((prev) => ({ ...prev, progress: 0.1 }))
          processedImage = await preprocessImage(imageSource)
          processedImageUrl = processedImage as string
          setState((prev) => ({ ...prev, processedImageUrl }))
        } catch (e) {
          console.warn('Image preprocessing failed, using original:', e)
        }
      }

      // Try Finnish first, fall back to English
      let worker: Tesseract.Worker
      try {
        worker = await Tesseract.createWorker('fin', 1, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              // Offset progress to account for preprocessing
              setState((prev) => ({ ...prev, progress: 0.1 + m.progress * 0.9 }))
            }
          },
        })
      } catch {
        // Fall back to English if Finnish fails
        worker = await Tesseract.createWorker('eng', 1, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setState((prev) => ({ ...prev, progress: 0.1 + m.progress * 0.9 }))
            }
          },
        })
      }
      workerRef.current = worker

      const result = await worker.recognize(processedImage)
      await worker.terminate()
      workerRef.current = null

      setState((prev) => ({
        ...prev,
        text: result.data.text,
        progress: 1,
        isProcessing: false,
        error: null,
      }))

      return result.data.text
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OCR failed'
      setState((prev) => ({
        ...prev,
        text: null,
        progress: 0,
        isProcessing: false,
        error: errorMessage,
      }))
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      text: null,
      progress: 0,
      isProcessing: false,
      error: null,
      processedImageUrl: null,
    })
  }, [])

  return {
    ...state,
    processImage,
    reset,
  }
}
