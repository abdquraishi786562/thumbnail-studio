import type { Messages } from './en';

// Spanish. Machine-quality translation: please have a native speaker review.
const es: Messages = {
  app: { name: 'Thumbnail Studio', untitled: 'Miniatura sin título' },
  top: { undo: 'Deshacer', redo: 'Rehacer', export: 'Exportar', settings: 'Ajustes', language: 'Idioma' },
  rail: { templates: 'Plantillas', text: 'Texto', images: 'Imágenes', shapes: 'Formas', ai: 'Herramientas IA', brand: 'Kit de marca' },
  panel: { comingSoon: 'Llega en un paso posterior', comingSoonHint: 'Esta parte está planificada y llegará en los próximos pasos.' },
  text: {
    addHeading: 'Añadir un título',
    addSubheading: 'Añadir un subtítulo',
    addBody: 'Añadir texto',
    sampleHeading: 'TU GRAN TÍTULO',
    sampleSub: 'Un subtítulo corto y llamativo',
    sampleBody: 'Más detalles aquí',
    rtlHint: 'Escribe en cualquier idioma. Cada cuadro de texto detecta su propia dirección.'
  },
  images: { upload: 'Subir imagen', dropHint: 'O suelta una imagen en cualquier parte del lienzo.' },
  shapes: { rect: 'Rectángulo', circle: 'Círculo', badge: 'Insignia' },
  inspector: {
    title: 'Propiedades',
    empty: 'Selecciona algo en el lienzo para editarlo.',
    font: 'Fuente',
    size: 'Tamaño',
    fill: 'Color',
    stroke: 'Contorno',
    shadow: 'Sombra',
    direction: 'Dirección del texto',
    auto: 'Auto',
    ltr: 'De izquierda a derecha',
    rtl: 'De derecha a izquierda',
    delete: 'Eliminar',
    background: 'Fondo',
    noPashto: 'Esta fuente no tiene letras pastún.'
  },
  sizes: {
    youtube: 'YouTube',
    shorts: 'Shorts · Reels · TikTok',
    instagram: 'Instagram cuadrado',
    portrait: 'Instagram vertical',
    facebook: 'Facebook · LinkedIn',
    x: 'X (Twitter)',
    podcast: 'Portada de pódcast'
  },
  settings: {
    title: 'Ajustes',
    close: 'Cerrar',
    themes: 'Temas',
    customColour: 'Color personalizado',
    yourOwnColour: 'Tu propio color',
    customHint: 'Haz clic en un color o elige el que quieras. Los botones, los resaltados y el marco del lienzo lo usarán.',
    anyColour: 'Cualquier color…',
    darkCustom: 'Fondo oscuro para mi color personalizado',
    motion: 'Movimiento',
    reduceMotion: 'Reducir movimiento',
    reduceMotionHint: 'Desactiva las animaciones: útil en equipos lentos o si el movimiento distrae.',
    languageSection: 'Idioma',
    languageHint: 'Elige el idioma de la aplicación. Los idiomas de derecha a izquierda invierten todo el diseño.'
  },
  theme: {
    deckDark: 'Oscuro',
    cleanLight: 'Claro',
    ivoryWhite: 'Blanco marfil',
    eyeShield: 'Protección ocular',
    midnightBlue: 'Azul medianoche',
    forest: 'Bosque',
    sunset: 'Atardecer',
    ocean: 'Océano',
    custom: 'Personalizado'
  },
  ai: {
    intro: 'Herramientas de IA gratuitas que funcionan en tu ordenador. Tus fotos nunca salen de él.',
    free: 'Gratis · en tu ordenador',
    bgRemove: 'Quitar fondo',
    bgRemoveHint: 'Recorta a una persona u objeto de una foto.',
    faces: 'Diseño según rostros',
    facesHint: 'Encuentra rostros y aleja el texto de ellos en cada tamaño.',
    palette: 'Colores inteligentes',
    paletteHint: 'Elige colores de texto que destaquen sobre tu foto.',
    depth: 'Efecto de profundidad',
    depthHint: 'Desenfoca el fondo o hace resaltar al sujeto.',
    upscale: 'Mejorar resolución',
    upscaleHint: 'Hace más nítidas las imágenes pequeñas o borrosas.',
    readability: 'Comprobar legibilidad',
    readabilityHint: 'Comprueba que el texto se lea bien en el móvil.'
  },
  export: { done: '{{name}} guardado', failed: 'La exportación falló. Inténtalo de nuevo.' },
  history: { undone: 'Deshecho', redone: 'Rehecho' }
};

export default es;
