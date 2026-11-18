import type { Messages } from './en';

// Arabic. Machine-quality translation: please have a native speaker review.
const ar: Messages = {
  app: { name: 'استوديو الصور المصغّرة', untitled: 'صورة مصغّرة بلا عنوان' },
  top: { undo: 'تراجع', redo: 'إعادة', export: 'تصدير', settings: 'الإعدادات', language: 'اللغة' },
  rail: { templates: 'القوالب', text: 'النص', images: 'الصور', shapes: 'الأشكال', ai: 'أدوات الذكاء الاصطناعي', brand: 'هوية العلامة' },
  panel: { comingSoon: 'قادم في خطوة لاحقة', comingSoonHint: 'هذا الجزء مخطط له وسيُضاف في خطوات البناء القادمة.' },
  text: {
    addHeading: 'إضافة عنوان',
    addSubheading: 'إضافة عنوان فرعي',
    addBody: 'إضافة نص',
    sampleHeading: 'عنوانك الكبير',
    sampleSub: 'عنوان فرعي قصير وجذاب',
    sampleBody: 'تفاصيل إضافية هنا',
    rtlHint: 'اكتب بالعربية أو الدرية أو البشتو أو أي لغة. كل مربع نص يحدد اتجاهه بنفسه.'
  },
  images: { upload: 'رفع صورة', dropHint: 'أو أفلت صورة في أي مكان على اللوحة.' },
  shapes: { rect: 'مستطيل', circle: 'دائرة', badge: 'شارة' },
  inspector: {
    title: 'الخصائص',
    empty: 'حدد عنصراً على اللوحة لتعديله.',
    font: 'الخط',
    size: 'الحجم',
    fill: 'اللون',
    stroke: 'الحدّ',
    shadow: 'الظل',
    direction: 'اتجاه النص',
    auto: 'تلقائي',
    ltr: 'من اليسار إلى اليمين',
    rtl: 'من اليمين إلى اليسار',
    delete: 'حذف',
    background: 'الخلفية',
    noPashto: 'هذا الخط لا يحتوي على حروف البشتو.'
  },
  sizes: {
    youtube: 'يوتيوب',
    shorts: 'شورتس · ريلز · تيك توك',
    instagram: 'إنستغرام مربع',
    portrait: 'إنستغرام عمودي',
    facebook: 'فيسبوك · لينكدإن',
    x: 'إكس (تويتر)',
    podcast: 'غلاف بودكاست'
  },
  settings: {
    title: 'الإعدادات',
    close: 'إغلاق',
    themes: 'السمات',
    customColour: 'لون مخصص',
    yourOwnColour: 'لونك الخاص',
    customHint: 'انقر على لون أو اختر أي لون تريده. ستستخدمه الأزرار والتمييزات وإطار اللوحة.',
    anyColour: 'أي لون…',
    darkCustom: 'خلفية داكنة للوني المخصص',
    motion: 'الحركة',
    reduceMotion: 'تقليل الحركة',
    reduceMotionHint: 'يوقف الرسوم المتحركة - مفيد على الأجهزة البطيئة أو إذا كانت الحركة مشتتة.',
    languageSection: 'اللغة',
    languageHint: 'اختر لغة التطبيق. اللغات من اليمين إلى اليسار تقلب التخطيط بالكامل.'
  },
  theme: {
    deckDark: 'داكن',
    cleanLight: 'فاتح',
    ivoryWhite: 'أبيض عاجي',
    eyeShield: 'حماية العين',
    midnightBlue: 'أزرق منتصف الليل',
    forest: 'غابة',
    sunset: 'غروب',
    ocean: 'محيط',
    custom: 'مخصص'
  },
  ai: {
    intro: 'أدوات ذكاء اصطناعي مجانية تعمل على جهازك. صورك لا تغادره.',
    free: 'مجاني · على جهازك',
    bgRemove: 'إزالة الخلفية',
    bgRemoveHint: 'افصل شخصاً أو عنصراً عن الصورة.',
    faces: 'تخطيط يراعي الوجوه',
    facesHint: 'يجد الوجوه ويبعد النص عنها في كل المقاسات.',
    palette: 'ألوان ذكية',
    paletteHint: 'يختار ألوان نص تبرز فوق صورتك.',
    depth: 'إبراز العمق',
    depthHint: 'يطمس الخلفية أو يُبرز الموضوع.',
    upscale: 'تحسين الدقة',
    upscaleHint: 'يوضّح الصور الصغيرة أو الضبابية.',
    readability: 'فحص الوضوح',
    readabilityHint: 'يتأكد أن النص مقروء بحجم شاشة الهاتف.'
  },
  export: { done: 'تم حفظ {{name}}', failed: 'فشل التصدير. حاول مرة أخرى.' },
  history: { undone: 'تم التراجع', redone: 'تمت الإعادة' }
};

export default ar;
