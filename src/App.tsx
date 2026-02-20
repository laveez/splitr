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
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-md min-h-screen flex flex-col">
        <header className="p-4 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Splitr
          </h1>
          <p className="text-sm text-slate-400">
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

        <footer className="text-center border-t border-slate-700 py-6 mt-8">
          <a
            href="https://github.com/laveez/splitr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <svg className="inline w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <p className="text-slate-500 text-sm mt-2">&copy; {new Date().getFullYear()} laveez</p>
        </footer>
      </div>
    </div>
  )
}
