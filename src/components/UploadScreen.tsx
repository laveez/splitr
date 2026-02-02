import { useCallback, useRef, useState } from 'react'

interface Props {
  onFileSelected: (file: File) => void
}

export default function UploadScreen({ onFileSelected }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      if (validTypes.includes(file.type)) {
        onFileSelected(file)
      } else {
        alert('Please upload an image (JPEG, PNG, WebP) or PDF file.')
      }
    },
    [onFileSelected]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-4xl mb-3">📄</div>
        <p className="text-slate-700 dark:text-slate-200 font-medium mb-1">
          Drop receipt here
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          or click to browse
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-slate-50 dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
            or
          </span>
        </div>
      </div>

      <button
        onClick={() => cameraInputRef.current?.click()}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        <span>📷</span>
        <span>Take Photo</span>
      </button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInput}
      />

      <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-4">
        Supports JPEG, PNG, WebP images and PDF files
      </p>
    </div>
  )
}
