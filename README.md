# Thumbnail Studio

Design thumbnails for YouTube and every other platform, in your browser.
Everything runs on your own computer: no account, no uploads.

## Features (step 1)

- Canvas editor: headings, subheadings, text, images (upload or drag and drop), shapes
- Text outline and shadow, colours, font choice, undo/redo
- Right-to-left text: Dari, Pashto, Persian, Arabic and Urdu, detected per text box
- Platform sizes: YouTube, Shorts/Reels/TikTok, Instagram, Facebook/LinkedIn, X, podcast cover
- Exact-size PNG export
- 8 themes plus your own colour, and a reduce-motion switch
- 12 interface languages, with full right-to-left layout
- Installable as an app (PWA) and works offline

## Run it

```bash
npm install
npm run dev
```

Build for hosting: `npm run build` (output in `dist/`). Tests: `npm test`.

## Languages

English, Dari, Pashto, Persian, Arabic, Urdu, Uzbek, Turkish, French, Spanish, German, Russian.
Translations other than English are machine-quality and should be reviewed by native speakers.

## Fonts

All bundled fonts use the SIL Open Font License. For Pashto text use Vazirmatn,
Noto Sans Arabic or Noto Naskh Arabic; Lalezar has no Pashto-specific letters.
