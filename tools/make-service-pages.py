#!/usr/bin/env python3
"""Собирает страницы услуг (reklama.html, vertikalnyj-kontent.html, imidzhevye-filmy.html).
Тексты и SEO — в PAGES ниже. Сами работы берутся из assets/js/config.js по полю category.
Запуск из корня сайта:  python3 tools/make-service-pages.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
V = {"css": 38, "config": 30, "js": 1}  # поднимайте при правках, чтобы браузеры не брали старое
SITE = "https://arkhfilm.ru"

PAGES = [
    {
        "file": "reklama.html", "cat": "ads", "name": "Рекламные кампании",
        "title": "Рекламные ролики — видеопродакшн в Твери, Москве и Санкт-Петербурге | arkh",
        "desc": "Съёмка рекламных роликов под ключ: сценарий, кастинг, съёмка на кинокамеры, монтаж и графика. Реклама для ТВ, digital и маркетплейсов. Тверь, Москва, Санкт-Петербург.",
        "h1": "Рекламные кампании",
        "lead": "Снимаем рекламные ролики для ТВ, digital, маркетплейсов и экранов: от идеи и сценария до финальных версий под каждую площадку. Работаем в Твери, Москве и Санкт-Петербурге.",
        "steps": [("Идея и сценарий", "Разбираем продукт и аудиторию, придумываем ход, который запомнят."),
                  ("Кастинг и локации", "Подбираем актёров, площадки, реквизит и команду под задачу."),
                  ("Съёмка", "Кинокамеры, свет, оптика и продюсер на площадке."),
                  ("Пост-продакшн", "Монтаж, цвет, звук, графика и 3D."),
                  ("Версии под площадки", "Форматы 16:9, 9:16 и 1:1, хронометражи для ТВ, digital и маркетплейсов.")],
    },
    {
        "file": "vertikalnyj-kontent.html", "cat": "reels", "name": "Вертикальный контент",
        "title": "Вертикальные ролики для Reels, Shorts и VK Клипов — съёмка в Твери, Москве, СПб | arkh",
        "desc": "Вертикальный видеоконтент для брендов: Reels, Shorts, VK Клипы и TikTok. Хук в первые секунды, трендовый монтаж, графика. Тверь, Москва, Санкт-Петербург.",
        "h1": "Вертикальный контент",
        "lead": "Снимаем вертикальные ролики для Reels, Shorts, VK Клипов и TikTok: хук в первые секунды, динамичный монтаж и графика под алгоритмы платформ. Отдельные ролики и серии для регулярного постинга.",
        "steps": [("Идея и хук", "Придумываем, чем зацепить зрителя в первые секунды."),
                  ("Сценарии серии", "Пишем ролики так, чтобы их хватило на регулярный постинг."),
                  ("Съёмка", "Снимаем сразу под вертикальный кадр, со светом и звуком."),
                  ("Монтаж и графика", "Динамичный монтаж, субтитры, моушн и 3D."),
                  ("Под каждую площадку", "Версии для Reels, Shorts, VK Клипов и TikTok.")],
    },
    {
        "file": "imidzhevye-filmy.html", "cat": "brand", "name": "Имиджевые фильмы",
        "title": "Имиджевый фильм о компании — съёмка в Твери, Москве и Санкт-Петербурге | arkh",
        "desc": "Имиджевые фильмы о бренде, команде и производстве: для сайта, презентаций, выставок и найма. Сценарий, съёмка, интервью, монтаж. Тверь, Москва, Санкт-Петербург.",
        "h1": "Имиджевые фильмы",
        "lead": "Снимаем фильмы о бренде, команде и производстве — для сайта, презентаций, выставок и найма. Показываем людей и процессы так, чтобы компании доверяли.",
        "steps": [("Погружение", "Знакомимся с компанией, людьми и тем, чем вы гордитесь."),
                  ("Сценарий и интервью", "Собираем историю и готовим героев к съёмке."),
                  ("Съёмка", "Производство, офис, интервью и детали продукта."),
                  ("Монтаж и графика", "Цвет, звук, титры и 3D-визуализация продукта."),
                  ("Версии", "Полный фильм и короткие нарезки для соцсетей и презентаций.")],
    },
]

TEMPLATE = """<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{url}">
  <meta name="theme-color" content="#0a0a0a">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="arkh">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{h1} — arkh">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="{site}/assets/img/og.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <link rel="stylesheet" href="assets/fonts/fonts.css?v=1">
  <link rel="stylesheet" href="assets/css/style.css?v={v_css}">
  <script type="application/ld+json">{ld}</script>
