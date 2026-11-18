import type { Messages } from './en';

// Persian (Iran). Machine-quality translation: please have a native speaker review.
const fa: Messages = {
  app: { name: 'استودیو تامبنیل', untitled: 'تامبنیل بی‌نام' },
  top: { undo: 'واگرد', redo: 'انجام دوباره', export: 'خروجی', settings: 'تنظیمات', language: 'زبان' },
  rail: { templates: 'قالب‌ها', text: 'متن', images: 'تصاویر', shapes: 'شکل‌ها', ai: 'ابزارهای هوش مصنوعی', brand: 'کیت برند' },
  panel: { comingSoon: 'در مرحلهٔ بعد می‌آید', comingSoonHint: 'این بخش برنامه‌ریزی شده و در مراحل بعدی ساخت اضافه می‌شود.' },
  text: {
    addHeading: 'افزودن عنوان',
    addSubheading: 'افزودن زیرعنوان',
    addBody: 'افزودن متن',
    sampleHeading: 'عنوان بزرگ شما',
    sampleSub: 'زیرعنوان کوتاه و جذاب',
    sampleBody: 'جزئیات بیشتر اینجا',
    rtlHint: 'به فارسی، پشتو یا هر زبانی بنویسید. هر کادر متن جهت خودش را تشخیص می‌دهد.'
  },
  images: { upload: 'بارگذاری تصویر', dropHint: 'یا تصویر را هر جای بوم رها کنید.' },
  shapes: { rect: 'مستطیل', circle: 'دایره', badge: 'نشان' },
  inspector: {
    title: 'ویژگی‌ها',
    empty: 'برای ویرایش، چیزی را روی بوم انتخاب کنید.',
    font: 'قلم',
    size: 'اندازه',
    fill: 'رنگ',
    stroke: 'دورخط',
    shadow: 'سایه',
    direction: 'جهت متن',
    auto: 'خودکار',
    ltr: 'چپ به راست',
    rtl: 'راست به چپ',
    delete: 'حذف',
    background: 'پس‌زمینه',
    noPashto: 'این قلم حروف پشتو ندارد.'
  },
  sizes: {
    youtube: 'یوتیوب',
    shorts: 'شورتس · ریلز · تیک‌تاک',
    instagram: 'اینستاگرام مربع',
    portrait: 'اینستاگرام عمودی',
    facebook: 'فیسبوک · لینکدین',
    x: 'ایکس (توییتر)',
    podcast: 'کاور پادکست'
  },
  settings: {
    title: 'تنظیمات',
    close: 'بستن',
    themes: 'پوسته‌ها',
    customColour: 'رنگ دلخواه',
    yourOwnColour: 'رنگ خودتان',
    customHint: 'روی یک رنگ کلیک کنید یا هر رنگی که دوست دارید انتخاب کنید. دکمه‌ها، نشانگرها و قاب بوم از آن استفاده می‌کنند.',
    anyColour: 'هر رنگی…',
    darkCustom: 'پس‌زمینهٔ تیره برای رنگ دلخواه من',
    motion: 'حرکت',
    reduceMotion: 'کاهش حرکت',
    reduceMotionHint: 'انیمیشن‌ها را خاموش می‌کند - مناسب رایانه‌های کند یا وقتی حرکت حواس را پرت می‌کند.',
    languageSection: 'زبان',
    languageHint: 'زبان برنامه را انتخاب کنید. زبان‌های راست‌به‌چپ کل چیدمان را برعکس می‌کنند.'
  },
  theme: {
    deckDark: 'تیره',
    cleanLight: 'روشن',
    ivoryWhite: 'سفید عاجی',
    eyeShield: 'محافظ چشم',
    midnightBlue: 'آبی نیمه‌شب',
    forest: 'جنگل',
    sunset: 'غروب',
    ocean: 'اقیانوس',
    custom: 'دلخواه'
  },
  ai: {
    intro: 'ابزارهای رایگان هوش مصنوعی که روی رایانهٔ خودتان اجرا می‌شوند. تصاویر شما از آن خارج نمی‌شود.',
    free: 'رایگان · روی رایانهٔ شما',
    bgRemove: 'حذف پس‌زمینه',
    bgRemoveHint: 'یک فرد یا شیء را از عکس جدا کنید.',
    faces: 'چیدمان آگاه از چهره',
    facesHint: 'چهره‌ها را پیدا می‌کند و متن را در همهٔ اندازه‌ها از آن‌ها دور نگه می‌دارد.',
    palette: 'رنگ‌های هوشمند',
    paletteHint: 'رنگ‌هایی برای متن انتخاب می‌کند که روی عکس شما به چشم بیایند.',
    depth: 'برجسته‌سازی عمق',
    depthHint: 'پس‌زمینه را مات می‌کند یا سوژه را برجسته می‌کند.',
    upscale: 'افزایش کیفیت',
    upscaleHint: 'تصاویر کوچک یا تار را واضح می‌کند.',
    readability: 'بررسی خوانایی',
    readabilityHint: 'بررسی می‌کند متن در اندازهٔ موبایل هم خوانا بماند.'
  },
  export: { done: '{{name}} ذخیره شد', failed: 'خروجی گرفتن ناموفق بود. دوباره تلاش کنید.' },
  history: { undone: 'واگرد شد', redone: 'دوباره انجام شد' }
};

export default fa;
