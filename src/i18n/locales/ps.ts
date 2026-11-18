import type { Messages } from './en';

// Pashto. Machine-quality translation: please have a native speaker review.
const ps: Messages = {
  app: { name: 'د انځورګوټي سټوډیو', untitled: 'بې نومه انځورګوټی' },
  top: { undo: 'بېرته', redo: 'بیا', export: 'صادرول', settings: 'امستنې', language: 'ژبه' },
  rail: { templates: 'کينډۍ', text: 'متن', images: 'انځورونه', shapes: 'شکلونه', ai: 'د مصنوعي ځيرکتيا وسایل', brand: 'د برنډ کټ' },
  panel: { comingSoon: 'په راتلونکي پړاو کې راځي', comingSoonHint: 'دا برخه پلان شوې او د جوړونې په راتلونکو پړاوونو کې به زياته شي.' },
  text: {
    addHeading: 'سرليک زيات کړئ',
    addSubheading: 'فرعي سرليک زيات کړئ',
    addBody: 'متن زيات کړئ',
    sampleHeading: 'ستاسو لوی سرليک',
    sampleSub: 'لنډ او زړه راښکونکی فرعي سرليک',
    sampleBody: 'نور جزئيات دلته',
    rtlHint: 'په پښتو، دري يا هره ژبه وليکئ. هر متن بکس خپل لوری پخپله پيدا کوي.'
  },
  images: { upload: 'انځور پورته کړئ', dropHint: 'يا انځور د کينوس په هر ځای کې پرېږدئ.' },
  shapes: { rect: 'مستطيل', circle: 'دايره', badge: 'نښان' },
  inspector: {
    title: 'ځانګړتياوې',
    empty: 'د سمون لپاره په کينوس کې يو شی وټاکئ.',
    font: 'فونټ',
    size: 'اندازه',
    fill: 'رنګ',
    stroke: 'څنډه',
    shadow: 'سيوری',
    direction: 'د متن لوری',
    auto: 'خپلکاره',
    ltr: 'له کيڼ نه ښي ته',
    rtl: 'له ښي نه کيڼ ته',
    delete: 'ړنګول',
    background: 'شاليد',
    noPashto: 'دا فونټ پښتو توري نه لري.'
  },
  sizes: {
    youtube: 'يوټيوب',
    shorts: 'شارټس · ريلز · ټيک ټاک',
    instagram: 'انسټاګرام مربع',
    portrait: 'انسټاګرام عمودي',
    facebook: 'فېسبوک · لينکډاين',
    x: 'اېکس (ټوېټر)',
    podcast: 'د پوډکاسټ پوښ'
  },
  settings: {
    title: 'امستنې',
    close: 'بندول',
    themes: 'بڼې',
    customColour: 'دلخواه رنګ',
    yourOwnColour: 'ستاسو خپل رنګ',
    customHint: 'په يو رنګ کليک وکړئ، يا هر رنګ چې خوښوئ وټاکئ. تڼۍ، نښې او د کينوس چوکاټ به يې وکاروي.',
    anyColour: 'هر رنګ…',
    darkCustom: 'زما د دلخواه رنګ لپاره تياره شاليد',
    motion: 'حرکت',
    reduceMotion: 'حرکت کمول',
    reduceMotionHint: 'انيميشنونه بندوي - په ورو کمپيوټرونو کې ګټور دی يا که حرکت پام اړوي.',
    languageSection: 'ژبه',
    languageHint: 'د اپ ژبه وټاکئ. له ښي نه کيڼ ته ژبې ټوله بڼه اړوي.'
  },
  theme: {
    deckDark: 'تياره',
    cleanLight: 'روښانه',
    ivoryWhite: 'عاجي سپين',
    eyeShield: 'د سترګو ساتونکی',
    midnightBlue: 'د نيمې شپې شين',
    forest: 'ځنګل',
    sunset: 'لمر لوېدنه',
    ocean: 'سمندر',
    custom: 'دلخواه'
  },
  ai: {
    intro: 'وړيا د مصنوعي ځيرکتيا وسایل چې ستاسو په خپل کمپيوټر چلېږي. ستاسو انځورونه ترې نه وځي.',
    free: 'وړيا · ستاسو په کمپيوټر',
    bgRemove: 'شاليد لرې کول',
    bgRemoveHint: 'يو کس يا شی له انځور نه جلا کړئ.',
    faces: 'د مخ پېژندنې ترتيب',
    facesHint: 'مخونه پيدا کوي او په ټولو اندازو کې متن ترې لرې ساتي.',
    palette: 'هوښيار رنګونه',
    paletteHint: 'د متن هغه رنګونه غوره کوي چې ستاسو په انځور ښه ښکاري.',
    depth: 'د ژوروالي برجسته کول',
    depthHint: 'شاليد تتوي يا موضوع برجسته کوي.',
    upscale: 'کيفيت لوړول',
    upscaleHint: 'کوچني يا تت انځورونه روښانه کوي.',
    readability: 'د لوستو وړتيا ازموينه',
    readabilityHint: 'ګوري چې ستاسو متن د موبايل په اندازه هم د لوستو وړ دی.'
  },
  export: { done: '{{name}} خوندي شو', failed: 'صادرول ناکام شول. بيا هڅه وکړئ.' },
  history: { undone: 'بېرته شو', redone: 'بيا وشو' }
};

export default ps;
