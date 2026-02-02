import { test, expect } from '@playwright/test'

test.describe('Results Screen', () => {
  // Helper to set up the results screen by going through swipe with specific categorization
  async function setupResultsScreen(
    page: any,
    items: { id: string; name: string; price: number }[],
    categorization: ('me' | 'you' | 'common' | 'ignore')[]
  ) {
    const itemsParam = encodeURIComponent(JSON.stringify(items))
    await page.goto(`/?testMode=swipe&testItems=${itemsParam}`)
    await page.waitForSelector('[data-testid="swipe-me"]', { timeout: 5000 })

    // Swipe items according to categorization
    for (const category of categorization) {
      await page.getByTestId(`swipe-${category}`).click()
      await page.waitForTimeout(150)
    }

    // Wait for results screen
    await page.waitForSelector('[data-testid="total-me"]', { timeout: 5000 })
  }

  test('should display totals correctly for mixed categorization', async ({ page }) => {
    const items = [
      { id: '1', name: 'Item 1', price: 10 },
      { id: '2', name: 'Item 2', price: 20 },
      { id: '3', name: 'Item 3', price: 30 },
    ]
    // Item 1: 10€ -> me
    // Item 2: 20€ -> you
    // Item 3: 30€ -> common (15€ each)
    await setupResultsScreen(page, items, ['me', 'you', 'common'])

    const meTotal = await page.getByTestId('total-me').textContent()
    const youTotal = await page.getByTestId('total-you').textContent()

    // Me: 10 + 15 (half of 30) = 25
    // You: 20 + 15 (half of 30) = 35
    expect(meTotal).toContain('25')
    expect(youTotal).toContain('35')
  })

  test('should show copy summary button', async ({ page }) => {
    const items = [{ id: '1', name: 'Item', price: 10 }]
    await setupResultsScreen(page, items, ['me'])

    await expect(page.getByTestId('copy-summary')).toBeVisible()
    await expect(page.getByTestId('copy-summary')).toContainText('Copy Summary')
  })

  test('should show copied confirmation after clicking copy', async ({ page }) => {
    const items = [{ id: '1', name: 'Item', price: 10 }]
    await setupResultsScreen(page, items, ['me'])

    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-write'])

    await page.getByTestId('copy-summary').click()

    // Button should show "Copied!" state
    await expect(page.getByTestId('copy-summary')).toContainText('Copied!')
  })

  test('should show start over button', async ({ page }) => {
    const items = [{ id: '1', name: 'Item', price: 10 }]
    await setupResultsScreen(page, items, ['me'])

    await expect(page.getByTestId('start-over')).toBeVisible()
    await expect(page.getByTestId('start-over')).toContainText('Split Another Receipt')
  })

  test('should return to upload screen when clicking start over', async ({ page }) => {
    const items = [{ id: '1', name: 'Item', price: 10 }]
    await setupResultsScreen(page, items, ['me'])

    await page.getByTestId('start-over').click()

    // Should be back to upload screen
    await expect(page.getByTestId('upload-dropzone')).toBeVisible()
  })

  test('should handle all items ignored', async ({ page }) => {
    const items = [
      { id: '1', name: 'Item 1', price: 10 },
      { id: '2', name: 'Item 2', price: 20 },
    ]
    await setupResultsScreen(page, items, ['ignore', 'ignore'])

    const meTotal = await page.getByTestId('total-me').textContent()
    const youTotal = await page.getByTestId('total-you').textContent()

    expect(meTotal).toContain('0,00')
    expect(youTotal).toContain('0,00')
  })

  test('should handle all items as common', async ({ page }) => {
    const items = [
      { id: '1', name: 'Item 1', price: 10 },
      { id: '2', name: 'Item 2', price: 20 },
    ]
    // Total: 30€, each pays 15€
    await setupResultsScreen(page, items, ['common', 'common'])

    const meTotal = await page.getByTestId('total-me').textContent()
    const youTotal = await page.getByTestId('total-you').textContent()

    expect(meTotal).toContain('15')
    expect(youTotal).toContain('15')
  })

  test('should handle single item for me', async ({ page }) => {
    const items = [{ id: '1', name: 'Item', price: 10 }]
    await setupResultsScreen(page, items, ['me'])

    const meTotal = await page.getByTestId('total-me').textContent()
    const youTotal = await page.getByTestId('total-you').textContent()

    expect(meTotal).toContain('10')
    expect(youTotal).toContain('0,00')
  })

  test('should handle single item for you', async ({ page }) => {
    const items = [{ id: '1', name: 'Item', price: 10 }]
    await setupResultsScreen(page, items, ['you'])

    const meTotal = await page.getByTestId('total-me').textContent()
    const youTotal = await page.getByTestId('total-you').textContent()

    expect(meTotal).toContain('0,00')
    expect(youTotal).toContain('10')
  })
})
