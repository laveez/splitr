import { useState, useCallback } from 'react'
import type { Screen, ReceiptItem, CategorizedItem } from './types'
import UploadScreen from './components/UploadScreen'
import CropScreen from './components/CropScreen'
import ProcessingScreen from './components/ProcessingScreen'
import EditItemsScreen from './components/EditItemsScreen'
import SwipeScreen from './components/SwipeScreen'
import ResultsScreen from './components/ResultsScreen'

// Test mode: allow tests to inject state via URL params
// Usage: ?testMode=edit&testItems=[{"id":"1","name":"Item","price":10}]
function getTestConfig(): { screen?: Screen; items?: ReceiptItem[] } | null {
  const params = new URLSearchParams(window.location.search)
  const testMode = params.get('testMode') as Screen | null
  const testItems = params.get('testItems')

  if (!testMode) return null

  try {
    const items = testItems ? JSON.parse(testItems) : []
    return { screen: testMode, items }
  } catch {
    return { screen: testMode, items: [] }
  }
}

export default function App() {
  const testConfig = getTestConfig()
  const [screen, setScreen] = useState<Screen>(testConfig?.screen || 'upload')
  const [file, setFile] = useState<File | null>(null)
  const [items, setItems] = useState<ReceiptItem[]>(testConfig?.items || [])
  const [categorizedItems, setCategorizedItems] = useState<CategorizedItem[]>([])

  const handleFileSelected = useCallback((selectedFile: File) => {
    setFile(selectedFile)
    // Skip crop for PDFs, go directly to processing
    if (selectedFile.type === 'application/pdf') {
      setScreen('processing')
    } else {
      setScreen('crop')
    }
  }, [])

  const handleCropComplete = useCallback((croppedFile: File) => {
    setFile(croppedFile)
    setScreen('processing')
  }, [])

  const handleSkipCrop = useCallback(() => {
    setScreen('processing')
  }, [])

  const handleItemsExtracted = useCallback((extractedItems: ReceiptItem[]) => {
    setItems(extractedItems)
    setScreen('edit')
  }, [])

  const handleItemsConfirmed = useCallback((confirmedItems: ReceiptItem[]) => {
    setItems(confirmedItems)
    setCategorizedItems([])
    setScreen('swipe')
  }, [])

  const handleSwipeComplete = useCallback((results: CategorizedItem[]) => {
    setCategorizedItems(results)
    setScreen('results')
  }, [])

  const handleStartOver = useCallback(() => {
    setFile(null)
    setItems([])
    setCategorizedItems([])
    setScreen('upload')
  }, [])

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-md min-h-screen flex flex-col">
        <header className="p-4 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Splitr
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Split receipts easily
          </p>
        </header>

        <main className="flex-1 p-4">
          {screen === 'upload' && (
            <UploadScreen onFileSelected={handleFileSelected} />
          )}
          {screen === 'crop' && file && (
            <CropScreen
              file={file}
              onCropComplete={handleCropComplete}
              onSkip={handleSkipCrop}
              onBack={() => setScreen('upload')}
            />
          )}
          {screen === 'processing' && file && (
            <ProcessingScreen
              file={file}
              onItemsExtracted={handleItemsExtracted}
              onError={handleStartOver}
            />
          )}
          {screen === 'edit' && (
            <EditItemsScreen
              items={items}
              onConfirm={handleItemsConfirmed}
              onBack={() => setScreen('upload')}
            />
          )}
          {screen === 'swipe' && (
            <SwipeScreen
              items={items}
              onComplete={handleSwipeComplete}
              onBack={() => setScreen('edit')}
            />
          )}
          {screen === 'results' && (
            <ResultsScreen
              categorizedItems={categorizedItems}
              onStartOver={handleStartOver}
            />
          )}
        </main>
      </div>
    </div>
  )
}
