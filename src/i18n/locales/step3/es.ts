import type { Messages3 } from './en';

// Spanish. Machine-quality translation: please have a native speaker review.
const m: Messages3 = {
  aiGen: {
    open: 'Miniatura con IA',
    title: 'Miniatura con IA',
    subtitle: 'Describe tu vídeo y obtén diseños terminados. Elige uno y cambia lo que quieras.',
    ideaLabel: '¿De qué trata tu vídeo?',
    ideaPlaceholder: 'p. ej. 10 formas fáciles de aprender inglés en casa',
    emptyIdea: 'Primero escribe de qué trata tu vídeo.',
    style: 'Estilo',
    photo: 'Tu foto (opcional)',
    photoHint: 'Una foto de una cara o un producto hace que la miniatura destaque.',
    addPhoto: 'Añadir foto',
    removePhoto: 'Quitar foto',
    aiPicture: 'Fondo dibujado con IA',
    aiPictureSends: 'El texto de tu idea se envía a {{service}} para dibujar la imagen.',
    aiPictureOff: 'Opcional: conecta una IA de imágenes en Ajustes para añadir fondos dibujados.',
    generate: 'Generar diseños',
    generating: 'Diseñando…',
    drawing: 'Dibujando la imagen…',
    more: 'Más ideas',
    newPicture: 'Nueva imagen',
    use: 'Usar este diseño',
    results: 'Elige un diseño. Después puedes cambiar cada parte.',
    brainOnDevice: 'Textos de la IA integrada de Chrome',
    brainRules: 'Textos del asistente de diseño integrado',
    enableOnDevice: 'Activar la IA gratuita integrada (Chrome)',
    downloading: 'Descargando modelo de IA… {{p}} %',
    applied: 'Diseño cargado. Haz clic en cualquier cosa para editarla.',
    pictureFailed: 'La IA de imágenes no respondió ({{reason}}). Los diseños se hicieron sin ella.',
    heroHint: 'Escribe una idea y obtén miniaturas terminadas en segundos.',
    replaceNote: 'Usar un diseño reemplaza el lienzo. Puedes deshacer con Ctrl+Z.'
  },
  styles: {
    auto: 'Auto',
    bold: 'Llamativo',
    minimal: 'Minimalista',
    gaming: 'Gaming',
    tech: 'Tecnología',
    education: 'Educación',
    news: 'Noticias',
    vlog: 'Vlog',
    food: 'Comida',
    travel: 'Viajes',
    business: 'Negocios'
  },
  pictures: {
    title: 'Imágenes con IA (opcional)',
    hint: 'Conecta tu propia cuenta de un servicio de IA de imágenes para dibujar fondos de las miniaturas. Estos servicios suelen cobrar por imagen. Tu clave se guarda solo en este navegador.',
    service: 'Servicio',
    none: 'Desactivado',
    custom: 'Otro (compatible con OpenAI)',
    key: 'Clave API',
    model: 'Modelo',
    baseUrl: 'Dirección del servicio',
    test: 'Probar',
    testing: 'Probando…',
    ok: 'Conectado: se creó una imagen de prueba.',
    failed: 'Error: {{reason}}',
    getKey: 'Obtener una clave'
  },
  sizes2: {
    refit: 'Reajustar desde {{name}}',
    refitHint: 'Reconstruir este tamaño desde el diseño principal',
    autoFitted: 'Ajustado automáticamente para {{name}}. Cambia lo que quieras.'
  },
  exportAll: {
    all: 'Todos los tamaños',
    hint: 'Cada tamaño marcado, en un solo archivo ZIP. Los tamaños que aún no has abierto se ajustan automáticamente.',
    count: 'Exportar {{n}} tamaños'
  }
};

export default m;
