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
