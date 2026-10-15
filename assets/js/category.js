/* Service pages (reklama / vertikalnyj-kontent / imidzhevye-filmy):
   all works of one category from config.js + the same player as on the main page. */
(() => {
  const S = window.SITE || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const canHover = matchMedia("(hover: hover)").matches;

  $$(".js-tg").forEach(a => { a.href = S.TELEGRAM_URL || "#"; a.target = "_blank"; a.rel = "noopener"; });
  $$(".js-year").forEach(el => (el.textContent = new Date().getFullYear()));

  const cat = document.body.dataset.cat;
  const works = (S.WORKS || []).filter(w => w.category === cat);
  const grid = $("#catGrid");
  $$(".js-count").forEach(el => (el.textContent = works.length));

  works.forEach((w, i) => {
    const el = document.createElement("article");
    el.className = `work ${w.ratio === "vertical" ? "work--vertical" : ""}`;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `Смотреть «${w.title}»`);
    el.tabIndex = 0;
    el.innerHTML = `
      <div class="work__media"><video src="${w.video}" poster="${w.poster || ""}" muted playsinline loop preload="none"></video></div>
      <span class="work__idx mono">${String(i + 1).padStart(2, "0")} / ${String(works.length).padStart(2, "0")}</span>
      <span class="work__play"></span>
      <div class="work__info"><small>${w.client || ""}</small><h3>${w.title}</h3></div>`;
    const vid = $("video", el);
    if (canHover) {
      el.addEventListener("mouseenter", () => { vid.preload = "auto"; vid.play().catch(() => {}); });
      el.addEventListener("mouseleave", () => vid.pause());
    }
    el.addEventListener("click", () => openModal(w, el));
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(w, el); } });
    grid.appendChild(el);
  });

  /* ---------- Player ---------- */
  const modal = $("#modal"), player = $(".modal__player", modal);
  let lastFocus = null;
  function openModal(w, trigger) {
    lastFocus = trigger;
    player.classList.toggle("modal__player--vertical", w.ratio === "vertical");
    player.innerHTML = `<video src="${w.video}" poster="${w.poster || ""}" controls autoplay playsinline></video>`;
    $(".modal__cat", modal).textContent = w.client || "";
    $(".modal__title", modal).textContent = w.title;
    $(".modal__task", modal).textContent = w.task || "";
    $("video", player).volume = .3; // the reels are mixed loud
    modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => $(".modal__close", modal).focus(), 50);
  }
  function closeModal() {
    modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true");
    const v = $("video", player); v && v.pause();
    setTimeout(() => (player.innerHTML = ""), 500);
    document.documentElement.style.overflow = "";
    lastFocus && lastFocus.focus();
  }
  $$("[data-close]", modal).forEach(b => b.addEventListener("click", closeModal));
  addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal(); });
})();
