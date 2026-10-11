(() => {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const S = window.SITE || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!window.gsap;
  if (reduced || !hasGsap) document.documentElement.classList.add("reduced");

  const CATS = { ads: "Реклама", reels: "Рилсы", motion: "Motion", brand: "Имиджевый" };

  /* ---------- Config → DOM ---------- */
  const brand = S.BRAND_NAME || "arkh";
  document.title = document.title.replace("arkh", brand);
  $$(".js-brand").forEach(el => (el.textContent = brand));
  $$(".js-brand-split").forEach(el => {
    el.innerHTML = [...brand].map(ch => `<span class="ch">${ch === " " ? "&nbsp;" : ch}</span>`).join("");
  });
  $$(".js-tg").forEach(a => { a.href = S.TELEGRAM_URL || "#"; a.target = "_blank"; a.rel = "noopener"; });
  $$(".js-year").forEach(el => (el.textContent = S.YEAR || new Date().getFullYear()));
  if (S.CITY) $$(".js-city").forEach(el => (el.textContent = S.CITY));
  $$(".js-socials").forEach(el => {
    el.innerHTML = (S.SOCIALS || []).map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join("");
  });

  // Hero media
  if (S.HERO_VIDEO) {
    const v = $(".hero__video"); v.src = S.HERO_VIDEO; v.hidden = false; $(".hero .fire-scene__silhouette").style.display = "none";
  } else if (S.HERO_IMAGE) {
    const i = $(".hero__img"); i.src = S.HERO_IMAGE; i.hidden = false; $(".hero .fire-scene__silhouette").style.display = "none";
  }

  // Contact background showreel (lazy)
  if (S.SHOWREEL_VIDEO) {
    const v = $(".contact__video");
    $(".contact__frame").classList.add("has-video");
    new IntersectionObserver((entries, io) => {
      if (entries[0].isIntersecting) { v.src = S.SHOWREEL_VIDEO; v.hidden = false; v.play().catch(() => {}); io.disconnect(); }
    }, { rootMargin: "300px" }).observe(v);
  }

  /* ---------- Works ---------- */
  const grid = $("#worksGrid");
  const mediaHTML = (w, cls = "") => {
    if (w.video) return `<video class="${cls}" src="${w.video}" ${w.poster ? `poster="${w.poster}"` : ""} muted playsinline loop preload="none"></video>`;
    if (w.poster) return `<img class="${cls}" src="${w.poster}" alt="" loading="lazy">`;
    const variants = ["", "fire-bg--mono", "fire-bg--car"];
    return `<div class="fire-bg ${variants[(w._i || 0) % 3]} ${cls}" style="position:absolute;inset:0"></div>`;
  };
  (S.WORKS || []).forEach((w, i) => {
    w._i = i;
    const el = document.createElement("article");
    el.className = `work ${w.ratio === "vertical" ? "work--vertical" : ""}`;
    el.dataset.cat = w.category;
    el.setAttribute("data-cursor", "");
    el.tabIndex = 0;
    el.innerHTML = `
      <div class="work__media">${mediaHTML(w)}</div>
      <span class="tag">${CATS[w.category] || ""}</span>
      <span class="work__play"></span>
      <div class="work__info"><small>${w.client || ""}</small><h3>${w.title}</h3></div>`;
    const vid = $("video", el);
    if (vid) {
      el.addEventListener("mouseenter", () => { vid.preload = "auto"; vid.play().catch(() => {}); });
      el.addEventListener("mouseleave", () => vid.pause());
    }
    el.addEventListener("click", () => openModal(w));
    el.addEventListener("keydown", e => { if (e.key === "Enter") openModal(w); });
    grid.appendChild(el);
  });

  $$(".chip").forEach(chip => chip.addEventListener("click", () => {
    $$(".chip").forEach(c => c.classList.toggle("is-active", c === chip));
    const f = chip.dataset.filter;
    $$(".work", grid).forEach(w => w.classList.toggle("is-hidden", f !== "all" && w.dataset.cat !== f));
    if (hasGsap && !reduced) gsap.fromTo($$(".work:not(.is-hidden)", grid), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .7, ease: "power3.out" });
    window.ScrollTrigger && ScrollTrigger.refresh();
  }));

  /* ---------- Modal ---------- */
  const modal = $("#modal");
  const player = $(".modal__player", modal);
  function openModal(w) {
    player.classList.toggle("modal__player--vertical", w.ratio === "vertical");
    player.innerHTML = w.video
      ? `<video src="${w.video}" ${w.poster ? `poster="${w.poster}"` : ""} controls autoplay playsinline></video>`
      : `${mediaHTML(w)}<div class="modal__placeholder">Здесь будет видео «${w.title}».<br>Добавьте файл в assets/video и путь в config.js</div>`;
    $(".modal__cat", modal).textContent = w.cat || CATS[w.category] || "";
    $(".modal__title", modal).textContent = w.title;
    $(".modal__task", modal).textContent = w.task || "";
    $(".modal__result", modal).textContent = w.result || "";
    modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false");
    lenis && lenis.stop();
  }
  function closeModal() {
    modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true");
    const v = $("video", player); v && v.pause();
    setTimeout(() => (player.innerHTML = ""), 500);
    lenis && lenis.start();
  }
  $$("[data-close]", modal).forEach(b => b.addEventListener("click", closeModal));
  addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal(); });
  $$(".js-showreel").forEach(b => b.addEventListener("click", () =>
    openModal({ title: "Шоурил " + brand, cat: "Шоурил", video: S.SHOWREEL_VIDEO, ratio: "wide",
      task: "Лучшие моменты наших съёмок за последний год.", result: "Понравилось? Напишите нам в Telegram." })));

  /* ---------- Backstage strip ---------- */
  const strip = $("#backstageStrip");
  const shots = S.BACKSTAGE || [];
  const mid = Math.floor(shots.length / 2);
  shots.forEach((s, i) => {
    const f = document.createElement("figure");
    f.className = "shot" + (i === mid ? " shot--big" : "");
    f.style.margin = "0";
    const variants = ["fire-bg--mono", "", "fire-bg--car"];
    f.innerHTML = (s.src ? `<img src="${s.src}" alt="${s.caption || ""}" loading="lazy">` : `<div class="fire-bg ${variants[i % 3]}"></div>`) +
      (i === mid ? `<img class="shot__logo" src="assets/img/logo-white.png" alt="">` : "") +
      `<figcaption>${s.caption || ""}</figcaption>`;
    strip.appendChild(f);
  });

  /* ---------- Manifest word split ---------- */
  $$(".js-words").forEach(p => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3 && n.textContent.trim()) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(" "));
            else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName === "B") {
          n.classList.add("w");
        }
      });
    };
    walk(p);
  });

  /* ---------- Header ---------- */
  const header = $(".header");
  let lastY = 0;
  const darkSections = $$(".why, .backstage");
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    header.classList.toggle("is-hidden", y > lastY && y > 400 && !$(".mobile-menu").classList.contains("is-open"));
    lastY = y;
    const probe = 40;
    header.classList.toggle("is-dark", darkSections.some(s => { const r = s.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; }));
    // active nav
    let current = "top";
    ["about", "services", "works", "backstage"].forEach(id => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * .4) current = id; });
    if (y < 200) current = "top";
    $$(".nav__link").forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + current));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Burger
  const burger = $(".burger"), menu = $(".mobile-menu");
  burger.addEventListener("click", () => {
    const open = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    menu.setAttribute("aria-hidden", !open);
    header.classList.toggle("is-dark", open);
  });
  $$("a", menu).forEach(a => a.addEventListener("click", () => { menu.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }));

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ lerp: 0.09 });
    window.lenis = lenis;
    if (hasGsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    }
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const id = a.getAttribute("href");
    if (id.length < 2 && !a.classList.contains("js-tg")) { e.preventDefault(); lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" }); return; }
    const t = id.length > 1 && document.querySelector(id);
    if (t) { e.preventDefault(); lenis ? lenis.scrollTo(t, { offset: -20 }) : t.scrollIntoView({ behavior: "smooth" }); }
  }));

  /* ---------- Cursor + magnetic ---------- */
  const cursor = $(".cursor");
  if (matchMedia("(hover: hover)").matches) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; });
    const loop = () => { cx += (tx - cx) * .18; cy += (ty - cy) * .18; cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener("mouseover", e => cursor.classList.toggle("is-big", !!e.target.closest("[data-cursor]")));
    $$(".magnetic").forEach(el => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  /* ---------- Counters ---------- */
  const counters = $$("[data-count]");
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, end = +el.dataset.count, dur = 1600, t0 = performance.now();
    const tick = t => { const p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    reduced ? (el.textContent = end) : requestAnimationFrame(tick);
    io.unobserve(el);
  }), { threshold: .5 });
  counters.forEach(c => io.observe(c));

  /* ---------- GSAP animations ---------- */
  if (!hasGsap || reduced) { $$(".manifest .w").forEach(w => w.classList.add("is-lit")); return; }
  gsap.registerPlugin(ScrollTrigger);

  // Hero intro
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.from(".hero__frame", { clipPath: "inset(8% 6% 0 6% round 36px)", duration: 1.6 })
    .from(".hero .line > span", { yPercent: 110, duration: 1.3, stagger: .12 }, .2)
    .from(".wordmark--hero .ch", { yPercent: 100, duration: 1.5, stagger: .07 }, .3)
    .from(".fire-scene .fs", { opacity: 0, scaleX: .2, duration: 1.6, stagger: .08 }, .4)
    .from(".header > *", { y: -30, opacity: 0, duration: 1, stagger: .06 }, .5)
    .to(".hero .reveal", { opacity: 1, y: 0, duration: 1.2, stagger: .12 }, .7);

  // Hero parallax
  gsap.to(".hero__media", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".wordmark--hero", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".case-card", { yPercent: -40, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // Generic reveals
  $$(".reveal").forEach(el => {
    if (el.closest(".hero")) return;
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  // Manifest word lighting
  $$(".js-words").forEach(p => {
    const words = $$(".w", p);
    ScrollTrigger.create({
      trigger: p, start: "top 80%", end: "bottom 45%", scrub: true,
      onUpdate: self => { const n = Math.round(self.progress * words.length); words.forEach((w, i) => w.classList.toggle("is-lit", i < n)); },
    });
  });

  // Cards stagger float
  gsap.utils.toArray(".card").forEach((c, i) => {
    gsap.fromTo(c, { y: 60 + i * 30 }, { y: 0, ease: "none", scrollTrigger: { trigger: ".cards", start: "top bottom", end: "center center", scrub: true } });
  });

  // Why banner title
  gsap.from(".why__streaks", { scaleX: 1.6, opacity: 0, ease: "none", scrollTrigger: { trigger: ".why__banner", start: "top bottom", end: "center center", scrub: true } });

  // Backstage strip horizontal drift
  gsap.fromTo(strip, { x: () => innerWidth * .15 }, {
    x: () => -(strip.scrollWidth - innerWidth) - innerWidth * .05, ease: "none",
    scrollTrigger: { trigger: strip, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
  });

  // Works stagger
  ScrollTrigger.batch(".work", { start: "top 90%", onEnter: b => gsap.from(b, { y: 60, opacity: 0, duration: 1, stagger: .1, ease: "power3.out" }), once: true });

  // Contact wordmark
  gsap.from(".wordmark--contact .ch", { yPercent: 60, opacity: 0, stagger: .08, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".wordmark--contact", start: "top 85%" } });

  // Services rows
  gsap.from(".svc__item", { y: 40, opacity: 0, stagger: .08, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".svc", start: "top 80%" } });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
