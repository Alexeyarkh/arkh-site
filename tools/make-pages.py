#!/usr/bin/env python3
"""Собирает страницы услуг и страницы проектов.

  reklama.html, vertikalnyj-kontent.html, imidzhevye-filmy.html — услуги (тексты в SERVICES)
  proekt-*.html — по одной на каждую работу (тексты в CASES, остальное из config.js)

Работы, их порядок, категория, видео и обложка берутся из assets/js/config.js (WORKS).
После правки config.js или текстов здесь запустите из корня сайта:
    python3 tools/make-pages.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
V = {"css": 41, "config": 31, "js": 2}  # поднимайте при правках, чтобы браузеры не брали старое
SITE = "https://arkhfilm.ru"
EMAIL = "arkhfilm@gmail.com"
CITIES = ("Тверь", "Москва", "Санкт-Петербург")
PUBLISHED = "2026-10-13"

SERVICES = [
    {
        "file": "reklama.html", "cat": "ads", "name": "Рекламные кампании", "short": "Реклама",
        "title": "Съёмка рекламных роликов в Твери, Москве и Санкт-Петербурге | arkh",
        "desc": "Рекламные ролики под ключ: сценарий, кастинг, съёмка на кинокамеры, монтаж и графика. Реклама для ТВ, digital и маркетплейсов. Работаем в Твери, Москве и Санкт-Петербурге.",
        "h1": "Рекламные кампании",
        "lead": "Снимаем рекламные ролики для ТВ, digital, маркетплейсов и экранов: от идеи и сценария до финальных версий под каждую площадку. Работаем в Твери, Москве и Санкт-Петербурге.",
        "steps": [("Идея и сценарий", "Разбираем продукт и аудиторию, придумываем ход, который запомнят."),
                  ("Кастинг и локации", "Подбираем актёров, площадки, реквизит и команду под задачу."),
                  ("Съёмка", "Кинокамеры, свет, оптика и продюсер на площадке."),
                  ("Пост-продакшн", "Монтаж, цвет, звук, графика и 3D."),
                  ("Версии под площадки", "Форматы 16:9, 9:16 и 1:1, хронометражи для ТВ, digital и маркетплейсов.")],
    },
    {
        "file": "vertikalnyj-kontent.html", "cat": "reels", "name": "Вертикальный контент", "short": "Вертикальный контент",
        "title": "Вертикальные ролики для Reels, Shorts и VK Клипов — Тверь, Москва, СПб | arkh",
        "desc": "Вертикальный видеоконтент для брендов: Reels, Shorts, VK Клипы и TikTok. Хук в первые секунды, динамичный монтаж, графика. Работаем в Твери, Москве и Санкт-Петербурге.",
        "h1": "Вертикальный контент",
        "lead": "Снимаем вертикальные ролики для Reels, Shorts, VK Клипов и TikTok: хук в первые секунды, динамичный монтаж и графика под алгоритмы платформ. Отдельные ролики и серии для регулярного постинга — в Твери, Москве и Санкт-Петербурге.",
        "steps": [("Идея и хук", "Придумываем, чем зацепить зрителя в первые секунды."),
                  ("Сценарии серии", "Пишем ролики так, чтобы их хватило на регулярный постинг."),
                  ("Съёмка", "Снимаем сразу под вертикальный кадр, со светом и звуком."),
                  ("Монтаж и графика", "Динамичный монтаж, субтитры, моушн и 3D."),
                  ("Под каждую площадку", "Версии для Reels, Shorts, VK Клипов и TikTok.")],
    },
    {
        "file": "imidzhevye-filmy.html", "cat": "brand", "name": "Имиджевые фильмы", "short": "Имиджевый фильм",
        "title": "Имиджевый фильм о компании — съёмка в Твери, Москве и Санкт-Петербурге | arkh",
        "desc": "Имиджевые фильмы о бренде, команде и производстве: для сайта, презентаций, выставок и найма. Сценарий, интервью, съёмка, монтаж. Работаем в Твери, Москве и Санкт-Петербурге.",
        "h1": "Имиджевые фильмы",
        "lead": "Снимаем фильмы о бренде, команде и производстве — для сайта, презентаций, выставок и найма. Показываем людей и процессы так, чтобы компании доверяли. Снимаем в Твери, Москве и Санкт-Петербурге.",
        "steps": [("Погружение", "Знакомимся с компанией, людьми и тем, чем вы гордитесь."),
                  ("Сценарий и интервью", "Собираем историю и готовим героев к съёмке."),
                  ("Съёмка", "Производство, офис, интервью и детали продукта."),
                  ("Монтаж и графика", "Цвет, звук, титры и 3D-визуализация продукта."),
                  ("Версии", "Полный фильм и короткие нарезки для соцсетей и презентаций.")],
    },
]

# Тексты страниц проектов: ключ — имя файла видео без .mp4
CASES = {
    "pro-opyty": ("Реклама наборов для опытов PRO Опыты",
        "Рекламный ролик детских наборов для опытов для продаж на маркетплейсе. Юные учёные открывают набор — и комната превращается в сказочный 3D-мир с огнедышащим драконом.",
        ["Сценарий и раскадровка", "Съёмка с детьми в интерьере", "3D-персонаж и спецэффекты", "Монтаж, цвет и звук", "Версии для карточки товара"]),
    "sulyanov": ("Вертикальный анонс мероприятия с Анатолием Сульяновым",
        "Динамичный вертикальный ролик-анонс бойцовского события: герой-спикер в октагоне, кинетическая типографика и монтаж в ритм музыки.",
        ["Сценарий и подача героя", "Съёмка в зале", "Кинетическая типографика", "Монтаж под ритм", "Версия 9:16 для соцсетей"]),
    "mr-shkaff": ("Имиджевый фильм для фабрики мебели Serebryakov",
        "Фильм о мебельной фабрике: ведущая с цифровым интерфейсом, производство и продукт, который оживает в 3D-визуализации.",
        ["Сценарий и интервью", "Съёмка на производстве", "Съёмка ведущей с графикой интерфейса", "3D-визуализация мебели", "Монтаж, цвет и звук"]),
    "vk-biznes": ("Рекламный ролик для VK Бизнес",
        "Вертикальный ролик о том, как малый бизнес принимает онлайн-записи через ВКонтакте: клипы, сообщения сообщества и кнопка «Записаться» на экранах смартфонов.",
        ["Сценарий", "Съёмка", "Моушн-графика с интерфейсами", "Монтаж", "Версия 9:16"]),
    "doma": ("Фильм о строительстве каркасного дома",
        "Ролик для строительной компании: путь дома от разметки и каркаса до готового объекта с аэросъёмкой.",
        ["Съёмка этапов стройки", "Аэросъёмка", "Монтаж и цветокоррекция", "Звук и музыка"]),
    "loft-point": ("Вертикальная реклама мебели на заказ для Loft Point",
        "Ролик для соцсетей о мебели на заказ: тёплые семейные сцены в интерьере, производство и субтитры, чтобы ролик смотрели даже без звука.",
        ["Сценарий", "Съёмка с актёрами в интерьере", "Съёмка производства", "Субтитры и монтаж", "Версия 9:16"]),
    "ozonator": ("Рекламный ролик озонатора Avest",
        "Продающий ролик бытового товара: героиня показывает продукт, а моушн-плашки объясняют его свойства.",
        ["Сценарий", "Съёмка с актрисой", "Предметная съёмка", "Моушн-плашки", "Монтаж и звук"]),
    "vk-prostor": ("Промо-ролик сообщества «Простор» ВКонтакте",
        "Яркий вертикальный промо-ролик креативной платформы «Простор»: неоновая графика поверх предметной съёмки и экран сообщества ВКонтакте.",
        ["Идея", "Предметная съёмка", "Неоновая графика и анимация", "Монтаж", "Версия 9:16"]),
    "oldboy": ("Рекламный ролик барбершопа OldBoy",
        "Атмосферный ролик о барбершопе OldBoy: стиль, мастера и клиенты, снятые как кино.",
        ["Сценарий", "Съёмка в барбершопе", "Цвет в фирменном стиле", "Монтаж и звук"]),
    "t2": ("Зимний промо-ролик T2 с 3D-графикой",
        "Вертикальный промо-ролик: гигантский фирменный стакан появляется посреди зимнего города, вокруг летают шары и светят прожекторы — 3D поверх реальной съёмки.",
        ["Идея", "Съёмка городской локации", "3D-моделирование и композитинг", "Монтаж", "Версия 9:16"]),
    "dominos": ("Рекламный ролик Domino's Pizza",
        "Динамичный ролик в уличном стиле: баскетбол, дрифт и граффити, а пицца заказывается в одно касание.",
        ["Сценарий", "Съёмка с актёрами и автомобилями", "Монтаж в ритм", "Цвет и звук"]),
    "orange-mebel": ("Имиджевый ролик для «Оранж Мебель»",
        "Ролик с основателем мебельной компании: производство, подход к клиентам и 3D-визуализация кухни с интерфейсом подбора материалов.",
        ["Сценарий и интервью", "Съёмка на производстве", "3D-визуализация", "Монтаж, цвет и звук"]),
}

e = lambda t: html.escape(t, quote=True)


def read_works():
    src = (ROOT / "assets/js/config.js").read_text(encoding="utf-8")
    block = src[src.index("WORKS: ["):src.index("],", src.index("WORKS: ["))]
    works = []
    for line in block.splitlines():
        line = line.strip()
        if not line.startswith("{ title:"):
            continue
        works.append(dict(re.findall(r'(\w+): "((?:[^"\\]|\\.)*)"', line)))
    for w in works:
        w["key"] = Path(w["video"]).stem
    return works


HEAD = """<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <script>if(location.protocol==="http:"&&/arkhfilm\\.ru$/.test(location.hostname))location.replace("https://arkhfilm.ru"+location.pathname+location.search+location.hash)</script>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{url}">
  <meta name="theme-color" content="#0a0a0a">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="arkh">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{og_title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="{og_image}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <link rel="stylesheet" href="assets/fonts/fonts.css?v=1">
  <link rel="stylesheet" href="assets/css/style.css?v={v_css}">
  <script type="application/ld+json">{ld}</script>
</head>
<body class="svc-page"{body_attr}>

<header class="header is-scrolled svc-page__header">
  <a href="./" class="logo" aria-label="На главную">
    <img src="assets/img/logo-white.png" alt="arkh" class="logo__img logo__img--w">
  </a>
  <nav class="nav" aria-label="Услуги">
{nav}
  </nav>
  <div class="header__right">
    <a href="#" class="btn btn--fire btn--sm js-tg">Написать</a>
  </div>
</header>
"""

TAIL = """
<footer class="footer container">
  <div class="footer__grid">
    <div class="footer__col footer__col--contacts">
      <span class="footer__h mono">Контакты</span>
      <a href="#" class="js-tg">Telegram</a>
      <a href="mailto:{email}">{email}</a>
      <p>Москва — Тверь — Санкт-Петербург</p>
    </div>
    <div class="footer__col">
      <span class="footer__h mono">Разделы</span>
      <a href="./">Главная</a><a href="./#about">О нас</a><a href="./#works">Работы</a><a href="./#backstage">Бэкстейдж</a>
    </div>
    <div class="footer__col">
      <span class="footer__h mono">Услуги</span>
      <a href="reklama.html">Рекламные кампании</a><a href="vertikalnyj-kontent.html">Вертикальный контент</a><a href="imidzhevye-filmy.html">Имиджевые фильмы</a>
    </div>
  </div>
  <div class="footer__end">
    <small class="footer__copy mono">© <span class="js-year">2026</span> arkh production</small>
    <a href="privacy.html" class="footer__privacy mono">Конфиденциальность</a>
  </div>
</footer>
{modal}
<script src="assets/js/config.js?v={v_config}" defer></script>
<script src="assets/js/category.js?v={v_js}" defer></script>
</body>
</html>
"""

MODAL = """
<div class="modal" id="modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
  <div class="modal__backdrop" data-close></div>
  <div class="modal__box">
    <button class="modal__close" data-close aria-label="Закрыть">✕</button>
    <div class="modal__player"></div>
    <div class="modal__info">
      <span class="tag mono modal__cat"></span>
      <h3 class="modal__title" id="modalTitle"></h3>
      <p class="modal__task"></p>
      <a href="#" class="btn btn--fire btn--sm js-tg">Хочу так же →</a>
      <a href="#" class="modal__more mono">Подробнее о проекте →</a>
    </div>
  </div>
</div>
"""

CTA = """
  <section class="container svc-cta">
    <h2 class="svc-cta__title">Обсудим ваш проект?</h2>
    <p class="svc-cta__lead">Расскажите о задаче — мы предложим идею и посчитаем смету. Снимаем в Твери, Москве и Санкт-Петербурге.</p>
    <a href="#" class="btn btn--fire js-tg">Написать в Telegram <span class="btn__arrow">→</span></a>
    <a class="contact__mail mono" href="mailto:{email}">или на почту: {email}</a>
  </section>
"""


def nav_html(active=None):
    return "\n".join(
        f'    <a href="{s["file"]}" class="nav__link{" is-active" if s is active else ""}"'
        + (' aria-current="page"' if s is active else "") + f'>{s["name"]}</a>' for s in SERVICES)


def card(w, i, n):
    vert = w.get("ratio") == "vertical"
    return (f'      <article class="work{" work--vertical" if vert else ""}" data-page="{w["page"]}" role="button" tabindex="0" aria-label="Смотреть «{e(w["title"])}»">\n'
            f'        <div class="work__media"><video src="{w["video"]}" poster="{w["poster"]}" muted playsinline loop preload="none"></video></div>\n'
            f'        <span class="work__idx mono">{i:02d} / {n:02d}</span>\n'
            f'        <span class="work__play"></span>\n'
            f'        <div class="work__info"><small>{e(w["client"])}</small><h3><a href="{w["page"]}" tabindex="-1">{e(w["title"])}</a></h3></div>\n'
            f'      </article>')


def org_ref():
    return {"@id": f"{SITE}/#org"}


def build_service(s, works):
    url = f"{SITE}/{s['file']}"
    items = [w for w in works if w["category"] == s["cat"]]
    steps = "\n".join(f'      <li><span class="mono">{i:02d}</span><h3>{e(t)}</h3><p>{e(d)}</p></li>'
                      for i, (t, d) in enumerate(s["steps"], 1))
    more = "\n".join(
        f'    <a class="svc-more__card" href="{o["file"]}" style="background-image:url(assets/img/services/{o["cat"]}.jpg)">'
        f'<span class="mono">Ещё услуга</span><strong>{o["name"]} ↗</strong></a>' for o in SERVICES if o is not s)
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Service", "name": s["name"], "serviceType": s["name"], "description": s["desc"], "url": url,
         "provider": org_ref(), "areaServed": [{"@type": "City", "name": c} for c in CITIES]},
        {"@type": "ItemList", "name": f"Проекты: {s['name']}", "itemListElement": [
            {"@type": "ListItem", "position": i, "url": f"{SITE}/{w['page']}", "name": w["title"]} for i, w in enumerate(items, 1)]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Главная", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": s["name"], "item": url}]},
    ]}
    body = f"""
<main class="svc-page__main">
  <section class="container svc-page__hero">
    <nav class="crumbs mono" aria-label="Навигация"><a href="./">Главная</a><span>/</span><a href="./#services">Услуги</a><span>/</span><span aria-current="page">{s["name"]}</span></nav>
    <h1 class="svc-page__title">{s["h1"]}</h1>
    <p class="svc-page__lead">{e(s["lead"])}</p>
    <p class="svc-page__count mono">{len(items)} работ · Тверь · Москва · Санкт-Петербург</p>
  </section>

  <section class="container" aria-label="Работы">
    <div class="svc-grid{" svc-grid--vertical" if s["cat"] == "reels" else ""}" id="catGrid">
{chr(10).join(card(w, i, len(items)) for i, w in enumerate(items, 1))}
    </div>
  </section>

  <section class="container svc-steps" aria-labelledby="stepsTitle">
    <h2 class="svc-steps__title" id="stepsTitle">Что входит</h2>
    <ol class="svc-steps__list">
{steps}
    </ol>
  </section>
{CTA.format(email=EMAIL)}
  <section class="container svc-more" aria-label="Другие услуги">
{more}
  </section>
</main>
"""
    page = HEAD.format(title=e(s["title"]), desc=e(s["desc"]), url=url, og_title=e(s["h1"] + " — arkh"),
                       og_image=f"{SITE}/assets/img/og.jpg", v_css=V["css"], ld=json.dumps(ld, ensure_ascii=False),
                       body_attr="", nav=nav_html(s))
    page += body + TAIL.format(email=EMAIL, modal=MODAL, v_config=V["config"], v_js=V["js"])
    (ROOT / s["file"]).write_text(page, encoding="utf-8")
    print("ok", s["file"])


def build_case(w, works):
    s = next(x for x in SERVICES if x["cat"] == w["category"])
    h1, about, done = CASES[w["key"]]
    url = f"{SITE}/{w['page']}"
    vert = w.get("ratio") == "vertical"
    poster = w["poster"].split("?")[0]
    title = f"{h1} — {s['short'].lower() if s['cat'] != 'ads' else 'рекламный ролик'} | arkh"
    desc = f"{about} Видеопродакшн arkh: работаем в Твери, Москве и Санкт-Петербурге."
    same = [x for x in works if x["category"] == w["category"] and x is not w]
    others = (same + [x for x in works if x["category"] != w["category"]])[:3]
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "VideoObject", "name": h1, "description": about, "thumbnailUrl": f"{SITE}/{poster}",
         "contentUrl": f"{SITE}/{w['video']}", "uploadDate": PUBLISHED, "inLanguage": "ru", "publisher": org_ref(),
         "creator": org_ref()},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Главная", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": s["name"], "item": f"{SITE}/{s['file']}"},
            {"@type": "ListItem", "position": 3, "name": w["title"], "item": url}]},
    ]}
    done_html = "\n".join(f"        <li>{e(d)}</li>" for d in done)
    result = f'\n      <p class="case__result">{e(w["result"])}</p>' if w.get("result") else ""
    more = "\n".join(
        f'    <a class="svc-more__card" href="{o["page"]}" style="background-image:url({o["poster"]})">'
        f'<span class="mono">{e(o["client"])}</span><strong>{e(o["title"])} ↗</strong></a>' for o in others)
    body = f"""
<main class="svc-page__main">
  <section class="container svc-page__hero">
    <nav class="crumbs mono" aria-label="Навигация"><a href="./">Главная</a><span>/</span><a href="{s["file"]}">{s["name"]}</a><span>/</span><span aria-current="page">{e(w["title"])}</span></nav>
    <h1 class="case__title">{e(h1)}</h1>
    <p class="svc-page__count mono">{e(w["client"])} · {"Вертикальный 9:16" if vert else "Горизонтальный 16:9"} · {s["name"]}</p>
  </section>

  <section class="container case">
    <div class="case__player{" case__player--vertical" if vert else ""}">
      <video src="{w["video"]}" poster="{w["poster"]}" controls playsinline preload="none"></video>
    </div>
    <div class="case__info">
      <h2 class="case__h">О проекте</h2>
      <p class="case__text">{e(about)}</p>{result}
      <h2 class="case__h">Что сделали</h2>
      <ul class="case__list">
{done_html}
      </ul>
      <a href="#" class="btn btn--fire js-tg">Хочу так же <span class="btn__arrow">→</span></a>
    </div>
  </section>
{CTA.format(email=EMAIL)}
  <section class="container" aria-label="Другие проекты">
    <h2 class="case__h case__h--more">Другие проекты</h2>
    <div class="svc-more">
{more}
    </div>
  </section>
</main>
"""
    page = HEAD.format(title=e(title), desc=e(desc), url=url, og_title=e(w["title"] + " — arkh"),
                       og_image=f"{SITE}/{poster}", v_css=V["css"], ld=json.dumps(ld, ensure_ascii=False),
                       body_attr="", nav=nav_html(s))
    page += body + TAIL.format(email=EMAIL, modal="", v_config=V["config"], v_js=V["js"])
    (ROOT / w["page"]).write_text(page, encoding="utf-8")
    print("ok", w["page"])


def build_sitemap(works):
    urls = [("", "1.0")] + [(s["file"], "0.8") for s in SERVICES] + [(w["page"], "0.6") for w in works]
    rows = "".join(f"  <url>\n    <loc>{SITE}/{u}</loc>\n    <lastmod>{PUBLISHED[:4]}-10-15</lastmod>\n"
                   f"    <changefreq>monthly</changefreq>\n    <priority>{p}</priority>\n  </url>\n" for u, p in urls)
    rows += f"  <url>\n    <loc>{SITE}/privacy.html</loc>\n    <changefreq>yearly</changefreq>\n    <priority>0.3</priority>\n  </url>\n"
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n'
                                       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + rows + "</urlset>\n",
                                       encoding="utf-8")
    print("ok sitemap.xml")


works = read_works()
missing = [w["key"] for w in works if w["key"] not in CASES]
if missing:
    raise SystemExit(f"Нет текста для проектов: {missing} — добавьте их в CASES")
for s in SERVICES:
    build_service(s, works)
for w in works:
    build_case(w, works)
build_sitemap(works)
