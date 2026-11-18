import type { Messages } from './en';

// Uzbek (Latin script). Machine-quality translation: please have a native speaker review.
const uz: Messages = {
  app: { name: 'Thumbnail Studio', untitled: 'Nomsiz muqova' },
  top: { undo: 'Bekor qilish', redo: 'Qaytarish', export: 'Eksport', settings: 'Sozlamalar', language: 'Til' },
  rail: { templates: 'Shablonlar', text: 'Matn', images: 'Rasmlar', shapes: 'Shakllar', ai: 'SI vositalari', brand: 'Brend toʻplami' },
  panel: { comingSoon: 'Keyingi bosqichda', comingSoonHint: 'Bu qism rejalashtirilgan va keyingi bosqichlarda qoʻshiladi.' },
  text: {
    addHeading: 'Sarlavha qoʻshish',
    addSubheading: 'Kichik sarlavha qoʻshish',
    addBody: 'Matn qoʻshish',
    sampleHeading: 'KATTA SARLAVHANGIZ',
    sampleSub: 'Qisqa va taʼsirli kichik sarlavha',
    sampleBody: 'Qoʻshimcha maʼlumot shu yerda',
    rtlHint: 'Istalgan tilda yozing. Har bir matn qutisi yoʻnalishini oʻzi aniqlaydi.'
  },
  images: { upload: 'Rasm yuklash', dropHint: 'Yoki rasmni tuvalning istalgan joyiga tashlang.' },
  shapes: { rect: 'Toʻrtburchak', circle: 'Doira', badge: 'Nishon' },
  inspector: {
    title: 'Xususiyatlar',
    empty: 'Tahrirlash uchun tuvaldan biror narsani tanlang.',
    font: 'Shrift',
    size: 'Oʻlcham',
    fill: 'Rang',
    stroke: 'Kontur',
    shadow: 'Soya',
    direction: 'Matn yoʻnalishi',
    auto: 'Avto',
    ltr: 'Chapdan oʻngga',
    rtl: 'Oʻngdan chapga',
    delete: 'Oʻchirish',
    background: 'Fon',
    noPashto: 'Bu shriftda pushtu harflari yoʻq.'
  },
  sizes: {
    youtube: 'YouTube',
    shorts: 'Shorts · Reels · TikTok',
    instagram: 'Instagram kvadrat',
    portrait: 'Instagram vertikal',
    facebook: 'Facebook · LinkedIn',
    x: 'X (Twitter)',
    podcast: 'Podkast muqovasi'
  },
  settings: {
    title: 'Sozlamalar',
    close: 'Yopish',
    themes: 'Mavzular',
    customColour: 'Maxsus rang',
    yourOwnColour: 'Oʻz rangingiz',
    customHint: 'Rangni bosing yoki istalgan rangni tanlang. Tugmalar, belgilar va tuval ramkasi undan foydalanadi.',
    anyColour: 'Istalgan rang…',
    darkCustom: 'Maxsus rangim uchun qora fon',
    motion: 'Harakat',
    reduceMotion: 'Harakatni kamaytirish',
    reduceMotionHint: 'Animatsiyalarni oʻchiradi - sekin kompyuterlarda yoki harakat chalgʻitsa foydali.',
    languageSection: 'Til',
    languageHint: 'Ilova tilini tanlang. Oʻngdan chapga yoziladigan tillar butun koʻrinishni aylantiradi.'
  },
  theme: {
    deckDark: 'Qorongʻi',
    cleanLight: 'Yorugʻ',
    ivoryWhite: 'Fil suyagi oq',
    eyeShield: 'Koʻz himoyasi',
    midnightBlue: 'Tun koʻki',
    forest: 'Oʻrmon',
    sunset: 'Quyosh botishi',
    ocean: 'Okean',
    custom: 'Maxsus'
  },
  ai: {
    intro: 'Oʻz kompyuteringizda ishlaydigan bepul SI vositalari. Rasmlaringiz undan chiqmaydi.',
    free: 'Bepul · kompyuteringizda',
    bgRemove: 'Fonni olib tashlash',
    bgRemoveHint: 'Rasmdagi odam yoki narsani ajratib oling.',
    faces: 'Yuzni hisobga olgan joylashuv',
    facesHint: 'Yuzlarni topadi va har bir oʻlchamda matnni ulardan uzoq tutadi.',
    palette: 'Aqlli ranglar',
    paletteHint: 'Rasmingizda yaxshi koʻrinadigan matn ranglarini tanlaydi.',
    depth: 'Chuqurlik effekti',
    depthHint: 'Fonni xiralashtiradi yoki obyektni ajratib koʻrsatadi.',
    upscale: 'Sifatni oshirish',
    upscaleHint: 'Kichik yoki xira rasmlarni tiniqlashtiradi.',
    readability: 'Oʻqilishni tekshirish',
    readabilityHint: 'Matn telefon oʻlchamida ham oʻqilishini tekshiradi.'
  },
  export: { done: '{{name}} saqlandi', failed: 'Eksport amalga oshmadi. Qayta urinib koʻring.' },
  history: { undone: 'Bekor qilindi', redone: 'Qaytarildi' }
};

export default uz;
