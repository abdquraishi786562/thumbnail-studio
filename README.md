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

**AI Thumbnail**
- Type what your video is about and get 6 finished, fully editable designs; "More ideas" for more
- 11 styles (or Auto), optional photo of you or your product, right-to-left layouts for Dari, Pashto, Arabic, Urdu
- Wording by Chrome's free on-device AI where available, otherwise by the built-in design assistant (offline, every language)
- Optional AI-drawn backgrounds with your own key for Pollinations, OpenAI or any OpenAI-compatible service
  (Settings → AI pictures). The key stays in your browser; only the idea text is sent to that service.

**Templates and projects**
- Templates gallery: 18 ready-made designs across 10 styles, drawn for the current size and language
- Projects save automatically on this device (including your photos) and the last one reopens on start
- Projects list: open, new, duplicate, delete; download a `.thumbproj` backup and import it anywhere

**Sizes**
- Each platform size keeps its own design; sizes you open for the first time are fitted automatically
  (text re-wraps and rescales, photos cover, items stay inside safe margins)
- "Re-fit from …" rebuilds a size from the main design
- Export every size at once as a ZIP of PNG or JPG files

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
