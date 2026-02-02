import { test, expect } from '@playwright/test'

test.describe('Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display upload screen on initial load', async ({ page }) => {
    await expect(page.getByTestId('upload-dropzone')).toBeVisible()
    await expect(page.getByTestId('camera-button')).toBeVisible()
    await expect(page.getByText('Drop receipt here')).toBeVisible()
  })

  test('should have file input with correct accept types', async ({ page }) => {
    const fileInput = page.getByTestId('file-input')
    await expect(fileInput).toHaveAttribute('accept', 'image/*,application/pdf')
  })

  test('should show camera button for mobile capture', async ({ page }) => {
    const cameraButton = page.getByTestId('camera-button')
    await expect(cameraButton).toBeVisible()
    await expect(cameraButton).toContainText('Take Photo')
  })

  test('should transition to crop screen after image upload', async ({ page }) => {
    const fileInput = page.getByTestId('file-input')

    // Create a simple test image
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    await fileInput.setInputFiles({
      name: 'test-receipt.png',
      mimeType: 'image/png',
      buffer,
    })

    // Should navigate to crop screen or processing screen
    await expect(
      page.getByText('Crop to the receipt area').or(page.getByText('Reading receipt'))
    ).toBeVisible({ timeout: 5000 })
  })

  test('should transition directly to processing for PDF files', async ({ page }) => {
    const fileInput = page.getByTestId('file-input')

    // Create a minimal PDF
    const pdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 44 >> stream
BT /F1 12 Tf 100 700 Td (Test) Tj ET
endstream endobj
xref
0 5
trailer << /Size 5 /Root 1 0 R >>
startxref
272
%%EOF`

    await fileInput.setInputFiles({
      name: 'test-receipt.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(pdfContent),
    })

    // Should go to processing screen for PDFs
    await expect(page.getByText('Reading PDF')).toBeVisible({ timeout: 5000 })
  })
})
