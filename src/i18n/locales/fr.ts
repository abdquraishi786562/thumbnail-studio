import type { Messages } from './en';

// French. Machine-quality translation: please have a native speaker review.
const fr: Messages = {
  app: { name: 'Thumbnail Studio', untitled: 'Miniature sans titre' },
  top: { undo: 'Annuler', redo: 'Rétablir', export: 'Exporter', settings: 'Paramètres', language: 'Langue' },
  rail: { templates: 'Modèles', text: 'Texte', images: 'Images', shapes: 'Formes', ai: 'Outils IA', brand: 'Kit de marque' },
  panel: { comingSoon: 'Prévu pour une étape suivante', comingSoonHint: 'Cette partie est prévue et arrivera dans les prochaines étapes.' },
  text: {
    addHeading: 'Ajouter un titre',
    addSubheading: 'Ajouter un sous-titre',
    addBody: 'Ajouter du texte',
    sampleHeading: 'VOTRE GRAND TITRE',
    sampleSub: 'Un sous-titre court et percutant',
    sampleBody: 'Plus de détails ici',
    rtlHint: 'Écrivez dans n’importe quelle langue. Chaque zone de texte trouve sa propre direction.'
  },
  images: { upload: 'Importer une image', dropHint: 'Ou déposez une image n’importe où sur le canevas.' },
  shapes: { rect: 'Rectangle', circle: 'Cercle', badge: 'Badge' },
  inspector: {
    title: 'Propriétés',
    empty: 'Sélectionnez un élément du canevas pour le modifier.',
    font: 'Police',
    size: 'Taille',
    fill: 'Couleur',
    stroke: 'Contour',
    shadow: 'Ombre',
    direction: 'Sens du texte',
    auto: 'Auto',
    ltr: 'De gauche à droite',
    rtl: 'De droite à gauche',
    delete: 'Supprimer',
    background: 'Arrière-plan',
    noPashto: 'Cette police n’a pas les lettres pachtounes.'
  },
  sizes: {
    youtube: 'YouTube',
    shorts: 'Shorts · Reels · TikTok',
    instagram: 'Instagram carré',
    portrait: 'Instagram portrait',
    facebook: 'Facebook · LinkedIn',
    x: 'X (Twitter)',
    podcast: 'Couverture de podcast'
  },
  settings: {
    title: 'Paramètres',
    close: 'Fermer',
    themes: 'Thèmes',
    customColour: 'Couleur personnalisée',
    yourOwnColour: 'Votre propre couleur',
    customHint: 'Cliquez sur une couleur ou choisissez celle que vous voulez. Les boutons, les surlignages et le cadre du canevas l’utiliseront.',
    anyColour: 'Autre couleur…',
    darkCustom: 'Fond sombre pour ma couleur personnalisée',
    motion: 'Animations',
    reduceMotion: 'Réduire les animations',
    reduceMotionHint: 'Désactive les animations - utile sur les PC lents ou si le mouvement vous distrait.',
    languageSection: 'Langue',
    languageHint: 'Choisissez la langue de l’application. Les langues de droite à gauche inversent toute la mise en page.'
  },
  theme: {
    deckDark: 'Sombre',
    cleanLight: 'Clair',
    ivoryWhite: 'Blanc ivoire',
    eyeShield: 'Protection des yeux',
    midnightBlue: 'Bleu nuit',
    forest: 'Forêt',
    sunset: 'Coucher de soleil',
    ocean: 'Océan',
    custom: 'Personnalisé'
  },
  ai: {
    intro: 'Des outils IA gratuits qui fonctionnent sur votre ordinateur. Vos photos ne le quittent jamais.',
    free: 'Gratuit · sur votre ordinateur',
    bgRemove: 'Supprimer l’arrière-plan',
    bgRemoveHint: 'Détourez une personne ou un objet d’une photo.',
    faces: 'Mise en page selon les visages',
    facesHint: 'Trouve les visages et éloigne le texte dans chaque format.',
    palette: 'Couleurs intelligentes',
    paletteHint: 'Choisit des couleurs de texte qui ressortent sur votre photo.',
    depth: 'Effet de profondeur',
    depthHint: 'Floute l’arrière-plan ou fait ressortir le sujet.',
    upscale: 'Agrandir',
    upscaleHint: 'Rend plus nettes les images petites ou floues.',
    readability: 'Vérifier la lisibilité',
    readabilityHint: 'Vérifie que le texte reste lisible sur téléphone.'
  },
  export: { done: '{{name}} enregistré', failed: 'L’export a échoué. Veuillez réessayer.' },
  history: { undone: 'Annulé', redone: 'Rétabli' }
};

export default fr;
