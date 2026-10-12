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
  HERO_VIDEO: "assets/video/hero.mp4",          // горизонтальная нарезка, напр. "assets/video/hero.mp4" (1920×1080, до ~10 МБ)
  HERO_VIDEO_MOBILE: "assets/video/hero-mobile.mp4",   // вертикальная для телефонов, напр. "assets/video/hero-mobile.mp4" (1080×1920, до ~5 МБ)
  HERO_POSTER: "assets/img/hero.jpg",         // стоп-кадр, пока видео грузится, напр. "assets/img/hero.jpg"
  HERO_POSTER_MOBILE: "assets/img/hero-mobile.jpg",  // вертикальный стоп-кадр (необязательно)
  HERO_IMAGE: "",          // устаревшее: используется как стоп-кадр, если HERO_POSTER пуст
  SHOWREEL_VIDEO: "",      // напр. "assets/video/showreel.mp4" — фон финального экрана и плеер «Смотреть шоурил»

  SOCIALS: [
    { name: "Telegram", url: "https://t.me/alexey_arkh" },
    { name: "Instagram", url: "#" },
    { name: "YouTube", url: "#" },
    { name: "VK", url: "#" },
  ],

  // Работы. category: ads | reels | motion | brand
  // ratio: "vertical" (9:16, рилсы) или "wide" (16:9)
  WORKS: [
    { title: "Запуск нового вкуса", client: "Напиток", category: "ads",    ratio: "wide",     poster: "", video: "", task: "Кампания для запуска линейки в федеральной сети.", result: "2,4 млн просмотров за неделю" },
    { title: "Вертикальная серия для бренда одежды", client: "Fashion", category: "reels",  ratio: "vertical", poster: "", video: "", task: "12 вертикальных видео под сезонную коллекцию.", result: "+38% к охвату аккаунта" },
    { title: "Моушн-айдентика", client: "Tech-стартап", category: "motion", ratio: "wide",     poster: "", video: "", task: "Анимированный логотип и графика для презентации.", result: "Пакет из 20 анимаций" },
    { title: "Имиджевый фильм", client: "Автодилер", category: "brand",  ratio: "wide",     poster: "", video: "", task: "Фильм о бренде для сайта и выставки.", result: "Главное видео на 3 площадках" },
    { title: "Вертикальный контент для ресторана", client: "HoReCa", category: "reels",  ratio: "vertical", poster: "", video: "", task: "Аппетитный контент на месяц за 1 съёмочный день.", result: "Бронирования +22%" },
    { title: "Реклама для маркетплейса", client: "E-com", category: "ads",    ratio: "vertical", poster: "", video: "", task: "Видео-обложки карточек товаров.", result: "CTR карточек ×1,7" },
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
