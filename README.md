<div align="center">

# Splitr

**Swipe to split**

Split receipts between two people with a Tinder-like swipe interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=flat-square)](https://nodejs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square)](https://vite.dev)

</div>

---

### Contents

[Features](#features) · [Quick Start](#quick-start) · [Scripts](#scripts) · [How It Works](#how-it-works) · [Current Limitations](#current-limitations) · [Contributing](#contributing)

---

## Features

- **Receipt upload** — PNG, JPG, WebP images or PDF files; camera capture on mobile
- **OCR extraction** — Tesseract.js for images, pdfjs-dist for selectable-text PDFs
- **Optional cropping** — crop to receipt area for better OCR accuracy
- **Item editing** — fix names, adjust prices, add/remove items before splitting
- **Swipe to categorize** — Tinder-style cards: left = Me, right = You, up = Common (50/50), down = Ignore
- **Instant results** — see the final split and copy a summary to clipboard
- **Debug & test modes** — `?debug=true` for raw OCR output; `?testMode=edit` to bypass OCR in tests

## Quick Start

```bash
git clone https://github.com/laveez/splitr.git
cd splitr
npm install --legacy-peer-deps
npm run dev
```

The `--legacy-peer-deps` flag is needed due to react-tinder-card peer dependency on React 18.

Opens at [localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm test` | Run Playwright e2e tests |
| `npm run test:ui` | Run tests with Playwright UI |
| `npm run test:headed` | Run tests in headed browser |

## How It Works

```mermaid
flowchart LR
    A[Upload<br/>image / PDF] --> B[Crop<br/>optional]
    B --> C[OCR / Extract<br/>Tesseract · pdfjs]
    C --> D[Edit items<br/>fix · add · remove]
    D --> E[Swipe cards<br/>Me · You · Common · Ignore]
    E --> F[Results<br/>totals · clipboard]

    style A fill:#2d4a2d
    style C fill:#38608c
    style E fill:#2d4a2d
```

Images are processed client-side with Tesseract.js OCR; PDFs with selectable text use pdfjs-dist for direct extraction. Detected items are parsed into name/price pairs, editable before the swipe phase. Each swipe assigns the item to a person, splits it 50/50, or ignores it.

## Current Limitations

> **Note:** The receipt parser is optimized for **Finnish K-Ruoka grocery receipts** — euro currency format, Finnish discount types (Plussa-tasaerä, Plussasetti, Tasaerä), and K-Ruoka receipt structure. To support other formats, extend the parsing logic in `src/utils/receiptParser.ts`.

## Contributing

Contributions are welcome! Open an issue or submit a PR.

```bash
git clone https://github.com/laveez/splitr.git
cd splitr
npm install --legacy-peer-deps
npm run dev
```

## License

[MIT](LICENSE)
