import type { Messages3 } from './en';

// Uzbek (Latin script). Machine-quality translation: please have a native speaker review.
const m: Messages3 = {
  aiGen: {
    open: 'SI muqova',
    title: 'SI muqova',
    subtitle: 'Videongizni tasvirlang va tayyor dizaynlarni oling. Birini tanlang, keyin xohlaganingizni oʻzgartiring.',
    ideaLabel: 'Videongiz nima haqida?',
    ideaPlaceholder: 'masalan, uyda ingliz tilini oʻrganishning 10 oson usuli',
    emptyIdea: 'Avval videongiz nima haqida ekanini yozing.',
    style: 'Uslub',
    photo: 'Rasmingiz (ixtiyoriy)',
    photoHint: 'Yuz yoki mahsulot rasmi muqovani ajratib koʻrsatadi.',
    addPhoto: 'Rasm qoʻshish',
    removePhoto: 'Rasmni olib tashlash',
    aiPicture: 'SI chizgan fon',
    aiPictureSends: 'Rasm chizish uchun gʻoyangiz matni {{service}} ga yuboriladi.',
    aiPictureOff: 'Ixtiyoriy: chizilgan fonlar uchun Sozlamalarda rasm SI ni ulang.',
    generate: 'Dizaynlar yaratish',
    generating: 'Dizayn qilinmoqda…',
    drawing: 'Rasm chizilmoqda…',
    more: 'Yana gʻoyalar',
    newPicture: 'Yangi rasm',
    use: 'Shu dizaynni ishlatish',
    results: 'Dizaynni tanlang. Keyin uning har bir qismini oʻzgartirishingiz mumkin.',
    brainOnDevice: 'Chrome ichki SI yozgan',
    brainRules: 'Ichki dizayn yordamchisi yozgan',
    enableOnDevice: 'Bepul ichki SI ni yoqish (Chrome)',
    downloading: 'SI modeli yuklanmoqda… {{p}}%',
    applied: 'Dizayn yuklandi. Tahrirlash uchun istalgan narsani bosing.',
    pictureFailed: 'Rasm SI javob bermadi ({{reason}}). Dizaynlar usiz yaratildi.',
    heroHint: 'Gʻoya yozing, soniyalarda tayyor muqovalar oling.',
    replaceNote: 'Dizaynni ishlatish tuvalni almashtiradi. Ctrl+Z bilan qaytarish mumkin.'
  },
  styles: {
    auto: 'Avto',
    bold: 'Yorqin',
    minimal: 'Minimal',
    gaming: 'Oʻyin',
    tech: 'Texnologiya',
    education: 'Taʼlim',
    news: 'Yangiliklar',
    vlog: 'Vlog',
    food: 'Taom',
    travel: 'Sayohat',
    business: 'Biznes'
  },
  pictures: {
    title: 'SI rasmlari (ixtiyoriy)',
    hint: 'Muqovalar uchun fon chizish maqsadida rasm SI xizmatidagi oʻz hisobingizni ulang. Bu xizmatlar odatda har bir rasm uchun haq oladi. Kalitingiz faqat shu brauzerda saqlanadi.',
    service: 'Xizmat',
    none: 'Oʻchiq',
    custom: 'Boshqa (OpenAI bilan mos)',
    key: 'API kaliti',
    model: 'Model',
    baseUrl: 'Xizmat manzili',
    test: 'Sinash',
    testing: 'Sinalmoqda…',
    ok: 'Ulandi: sinov rasmi yaratildi.',
    failed: 'Xato: {{reason}}',
    getKey: 'Kalit olish'
  },
  sizes2: {
    refit: '{{name}} dan qayta moslash',
    refitHint: 'Bu oʻlchamni asosiy dizayndan qayta yaratish',
    autoFitted: '{{name}} uchun avtomatik moslandi. Xohlaganingizni oʻzgartiring.'
  },
  exportAll: {
    all: 'Barcha oʻlchamlar',
    hint: 'Belgilangan har bir oʻlcham bitta ZIP faylda. Hali ochilmagan oʻlchamlar avtomatik moslanadi.',
    count: '{{n}} ta oʻlchamni eksport qilish'
  }
};

export default m;
