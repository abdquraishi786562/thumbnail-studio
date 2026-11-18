import type { Messages } from './en';

// Dari (Afghan Persian). Machine-quality translation: please have a native speaker review.
const faAF: Messages = {
  app: { name: 'استودیوی تصویرک', untitled: 'تصویرک بی‌نام' },
  top: { undo: 'واگرد', redo: 'ازنو', export: 'خروجی', settings: 'تنظیمات', language: 'زبان' },
  rail: { templates: 'قالب‌ها', text: 'متن', images: 'عکس‌ها', shapes: 'شکل‌ها', ai: 'ابزارهای هوش مصنوعی', brand: 'کیت برند' },
  panel: { comingSoon: 'در مرحلهٔ بعدی می‌آید', comingSoonHint: 'این بخش برنامه‌ریزی شده و در مراحل بعدی ساخت اضافه می‌شود.' },
  text: {
    addHeading: 'افزودن عنوان',
    addSubheading: 'افزودن زیرعنوان',
    addBody: 'افزودن متن',
    sampleHeading: 'عنوان بزرگ شما',
    sampleSub: 'زیرعنوان کوتاه و گیرا',
    sampleBody: 'جزئیات بیشتر اینجا',
    rtlHint: 'به دری، پښتو یا هر زبانی بنویسید. هر جعبهٔ متن جهت خود را خودش پیدا می‌کند.'
  },
  images: { upload: 'بارگذاری عکس', dropHint: 'یا عکس را در هر جای بوم رها کنید.' },
  shapes: { rect: 'مستطیل', circle: 'دایره', badge: 'نشان' },
  inspector: {
    title: 'ویژگی‌ها',
    empty: 'برای ویرایش، چیزی را روی بوم انتخاب کنید.',
    font: 'فونت',
    size: 'اندازه',
    fill: 'رنگ',
    stroke: 'حاشیه',
    shadow: 'سایه',
    direction: 'جهت متن',
    auto: 'خودکار',
    ltr: 'چپ به راست',
    rtl: 'راست به چپ',
    delete: 'حذف',
    background: 'پس‌زمینه',
    noPashto: 'این فونت حروف پښتو ندارد.'
  },
  sizes: {
    youtube: 'یوتیوب',
    shorts: 'شورتس · ریلز · تیک‌تاک',
    instagram: 'اینستاگرام مربع',
    portrait: 'اینستاگرام عمودی',
    facebook: 'فیسبوک · لینکدین',
    x: 'ایکس (توییتر)',
    podcast: 'جلد پادکست'
  },
  settings: {
    title: 'تنظیمات',
    close: 'بستن',
    themes: 'پوسته‌ها',
    customColour: 'رنگ دلخواه',
    yourOwnColour: 'رنگ خودتان',
    customHint: 'روی یک رنگ کلیک کنید یا هر رنگی را که می‌خواهید انتخاب کنید. دکمه‌ها، نشانه‌ها و قاب بوم از آن استفاده می‌کنند.',
    anyColour: 'هر رنگی…',
    darkCustom: 'پس‌زمینهٔ تاریک برای رنگ دلخواه من',
    motion: 'حرکت',
    reduceMotion: 'کاهش حرکت',
    reduceMotionHint: 'انیمیشن‌ها را خاموش می‌کند - برای کمپیوترهای کند یا اگر حرکت حواس را پرت می‌کند.',
    languageSection: 'زبان',
    languageHint: 'زبان برنامه را انتخاب کنید. زبان‌های راست به چپ کل صفحه را برعکس می‌کنند.'
  },
  theme: {
    deckDark: 'تاریک',
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
    intro: 'ابزارهای رایگان هوش مصنوعی که روی کمپیوتر خودتان کار می‌کنند. عکس‌های شما از آن بیرون نمی‌رود.',
    free: 'رایگان · روی کمپیوتر شما',
    bgRemove: 'حذف پس‌زمینه',
    bgRemoveHint: 'یک شخص یا چیزی را از عکس جدا کنید.',
    faces: 'چیدمان با تشخیص چهره',
    facesHint: 'چهره‌ها را پیدا می‌کند و متن را در همه اندازه‌ها از آن‌ها دور نگه می‌دارد.',
    palette: 'رنگ‌های هوشمند',
    paletteHint: 'رنگ‌هایی برای متن پیشنهاد می‌کند که روی عکس شما خوب دیده شوند.',
    depth: 'برجسته‌سازی عمق',
    depthHint: 'پس‌زمینه را تار می‌کند یا سوژه را برجسته می‌سازد.',
    upscale: 'افزایش کیفیت',
    upscaleHint: 'عکس‌های کوچک یا تار را واضح می‌کند.',
    readability: 'بررسی خوانایی',
    readabilityHint: 'بررسی می‌کند که متن در اندازهٔ موبایل هم خوانا باشد.'
  },
  export: { done: '{{name}} ذخیره شد', failed: 'خروجی گرفتن ناکام شد. لطفاً دوباره کوشش کنید.' },
  history: { undone: 'واگرد شد', redone: 'ازنو انجام شد' }
};

export default faAF;
