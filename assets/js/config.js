/* ==========================================================
   ЕДИНОЕ МЕСТО НАСТРОЕК САЙТА
   Меняйте здесь — всё на сайте подтянется автоматически.
   ========================================================== */
window.SITE = {
  BRAND_NAME: "arkh",                       // гигантский wordmark, title, футер
  TELEGRAM_URL: "https://t.me/alexey_arkh",    // все кнопки «Написать» ведут сюда
  CITY: "Москва — снимаем по всему миру",
  YEAR: 2026,

  // Видео-подложки. Пока пусто — показываются огненные градиенты.
  // Первый экран: нарезка бэкстейджа. Фон — она же, приглушённая ч/б, справа — окно-кадр в цвете.
  HERO_VIDEO: "assets/video/hero.mp4",          // горизонтальная нарезка — и для ПК, и для телефона (сжимать: MAXW=1280 tools/compress-video.sh …)
  HERO_POSTER: "assets/img/hero.jpg",         // стоп-кадр, пока видео грузится, напр. "assets/img/hero.jpg"
  HERO_IMAGE: "",          // устаревшее: используется как стоп-кадр, если HERO_POSTER пуст
  SHOWREEL_VIDEO: "assets/video/showreel.mp4",      // напр. "assets/video/showreel.mp4" — фон финального экрана и плеер «Смотреть шоурил»

  SOCIALS: [
    { name: "Telegram", url: "https://t.me/alexey_arkh" },
    { name: "Instagram", url: "#" },
    { name: "YouTube", url: "#" },
    { name: "VK", url: "#" },
  ],

  // Работы. category: ads | reels | motion | brand
  // ratio: "vertical" (9:16, рилсы) или "wide" (16:9)
  WORKS: [
    // Порядок на сайте = порядок здесь: горизонтальные и вертикальные чередуются, первой всегда идёт горизонтальная.
    { title: "PRO Опыты", client: "Детские наборы · Ozon", category: "ads", ratio: "wide", poster: "assets/img/works/pro-opyty.jpg", video: "assets/video/works/pro-opyty.mp4", task: "Реклама наборов для опытов для маркетплейса — со сказочным 3D-миром.", result: "" },
    { title: "Анонс мероприятия", client: "Анатолий Сульянов", category: "reels", ratio: "vertical", poster: "assets/img/works/sulyanov.jpg", video: "assets/video/works/sulyanov.mp4", task: "Вертикальный анонс события с героем-спикером.", result: "" },
    { title: "Мистер Шкафф", client: "Мебельная компания", category: "brand", ratio: "wide", poster: "assets/img/works/mr-shkaff.jpg", video: "assets/video/works/mr-shkaff.mp4", task: "Имиджевый фильм: основатель, производство и 3D-визуализация продукта.", result: "" },
    { title: "Запиши на пятницу", client: "VK Бизнес", category: "reels", ratio: "vertical", poster: "assets/img/works/vk-biznes.jpg", video: "assets/video/works/vk-biznes.mp4", task: "Вертикальный ролик о сервисе онлайн-записи для малого бизнеса.", result: "" },
    { title: "Каркасные дома", client: "Строительная компания", category: "brand", ratio: "wide", poster: "assets/img/works/doma.jpg", video: "assets/video/works/doma.mp4", task: "Фильм о строительстве дома — от разметки до аэросъёмки готового объекта.", result: "" },
    { title: "Мебель на заказ", client: "Loft Point", category: "reels", ratio: "vertical", poster: "assets/img/works/loft-point.jpg", video: "assets/video/works/loft-point.mp4", task: "Вертикальная реклама мебели на заказ с субтитрами под соцсети.", result: "" },
    { title: "Оранж Мебель", client: "Мебельная компания", category: "ads", ratio: "wide", poster: "assets/img/works/orange-mebel.jpg", video: "assets/video/works/orange-mebel.mp4", task: "Рекламный ролик с основателем: производство и подход к клиентам.", result: "" },
    { title: "Простор", client: "VK", category: "reels", ratio: "vertical", poster: "assets/img/works/vk-prostor.jpg", video: "assets/video/works/vk-prostor.mp4", task: "Промо-ролик сообщества «Простор» во ВКонтакте.", result: "" },
    { title: "OldBoy Family", client: "Барбершоп OldBoy", category: "brand", ratio: "wide", poster: "assets/img/works/oldboy.jpg", video: "assets/video/works/oldboy.mp4", task: "Фильм об атмосфере барбершопа и его команде.", result: "" },
    { title: "Зимнее промо", client: "T2", category: "reels", ratio: "vertical", poster: "assets/img/works/t2.jpg", video: "assets/video/works/t2.mp4", task: "Вертикальный промо-ролик с 3D-графикой: гигантский стакан посреди зимнего города.", result: "" },
    { title: "Касание", client: "Domino's Pizza", category: "ads", ratio: "wide", poster: "assets/img/works/dominos.jpg", video: "assets/video/works/dominos.mp4", task: "Динамичный ролик в стиле улицы: баскетбол, дрифт, граффити — заказ в одно касание.", result: "" },
    { title: "Озонатор", client: "Товар для дома", category: "ads", ratio: "wide", poster: "assets/img/works/ozonator.jpg", video: "assets/video/works/ozonator.mp4", task: "Рекламный ролик товара с моушн-плашками о свойствах.", result: "" },
  ],

  // Логотипы клиентов («Нам доверяют»). Лучше SVG или PNG на прозрачном фоне —
  // на сайте они показываются белыми, а при наведении в родных цветах.
  // Пример: { name: "Бренд", logo: "assets/img/clients/brand.svg" }
  CLIENTS: [],

  // Фото или видео для плиток «О студии» (Стратегия, Продакшн, Скорость, Команда).
  // Пусто — остаётся текущий фон. Пример: "assets/img/about-1.jpg" или "assets/video/about-2.mp4"
  ABOUT_MEDIA: ["", "", "", ""],

  // Фото со съёмок (бэкстейдж). Добавляйте пути к файлам.
  BACKSTAGE: [
    { src: "", caption: "Свет и камера на площадке" },
    { src: "", caption: "Работа с актёрами" },
    { src: "", caption: "Съёмка продукта" },
    { src: "", caption: "Режиссёрский монитор" },
    { src: "", caption: "Цветокоррекция" },
  ],
};
