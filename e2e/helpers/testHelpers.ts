import { Page, expect } from '@playwright/test'
import path from 'path'

/**
 * Test result interface for LLM-friendly output
 */
export interface TestResult {
  name: string
  status: 'pass' | 'fail'
  screenshot?: string
  error?: string
  duration: number
}

/**
 * Upload a file to the app using the file input
 */
export async function uploadFile(page: Page, filePath: string) {
  const fileInput = page.getByTestId('file-input')
  await fileInput.setInputFiles(filePath)
}

/**
 * Wait for the processing screen to complete
 */
export async function waitForProcessingComplete(page: Page, timeout = 30000) {
  await page.waitForSelector('[data-testid="confirm-items-button"]', { timeout })
}

/**
 * Click a swipe button and wait for animation
 */
export async function clickSwipeButton(page: Page, direction: 'me' | 'you' | 'common' | 'ignore') {
  await page.getByTestId(`swipe-${direction}`).click()
  await page.waitForTimeout(100)
}

/**
 * Get the current progress percentage from the swipe screen
 */
export async function getSwipeProgress(page: Page): Promise<number> {
  const progressFill = page.getByTestId('swipe-progress-fill')
  const style = await progressFill.getAttribute('style')
  const match = style?.match(/width:\s*(\d+(?:\.\d+)?)%/)
  return match ? parseFloat(match[1]) : 0
}

/**
 * Get the total amounts from the results screen
 */
export async function getResultTotals(page: Page): Promise<{ me: string, you: string }> {
  const meTotal = await page.getByTestId('total-me').textContent()
  const youTotal = await page.getByTestId('total-you').textContent()
  return {
    me: meTotal?.trim() || '0,00 €',
    you: youTotal?.trim() || '0,00 €',
  }
}

/**
 * Add a new item in the edit screen
 */
export async function addItem(page: Page, name: string, price: number) {
  await page.getByTestId('add-item-button').click()

  const items = await page.locator('[data-testid^="item-row-"]').all()
  const lastItem = items[items.length - 1]

  const nameInput = lastItem.locator('input[type="text"]')
  const priceInput = lastItem.locator('input[type="number"]')

  await nameInput.fill(name)
  await priceInput.fill(price.toString())
}

/**
 * Get fixture file path
 */
export function getFixturePath(filename: string): string {
  return path.join(__dirname, '..', 'fixtures', filename)
}

/**
 * Create a simple test receipt image using canvas (for testing without real receipts)
 */
export async function createTestReceiptBlob(): Promise<Blob> {
  const canvas = new OffscreenCanvas(400, 600)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas context')

  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, 400, 600)

  ctx.fillStyle = 'black'
  ctx.font = '16px monospace'
  ctx.fillText('Test Receipt', 150, 50)
  ctx.fillText('Apple           2,50 €', 50, 100)
  ctx.fillText('Banana          1,99 €', 50, 130)
  ctx.fillText('Milk            1,49 €', 50, 160)
  ctx.fillText('Bread           2,00 €', 50, 190)
  ctx.fillText('Yhteensä        7,98 €', 50, 250)

  return canvas.convertToBlob({ type: 'image/png' })
}
