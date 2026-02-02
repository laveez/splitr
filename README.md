# Splitr

A web app for splitting receipts between two people using a Tinder-like swipe interface.

**Live demo:** https://laveez.github.io/splitr/

## Features

- Upload receipt images (PNG, JPG, WebP) or PDFs
- OCR text extraction from images using Tesseract.js
- Direct text extraction from PDFs with selectable text
- Optional image cropping to improve OCR accuracy
- Edit detected items before splitting
- Tinder-style swipe interface to categorize items:
  - 👈 Left = Me
  - 👉 Right = You
  - 👆 Up = Common (split 50/50)
  - 👇 Down = Ignore
- Copy results summary to clipboard

## How It Works

### 1. Upload
Drop a receipt image or PDF, or take a photo directly from your phone. The app accepts JPEG, PNG, WebP images and PDF files.

### 2. Crop (optional)
For images, you can optionally crop to just the receipt area. This improves OCR accuracy by removing background noise.

### 3. Processing
- **Images**: Tesseract.js runs OCR to extract text from the image
- **PDFs**: Text is extracted directly using pdfjs-dist (much faster and more accurate)

### 4. Edit Items
Review and edit the detected items. You can:
- Fix item names that were misread
- Adjust prices
- Add items that weren't detected
- Delete items you don't want to split

### 5. Swipe to Categorize
Each item appears as a card. Swipe (or tap the buttons) to categorize:
- **Me**: I'm paying for this item
- **You**: You're paying for this item
- **Common**: We'll split this 50/50
- **Ignore**: Don't include in the split

### 6. Results
See the final split showing how much each person owes. Copy the summary to share.

## Current Limitations

> **Note:** The receipt parser is currently optimized for **Finnish K-Ruoka grocery receipts**. It handles Finnish-specific patterns like:
> - Euro currency format (comma as decimal separator)
> - Finnish discount types (Plussa-tasaerä, Plussasetti, Tasaerä)
> - K-Ruoka receipt structure and tax summary detection

To adapt for other receipt formats, the parsing logic in `src/utils/receiptParser.ts` needs to be extended with additional patterns.

## Project Structure

```
src/
├── components/         # React components
│   ├── UploadScreen.tsx      # File upload UI
│   ├── CropScreen.tsx        # Image cropping
│   ├── ProcessingScreen.tsx  # OCR processing
│   ├── EditItemsScreen.tsx   # Item editing
│   ├── SwipeScreen.tsx       # Swipe categorization
│   ├── ResultsScreen.tsx     # Final results
│   ├── ItemCard.tsx          # Swipeable item card
│   └── DebugPanel.tsx        # Debug info display
├── hooks/              # Custom React hooks
│   ├── useOCR.ts             # Tesseract.js wrapper
│   └── useDarkMode.ts        # Dark mode detection
├── utils/              # Utility functions
│   ├── receiptParser.ts      # OCR text parsing
│   ├── calculations.ts       # Split calculations
│   ├── pdfExtractor.ts       # PDF text extraction
│   ├── format.ts             # Price formatting
│   ├── colors.ts             # Card color palette
│   └── ids.ts                # ID generation
├── types.ts            # TypeScript types
└── App.tsx             # Main app component
```

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Tesseract.js (client-side OCR)
- pdfjs-dist (PDF text extraction)
- react-tinder-card (swipe gestures)
- react-easy-crop (image cropping)
- Playwright (e2e testing)

## Development

```bash
npm install --legacy-peer-deps
npm run dev
```

The `--legacy-peer-deps` flag is needed due to react-tinder-card peer dependency on React 18.

### Debug Mode

Add `?debug=true` to the URL to enable debug mode, which shows:
- Raw OCR text output
- Parsed items before editing
- Processed image preview

### Test Mode

For automated testing, you can skip OCR and go directly to specific screens with pre-populated items:

```
/?testMode=edit&testItems=[{"id":"1","name":"Apple","price":2.50}]
/?testMode=swipe&testItems=[{"id":"1","name":"Banana","price":1.99}]
```

This is used by the Playwright tests to bypass slow OCR processing.

## Testing

The project includes Playwright e2e tests for all major flows.

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode
npm run test:headed
```

### Test Structure

```
e2e/
├── tests/
│   ├── upload.spec.ts      # Upload flow tests
│   ├── edit-items.spec.ts  # Item editing tests
│   ├── swipe.spec.ts       # Swipe flow tests
│   └── results.spec.ts     # Results calculation tests
├── helpers/
│   └── testHelpers.ts      # Test utilities
└── fixtures/               # Test fixtures
```

### Data Test IDs

Key elements have `data-testid` attributes for reliable test targeting:

| Element | Test ID |
|---------|---------|
| Upload dropzone | `upload-dropzone` |
| File input | `file-input` |
| Camera button | `camera-button` |
| Item name input | `item-name-{id}` |
| Item price input | `item-price-{id}` |
| Add item button | `add-item-button` |
| Confirm button | `confirm-items-button` |
| Swipe Me button | `swipe-me` |
| Swipe You button | `swipe-you` |
| Swipe Common button | `swipe-common` |
| Swipe Ignore button | `swipe-ignore` |
| Progress bar | `swipe-progress-bar` |
| Me total | `total-me` |
| You total | `total-you` |
| Copy summary button | `copy-summary` |
| Start over button | `start-over` |

## Building

```bash
npm run build
```

Output is in the `dist/` folder, configured for GitHub Pages deployment at `/splitr/`.

## License

MIT