</head>
<body class="svc-page" data-cat="{cat}">

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

<main class="svc-page__main">
  <section class="container svc-page__hero">
    <nav class="crumbs mono" aria-label="Навигация"><a href="./">Главная</a><span>/</span><a href="./#services">Услуги</a><span>/</span><span aria-current="page">{name}</span></nav>
    <h1 class="svc-page__title">{h1}</h1>
    <p class="svc-page__lead">{lead}</p>
    <p class="svc-page__count mono"><span class="js-count">0</span> работ · Тверь · Москва · Санкт-Петербург</p>
  </section>

  <section class="container" aria-label="Работы">
    <div class="svc-grid{grid_mod}" id="catGrid"></div>
  </section>

  <section class="container svc-steps" aria-labelledby="stepsTitle">
    <h2 class="svc-steps__title" id="stepsTitle">Что входит</h2>
    <ol class="svc-steps__list">
{steps}
    </ol>
  </section>

  <section class="container svc-cta">
    <h2 class="svc-cta__title">Обсудим ваш проект?</h2>
    <p class="svc-cta__lead">Расскажите о задаче — мы предложим идею и посчитаем смету.</p>
    <a href="#" class="btn btn--fire js-tg">Написать в Telegram <span class="btn__arrow">→</span></a>
  </section>

  <section class="container svc-more" aria-label="Другие услуги">
{more}
  </section>
</main>

<footer class="footer container">
  <p>Москва — Тверь — Санкт-Петербург</p>
  <div class="footer__links">
    <a href="reklama.html">Рекламные кампании</a><a href="vertikalnyj-kontent.html">Вертикальный контент</a><a href="imidzhevye-filmy.html">Имиджевые фильмы</a>
  </div>
  <div class="footer__end">
    <small class="footer__copy mono">© <span class="js-year">2026</span> arkh production</small>
    <a href="privacy.html" class="footer__privacy mono">Конфиденциальность</a>
  </div>
</footer>

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
    </div>
  </div>
</div>

<script src="assets/js/config.js?v={v_config}" defer></script>
<script src="assets/js/category.js?v={v_js}" defer></script>
</body>
</html>
"""


def build(p):
    url = f"{SITE}/{p['file']}"
    nav = "\n".join(
        f'    <a href="{o["file"]}" class="nav__link{" is-active" if o is p else ""}"'
        f'{" aria-current=\"page\"" if o is p else ""}>{o["name"]}</a>' for o in PAGES)
    steps = "\n".join(f'      <li><span class="mono">{i:02d}</span><h3>{t}</h3><p>{d}</p></li>'
                      for i, (t, d) in enumerate(p["steps"], 1))
    more = "\n".join(
        f'    <a class="svc-more__card" href="{o["file"]}" style="background-image:url(assets/img/services/{o["cat"]}.jpg)">'
        f'<span class="mono">Ещё услуга</span><strong>{o["name"]} ↗</strong></a>' for o in PAGES if o is not p)
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "Service", "name": p["name"], "serviceType": p["name"], "description": p["desc"], "url": url,
             "provider": {"@id": f"{SITE}/#org"},
             "areaServed": [{"@type": "City", "name": c} for c in ("Тверь", "Москва", "Санкт-Петербург")]},
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Главная", "item": f"{SITE}/"},
                {"@type": "ListItem", "position": 2, "name": p["name"], "item": url}]},
        ],
    }
    html = TEMPLATE.format(
        title=p["title"], desc=p["desc"], url=url, site=SITE, h1=p["h1"], name=p["name"], lead=p["lead"],
        cat=p["cat"], nav=nav, steps=steps, more=more, ld=json.dumps(ld, ensure_ascii=False),
        grid_mod=" svc-grid--vertical" if p["cat"] == "reels" else "",
        v_css=V["css"], v_config=V["config"], v_js=V["js"])
    (ROOT / p["file"]).write_text(html, encoding="utf-8")
    print("ok", p["file"])


for page in PAGES:
    build(page)
