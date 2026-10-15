/* ==========================================================
   ЕДИНОЕ МЕСТО НАСТРОЕК САЙТА
   Меняйте здесь — всё на сайте подтянется автоматически.
   ========================================================== */
window.SITE = {
  BRAND_NAME: "arkh",                       // гигантский wordmark, title, футер
  TELEGRAM_URL: "https://t.me/alexey_arkh",    // все кнопки «Написать» ведут сюда
  CITY: "Москва — Тверь — Санкт-Петербург",
  YEAR: 2026,

  // Видео-подложки. Пока пусто — показываются огненные градиенты.
  // Первый экран: нарезка бэкстейджа. Фон — она же, приглушённая ч/б, справа — окно-кадр в цвете.
  HERO_VIDEO: "assets/video/hero.mp4",          // горизонтальная нарезка — и для ПК, и для телефона (сжимать: MAXW=1280 tools/compress-video.sh …)
  HERO_VIDEO_MOBILE: "assets/video/hero-mobile.mp4", // облегчённая версия для телефонов (854 px, ~2 МБ)
  HERO_POSTER: "assets/img/hero.jpg",         // стоп-кадр, пока видео грузится, напр. "assets/img/hero.jpg"
  HERO_IMAGE: "",          // устаревшее: используется как стоп-кадр, если HERO_POSTER пуст
  SHOWREEL_VIDEO: "assets/video/showreel.mp4",      // плеер по кнопке «Шоурил» и по клику на окно-кадр

  SOCIALS: [
    { name: "Telegram", url: "https://t.me/alexey_arkh" },
  ],

  // Работы. category: ads | reels | motion | brand
  // ratio: "vertical" (9:16, рилсы) или "wide" (16:9)
  WORKS: [
    // Порядок на сайте = порядок здесь: горизонтальные и вертикальные чередуются, первой всегда идёт горизонтальная.
    { title: "PRO Опыты", client: "Детские наборы · Ozon", category: "ads", ratio: "wide", poster: "assets/img/works/pro-opyty.jpg?v=2", video: "assets/video/works/pro-opyty.mp4", task: "Реклама наборов опытов для маркетплейса со сказочным 3D-миром.", result: "" },
    { title: "Анонс мероприятия", client: "Анатолий Сульянов", category: "reels", ratio: "vertical", poster: "assets/img/works/sulyanov.jpg?v=2", video: "assets/video/works/sulyanov.mp4", task: "Вертикальный анонс события с героем-спикером.", result: "" },
    { title: "Serebryakov", client: "Фабрика мебели", category: "brand", ratio: "wide", poster: "assets/img/works/mr-shkaff.jpg?v=2", video: "assets/video/works/mr-shkaff.mp4", task: "Имиджевый фильм с основателем на производстве и 3D-визуализацией продукта.", result: "" },
    { title: "Рекламный ролик для VK Бизнес", client: "VK Бизнес", category: "reels", ratio: "vertical", poster: "assets/img/works/vk-biznes.jpg?v=2", video: "assets/video/works/vk-biznes.mp4", task: "Вертикальный ролик о сервисе онлайн-записи для малого бизнеса.", result: "" },
    { title: "Каркасные дома", client: "Строительная компания", category: "brand", ratio: "wide", poster: "assets/img/works/doma.jpg?v=2", video: "assets/video/works/doma.mp4", task: "Фильм о строительстве дома — от разметки до аэросъёмки готового объекта.", result: "" },
    { title: "Мебель на заказ", client: "Loft Point", category: "reels", ratio: "vertical", poster: "assets/img/works/loft-point.jpg?v=2", video: "assets/video/works/loft-point.mp4", task: "Вертикальная реклама мебели на заказ с субтитрами под соцсети.", result: "" },
    { title: "Avest Ozonator", client: "Товар для дома", category: "ads", ratio: "wide", poster: "assets/img/works/ozonator.jpg?v=2", video: "assets/video/works/ozonator.mp4", task: "Рекламный ролик товара с моушн-плашками о свойствах продукта.", result: "" },
    { title: "Простор", client: "VK", category: "reels", ratio: "vertical", poster: "assets/img/works/vk-prostor.jpg?v=2", video: "assets/video/works/vk-prostor.mp4", task: "Промо-ролик сообщества «Простор» во ВКонтакте.", result: "" },
    { title: "OldBoy Барбершоп", client: "Барбершоп OldBoy", category: "brand", ratio: "wide", poster: "assets/img/works/oldboy.jpg?v=2", video: "assets/video/works/oldboy.mp4", task: "Фильм об атмосфере барбершопа и его команде.", result: "" },
    { title: "Зимнее промо", client: "T2", category: "reels", ratio: "vertical", poster: "assets/img/works/t2.jpg?v=2", video: "assets/video/works/t2.mp4", task: "Вертикальный промо-ролик с 3D-графикой: гигантский стакан посреди зимнего города.", result: "" },
    { title: "Domino's Pizza", client: "Domino's Pizza", category: "ads", ratio: "wide", poster: "assets/img/works/dominos.jpg?v=2", video: "assets/video/works/dominos.mp4", task: "Динамичный ролик в уличном стиле: баскетбол, дрифт, граффити и заказ в одно касание.", result: "" },
    { title: "Оранж Мебель", client: "Мебельная компания", category: "ads", ratio: "wide", poster: "assets/img/works/orange-mebel.jpg?v=2", video: "assets/video/works/orange-mebel.mp4", task: "Рекламный ролик с основателем: производство и подход к клиентам.", result: "" },
  ],

  // Логотипы клиентов («Нам доверяют»). Лучше SVG или PNG на прозрачном фоне —
  // на сайте они показываются белыми, а при наведении — в родных цветах на светлой плашке.
  // Пример: { name: "Бренд", logo: "assets/img/clients/brand.svg" }
  CLIENTS: [
    { name: "Domino's Pizza", logo: "assets/img/clients/dominos.png" },
    { name: "T2", logo: "assets/img/clients/t2.png" },
    { name: "VK Бизнес", logo: "assets/img/clients/vk-biznes.png" },
    { name: "Фабрика мебели Serebryakov", logo: "assets/img/clients/serebryakov.png" },
    { name: "Letique Cosmetics", logo: "assets/img/clients/letique.png" },
    { name: "Avest", logo: "assets/img/clients/avest.png" },
    { name: "OldBoy Barbershop", logo: "assets/img/clients/oldboy.png" },
    { name: "Оранж Мебель", logo: "assets/img/clients/orange-mebel.png" },
    { name: "Мистер Ант", logo: "assets/img/clients/mister-ant.png" },
  ],

  // Фото или видео для плиток «О студии» (Стратегия, Продакшн, Скорость, Команда).
  // Пусто — остаётся текущий фон. Пример: "assets/img/about-1.jpg" или "assets/video/about-2.mp4"
  ABOUT_MEDIA: ["assets/video/about/1.mp4", "assets/video/about/2.mp4", "assets/video/about/3.mp4", "assets/video/about/4.mp4"],

  // Фото со съёмок (бэкстейдж). wide: true — горизонтальное фото.
  BACKSTAGE: [
    { src: "assets/img/backstage/01.jpg", caption: "Режиссёрский монитор" },
    { src: "assets/img/backstage/02.jpg", caption: "Выставляем свет", wide: true },
    { src: "assets/img/backstage/03.jpg", caption: "Работа с актёрами" },
    { src: "assets/img/backstage/04.jpg", caption: "Съёмка PRO Опыты", wide: true },
    { src: "assets/img/backstage/05.jpg", caption: "Режиссёр на площадке" },
    { src: "assets/img/backstage/06.jpg", caption: "Камера и оптика", wide: true },
    { src: "assets/img/backstage/07.jpg", caption: "Съёмка на гимбал" },
    { src: "assets/img/backstage/08.jpg", caption: "Дым и контровой свет", wide: true },
    { src: "assets/img/backstage/09.jpg", caption: "Сверяем раскадровку" },
    { src: "assets/img/backstage/10.jpg", caption: "Интервью с героем" },
    { src: "assets/img/backstage/11.jpg", caption: "Свет на производстве" },
    { src: "assets/img/backstage/12.jpg", caption: "Тележка и проводка камеры" },
    { src: "assets/img/backstage/13.jpg", caption: "Через объектив" },
  ],
};
