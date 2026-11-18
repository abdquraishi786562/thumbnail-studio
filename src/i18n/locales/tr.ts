import type { Messages } from './en';

// Turkish. Machine-quality translation: please have a native speaker review.
const tr: Messages = {
  app: { name: 'Thumbnail Studio', untitled: 'Adsız küçük resim' },
  top: { undo: 'Geri al', redo: 'Yinele', export: 'Dışa aktar', settings: 'Ayarlar', language: 'Dil' },
  rail: { templates: 'Şablonlar', text: 'Metin', images: 'Görseller', shapes: 'Şekiller', ai: 'Yapay zekâ araçları', brand: 'Marka kiti' },
  panel: { comingSoon: 'Sonraki adımda geliyor', comingSoonHint: 'Bu bölüm planlandı ve sonraki geliştirme adımlarında eklenecek.' },
  text: {
    addHeading: 'Başlık ekle',
    addSubheading: 'Alt başlık ekle',
    addBody: 'Metin ekle',
    sampleHeading: 'BÜYÜK BAŞLIĞINIZ',
    sampleSub: 'Kısa ve etkileyici alt başlık',
    sampleBody: 'Ek ayrıntılar burada',
    rtlHint: 'Herhangi bir dilde yazın. Her metin kutusu yönünü kendisi belirler.'
  },
  images: { upload: 'Görsel yükle', dropHint: 'Ya da görseli tuvalin herhangi bir yerine bırakın.' },
  shapes: { rect: 'Dikdörtgen', circle: 'Daire', badge: 'Rozet' },
  inspector: {
    title: 'Özellikler',
    empty: 'Düzenlemek için tuvalde bir öğe seçin.',
    font: 'Yazı tipi',
    size: 'Boyut',
    fill: 'Renk',
    stroke: 'Kontur',
    shadow: 'Gölge',
    direction: 'Metin yönü',
    auto: 'Otomatik',
    ltr: 'Soldan sağa',
    rtl: 'Sağdan sola',
    delete: 'Sil',
    background: 'Arka plan',
    noPashto: 'Bu yazı tipinde Peştuca harfler yok.'
  },
  sizes: {
    youtube: 'YouTube',
    shorts: 'Shorts · Reels · TikTok',
    instagram: 'Instagram kare',
    portrait: 'Instagram dikey',
    facebook: 'Facebook · LinkedIn',
    x: 'X (Twitter)',
    podcast: 'Podcast kapağı'
  },
  settings: {
    title: 'Ayarlar',
    close: 'Kapat',
    themes: 'Temalar',
    customColour: 'Özel renk',
    yourOwnColour: 'Kendi renginiz',
    customHint: 'Bir renge tıklayın ya da istediğiniz rengi seçin. Düğmeler, vurgular ve tuval çerçevesi bu rengi kullanır.',
    anyColour: 'Herhangi bir renk…',
    darkCustom: 'Özel rengim için koyu arka plan',
    motion: 'Hareket',
    reduceMotion: 'Hareketi azalt',
    reduceMotionHint: 'Animasyonları kapatır - yavaş bilgisayarlarda veya hareket dikkat dağıtıyorsa faydalıdır.',
    languageSection: 'Dil',
    languageHint: 'Uygulamanın dilini seçin. Sağdan sola diller tüm düzeni çevirir.'
  },
  theme: {
    deckDark: 'Koyu',
    cleanLight: 'Açık',
    ivoryWhite: 'Fildişi Beyaz',
    eyeShield: 'Göz Koruma',
    midnightBlue: 'Gece Mavisi',
    forest: 'Orman',
    sunset: 'Gün Batımı',
    ocean: 'Okyanus',
    custom: 'Özel'
  },
  ai: {
    intro: 'Kendi bilgisayarınızda çalışan ücretsiz yapay zekâ araçları. Fotoğraflarınız dışarı çıkmaz.',
    free: 'Ücretsiz · bilgisayarınızda',
    bgRemove: 'Arka planı kaldır',
    bgRemoveHint: 'Bir kişiyi veya nesneyi fotoğraftan ayırın.',
    faces: 'Yüze duyarlı düzen',
    facesHint: 'Yüzleri bulur ve her boyutta metni onlardan uzak tutar.',
    palette: 'Akıllı renkler',
    paletteHint: 'Fotoğrafınızda öne çıkan metin renkleri seçer.',
    depth: 'Derinlik efekti',
    depthHint: 'Arka planı bulanıklaştırır veya konuyu öne çıkarır.',
    upscale: 'Çözünürlük artır',
    upscaleHint: 'Küçük veya bulanık görselleri netleştirir.',
    readability: 'Okunabilirlik kontrolü',
    readabilityHint: 'Metnin telefon boyutunda da okunabilir olduğunu kontrol eder.'
  },
  export: { done: '{{name}} kaydedildi', failed: 'Dışa aktarma başarısız. Lütfen tekrar deneyin.' },
  history: { undone: 'Geri alındı', redone: 'Yinelendi' }
};

export default tr;
