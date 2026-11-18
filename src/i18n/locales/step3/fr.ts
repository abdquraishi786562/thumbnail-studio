import type { Messages3 } from './en';

// French. Machine-quality translation: please have a native speaker review.
const m: Messages3 = {
  aiGen: {
    open: 'Miniature IA',
    title: 'Miniature IA',
    subtitle: 'Décrivez votre vidéo et obtenez des designs finis. Choisissez-en un, puis modifiez ce que vous voulez.',
    ideaLabel: 'De quoi parle votre vidéo ?',
    ideaPlaceholder: 'ex. 10 façons simples d’apprendre l’anglais à la maison',
    emptyIdea: 'Écrivez d’abord le sujet de votre vidéo.',
    style: 'Style',
    photo: 'Votre photo (facultatif)',
    photoHint: 'Une photo de visage ou de produit fait ressortir la miniature.',
    addPhoto: 'Ajouter une photo',
    removePhoto: 'Retirer la photo',
    aiPicture: 'Arrière-plan dessiné par IA',
    aiPictureSends: 'Le texte de votre idée est envoyé à {{service}} pour dessiner l’image.',
    aiPictureOff: 'Facultatif : connectez une IA d’images dans les Paramètres pour ajouter des fonds dessinés.',
    generate: 'Générer des designs',
    generating: 'Conception…',
    drawing: 'Dessin de l’image…',
    more: 'Plus d’idées',
    newPicture: 'Nouvelle image',
    use: 'Utiliser ce design',
    results: 'Choisissez un design. Vous pourrez en modifier chaque élément ensuite.',
    brainOnDevice: 'Textes écrits par l’IA intégrée de Chrome',
    brainRules: 'Textes écrits par l’assistant de design intégré',
    enableOnDevice: 'Activer l’IA gratuite intégrée (Chrome)',
    downloading: 'Téléchargement du modèle d’IA… {{p}} %',
    applied: 'Design chargé. Cliquez sur n’importe quel élément pour le modifier.',
    pictureFailed: 'L’IA d’images n’a pas répondu ({{reason}}). Les designs ont été faits sans elle.',
    heroHint: 'Écrivez une idée, obtenez des miniatures finies en quelques secondes.',
    replaceNote: 'Utiliser un design remplace le canevas. Ctrl+Z pour annuler.'
  },
  styles: {
    auto: 'Auto',
    bold: 'Percutant',
    minimal: 'Minimal',
    gaming: 'Jeu vidéo',
    tech: 'Tech',
    education: 'Éducation',
    news: 'Actu',
    vlog: 'Vlog',
    food: 'Cuisine',
    travel: 'Voyage',
    business: 'Business'
  },
  pictures: {
    title: 'Images IA (facultatif)',
    hint: 'Connectez votre propre compte d’un service d’IA d’images pour dessiner les fonds des miniatures IA. Ces services facturent généralement chaque image. Votre clé reste uniquement dans ce navigateur.',
    service: 'Service',
    none: 'Désactivé',
    custom: 'Autre (compatible OpenAI)',
    key: 'Clé API',
    model: 'Modèle',
    baseUrl: 'Adresse du service',
    test: 'Tester',
    testing: 'Test…',
    ok: 'Connecté : une image de test a été créée.',
    failed: 'Échec : {{reason}}',
    getKey: 'Obtenir une clé'
  },
  sizes2: {
    refit: 'Réajuster depuis {{name}}',
    refitHint: 'Reconstruire ce format à partir du design principal',
    autoFitted: 'Adapté automatiquement pour {{name}}. Ajustez ce que vous voulez.'
  },
  exportAll: {
    all: 'Tous les formats',
    hint: 'Chaque format coché, dans un seul fichier ZIP. Les formats pas encore ouverts sont adaptés automatiquement.',
    count: 'Exporter {{n}} formats'
  }
};

export default m;
