(() => {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!location.hash) scrollTo(0, 0);
  const S = window.SITE || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!window.gsap;
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduced || !hasGsap) root.classList.remove("anim", "intro");
  const animated = root.classList.contains("anim");
  const intro = root.classList.contains("intro");

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
    const v = $(".hero__video"); v.src = S.HERO_VIDEO; v.hidden = false; $(".hero .fire-scene").style.display = "none";
  } else if (S.HERO_IMAGE) {
    const i = $(".hero__img"); i.src = S.HERO_IMAGE; i.hidden = false; $(".hero .fire-scene").style.display = "none";
  }

  // Contact background showreel (lazy)
  if (S.SHOWREEL_VIDEO) {
    const v = $(".contact__video");
    new IntersectionObserver((entries, io) => {
      if (entries[0].isIntersecting) { v.src = S.SHOWREEL_VIDEO; v.hidden = false; v.play().catch(() => {}); io.disconnect(); }
    }, { rootMargin: "300px" }).observe(v);
  }

  /* ---------- Intro slate countdown ---------- */
  if (intro) {
    const num = $(".slate__num");
    [2, 1].forEach((n, i) => setTimeout(() => (num.textContent = n), 650 * (i + 1)));
  }

  /* ---------- Viewfinder timecode (24 fps) ---------- */
  const tc = $(".js-timecode");
  if (tc) {
    const pad = n => String(n).padStart(2, "0");
    const t0 = performance.now();
    let last = -1;
    const tick = now => {
      const f = Math.floor((now - t0) / (1000 / 24));
      if (f !== last) {
        last = f;
        const s = Math.floor(f / 24);
        tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % 24)}`;
      }
      if (!reduced) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Tape marquee: duplicate tracks for a seamless loop ---------- */
  $$(".tape__track").forEach(t => (t.innerHTML += t.innerHTML));

  /* ---------- Works ---------- */
  const grid = $("#worksGrid");
  const works = S.WORKS || [];
  const mediaHTML = (w, cls = "") => {
    if (w.video) return `<video class="${cls}" src="${w.video}" ${w.poster ? `poster="${w.poster}"` : ""} muted playsinline loop preload="none"></video>`;
    if (w.poster) return `<img class="${cls}" src="${w.poster}" alt="" loading="lazy">`;
    const variants = ["", "fire-bg--mono", "fire-bg--car"];
    return `<div class="fire-bg ${variants[(w._i || 0) % 3]} ${cls}" style="position:absolute;inset:0"></div>`;
  };
  works.forEach((w, i) => {
    w._i = i;
    const el = document.createElement("article");
    el.className = `work ${w.ratio === "vertical" ? "work--vertical" : ""}`;
    el.dataset.cat = w.category;
    el.setAttribute("data-cursor", "");
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `Открыть работу «${w.title}»`);
    el.tabIndex = 0;
    el.innerHTML = `
      <div class="work__media">${mediaHTML(w)}</div>
      <span class="tag mono">${CATS[w.category] || ""}</span>
      <span class="work__idx mono">${String(i + 1).padStart(2, "0")} / ${String(works.length).padStart(2, "0")}</span>
      <span class="work__play"></span>
      <div class="work__info"><small>${w.client || ""}</small><h3>${w.title}</h3></div>`;
    const vid = $("video", el);
    if (vid) {
      el.addEventListener("mouseenter", () => { vid.preload = "auto"; vid.play().catch(() => {}); });
      el.addEventListener("mouseleave", () => vid.pause());
    }
    el.addEventListener("click", () => openModal(w, el));
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(w, el); } });
    grid.appendChild(el);
  });

  $$(".chip").forEach(chip => chip.addEventListener("click", () => {
    $$(".chip").forEach(c => { c.classList.toggle("is-active", c === chip); c.setAttribute("aria-pressed", c === chip); });
    const f = chip.dataset.filter;
    $$(".work", grid).forEach(w => w.classList.toggle("is-hidden", f !== "all" && w.dataset.cat !== f));
    $(".works__scroller").scrollLeft = 0;
    if (animated) gsap.fromTo($$(".work:not(.is-hidden)", grid), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .7, ease: "power3.out" });
    window.ScrollTrigger && ScrollTrigger.refresh();
  }));

  /* ---------- Modal ---------- */
  const modal = $("#modal");
  const player = $(".modal__player", modal);
  let lastFocus = null;
  function openModal(w, trigger) {
    lastFocus = trigger || document.activeElement;
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
    setTimeout(() => $(".modal__close", modal).focus(), 50);
  }
  function closeModal() {
    modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true");
    const v = $("video", player); v && v.pause();
    setTimeout(() => (player.innerHTML = ""), 500);
    lenis && lenis.start();
    lastFocus && lastFocus.focus && lastFocus.focus();
  }
  $$("[data-close]", modal).forEach(b => b.addEventListener("click", closeModal));
  addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal(); });
  $$(".js-showreel").forEach(b => b.addEventListener("click", () =>
    openModal({ title: "Шоурил " + brand, cat: "Шоурил", video: S.SHOWREEL_VIDEO, ratio: "wide",
      task: "Лучшие моменты наших съёмок за последний год.", result: "Понравилось? Напишите нам в Telegram." }, b)));

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
    [...p.childNodes].forEach(n => {
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
  });

  /* ---------- Header ---------- */
  const header = $(".header");
  const menu = $(".mobile-menu"), burger = $(".burger");
  let lastY = 0;
  const lightSections = $$(".light");
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    header.classList.toggle("is-hidden", y > lastY && y > 500 && !menu.classList.contains("is-open"));
    lastY = y;
    const probe = 38;
    const overLight = lightSections.some(s => { const r = s.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; });
    header.classList.toggle("is-light", overLight && !menu.classList.contains("is-open"));
    let current = "";
    ["about", "services", "works", "backstage"].forEach(id => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * .4) current = id; });
    if (document.getElementById("contact").getBoundingClientRect().top < innerHeight * .4) current = "";
    $$(".nav__link").forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + current));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger.addEventListener("click", () => {
    const open = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    menu.setAttribute("aria-hidden", !open);
    onScroll();
  });
  $$("a", menu).forEach(a => a.addEventListener("click", () => {
    menu.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); menu.setAttribute("aria-hidden", "true");
  }));

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ lerp: 0.09 });
    window.lenis = lenis;
    if (hasGsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      if (intro) { lenis.stop(); setTimeout(() => lenis.start(), 2300); }
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    }
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const id = a.getAttribute("href");
    if (a.classList.contains("js-tg")) return;
    const t = id.length > 1 && document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    if (id === "#top") { lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" }); return; }
    lenis ? lenis.scrollTo(t, { offset: -10 }) : t.scrollIntoView({ behavior: "smooth" });
  }));

  /* ---------- Cursor, magnetic, service preview ---------- */
  const cursor = $(".cursor");
  if (canHover) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    const preview = $(".svc-preview"), previewBg = $(".fire-bg", preview);
    let px = cx, py = cy;
    addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; });
    const loop = () => {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2;
      px += (tx - px) * .1; py += (ty - py) * .1;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      if (preview.classList.contains("is-on")) {
        const rot = Math.max(-12, Math.min(12, (tx - px) * .08));
        preview.style.transform = `translate(${px + 40}px, ${py}px) translate(0,-50%) rotate(${rot}deg)`;
      }
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("mouseover", e => {
      const svc = e.target.closest(".svc__item");
      cursor.classList.toggle("is-big", !!e.target.closest("[data-cursor]") && !svc);
      if (svc) {
        previewBg.className = "fire-bg " + (svc.dataset.preview || "");
        if (!preview.classList.contains("is-on")) { px = tx; py = ty; }
        preview.classList.add("is-on");
      } else preview.classList.remove("is-on");
    });
    $$(".magnetic").forEach(el => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }
  $$(".svc__item").forEach(li => li.addEventListener("click", () => window.open(S.TELEGRAM_URL || "#", "_blank", "noopener")));

  /* ---------- Counters ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, end = +el.dataset.count, dur = 1600, t0 = performance.now();
    const tick = t => { const p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    reduced ? (el.textContent = end) : requestAnimationFrame(tick);
    io.unobserve(el);
  }), { threshold: .5 });
  $$("[data-count]").forEach(c => io.observe(c));

  /* ---------- GSAP animations ---------- */
  if (!animated) {
    $$(".manifest .w").forEach(w => w.classList.add("is-lit"));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Hero intro (waits for the slate on first visit)
  const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: intro ? 2.2 : .1 });
  tl.from(".hero__media", { scale: 1.25, duration: 2.2, ease: "expo.out" })
    .from(".vf__c", { scale: 2.2, opacity: 0, duration: 1.2, stagger: .05 }, 0)
    .from(".vf__meta, .vf__cross", { opacity: 0, duration: .8, stagger: .08 }, .4)
    .to(".hero .line > span", { y: 0, duration: 1.3, stagger: .1 }, .15)
    .to(".hero .reveal", { opacity: 1, y: 0, duration: 1.1, stagger: .1 }, .6)
    .from(".header > *", { y: -24, opacity: 0, duration: 1, stagger: .06 }, .5)
    .from(".hero__scroll", { opacity: 0, duration: 1 }, 1);

  // Hero scroll-out
  gsap.to(".hero__media", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__content", { yPercent: -18, opacity: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "center center", end: "bottom top", scrub: true } });
  gsap.to(".case-card", { yPercent: -60, rotate: 6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // Tape tilt with scroll
  gsap.fromTo(".tape__row--fire", { rotate: -5 }, { rotate: -1, ease: "none", scrollTrigger: { trigger: ".tape", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo(".tape__row--dark", { rotate: 5 }, { rotate: 1, ease: "none", scrollTrigger: { trigger: ".tape", start: "top bottom", end: "bottom top", scrub: true } });

  // Generic reveals
  $$(".reveal").forEach(el => {
    if (el.closest(".hero")) return;
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  // Line-masked titles
  [".why__banner-title", ".contact__title"].forEach(sel => {
    gsap.to(`${sel} .line > span`, { y: 0, duration: 1.3, stagger: .12, ease: "expo.out", scrollTrigger: { trigger: sel, start: "top 85%" } });
  });

  // Manifest word lighting
  $$(".js-words").forEach(p => {
    const words = $$(".w", p);
    ScrollTrigger.create({
      trigger: p, start: "top 80%", end: "bottom 45%", scrub: true,
      onUpdate: self => { const n = Math.round(self.progress * words.length); words.forEach((w, i) => w.classList.toggle("is-lit", i < n)); },
    });
  });

  // Bento float
  gsap.utils.toArray(".bento .card").forEach((c, i) => {
    gsap.fromTo(c, { y: 50 + i * 25 }, { y: 0, ease: "none", scrollTrigger: { trigger: ".bento", start: "top bottom", end: "center center", scrub: true } });
  });

  // Services rows
  gsap.from(".svc__item", { y: 40, opacity: 0, stagger: .07, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".svc", start: "top 82%" } });

  // Why banner
  gsap.from(".why__streaks", { scaleX: 1.6, opacity: 0, ease: "none", scrollTrigger: { trigger: ".why__banner", start: "top bottom", end: "center center", scrub: true } });

  // Works: pinned horizontal reel on desktop, native swipe on mobile
  const mm = gsap.matchMedia();
  const scroller = $(".works__scroller"), bar = $(".works__bar span");
  mm.add("(min-width: 900px)", () => {
    const works = $("#works");
    works.classList.add("is-pinned");
    const dist = () => Math.max(0, grid.scrollWidth - innerWidth + parseFloat(getComputedStyle(scroller).paddingLeft));
    const tween = gsap.to(grid, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: works, start: "top top", end: () => "+=" + dist(), pin: true, scrub: .6, invalidateOnRefresh: true,
        onUpdate: self => gsap.set(bar, { scaleX: self.progress }),
      },
    });
    return () => { works.classList.remove("is-pinned"); tween.scrollTrigger.kill(); tween.kill(); gsap.set(grid, { x: 0 }); };
  });
  mm.add("(max-width: 899px)", () => {
    const upd = () => gsap.set(bar, { scaleX: scroller.scrollLeft / Math.max(1, scroller.scrollWidth - scroller.clientWidth) });
    scroller.addEventListener("scroll", upd, { passive: true });
    return () => scroller.removeEventListener("scroll", upd);
  });
  ScrollTrigger.batch(".work", { start: "top 92%", onEnter: b => gsap.from(b, { y: 60, opacity: 0, duration: 1, stagger: .1, ease: "power3.out" }), once: true });

  // Backstage strip drift
  gsap.fromTo(strip, { x: () => innerWidth * .1 }, {
    x: () => -(strip.scrollWidth - innerWidth) - innerWidth * .05, ease: "none",
    scrollTrigger: { trigger: strip, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
  });

  // Process line fill
  gsap.to(".process__line", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".process", start: "top 85%", end: "bottom 60%", scrub: true } });

  // Wordmark fire fill
  gsap.to(".wordmark .js-brand-split", { backgroundPosition: "0% 0", ease: "none", scrollTrigger: { trigger: ".wordmark", start: "top bottom", end: "bottom bottom", scrub: true } });

  addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
