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
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set())
  const [showHint, setShowHint] = useState(true)

  const currentIndex = swipedIds.size

  // Get remaining items (not yet swiped), reversed so current item renders on top
  const remainingItems = useMemo(() => {
    return items.filter(item => !swipedIds.has(item.id)).reverse()
  }, [items, swipedIds])

  const handleSwipe = useCallback(
    (direction: Direction, item: ReceiptItem) => {
      setShowHint(false)
      const category = directionToCategory[direction]

      // Immediately mark as swiped to remove from DOM
      setSwipedIds(prev => new Set(prev).add(item.id))

      const newCategorized = [...categorized, { item, category }]
      setCategorized(newCategorized)

      if (newCategorized.length === items.length) {
        setTimeout(() => {
          onComplete(newCategorized)
        }, 300)
      }
    },
    [categorized, items.length, onComplete]
  )

  const handleButtonSwipe = useCallback(
    (direction: Direction) => {
      const item = remainingItems[remainingItems.length - 1] // Top card is last in array
      if (item) {
        handleSwipe(direction, item)
      }
    },
    [remainingItems, handleSwipe]
  )

  const progress = items.length > 0 ? (currentIndex / items.length) * 100 : 0
  const isComplete = currentIndex >= items.length

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
          {isComplete ? items.length : currentIndex + 1} of {items.length}
        </span>
      </div>

      <div data-testid="swipe-progress-bar" className="w-full bg-slate-200/60 dark:bg-slate-700/60 rounded-full h-2 mb-4">
        <div
          className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
          data-testid="swipe-progress-fill"
        />
      </div>

      <div className="relative flex-1 min-h-[300px] overflow-hidden">
        {remainingItems.map((item, index) => (
          <TinderCard
            key={item.id}
            onSwipe={(dir) => handleSwipe(dir as Direction, item)}
            onCardLeftScreen={() => {}}
            preventSwipe={[]}
            className="absolute inset-0 will-change-transform"
            swipeRequirementType="position"
            swipeThreshold={100}
          >
            <ItemCard item={item} zIndex={index} />
          </TinderCard>
        ))}

        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-400 dark:text-slate-500">Processing results...</p>
          </div>
        )}
      </div>

      {showHint && !isComplete && (
        <div className="bg-indigo-50/80 dark:bg-indigo-900/30 rounded-xl p-3 mb-4 text-center text-sm text-indigo-600 dark:text-indigo-300 shadow-sm">
          Swipe the card to categorize: left for me, right for you, up if shared, down to ignore
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 pt-4">
        <button
          onClick={() => handleButtonSwipe('left')}
          disabled={isComplete}
          data-testid="swipe-me"
          className="flex flex-col items-center p-3 bg-teal-100/80 dark:bg-teal-900/40 rounded-xl text-teal-700 dark:text-teal-300 hover:bg-teal-200/80 dark:hover:bg-teal-800/50 disabled:opacity-50 transition-all shadow-sm hover:shadow"
        >
          <span className="text-xl">👈</span>
          <span className="text-xs mt-1 font-medium">Me</span>
        </button>
        <button
          onClick={() => handleButtonSwipe('up')}
          disabled={isComplete}
          data-testid="swipe-common"
          className="flex flex-col items-center p-3 bg-violet-100/80 dark:bg-violet-900/40 rounded-xl text-violet-700 dark:text-violet-300 hover:bg-violet-200/80 dark:hover:bg-violet-800/50 disabled:opacity-50 transition-all shadow-sm hover:shadow"
        >
          <span className="text-xl">👆</span>
          <span className="text-xs mt-1 font-medium">Common</span>
        </button>
        <button
          onClick={() => handleButtonSwipe('right')}
          disabled={isComplete}
          data-testid="swipe-you"
          className="flex flex-col items-center p-3 bg-sky-100/80 dark:bg-sky-900/40 rounded-xl text-sky-700 dark:text-sky-300 hover:bg-sky-200/80 dark:hover:bg-sky-800/50 disabled:opacity-50 transition-all shadow-sm hover:shadow"
        >
          <span className="text-xl">👉</span>
          <span className="text-xs mt-1 font-medium">You</span>
        </button>
        <button
          onClick={() => handleButtonSwipe('down')}
          disabled={isComplete}
          data-testid="swipe-ignore"
          className="flex flex-col items-center p-3 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/60 disabled:opacity-50 transition-all shadow-sm hover:shadow"
        >
          <span className="text-xl">👇</span>
          <span className="text-xs mt-1 font-medium">Skip</span>
        </button>
      </div>
    </div>
  )
}
