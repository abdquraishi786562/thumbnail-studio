import type { Messages3 } from './en';

// Turkish. Machine-quality translation: please have a native speaker review.
const m: Messages3 = {
  aiGen: {
    open: 'YZ Küçük Resim',
    title: 'YZ Küçük Resim',
    subtitle: 'Videonu anlat, hazır tasarımlar al. Birini seç, sonra istediğini değiştir.',
    ideaLabel: 'Videon ne hakkında?',
    ideaPlaceholder: 'ör. evde İngilizce öğrenmenin 10 kolay yolu',
    emptyIdea: 'Önce videonun ne hakkında olduğunu yaz.',
    style: 'Stil',
    photo: 'Fotoğrafın (isteğe bağlı)',
    photoHint: 'Yüz veya ürün fotoğrafı küçük resmi öne çıkarır.',
    addPhoto: 'Fotoğraf ekle',
    removePhoto: 'Fotoğrafı kaldır',
    aiPicture: 'YZ ile çizilmiş arka plan',
    aiPictureSends: 'Resmi çizmek için fikir metnin {{service}} hizmetine gönderilir.',
    aiPictureOff: 'İsteğe bağlı: çizilmiş arka planlar için Ayarlar’dan bir resim YZ’si bağla.',
    generate: 'Tasarımları oluştur',
    generating: 'Tasarlanıyor…',
    drawing: 'Resim çiziliyor…',
    more: 'Daha fazla fikir',
    newPicture: 'Yeni resim',
    use: 'Bu tasarımı kullan',
    results: 'Bir tasarım seç. Sonra her parçasını değiştirebilirsin.',
    brainOnDevice: 'Chrome’un cihaz içi YZ’si yazdı',
    brainRules: 'Yerleşik tasarım asistanı yazdı',
    enableOnDevice: 'Ücretsiz cihaz içi YZ’yi aç (Chrome)',
    downloading: 'YZ modeli indiriliyor… %{{p}}',
    applied: 'Tasarım yüklendi. Düzenlemek için herhangi bir şeye tıkla.',
    pictureFailed: 'Resim YZ’si yanıt vermedi ({{reason}}). Tasarımlar onsuz yapıldı.',
    heroHint: 'Bir fikir yaz, saniyeler içinde hazır küçük resimler al.',
    replaceNote: 'Bir tasarımı kullanmak tuvali değiştirir. Ctrl+Z ile geri alabilirsin.'
  },
  styles: {
    auto: 'Otomatik',
    bold: 'Cesur',
    minimal: 'Sade',
    gaming: 'Oyun',
    tech: 'Teknoloji',
    education: 'Eğitim',
    news: 'Haber',
    vlog: 'Vlog',
    food: 'Yemek',
    travel: 'Seyahat',
    business: 'İş'
  },
  pictures: {
    title: 'YZ resimleri (isteğe bağlı)',
    hint: 'Küçük resimlere arka plan çizdirmek için bir resim YZ hizmetindeki kendi hesabını bağla. Bu hizmetler genelde resim başına ücret alır. Anahtarın yalnızca bu tarayıcıda saklanır.',
    service: 'Hizmet',
    none: 'Kapalı',
    custom: 'Diğer (OpenAI uyumlu)',
    key: 'API anahtarı',
    model: 'Model',
    baseUrl: 'Hizmet adresi',
    test: 'Test et',
    testing: 'Test ediliyor…',
    ok: 'Bağlandı: bir test resmi yapıldı.',
    failed: 'Başarısız: {{reason}}',
    getKey: 'Anahtar al'
  },
  sizes2: {
    refit: '{{name}} tasarımından yeniden sığdır',
    refitHint: 'Bu boyutu ana tasarımdan yeniden oluştur',
    autoFitted: '{{name}} için otomatik sığdırıldı. İstediğini düzenle.'
  },
  exportAll: {
    all: 'Tüm boyutlar',
    hint: 'İşaretlediğin her boyut tek bir ZIP dosyasında. Henüz açmadığın boyutlar otomatik sığdırılır.',
    count: '{{n}} boyutu dışa aktar'
  }
};

export default m;
