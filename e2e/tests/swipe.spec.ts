import { test, expect } from '@playwright/test'

test.describe('Swipe Screen', () => {
  const testItems = [
    { id: '1', name: 'Item 1', price: 10 },
    { id: '2', name: 'Item 2', price: 20 },
    { id: '3', name: 'Item 3', price: 30 },
  ]

  test.beforeEach(async ({ page }) => {
    // Use test mode to go directly to swipe screen with pre-populated items
    const itemsParam = encodeURIComponent(JSON.stringify(testItems))
    await page.goto(`/?testMode=swipe&testItems=${itemsParam}`)
    await page.waitForSelector('[data-testid="swipe-me"]', { timeout: 5000 })
  })

  test('should display swipe buttons', async ({ page }) => {
    await expect(page.getByTestId('swipe-me')).toBeVisible()
    await expect(page.getByTestId('swipe-you')).toBeVisible()
    await expect(page.getByTestId('swipe-common')).toBeVisible()
    await expect(page.getByTestId('swipe-ignore')).toBeVisible()
  })

  test('should show progress bar', async ({ page }) => {
    await expect(page.getByTestId('swipe-progress-bar')).toBeVisible()
    // Progress fill exists but may be hidden at 0% width
    await expect(page.getByTestId('swipe-progress-fill')).toBeAttached()
  })

  test('should update progress when swiping', async ({ page }) => {
    // Get initial progress
    const progressFill = page.getByTestId('swipe-progress-fill')
    const initialStyle = await progressFill.getAttribute('style')
    const initialMatch = initialStyle?.match(/width:\s*([\d.]+)%/)
    const initialProgress = initialMatch ? parseFloat(initialMatch[1]) : 0

    // Swipe one item
    await page.getByTestId('swipe-me').click()
    await page.waitForTimeout(150)

    // Check progress increased
    const newStyle = await progressFill.getAttribute('style')
    const newMatch = newStyle?.match(/width:\s*([\d.]+)%/)
    const newProgress = newMatch ? parseFloat(newMatch[1]) : 0

    expect(newProgress).toBeGreaterThan(initialProgress)
  })

  test('should transition to results after all items swiped', async ({ page }) => {
    // Swipe all 3 items
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('swipe-me').click()
      await page.waitForTimeout(150)
    }

    // Should transition to results
    await expect(page.getByTestId('total-me')).toBeVisible({ timeout: 5000 })
  })

  test('should categorize items correctly - all to me', async ({ page }) => {
    // Swipe all items to "me"
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('swipe-me').click()
      await page.waitForTimeout(150)
    }

    // Check results - all items should be in "me" (10+20+30 = 60)
    await expect(page.getByTestId('total-me')).toBeVisible({ timeout: 5000 })
    const meTotal = await page.getByTestId('total-me').textContent()
    expect(meTotal).toContain('60')
  })

  test('should categorize items correctly - all to you', async ({ page }) => {
    // Swipe all items to "you"
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('swipe-you').click()
      await page.waitForTimeout(150)
    }

    // Check results - all items should be in "you" (10+20+30 = 60)
    await expect(page.getByTestId('total-you')).toBeVisible({ timeout: 5000 })
    const youTotal = await page.getByTestId('total-you').textContent()
    expect(youTotal).toContain('60')
  })

  test('should split common items 50/50', async ({ page }) => {
    // Swipe all items to "common"
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('swipe-common').click()
      await page.waitForTimeout(150)
    }

    // Check results - should be split 50/50 (60 / 2 = 30 each)
    await expect(page.getByTestId('total-me')).toBeVisible({ timeout: 5000 })
    const meTotal = await page.getByTestId('total-me').textContent()
    const youTotal = await page.getByTestId('total-you').textContent()
    expect(meTotal).toContain('30')
    expect(youTotal).toContain('30')
  })

  test('should not count ignored items in totals', async ({ page }) => {
    // Swipe all items to "ignore"
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('swipe-ignore').click()
      await page.waitForTimeout(150)
    }

    // Check results - totals should be 0
    await expect(page.getByTestId('total-me')).toBeVisible({ timeout: 5000 })
    const meTotal = await page.getByTestId('total-me').textContent()
    const youTotal = await page.getByTestId('total-you').textContent()
    expect(meTotal).toContain('0,00')
    expect(youTotal).toContain('0,00')
  })

  test('should handle mixed categorization', async ({ page }) => {
    // Item 1 (10€) -> me
    // Item 2 (20€) -> you
    // Item 3 (30€) -> common (15€ each)
    await page.getByTestId('swipe-me').click()
    await page.waitForTimeout(150)
    await page.getByTestId('swipe-you').click()
    await page.waitForTimeout(150)
    await page.getByTestId('swipe-common').click()
    await page.waitForTimeout(150)

    await expect(page.getByTestId('total-me')).toBeVisible({ timeout: 5000 })
    const meTotal = await page.getByTestId('total-me').textContent()
    const youTotal = await page.getByTestId('total-you').textContent()

    // Me: 10 + 15 = 25
    // You: 20 + 15 = 35
    expect(meTotal).toContain('25')
    expect(youTotal).toContain('35')
  })
})
