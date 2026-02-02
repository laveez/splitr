import { test, expect } from '@playwright/test'

test.describe('Edit Items Screen', () => {
  const testItems = [
    { id: '1', name: 'Apple', price: 2.50 },
    { id: '2', name: 'Banana', price: 1.99 },
  ]

  test.beforeEach(async ({ page }) => {
    // Use test mode to go directly to edit screen with pre-populated items
    const itemsParam = encodeURIComponent(JSON.stringify(testItems))
    await page.goto(`/?testMode=edit&testItems=${itemsParam}`)
    await page.waitForSelector('[data-testid="add-item-button"]', { timeout: 5000 })
  })

  test('should display existing items', async ({ page }) => {
    await expect(page.locator('[data-testid^="item-row-"]')).toHaveCount(2)
  })

  test('should add a new item', async ({ page }) => {
    const initialCount = await page.locator('[data-testid^="item-row-"]').count()

    await page.getByTestId('add-item-button').click()

    const newCount = await page.locator('[data-testid^="item-row-"]').count()
    expect(newCount).toBe(initialCount + 1)
  })

  test('should update item name and price', async ({ page }) => {
    // Get the first item row
    const firstRow = page.locator('[data-testid^="item-row-"]').first()
    const nameInput = firstRow.locator('input[type="text"]')
    const priceInput = firstRow.locator('input[type="number"]')

    // Clear and fill new values
    await nameInput.clear()
    await nameInput.fill('Orange')
    await priceInput.clear()
    await priceInput.fill('3.50')

    // Verify the inputs have the correct values
    await expect(nameInput).toHaveValue('Orange')
    await expect(priceInput).toHaveValue('3.50')
  })

  test('should delete an item', async ({ page }) => {
    const initialCount = await page.locator('[data-testid^="item-row-"]').count()

    // Delete the first item
    const deleteButtons = page.locator('[data-testid^="item-delete-"]')
    await deleteButtons.first().click()

    // Verify item was deleted
    const newCount = await page.locator('[data-testid^="item-row-"]').count()
    expect(newCount).toBe(initialCount - 1)
  })

  test('should update total when items change', async ({ page }) => {
    // Initial total should be 2.50 + 1.99 = 4.49
    const total = page.getByTestId('edit-total')
    await expect(total).toContainText('4,49')

    // Add a new item with price 5.00
    await page.getByTestId('add-item-button').click()

    const lastRow = page.locator('[data-testid^="item-row-"]').last()
    const nameInput = lastRow.locator('input[type="text"]')
    const priceInput = lastRow.locator('input[type="number"]')

    await nameInput.fill('New Item')
    await priceInput.fill('5')

    // Total should now be 4.49 + 5.00 = 9.49
    await expect(total).toContainText('9,49')
  })

  test('should enable confirm button with valid items', async ({ page }) => {
    // Initial items are valid, button should be enabled
    const confirmButton = page.getByTestId('confirm-items-button')
    await expect(confirmButton).not.toBeDisabled()
    await expect(confirmButton).toContainText('2 items')
  })

  test('should disable confirm button when no valid items', async ({ page }) => {
    // Delete all items
    while (await page.locator('[data-testid^="item-delete-"]').count() > 0) {
      await page.locator('[data-testid^="item-delete-"]').first().click()
    }

    const confirmButton = page.getByTestId('confirm-items-button')
    await expect(confirmButton).toBeDisabled()
  })

  test('should transition to swipe screen on confirm', async ({ page }) => {
    await page.getByTestId('confirm-items-button').click()

    // Should be on swipe screen
    await expect(page.getByTestId('swipe-me')).toBeVisible({ timeout: 5000 })
  })
})
