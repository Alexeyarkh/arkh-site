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

  const CATS = { ads: "Реклама", reels: "Вертикальный контент", motion: "Моушн-дизайн", brand: "Имиджевый" };

  /* ---------- Config → DOM ---------- */
  const brand = S.BRAND_NAME || "arkh";
  document.title = document.title.replace("arkh", brand);
  $$(".js-brand").forEach(el => (el.textContent = brand));
  $$(".js-brand-split").forEach(el => {
    el.innerHTML = [...brand].map(ch => `<span class="ch">${ch === " " ? "&nbsp;" : ch}</span>`).join("");
  });
  $$(".js-tg").forEach(a => { a.href = S.TELEGRAM_URL || "#"; a.target = "_blank"; a.rel = "noopener"; });
  const tgHandle = (S.TELEGRAM_URL || "").match(/t\.me\/([\w\d_]+)/);
  if (tgHandle) $$(".js-tg-handle").forEach(el => (el.textContent = "@" + tgHandle[1]));
  $$(".js-year").forEach(el => (el.textContent = S.YEAR || new Date().getFullYear()));
  if (S.CITY) $$(".js-city").forEach(el => (el.textContent = S.CITY));
  $$(".js-socials").forEach(el => {
    el.innerHTML = (S.SOCIALS || []).map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join("");
  });

  /* ---------- Hero media: muted b/w backdrop + full-colour viewfinder window ---------- */
  (() => {
    const hero = $(".hero");
    // one horizontal reel everywhere (16:9 window); phones get a lighter encode of the same cut
    const src = (matchMedia("(max-width: 720px)").matches && S.HERO_VIDEO_MOBILE) || S.HERO_VIDEO;
    const poster = S.HERO_POSTER || S.HERO_IMAGE;
    const saveData = navigator.connection && navigator.connection.saveData;
    const bgPoster = $(".hero__poster"), winPoster = $(".vfwin__poster");
    const useMedia = () => { hero.classList.add("has-media"); $(".hero .fire-scene").style.display = "none"; $(".vfwin__ph").hidden = true; };
    if (poster) { bgPoster.src = winPoster.src = poster; bgPoster.hidden = winPoster.hidden = false; useMedia(); }
    if (!src || reduced || saveData) return;

    const video = $(".vfwin__video"), canvas = $(".hero__bg"), ctx = canvas.getContext("2d");
    const probe = document.createElement("canvas"); probe.width = 32; probe.height = 18;
    const pctx = probe.getContext("2d", { willReadFrequently: true });
    const win = $(".vfwin");
    let prev = null, lastFlash = 0, visible = true, started = false, motion = 8;
    video.src = src; if (poster) video.poster = poster;
    video.preload = "auto"; video.hidden = false;

    const draw = () => {
      if (!visible || video.paused) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // detect cuts: big jump in a 32x18 luminance map → light-leak flash on the window
      pctx.drawImage(video, 0, 0, 32, 18);
      const d = pctx.getImageData(0, 0, 32, 18).data, lum = new Float32Array(576);
      let diff = 0;
      for (let i = 0; i < 576; i++) { lum[i] = d[i * 4] * .3 + d[i * 4 + 1] * .59 + d[i * 4 + 2] * .11; if (prev) diff += Math.abs(lum[i] - prev[i]); }
      prev = lum;
      const now = performance.now(), avg = diff / 576;
      // a cut = a sharp spike against the scene's usual motion level
      const isCut = avg > 26 && avg > motion * 3.2;
      motion = motion * .85 + Math.min(avg, 60) * .15;
      if (isCut && now - lastFlash > 1200) {
        lastFlash = now; win.classList.remove("is-flash"); void win.offsetWidth; win.classList.add("is-flash");
      }
    };
    const loop = () => {
      draw();
      if ("requestVideoFrameCallback" in video) video.requestVideoFrameCallback(loop); else requestAnimationFrame(loop);
    };
    video.addEventListener("playing", () => {
      if (started) return;
      started = true;
      const r = (video.videoWidth / video.videoHeight) || 16 / 9;
      canvas.width = 640; canvas.height = Math.round(640 / r);
      canvas.hidden = false; bgPoster.hidden = true; winPoster.hidden = true; useMedia(); loop();
    });
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) { video.play().catch(() => {}); if (started && !("requestVideoFrameCallback" in video)) loop(); }
      else video.pause();
    }).observe(hero);
  })();

  // Contact background showreel (lazy)

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
      const f = Math.floor((now - t0) / (1000 / 25));
      if (f !== last) {
        last = f;
        const s = Math.floor(f / 25);
        tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % 25)}`;
      }
      if (!reduced) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Ticker: duplicate tracks for a seamless loop ---------- */
  const tickers = $$(".ticker__track");
  tickers.forEach(t => (t.innerHTML += t.innerHTML));

  /* ---------- Works ---------- */
  const grid = $("#worksGrid");
  const works = S.WORKS || [];
  const mediaHTML = (w, cls = "", lazy = false) => {
    // lazy: the poster is set only when the card approaches the screen (see posterIO below)
    if (w.video) return `<video class="${cls}" src="${w.video}" ${w.poster ? `${lazy ? "data-poster" : "poster"}="${w.poster}"` : ""} muted playsinline loop preload="none"></video>`;
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
      <div class="work__media">${mediaHTML(w, "", true)}</div>
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
  const posterIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const v = e.target; v.poster = v.dataset.poster; v.removeAttribute("data-poster"); posterIO.unobserve(v);
  }), { rootMargin: "400px 900px" });
  $$("video[data-poster]", grid).forEach(v => posterIO.observe(v));

  // hide filters that have no works yet
  $$(".chip").forEach(chip => {
    const f = chip.dataset.filter;
    if (f !== "all" && !works.some(w => w.category === f)) chip.hidden = true;
  });
  $$(".chip").forEach(chip => chip.addEventListener("click", () => {
    $$(".chip").forEach(c => { c.classList.toggle("is-active", c === chip); c.setAttribute("aria-pressed", c === chip); });
    const f = chip.dataset.filter;
    $$(".work", grid).forEach(w => w.classList.toggle("is-hidden", f !== "all" && w.dataset.cat !== f));
    scroller.scrollTo({ left: 0, behavior: reduced ? "auto" : "smooth" });
    setTimeout(updateWorks, 50);
    if (animated) gsap.fromTo($$(".work:not(.is-hidden)", grid), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .7, ease: "power3.out" });
    window.ScrollTrigger && ScrollTrigger.refresh();
  }));

  /* ---------- Clients logos marquee ---------- */
  const clientsTrack = $(".js-clients");
  if (clientsTrack) {
    const list = (S.CLIENTS || []).filter(c => c.logo);
    const items = list.length
      ? list.map(c => `<span class="client" title="${c.name || ""}"><img src="${c.logo}" alt="${c.name || ""}" loading="lazy"></span>`)
      : Array.from({ length: 8 }, () => `<span class="client client--ph" aria-hidden="true">логотип</span>`);
    const set = items.join("");
    clientsTrack.innerHTML = set + set; // two copies for a seamless loop
    if (!list.length) clientsTrack.closest(".clients").classList.add("is-placeholder");
  }

  /* ---------- About tiles: optional photo / video ---------- */
  $$(".bento .card").forEach((card, i) => {
    const src = (S.ABOUT_MEDIA || [])[i];
    if (!src) return;
    const isVideo = /\.(mp4|webm|mov)$/i.test(src);
    const bg = document.createElement("div");
    bg.className = "card__bg card__media";
    bg.innerHTML = isVideo
      ? `<video src="${src}" poster="${src.replace(/\.(mp4|webm|mov)$/i, ".jpg")}" muted playsinline loop preload="none"></video>`
      : `<img src="${src}" alt="" loading="lazy">`;
    $$(".card__bg", card).forEach(el => el.remove());
    card.prepend(bg);
    card.classList.add("card--media");
    const v = $("video", bg);
    if (v && !reduced) new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { rootMargin: "100px" }).observe(card);
  });

  /* ---------- Hero case stack (sonner-like) ---------- */
  const stack = $(".cases__stack");
  if (stack) {
    const variants = ["fire-bg--car", "fire-bg--mono", ""];
    const picks = works.slice(0, 3);
    const cards = picks.map((w, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "case-card";
      b.setAttribute("data-cursor", "");
      b.innerHTML = `
        <div class="case-card__bg ${w.poster ? "" : "fire-bg " + variants[i % 3]}">${w.poster ? `<img src="${w.poster}" alt="" style="width:100%;height:100%;object-fit:cover">` : ""}</div>
        <span class="tag mono">кейс ${String(i + 1).padStart(2, "0")}</span>
        <div class="case-card__body"><strong>${w.title}</strong><small>${CATS[w.category] || ""}${w.client ? " · " + w.client : ""}</small></div>
        <span class="case-card__arrow">↗</span>`;
      stack.appendChild(b);
      return b;
    });
    let order = cards.map((_, i) => i); // order[pos] = card index
    const count = $(".cases__count"), barI = $(".cases__bar i");
    const paint = () => {
      order.forEach((ci, pos) => { cards[ci].dataset.i = pos; cards[ci].style.setProperty("--i", pos); cards[ci].tabIndex = pos === 0 ? 0 : -1; });
      count.textContent = `${String(order[0] + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
      barI.classList.remove("is-run"); void barI.offsetWidth;
      if (!reduced && cards.length > 1) barI.classList.add("is-run");
    };
    const bring = ci => { const k = order.indexOf(ci); order = order.slice(k).concat(order.slice(0, k)); paint(); };
    cards.forEach((c, ci) => c.addEventListener("click", () => (order[0] === ci ? openModal(picks[ci], c) : bring(ci))));
    barI.addEventListener("animationend", () => bring(order[1]));
    paint();
  }

  /* ---------- QR code for Telegram ---------- */
  const qrBox = $(".js-qr");
  if (qrBox && window.qrcode && S.TELEGRAM_URL) {
    const qr = qrcode(0, "M"); qr.addData(S.TELEGRAM_URL); qr.make();
    const n = qr.getModuleCount();
    const inFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
    let dots = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
      if (qr.isDark(r, c) && !inFinder(r, c)) dots += `<circle cx="${c + .5}" cy="${r + .5}" r=".43"/>`;
    const eye = (x, y) => `<rect x="${x + .5}" y="${y + .5}" width="6" height="6" rx="2" fill="none" stroke="#0a0a0a" stroke-width="1"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx=".9"/>`;
    qrBox.innerHTML = `<svg viewBox="0 0 ${n} ${n}" fill="#0a0a0a" role="img" aria-label="QR-код ссылки на Telegram">${dots}${eye(0, 0)}${eye(n - 7, 0)}${eye(0, n - 7)}</svg>`;
  } else root.classList.add("no-qr");

  /* ---------- Works slider: drag, arrows, progress ---------- */
  const scroller = $(".works__scroller"), bar = $(".works__bar span");
  const prevBtn = $(".js-prev"), nextBtn = $(".js-next");
  let dragMoved = false;
  function updateWorks() {
    const max = scroller.scrollWidth - scroller.clientWidth;
    const p = max > 0 ? scroller.scrollLeft / max : 0;
    bar.style.transform = `scaleX(${Math.max(.04, p)})`;
    prevBtn.disabled = scroller.scrollLeft < 4;
    nextBtn.disabled = scroller.scrollLeft > max - 4;
  }
  const step = dir => {
    const card = $(".work:not(.is-hidden)", grid);
    const w = card ? card.getBoundingClientRect().width + 16 : scroller.clientWidth * .6;
    scroller.scrollBy({ left: dir * w, behavior: reduced ? "auto" : "smooth" });
  };
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));
  scroller.addEventListener("scroll", updateWorks, { passive: true });
  scroller.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  });
  // Mouse drag (touch uses native swipe)
  let dragX = 0, startLeft = 0, dragging = false;
  scroller.addEventListener("pointerdown", e => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    dragging = true; dragMoved = false; dragX = e.clientX; startLeft = scroller.scrollLeft;
  });
  addEventListener("pointermove", e => {
    if (!dragging) return;
    const dx = e.clientX - dragX;
    if (!dragMoved && Math.abs(dx) > 6) { dragMoved = true; scroller.classList.add("is-dragging"); }
    if (dragMoved) scroller.scrollLeft = startLeft - dx;
  });
  addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    if (dragMoved) {
      scroller.classList.remove("is-dragging");
      // snap to nearest card after drag
      const cards = $$(".work:not(.is-hidden)", grid);
      const pad = parseFloat(getComputedStyle(scroller).paddingLeft);
      const near = cards.reduce((a, c) => Math.abs(c.offsetLeft - pad - scroller.scrollLeft) < Math.abs(a.offsetLeft - pad - scroller.scrollLeft) ? c : a, cards[0]);
      near && scroller.scrollTo({ left: near.offsetLeft - pad, behavior: "smooth" });
      setTimeout(() => (dragMoved = false), 0);
    }
  });
  scroller.addEventListener("click", e => { if (dragMoved) { e.stopPropagation(); e.preventDefault(); } }, true);
  updateWorks();

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
    $(".modal__more", modal).href = w.page || "#";
    const mv = $("video", player);
    if (mv) mv.volume = .3; // open quieter — the reels are mixed loud
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
    const big = i === mid && !s.src; // the logo tile is only for the placeholder strip
    f.className = "shot" + (big ? " shot--big" : "") + (s.wide ? " shot--wide" : "") + (s.square ? " shot--square" : "");
    f.style.margin = "0";
    const variants = ["fire-bg--mono", "", "fire-bg--car"];
    f.innerHTML = (s.src ? `<img src="${s.src}" alt="${s.caption || ""}" loading="lazy">` : `<div class="fire-bg ${variants[i % 3]}"></div>`) +
      (big ? `<img class="shot__logo" src="assets/img/logo-white.png" alt="">` : "") +
      `<figcaption>${s.caption || ""}</figcaption>`;
    strip.appendChild(f);
  });

  // backstage: on phones the strip is swiped by hand; elsewhere it loops on its own (needs a second copy)
  const swipePhone = !canHover && matchMedia("(max-width: 720px)").matches;
  if (strip && swipePhone) strip.classList.add("is-swipe");
  else if (strip && strip.children.length) strip.innerHTML += strip.innerHTML;

  /* ---------- Phone swipe rows: a progress line shows there is more to the right ---------- */
  if (swipePhone) {
    [$(".bento"), $(".usp"), strip].forEach(row => {
      if (!row) return;
      const bar = document.createElement("div");
      bar.className = "swipe-bar" + (row === strip ? " swipe-bar--strip" : "");
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = "<span></span>";
      row.after(bar);
      const thumb = bar.firstChild;
      const update = () => {
        const max = row.scrollWidth - row.clientWidth;
        const w = Math.max(.12, row.clientWidth / row.scrollWidth);
        thumb.style.width = w * 100 + "%";
        thumb.style.left = (max > 0 ? row.scrollLeft / max : 0) * (1 - w) * 100 + "%";
      };
      row.addEventListener("scroll", update, { passive: true });
      addEventListener("resize", update);
      update();
    });
  }

  /* ---------- Touch carousels: light up the card you are looking at ---------- */
  if (!canHover && matchMedia("(max-width: 720px)").matches) {
    $$(".bento, .usp").forEach(row => {
      const cards = [...row.children];
      const io = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle("is-active", e.intersectionRatio > .6)),
        { root: row, threshold: [0, .6, 1] });
      cards.forEach(c => io.observe(c));
    });
  }

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
      } else if (n.nodeType === 1 && (n.tagName === "B" || n.tagName === "EM")) {
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
    lenis = new Lenis({ lerp: 0.09, prevent: node => node.classList && node.classList.contains("works__scroller") && false });
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

  /* ---------- Cursor (liquid glass drop), magnetic, service preview, spotlight ---------- */
  const cursor = $(".cursor"), blobLabel = $(".cursor__label");
  if (canHover) {
    root.classList.add("has-cursor");
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy, seen = false;
    const preview = $(".svc-preview"), previewImg = $("img", preview);
    // warm the cache so the first hover shows the frame at once
    $$(".svc__item").forEach(li => { if (li.dataset.preview) new Image().src = li.dataset.preview; });
    let px = cx, py = cy;
    cursor.style.opacity = "0";
    addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; if (!seen) { seen = true; cx = tx; cy = ty; cursor.style.opacity = "1"; } });
    document.addEventListener("mouseleave", () => (cursor.style.opacity = "0"));
    document.addEventListener("mouseenter", () => seen && (cursor.style.opacity = "1"));
    addEventListener("mousedown", () => cursor.classList.add("is-down"));
    addEventListener("mouseup", () => cursor.classList.remove("is-down"));
    const blob = $(".cursor__blob");
    const loop = () => {
      const dx = tx - cx, dy = ty - cy;
      cx += dx * .22; cy += dy * .22;
      px += (tx - px) * .1; py += (ty - py) * .1;
      // liquid stretch along the direction of travel
      const speed = Math.min(Math.hypot(dx, dy), 160);
      const k = cursor.classList.contains("is-big") ? .0012 : .004;
      const st = Math.min(speed * k, .45);
      const ang = Math.atan2(dy, dx) * 180 / Math.PI;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      blob.style.transform = `rotate(${ang}deg) scale(${1 + st}, ${1 - st * .6})${cursor.classList.contains("is-down") ? " scale(.8)" : ""}`;
      if (preview.classList.contains("is-on")) {
        const rot = Math.max(-12, Math.min(12, (tx - px) * .08));
        preview.style.transform = `translate(${px + 40}px, ${py}px) translate(0,-50%) rotate(${rot}deg)`;
      }
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("mouseover", e => {
      const svc = e.target.closest(".svc__item");
      const big = e.target.closest("[data-cursor]") && !svc;
      cursor.classList.toggle("is-big", !!big);
      if (big) blobLabel.textContent = e.target.closest(".tg-card") ? "Написать" : e.target.closest(".works__scroller, .vfwin") ? "Смотреть" : "Открыть";
      if (svc) {
        const want = svc.dataset.preview || "";
        if (want && previewImg.getAttribute("src") !== want) previewImg.src = want;
        if (!preview.classList.contains("is-on")) { px = tx; py = ty; }
        preview.classList.add("is-on");
      } else if (preview.classList.contains("is-on")) { preview.classList.remove("is-on"); }
    });
    const magnet = (el, f) => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * f}px, ${(e.clientY - r.top - r.height / 2) * f * 1.4}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    };
    $$(".magnetic").forEach(el => magnet(el, .2));
    $$(".magnetic-soft").forEach(el => magnet(el, .06));
    // spotlight cards
    $$(".js-spot").forEach(el => el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
    }));
    // hero accent word follows the cursor
    const hero = $(".hero");
    hero.classList.add("is-following");
    hero.addEventListener("mousemove", e => hero.style.setProperty("--mx", `${(1 - e.clientX / innerWidth) * 100}%`));
  }
  $$(".svc__item").forEach(li => {
    const link = $("a", li);
    const go = () => { if (link) location.href = link.href; };
    li.addEventListener("click", go);
    li.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });

  /* ---------- No signal overlay ---------- */
  const signal = $("#signal");
  const setSignal = off => { signal.hidden = !off; lenis && (off ? lenis.stop() : lenis.start()); };
  addEventListener("offline", () => setSignal(true));
  addEventListener("online", () => setSignal(false));
  $(".js-retry").addEventListener("click", () => (navigator.onLine ? setSignal(false) : location.reload()));
  if (navigator.onLine === false) setSignal(true);

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
    .from(".vf__meta", { opacity: 0, duration: .8, stagger: .08 }, .4)
    .to(".hero .line > span", { y: 0, duration: 1.3, stagger: .1 }, .15)
    .to(".stroke path", { strokeDashoffset: 0, duration: 1.4, ease: "power3.inOut" }, .9)
    .to(".hero .reveal", { opacity: 1, y: 0, duration: 1.1, stagger: .1 }, .6)
    .from(".header > *", { y: -24, opacity: 0, duration: 1, stagger: .06 }, .5)
    .from(".hero__scroll", { opacity: 0, duration: 1 }, 1);

  // Hero scroll-out
  gsap.to(".hero__media", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__content", { yPercent: -18, opacity: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "center center", end: "bottom top", scrub: true } });
  gsap.to(".hero__aside", { yPercent: -35, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  if (canHover) {
    const ax = gsap.quickTo(".hero__aside", "x", { duration: .9, ease: "power3.out" });
    const ay = gsap.quickTo(".hero__aside", "y", { duration: .9, ease: "power3.out" });
    $(".hero").addEventListener("mousemove", e => { ax((e.clientX / innerWidth - .5) * -18); ay((e.clientY / innerHeight - .5) * -12); });
  }

  // Ticker reacts to scroll velocity: speeds up and skews
  const anims = tickers.map(t => t.getAnimations()[0]).filter(Boolean);
  const skewTo = gsap.quickTo(".ticker__track", "skewX", { duration: .5, ease: "power3.out" });
  let rate = 1;
  gsap.ticker.add(() => {
    const v = lenis ? lenis.velocity : 0;
    const target = 1 + Math.min(Math.abs(v) * .25, 6);
    rate += (target - rate) * .08;
    anims.forEach(a => (a.playbackRate = rate));
    skewTo(Math.max(-12, Math.min(12, -v * .6)));
  });

  // Seamless crossfades: the page background dissolves between dark and paper
  root.classList.add("morph");
  const BLACK = "#0a0a0a", PAPER = "#ecebe6";
  const scenes = [
    [".ticker", BLACK], ["#about", PAPER], ["#services", BLACK], [".clients", BLACK],
    [".why__banner", BLACK], [".why__body", PAPER], ["#works", BLACK], ["#backstage", PAPER], ["#contact", BLACK],
  ];
  gsap.set(document.body, { backgroundColor: BLACK });
  scenes.reduce((prev, [sel, color]) => {
    const el = $(sel);
    if (el && color !== prev) {
      gsap.fromTo(document.body, { backgroundColor: prev }, {
        backgroundColor: color, ease: "power2.inOut", immediateRender: false,
        scrollTrigger: { trigger: el, start: "top 62%", end: "top 42%", scrub: .4 },
      });
    }
    return el ? color : prev;
  }, BLACK);

  // Section labels appear only once the page background has switched under them
  $$(".section-label").forEach(el => {
    if (el.closest(".hero, .contact")) return;
    gsap.from(el, { opacity: 0, y: 16, duration: .8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 56%" } });
  });

  // Generic reveals
  $$(".reveal").forEach(el => {
    if (el.closest(".hero")) return;
    const late = el.matches(".h2"); // big section titles wait for the background switch
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: late ? "top 56%" : "top 90%" } });
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

  gsap.from(".works__grid", { x: 160, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".works__scroller", start: "top 85%" } });


  // Process line fill
  gsap.to(".process__line", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".process", start: "top 85%", end: "bottom 60%", scrub: true } });

  // Wordmark fire fill
  const wm = $(".wordmark .js-brand-split");
  gsap.to(wm, { backgroundPosition: "0% 0", ease: "none", scrollTrigger: {
    trigger: ".contact", start: "top 70%", end: "top top", scrub: true,
    onUpdate: self => (wm.style.webkitTextStrokeColor = `rgba(255,255,255,${(.22 * (1 - self.progress)).toFixed(3)})`),
  } });

  addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
