const en = {
  app: { name: 'Thumbnail Studio', untitled: 'Untitled thumbnail' },
  top: { undo: 'Undo', redo: 'Redo', export: 'Export', settings: 'Settings', language: 'Language' },
  rail: { templates: 'Templates', text: 'Text', images: 'Images', shapes: 'Shapes', ai: 'AI tools', brand: 'Brand kit' },
  panel: { comingSoon: 'Coming in a later step', comingSoonHint: 'This part is planned and will arrive in the next build steps.' },
  text: {
    addHeading: 'Add a heading',
    addSubheading: 'Add a subheading',
    addBody: 'Add body text',
    sampleHeading: 'YOUR BIG TITLE',
    sampleSub: 'Short, punchy subtitle',
    sampleBody: 'Extra detail goes here',
    rtlHint: 'Type in Dari, Pashto or any language. Each text box finds its own direction.'
  },
  images: { upload: 'Upload image', dropHint: 'Or drop an image anywhere on the canvas.' },
  shapes: { rect: 'Rectangle', circle: 'Circle', badge: 'Badge' },
  inspector: {
    title: 'Properties',
    empty: 'Select something on the canvas to edit it.',
    font: 'Font',
    size: 'Size',
    fill: 'Colour',
    stroke: 'Outline',
    shadow: 'Shadow',
    direction: 'Text direction',
    auto: 'Auto',
    ltr: 'Left to right',
    rtl: 'Right to left',
    delete: 'Delete',
    background: 'Background',
    noPashto: 'This font has no Pashto letters.'
  },
  sizes: {
    youtube: 'YouTube',
    shorts: 'Shorts · Reels · TikTok',
    instagram: 'Instagram square',
    portrait: 'Instagram portrait',
    facebook: 'Facebook · LinkedIn',
    x: 'X (Twitter)',
    podcast: 'Podcast cover'
  },
  settings: {
    title: 'Settings',
    close: 'Close',
    themes: 'Themes',
    customColour: 'Custom colour',
    yourOwnColour: 'Your own colour',
    customHint: 'Click a colour, or choose any colour you like. Buttons, highlights and the canvas frame will use it.',
    anyColour: 'Any colour…',
    darkCustom: 'Dark background for my custom colour',
    motion: 'Motion',
    reduceMotion: 'Reduce motion',
    reduceMotionHint: 'Turns off animations - useful on slow PCs or if movement is distracting.',
    languageSection: 'Language',
    languageHint: 'Choose the language of the app. Right-to-left languages flip the whole layout.'
  },
  theme: {
    deckDark: 'Deck Dark',
    cleanLight: 'Clean Light',
    ivoryWhite: 'Ivory White',
    eyeShield: 'Eye-Shield',
    midnightBlue: 'Midnight Blue',
    forest: 'Forest',
    sunset: 'Sunset',
    ocean: 'Ocean',
    custom: 'Custom'
  },
  ai: {
    intro: 'Free AI tools that run on your own computer. Your photos never leave it.',
    free: 'Free · on your computer',
    bgRemove: 'Remove background',
    bgRemoveHint: 'Cut a person or object out of a photo.',
    faces: 'Face-aware layout',
    facesHint: 'Finds faces and keeps text away from them in every size.',
    palette: 'Smart colours',
    paletteHint: 'Picks text colours that stand out from your photo.',
    depth: 'Depth pop-out',
    depthHint: 'Blurs the background or makes the subject pop out.',
    upscale: 'Upscale',
    upscaleHint: 'Sharpens small or blurry images.',
    readability: 'Readability check',
    readabilityHint: 'Checks your text is still readable at phone size.'
  },
  export: { done: 'Saved {{name}}', failed: 'Export failed. Please try again.' },
  history: { undone: 'Undone', redone: 'Redone' }
};

export default en;
export type Messages = typeof en;
