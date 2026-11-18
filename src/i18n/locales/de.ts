import type { Messages } from './en';

// German. Machine-quality translation: please have a native speaker review.
const de: Messages = {
  app: { name: 'Thumbnail Studio', untitled: 'Unbenanntes Thumbnail' },
  top: { undo: 'Rückgängig', redo: 'Wiederholen', export: 'Exportieren', settings: 'Einstellungen', language: 'Sprache' },
  rail: { templates: 'Vorlagen', text: 'Text', images: 'Bilder', shapes: 'Formen', ai: 'KI-Werkzeuge', brand: 'Marken-Kit' },
  panel: { comingSoon: 'Kommt in einem späteren Schritt', comingSoonHint: 'Dieser Teil ist geplant und kommt in den nächsten Ausbaustufen.' },
  text: {
    addHeading: 'Überschrift hinzufügen',
    addSubheading: 'Unterüberschrift hinzufügen',
    addBody: 'Text hinzufügen',
    sampleHeading: 'DEIN GROSSER TITEL',
    sampleSub: 'Kurzer, starker Untertitel',
    sampleBody: 'Weitere Details hier',
    rtlHint: 'Schreibe in jeder Sprache. Jedes Textfeld erkennt seine Richtung selbst.'
  },
  images: { upload: 'Bild hochladen', dropHint: 'Oder ein Bild irgendwo auf die Leinwand ziehen.' },
  shapes: { rect: 'Rechteck', circle: 'Kreis', badge: 'Abzeichen' },
  inspector: {
    title: 'Eigenschaften',
    empty: 'Wähle etwas auf der Leinwand aus, um es zu bearbeiten.',
    font: 'Schrift',
    size: 'Größe',
    fill: 'Farbe',
    stroke: 'Kontur',
    shadow: 'Schatten',
    direction: 'Textrichtung',
    auto: 'Auto',
    ltr: 'Links nach rechts',
    rtl: 'Rechts nach links',
    delete: 'Löschen',
    background: 'Hintergrund',
    noPashto: 'Diese Schrift hat keine paschtunischen Buchstaben.'
  },
  sizes: {
    youtube: 'YouTube',
    shorts: 'Shorts · Reels · TikTok',
    instagram: 'Instagram quadratisch',
    portrait: 'Instagram Hochformat',
    facebook: 'Facebook · LinkedIn',
    x: 'X (Twitter)',
    podcast: 'Podcast-Cover'
  },
  settings: {
    title: 'Einstellungen',
    close: 'Schließen',
    themes: 'Designs',
    customColour: 'Eigene Farbe',
    yourOwnColour: 'Deine eigene Farbe',
    customHint: 'Klicke auf eine Farbe oder wähle eine beliebige. Schaltflächen, Hervorhebungen und der Leinwandrahmen verwenden sie.',
    anyColour: 'Beliebige Farbe…',
    darkCustom: 'Dunkler Hintergrund für meine eigene Farbe',
    motion: 'Bewegung',
    reduceMotion: 'Bewegung reduzieren',
    reduceMotionHint: 'Schaltet Animationen aus - hilfreich auf langsamen PCs oder wenn Bewegung ablenkt.',
    languageSection: 'Sprache',
    languageHint: 'Wähle die Sprache der App. Rechts-nach-links-Sprachen spiegeln das gesamte Layout.'
  },
  theme: {
    deckDark: 'Dunkel',
    cleanLight: 'Hell',
    ivoryWhite: 'Elfenbein',
    eyeShield: 'Augenschutz',
    midnightBlue: 'Mitternachtsblau',
    forest: 'Wald',
    sunset: 'Sonnenuntergang',
    ocean: 'Ozean',
    custom: 'Eigene'
  },
  ai: {
    intro: 'Kostenlose KI-Werkzeuge, die auf deinem eigenen Computer laufen. Deine Fotos verlassen ihn nie.',
    free: 'Kostenlos · auf deinem Computer',
    bgRemove: 'Hintergrund entfernen',
    bgRemoveHint: 'Eine Person oder ein Objekt aus einem Foto freistellen.',
    faces: 'Gesichtsbewusstes Layout',
    facesHint: 'Findet Gesichter und hält Text in jedem Format von ihnen fern.',
    palette: 'Intelligente Farben',
    paletteHint: 'Wählt Textfarben, die sich von deinem Foto abheben.',
    depth: 'Tiefeneffekt',
    depthHint: 'Macht den Hintergrund unscharf oder hebt das Motiv hervor.',
    upscale: 'Hochskalieren',
    upscaleHint: 'Schärft kleine oder unscharfe Bilder.',
    readability: 'Lesbarkeit prüfen',
    readabilityHint: 'Prüft, ob der Text auch in Handygröße lesbar ist.'
  },
  export: { done: '{{name}} gespeichert', failed: 'Export fehlgeschlagen. Bitte erneut versuchen.' },
  history: { undone: 'Rückgängig gemacht', redone: 'Wiederholt' }
};

export default de;
