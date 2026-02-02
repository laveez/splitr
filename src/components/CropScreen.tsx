import { useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from '../types'

interface Props {
  file: File
  onCropComplete: (croppedFile: File) => void
  onSkip: () => void
  onBack: () => void
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image()
  image.src = imageSrc

  await new Promise((resolve) => {
    image.onload = resolve
  })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas context')

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas toBlob failed'))
    }, 'image/jpeg', 0.95)
  })
}

export default function CropScreen({ file, onCropComplete, onSkip, onBack }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Load image on mount
  useEffect(() => {
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [file])

  const onCropChange = useCallback((newCrop: { x: number; y: number }) => {
    setCrop(newCrop)
  }, [])

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom)
  }, [])

  const onCropAreaComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleCrop = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return

    setIsProcessing(true)
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      const croppedFile = new File([croppedBlob], file.name, { type: 'image/jpeg' })
      onCropComplete(croppedFile)
    } catch (err) {
      console.error('Crop failed:', err)
      setIsProcessing(false)
    }
  }, [imageSrc, croppedAreaPixels, file.name, onCropComplete])

  if (!imageSrc) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading image...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ← Back
        </button>
        <button
          onClick={onSkip}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Skip crop →
        </button>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 text-center">
        Crop to the receipt area for better OCR results
      </p>

      <div className="relative flex-1 min-h-[400px] bg-slate-900 rounded-lg overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={undefined}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaComplete}
          showGrid={true}
        />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <span className="text-sm text-slate-500 dark:text-slate-400">Zoom</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <button
        onClick={handleCrop}
        disabled={isProcessing || !croppedAreaPixels}
        className="mt-4 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none"
      >
        {isProcessing ? 'Processing...' : 'Crop & Continue'}
      </button>
    </div>
  )
}
