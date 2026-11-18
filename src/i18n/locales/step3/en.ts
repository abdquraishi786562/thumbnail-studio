const en3 = {
  aiGen: {
    open: 'AI Thumbnail',
    title: 'AI Thumbnail',
    subtitle: 'Describe your video and get finished designs. Pick one, then change anything you like.',
    ideaLabel: 'What is your video about?',
    ideaPlaceholder: 'e.g. 10 easy ways to learn English at home',
    emptyIdea: 'Type what your video is about first.',
    style: 'Style',
    photo: 'Your photo (optional)',
    photoHint: 'A face or product photo makes thumbnails stand out.',
    addPhoto: 'Add photo',
    removePhoto: 'Remove photo',
    aiPicture: 'AI picture background',
    aiPictureSends: 'Your idea text is sent to {{service}} to draw the picture.',
    aiPictureOff: 'Optional: connect a picture AI in Settings to add drawn backgrounds.',
    generate: 'Generate designs',
    generating: 'Designing…',
    drawing: 'Drawing the picture…',
    more: 'More ideas',
    newPicture: 'New picture',
    use: 'Use this design',
    results: 'Pick a design. You can change every part of it afterwards.',
    brainOnDevice: 'Words by Chrome’s on-device AI',
    brainRules: 'Words by the built-in design assistant',
    enableOnDevice: 'Turn on free on-device AI (Chrome)',
    downloading: 'Downloading AI model… {{p}}%',
    applied: 'Design loaded. Click anything to edit it.',
    pictureFailed: 'The picture AI did not answer ({{reason}}). Designs were made without it.',
    heroHint: 'Type an idea, get finished thumbnails in seconds.',
    replaceNote: 'Using a design replaces the canvas. You can undo with Ctrl+Z.'
  },
  styles: {
    auto: 'Auto',
    bold: 'Bold',
    minimal: 'Minimal',
    gaming: 'Gaming',
    tech: 'Tech',
    education: 'Education',
    news: 'News',
    vlog: 'Vlog',
    food: 'Food',
    travel: 'Travel',
    business: 'Business'
  },
  pictures: {
    title: 'AI pictures (optional)',
    hint: 'Connect your own account at a picture AI service to draw backgrounds for AI thumbnails. These services usually charge per picture. Your key is saved only in this browser.',
    service: 'Service',
    none: 'Off',
    custom: 'Other (OpenAI-compatible)',
    key: 'API key',
    model: 'Model',
    baseUrl: 'Service address',
    test: 'Test',
    testing: 'Testing…',
    ok: 'Connected: a test picture was made.',
    failed: 'Failed: {{reason}}',
    getKey: 'Get a key'
  },
  sizes2: {
    refit: 'Re-fit from {{name}}',
    refitHint: 'Rebuild this size from your main design',
    autoFitted: 'Fitted automatically for {{name}}. Adjust anything you like.'
  },
  exportAll: {
    all: 'All sizes',
    hint: 'Every size you tick, in one ZIP file. Sizes you have not opened yet are fitted automatically.',
    count: 'Export {{n}} sizes'
  }
};

export default en3;
export type Messages3 = typeof en3;
