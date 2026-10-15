/* Service and project pages: the cards are in the HTML (for search engines),
   this adds hover previews, the player modal and the Telegram links. */
(() => {
  const S = window.SITE || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const canHover = matchMedia("(hover: hover)").matches;

  $$(".js-tg").forEach(a => { a.href = S.TELEGRAM_URL || "#"; a.target = "_blank"; a.rel = "noopener"; });
  $$(".js-year").forEach(el => (el.textContent = new Date().getFullYear()));
  // project page player: open quieter — the reels are mixed loud
  $$(".case__player video").forEach(v => (v.volume = .3));

  const modal = $("#modal");
  const works = S.WORKS || [];
  $$(".svc-grid .work").forEach(el => {
    const w = works.find(x => x.page === el.dataset.page);
    if (!w || !modal) return;
    const vid = $("video", el);
    if (canHover) {
      el.addEventListener("mouseenter", () => { vid.preload = "auto"; vid.play().catch(() => {}); });
      el.addEventListener("mouseleave", () => vid.pause());
    }
    el.addEventListener("click", e => { if (!e.target.closest("a")) { e.preventDefault(); openModal(w, el); } });
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(w, el); } });
  });
  if (!modal) return;

  /* ---------- Player ---------- */
  const player = $(".modal__player", modal);
  let lastFocus = null;
  function openModal(w, trigger) {
    lastFocus = trigger;
    player.classList.toggle("modal__player--vertical", w.ratio === "vertical");
    player.innerHTML = `<video src="${w.video}" poster="${w.poster || ""}" controls autoplay playsinline></video>`;
    $(".modal__cat", modal).textContent = w.client || "";
    $(".modal__title", modal).textContent = w.title;
    $(".modal__task", modal).textContent = w.task || "";
    $(".modal__more", modal).href = w.page || "#";
    $("video", player).volume = .3;
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
