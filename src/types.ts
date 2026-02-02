export interface ReceiptItem {
  id: string
  name: string
  price: number
}

export type Category = 'me' | 'you' | 'common' | 'ignore'

export interface CategorizedItem {
  item: ReceiptItem
  category: Category
}

export type Screen = 'upload' | 'crop' | 'processing' | 'edit' | 'swipe' | 'results'

/**
 * Crop area with pixel coordinates
 */
export interface Area {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Debug information for OCR processing
 */
export interface DebugInfo {
  processedImageUrl?: string
  ocrText?: string
  parsedItems?: ReceiptItem[]
}

/**
 * Screen component props
 */
export interface UploadScreenProps {
  onFileSelected: (file: File) => void
}

export interface CropScreenProps {
  file: File
  onCropComplete: (croppedFile: File) => void
  onSkip: () => void
  onBack: () => void
}

export interface ProcessingScreenProps {
  file: File
  onItemsExtracted: (items: ReceiptItem[]) => void
  onError: () => void
}

export interface EditItemsScreenProps {
  items: ReceiptItem[]
  onConfirm: (items: ReceiptItem[]) => void
  onBack: () => void
}

export interface SwipeScreenProps {
  items: ReceiptItem[]
  onComplete: (results: CategorizedItem[]) => void
  onBack: () => void
}

export interface ResultsScreenProps {
  categorizedItems: CategorizedItem[]
  onStartOver: () => void
}
