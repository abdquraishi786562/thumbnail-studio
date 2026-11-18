# Thumbnail Studio

Design thumbnails for YouTube and every other platform, in your browser.
Everything runs on your own computer: no account, no uploads.

## Features

**Editor**
- Headings, subheadings, text, images (upload, drag and drop, or paste a screenshot), 8 shapes
- Text: font, size, letter spacing, line height, alignment, solid or gradient fill, outline,
  shadow / glow / hard shadow, text background
- Photos: brightness, contrast, saturation, blur, crop, rounded corners, border
- Layers panel: drag to reorder, hide, lock
- Duplicate, align, flip, opacity, bring forward/back, snapping guides, undo/redo
- Shortcuts: Ctrl+Z/Y, Ctrl+C/V/D, Delete, arrow keys (Shift = 10 px), [ and ], Space to play

**Animated thumbnails**
- 10 entrance animations and 6 loops per item, with delay and length
- Auto-animate everything in one click, live preview with a play bar
- Export MP4, WebM or GIF, frame by frame, so the file matches the preview exactly
- Right-to-left text: Dari, Pashto, Persian, Arabic and Urdu, detected per text box
- Platform sizes: YouTube, Shorts/Reels/TikTok, Instagram, Facebook/LinkedIn, X, podcast cover
- Exact-size PNG export, or JPG compressed under YouTube's 2 MB limit
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

## Libraries

Fabric.js (canvas), Motion (animation), i18next (languages), Mediabunny (MP4/WebM, MPL-2.0),
gifenc (GIF), Zustand, Lucide icons. Fonts from Fontsource.

## Fonts

All bundled fonts use the SIL Open Font License. For Pashto text use Vazirmatn,
Noto Sans Arabic or Noto Naskh Arabic; Lalezar has no Pashto-specific letters.
