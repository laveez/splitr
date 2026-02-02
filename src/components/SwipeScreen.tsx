import { useState, useCallback, useMemo } from 'react'
import TinderCard from 'react-tinder-card'
import type { ReceiptItem, CategorizedItem, Category } from '../types'
import ItemCard from './ItemCard'

interface Props {
  items: ReceiptItem[]
  onComplete: (results: CategorizedItem[]) => void
  onBack: () => void
}

type Direction = 'left' | 'right' | 'up' | 'down'

const directionToCategory: Record<Direction, Category> = {
  left: 'me',
  right: 'you',
  up: 'common',
  down: 'ignore',
}

export default function SwipeScreen({ items, onComplete, onBack }: Props) {
  const [categorized, setCategorized] = useState<CategorizedItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showHint, setShowHint] = useState(true)

  // Get remaining items from current index to end, reversed so current item is on top
  const remainingItems = useMemo(() => {
    return items.slice(currentIndex).reverse()
  }, [items, currentIndex])

  const handleSwipe = useCallback(
    (direction: Direction, item: ReceiptItem) => {
      setShowHint(false)
      const category = directionToCategory[direction]
      setCategorized((prev) => [...prev, { item, category }])

      if (currentIndex === items.length - 1) {
        setTimeout(() => {
          const allCategorized = [
            ...categorized,
            { item, category },
          ]
          onComplete(allCategorized)
        }, 300)
      }
    },
    [categorized, currentIndex, items.length, onComplete]
  )

  const handleCardLeftScreen = useCallback(() => {
    setCurrentIndex((prev) => prev + 1)
  }, [])

  const handleButtonSwipe = useCallback(
    (direction: Direction) => {
      const item = items[currentIndex]
      if (item) {
        handleSwipe(direction, item)
        handleCardLeftScreen()
      }
    },
    [items, currentIndex, handleSwipe, handleCardLeftScreen]
  )

  const progress = items.length > 0 ? (currentIndex / items.length) * 100 : 0

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ← Back
        </button>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {currentIndex < items.length ? currentIndex + 1 : items.length} of {items.length}
        </span>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-4">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative flex-1 min-h-[350px]">
        {remainingItems.map((item) => (
          <TinderCard
            key={item.id}
            onSwipe={(dir) => handleSwipe(dir as Direction, item)}
            onCardLeftScreen={handleCardLeftScreen}
            preventSwipe={[]}
            className="absolute inset-0"
            swipeRequirementType="position"
            swipeThreshold={100}
          >
            <ItemCard item={item} />
          </TinderCard>
        ))}

        {currentIndex >= items.length && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-400 dark:text-slate-500">Processing results...</p>
          </div>
        )}
      </div>

      {showHint && currentIndex < items.length && (
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-4 text-center text-sm text-blue-700 dark:text-blue-300">
          Swipe the card to categorize: left for you, right for them, up if shared, down to ignore
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 mt-auto pt-4">
        <button
          onClick={() => handleButtonSwipe('left')}
          disabled={currentIndex >= items.length}
          className="flex flex-col items-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 disabled:opacity-50 transition-colors"
        >
          <span className="text-xl">👈</span>
          <span className="text-xs mt-1">Me</span>
        </button>
        <button
          onClick={() => handleButtonSwipe('up')}
          disabled={currentIndex >= items.length}
          className="flex flex-col items-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 transition-colors"
        >
          <span className="text-xl">👆</span>
          <span className="text-xs mt-1">Common</span>
        </button>
        <button
          onClick={() => handleButtonSwipe('right')}
          disabled={currentIndex >= items.length}
          className="flex flex-col items-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
        >
          <span className="text-xl">👉</span>
          <span className="text-xs mt-1">You</span>
        </button>
        <button
          onClick={() => handleButtonSwipe('down')}
          disabled={currentIndex >= items.length}
          className="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          <span className="text-xl">👇</span>
          <span className="text-xs mt-1">Skip</span>
        </button>
      </div>
    </div>
  )
}
