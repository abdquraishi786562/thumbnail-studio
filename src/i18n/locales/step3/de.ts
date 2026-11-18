import type { Messages3 } from './en';

// German. Machine-quality translation: please have a native speaker review.
const m: Messages3 = {
  aiGen: {
    open: 'KI-Thumbnail',
    title: 'KI-Thumbnail',
    subtitle: 'Beschreibe dein Video und erhalte fertige Designs. Wähle eines und ändere, was du willst.',
    ideaLabel: 'Worum geht es in deinem Video?',
    ideaPlaceholder: 'z. B. 10 einfache Wege, zu Hause Englisch zu lernen',
    emptyIdea: 'Schreibe zuerst, worum es in deinem Video geht.',
    style: 'Stil',
    photo: 'Dein Foto (optional)',
    photoHint: 'Ein Gesichts- oder Produktfoto lässt Thumbnails herausstechen.',
    addPhoto: 'Foto hinzufügen',
    removePhoto: 'Foto entfernen',
    aiPicture: 'KI-gezeichneter Hintergrund',
    aiPictureSends: 'Dein Ideentext wird an {{service}} gesendet, um das Bild zu zeichnen.',
    aiPictureOff: 'Optional: Verbinde in den Einstellungen eine Bild-KI für gezeichnete Hintergründe.',
    generate: 'Designs erstellen',
    generating: 'Wird gestaltet…',
    drawing: 'Bild wird gezeichnet…',
    more: 'Mehr Ideen',
    newPicture: 'Neues Bild',
    use: 'Dieses Design verwenden',
    results: 'Wähle ein Design. Danach kannst du jeden Teil ändern.',
    brainOnDevice: 'Texte von Chromes integrierter KI',
    brainRules: 'Texte vom eingebauten Design-Assistenten',
    enableOnDevice: 'Kostenlose integrierte KI einschalten (Chrome)',
    downloading: 'KI-Modell wird geladen… {{p}} %',
    applied: 'Design geladen. Klicke auf etwas, um es zu bearbeiten.',
    pictureFailed: 'Die Bild-KI hat nicht geantwortet ({{reason}}). Die Designs wurden ohne sie erstellt.',
    heroHint: 'Schreib eine Idee und erhalte in Sekunden fertige Thumbnails.',
    replaceNote: 'Ein Design zu verwenden ersetzt die Leinwand. Mit Strg+Z rückgängig.'
  },
  styles: {
    auto: 'Auto',
    bold: 'Kräftig',
    minimal: 'Minimal',
    gaming: 'Gaming',
    tech: 'Technik',
    education: 'Bildung',
    news: 'News',
    vlog: 'Vlog',
    food: 'Essen',
    travel: 'Reisen',
    business: 'Business'
  },
  pictures: {
    title: 'KI-Bilder (optional)',
    hint: 'Verbinde dein eigenes Konto bei einem Bild-KI-Dienst, um Hintergründe für KI-Thumbnails zu zeichnen. Diese Dienste berechnen meist pro Bild. Dein Schlüssel bleibt nur in diesem Browser.',
    service: 'Dienst',
    none: 'Aus',
    custom: 'Anderer (OpenAI-kompatibel)',
    key: 'API-Schlüssel',
    model: 'Modell',
    baseUrl: 'Dienstadresse',
    test: 'Testen',
    testing: 'Wird getestet…',
    ok: 'Verbunden: Ein Testbild wurde erstellt.',
    failed: 'Fehlgeschlagen: {{reason}}',
    getKey: 'Schlüssel holen'
  },
  sizes2: {
    refit: 'Neu anpassen aus {{name}}',
    refitHint: 'Diese Größe aus dem Hauptdesign neu aufbauen',
    autoFitted: 'Automatisch für {{name}} angepasst. Ändere, was du willst.'
  },
  exportAll: {
    all: 'Alle Größen',
    hint: 'Jede angehakte Größe in einer ZIP-Datei. Noch nicht geöffnete Größen werden automatisch angepasst.',
    count: '{{n}} Größen exportieren'
  }
};

export default m;
