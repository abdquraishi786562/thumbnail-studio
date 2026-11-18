import type { Messages4 } from './en';

// Russian. Machine-quality translation: please have a native speaker review.
const m: Messages4 = {
  projects: {
    title: "Проекты",
    open: "Проекты",
    new: "Новый проект",
    import: "Импорт резервной копии",
    autoNote: "Всё сохраняется автоматически на этом устройстве. Скачайте резервную копию, чтобы хранить её в другом месте.",
    empty: "Сохранённых проектов пока нет. Работа сохраняется автоматически, как только вы что-то измените.",
    current: "Открыт",
    edited: "Изменён {{when}}",
    saving: "Сохранение…",
    saved: "Сохранено",
    saveFailed: "Не удалось сохранить",
    duplicate: "Дублировать",
    copySuffix: "(копия)",
    backup: "Скачать резервную копию",
    delete: "Удалить",
    confirmDelete: "Удалить этот проект?",
    yes: "Удалить",
    no: "Оставить",
    opened: "Открыт проект «{{name}}»",
    imported: "Импортирован проект «{{name}}»",
    importFailed: "Не удалось открыть файл. Выберите резервную копию .thumbproj.",
    storage: "Занято на устройстве: {{used}}"
  },
  templates: {
    hint: "Начните с готового дизайна. Он подстроится под текущий размер, и всё можно изменить.",
    all: "Все",
    applied: "Шаблон применён. Нажмите на любой элемент, чтобы изменить его."
  }
};

export default m;
