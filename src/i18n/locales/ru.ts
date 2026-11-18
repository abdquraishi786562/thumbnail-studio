import type { Messages } from './en';

// Russian. Machine-quality translation: please have a native speaker review.
const ru: Messages = {
  app: { name: 'Thumbnail Studio', untitled: 'Обложка без названия' },
  top: { undo: 'Отменить', redo: 'Повторить', export: 'Экспорт', settings: 'Настройки', language: 'Язык' },
  rail: { templates: 'Шаблоны', text: 'Текст', images: 'Изображения', shapes: 'Фигуры', ai: 'ИИ-инструменты', brand: 'Брендбук' },
  panel: { comingSoon: 'Появится на следующем этапе', comingSoonHint: 'Эта часть запланирована и появится на следующих этапах разработки.' },
  text: {
    addHeading: 'Добавить заголовок',
    addSubheading: 'Добавить подзаголовок',
    addBody: 'Добавить текст',
    sampleHeading: 'ВАШ БОЛЬШОЙ ЗАГОЛОВОК',
    sampleSub: 'Короткий яркий подзаголовок',
    sampleBody: 'Подробности здесь',
    rtlHint: 'Пишите на любом языке. Каждый текстовый блок сам определяет направление.'
  },
  images: { upload: 'Загрузить изображение', dropHint: 'Или перетащите изображение в любое место холста.' },
  shapes: { rect: 'Прямоугольник', circle: 'Круг', badge: 'Значок' },
  inspector: {
    title: 'Свойства',
    empty: 'Выберите элемент на холсте, чтобы изменить его.',
    font: 'Шрифт',
    size: 'Размер',
    fill: 'Цвет',
    stroke: 'Обводка',
    shadow: 'Тень',
    direction: 'Направление текста',
    auto: 'Авто',
    ltr: 'Слева направо',
    rtl: 'Справа налево',
    delete: 'Удалить',
    background: 'Фон',
    noPashto: 'В этом шрифте нет букв пушту.'
  },
  sizes: {
    youtube: 'YouTube',
    shorts: 'Shorts · Reels · TikTok',
    instagram: 'Instagram квадрат',
    portrait: 'Instagram вертикаль',
    facebook: 'Facebook · LinkedIn',
    x: 'X (Twitter)',
    podcast: 'Обложка подкаста'
  },
  settings: {
    title: 'Настройки',
    close: 'Закрыть',
    themes: 'Темы',
    customColour: 'Свой цвет',
    yourOwnColour: 'Ваш собственный цвет',
    customHint: 'Нажмите на цвет или выберите любой другой. Кнопки, выделения и рамка холста будут использовать его.',
    anyColour: 'Любой цвет…',
    darkCustom: 'Тёмный фон для моего цвета',
    motion: 'Анимация',
    reduceMotion: 'Уменьшить анимацию',
    reduceMotionHint: 'Отключает анимации - полезно на медленных ПК или если движение отвлекает.',
    languageSection: 'Язык',
    languageHint: 'Выберите язык приложения. Языки с письмом справа налево зеркалируют весь интерфейс.'
  },
  theme: {
    deckDark: 'Тёмная',
    cleanLight: 'Светлая',
    ivoryWhite: 'Слоновая кость',
    eyeShield: 'Защита глаз',
    midnightBlue: 'Полночный синий',
    forest: 'Лес',
    sunset: 'Закат',
    ocean: 'Океан',
    custom: 'Своя'
  },
  ai: {
    intro: 'Бесплатные ИИ-инструменты, работающие на вашем компьютере. Фото никуда не отправляются.',
    free: 'Бесплатно · на вашем компьютере',
    bgRemove: 'Удалить фон',
    bgRemoveHint: 'Вырезать человека или предмет из фото.',
    faces: 'Макет с учётом лиц',
    facesHint: 'Находит лица и отодвигает от них текст в каждом формате.',
    palette: 'Умные цвета',
    paletteHint: 'Подбирает цвета текста, заметные на вашем фото.',
    depth: 'Эффект глубины',
    depthHint: 'Размывает фон или выделяет объект.',
    upscale: 'Увеличить качество',
    upscaleHint: 'Делает чётче маленькие или размытые изображения.',
    readability: 'Проверка читаемости',
    readabilityHint: 'Проверяет, читается ли текст на экране телефона.'
  },
  export: { done: '{{name}} сохранён', failed: 'Не удалось экспортировать. Попробуйте ещё раз.' },
  history: { undone: 'Отменено', redone: 'Повторено' }
};

export default ru;
