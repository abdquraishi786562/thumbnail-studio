import type { Messages } from './en';

// Urdu. Machine-quality translation: please have a native speaker review.
const ur: Messages = {
  app: { name: 'تھمب نیل اسٹوڈیو', untitled: 'بے نام تھمب نیل' },
  top: { undo: 'واپس', redo: 'دوبارہ', export: 'برآمد', settings: 'ترتیبات', language: 'زبان' },
  rail: { templates: 'سانچے', text: 'متن', images: 'تصاویر', shapes: 'اشکال', ai: 'اے آئی ٹولز', brand: 'برانڈ کٹ' },
  panel: { comingSoon: 'اگلے مرحلے میں آئے گا', comingSoonHint: 'یہ حصہ منصوبے میں شامل ہے اور اگلے مراحل میں شامل کیا جائے گا۔' },
  text: {
    addHeading: 'سرخی شامل کریں',
    addSubheading: 'ذیلی سرخی شامل کریں',
    addBody: 'متن شامل کریں',
    sampleHeading: 'آپ کی بڑی سرخی',
    sampleSub: 'مختصر اور دلچسپ ذیلی سرخی',
    sampleBody: 'مزید تفصیل یہاں',
    rtlHint: 'اردو، دری، پشتو یا کسی بھی زبان میں لکھیں۔ ہر ٹیکسٹ باکس اپنی سمت خود پہچانتا ہے۔'
  },
  images: { upload: 'تصویر اپ لوڈ کریں', dropHint: 'یا تصویر کینوس پر کہیں بھی چھوڑ دیں۔' },
  shapes: { rect: 'مستطیل', circle: 'دائرہ', badge: 'بیج' },
  inspector: {
    title: 'خصوصیات',
    empty: 'ترمیم کے لیے کینوس پر کوئی چیز منتخب کریں۔',
    font: 'فونٹ',
    size: 'سائز',
    fill: 'رنگ',
    stroke: 'خاکہ',
    shadow: 'سایہ',
    direction: 'متن کی سمت',
    auto: 'خودکار',
    ltr: 'بائیں سے دائیں',
    rtl: 'دائیں سے بائیں',
    delete: 'حذف کریں',
    background: 'پس منظر',
    noPashto: 'اس فونٹ میں پشتو حروف نہیں ہیں۔'
  },
  sizes: {
    youtube: 'یوٹیوب',
    shorts: 'شارٹس · ریلز · ٹک ٹاک',
    instagram: 'انسٹاگرام مربع',
    portrait: 'انسٹاگرام عمودی',
    facebook: 'فیس بک · لنکڈ اِن',
    x: 'ایکس (ٹوئٹر)',
    podcast: 'پوڈکاسٹ کور'
  },
  settings: {
    title: 'ترتیبات',
    close: 'بند کریں',
    themes: 'تھیمز',
    customColour: 'اپنی پسند کا رنگ',
    yourOwnColour: 'آپ کا اپنا رنگ',
    customHint: 'کسی رنگ پر کلک کریں یا اپنی پسند کا کوئی بھی رنگ چنیں۔ بٹن، نمایاں حصے اور کینوس کا فریم یہی رنگ استعمال کریں گے۔',
    anyColour: 'کوئی بھی رنگ…',
    darkCustom: 'میرے رنگ کے لیے گہرا پس منظر',
    motion: 'حرکت',
    reduceMotion: 'حرکت کم کریں',
    reduceMotionHint: 'اینیمیشن بند کرتا ہے - سست کمپیوٹرز پر یا اگر حرکت توجہ ہٹائے تو مفید ہے۔',
    languageSection: 'زبان',
    languageHint: 'ایپ کی زبان منتخب کریں۔ دائیں سے بائیں زبانیں پورا لے آؤٹ پلٹ دیتی ہیں۔'
  },
  theme: {
    deckDark: 'گہرا',
    cleanLight: 'ہلکا',
    ivoryWhite: 'ہاتھی دانت سفید',
    eyeShield: 'آنکھوں کا تحفظ',
    midnightBlue: 'آدھی رات نیلا',
    forest: 'جنگل',
    sunset: 'غروبِ آفتاب',
    ocean: 'سمندر',
    custom: 'اپنی پسند'
  },
  ai: {
    intro: 'مفت اے آئی ٹولز جو آپ کے اپنے کمپیوٹر پر چلتے ہیں۔ آپ کی تصاویر باہر نہیں جاتیں۔',
    free: 'مفت · آپ کے کمپیوٹر پر',
    bgRemove: 'پس منظر ہٹائیں',
    bgRemoveHint: 'تصویر سے کسی شخص یا چیز کو الگ کریں۔',
    faces: 'چہرہ شناس لے آؤٹ',
    facesHint: 'چہرے تلاش کرتا ہے اور ہر سائز میں متن کو ان سے دور رکھتا ہے۔',
    palette: 'سمارٹ رنگ',
    paletteHint: 'متن کے ایسے رنگ چنتا ہے جو آپ کی تصویر پر نمایاں ہوں۔',
    depth: 'گہرائی ابھاریں',
    depthHint: 'پس منظر دھندلا کرتا ہے یا موضوع کو ابھارتا ہے۔',
    upscale: 'معیار بڑھائیں',
    upscaleHint: 'چھوٹی یا دھندلی تصاویر کو صاف کرتا ہے۔',
    readability: 'پڑھنے کی جانچ',
    readabilityHint: 'جانچتا ہے کہ متن فون کے سائز پر بھی پڑھا جا سکے۔'
  },
  export: { done: '{{name}} محفوظ ہو گیا', failed: 'برآمد ناکام ہو گئی۔ دوبارہ کوشش کریں۔' },
  history: { undone: 'واپس ہو گیا', redone: 'دوبارہ ہو گیا' }
};

export default ur;
