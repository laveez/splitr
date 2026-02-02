import type { CategorizedItem } from '../types'

export interface SplitResult {
  meTotal: number
  youTotal: number
  commonTotal: number
  meItems: CategorizedItem[]
  youItems: CategorizedItem[]
  commonItems: CategorizedItem[]
  ignoredItems: CategorizedItem[]
}

export function calculateSplit(items: CategorizedItem[]): SplitResult {
  const result: SplitResult = {
    meTotal: 0,
    youTotal: 0,
    commonTotal: 0,
    meItems: [],
    youItems: [],
    commonItems: [],
    ignoredItems: [],
  }

  for (const categorized of items) {
    switch (categorized.category) {
      case 'me':
        result.meTotal += categorized.item.price
        result.meItems.push(categorized)
        break
      case 'you':
        result.youTotal += categorized.item.price
        result.youItems.push(categorized)
        break
      case 'common':
        result.commonTotal += categorized.item.price
        result.commonItems.push(categorized)
        break
      case 'ignore':
        result.ignoredItems.push(categorized)
        break
    }
  }

  return result
}

function formatEuro(price: number): string {
  return price.toFixed(2).replace('.', ',') + ' €'
}

export function formatSplitSummary(result: SplitResult): string {
  const halfCommon = result.commonTotal / 2
  const meOwes = result.meTotal + halfCommon
  const youOwes = result.youTotal + halfCommon

  const lines: string[] = []
  lines.push('Receipt Split Summary')
  lines.push('=====================')
  lines.push('')

  if (result.meItems.length > 0) {
    lines.push('Me:')
    for (const { item } of result.meItems) {
      lines.push(`  ${item.name}: ${formatEuro(item.price)}`)
    }
    lines.push('')
  }

  if (result.youItems.length > 0) {
    lines.push('You:')
    for (const { item } of result.youItems) {
      lines.push(`  ${item.name}: ${formatEuro(item.price)}`)
    }
    lines.push('')
  }

  if (result.commonItems.length > 0) {
    lines.push('Shared (split 50/50):')
    for (const { item } of result.commonItems) {
      lines.push(`  ${item.name}: ${formatEuro(item.price)}`)
    }
    lines.push('')
  }

  lines.push('---------------------')
  lines.push(`Me owes: ${formatEuro(meOwes)}`)
  lines.push(`You owe: ${formatEuro(youOwes)}`)

  return lines.join('\n')
}
