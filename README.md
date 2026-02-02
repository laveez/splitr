# Splitr

A web app for splitting receipts between two people using a Tinder-like swipe interface.

**Live demo:** https://laveez.github.io/splitr/

## Features

- Upload receipt images (PNG, JPG) or PDFs
- OCR text extraction from images using Tesseract.js
- Direct text extraction from PDFs with selectable text
- Edit detected items before splitting
- Swipe interface to categorize items:
  - 👈 Left = Me
  - 👉 Right = You
  - 👆 Up = Common (split 50/50)
  - 👇 Down = Ignore
- Copy results summary to clipboard

## Current Limitations

> **Note:** The receipt parser is currently optimized for **Finnish K-Ruoka grocery receipts**. It handles Finnish-specific patterns like:
> - Euro currency format (comma as decimal separator)
> - Finnish discount types (Plussa-tasaerä, Plussasetti, Tasaerä)
> - K-Ruoka receipt structure and tax summary detection

To adapt for other receipt formats, the parsing logic in `src/utils/receiptParser.ts` needs to be extended with additional patterns.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Tesseract.js (client-side OCR)
- pdfjs-dist (PDF text extraction)
- react-tinder-card (swipe gestures)

## Development

```bash
npm install --legacy-peer-deps
npm run dev
```

The `--legacy-peer-deps` flag is needed due to react-tinder-card peer dependency on React 18.

## Building

```bash
npm run build
```

Output is in the `dist/` folder, configured for GitHub Pages deployment at `/splitr/`.

## License

MIT
