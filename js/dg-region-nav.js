(() => {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Destinations menus (header dropdown + drawer accordion) ---------- */
  qsa("[data-dg-dest-toggle]").forEach((btn) => {
    const menu = btn.parentElement.querySelector("[data-dg-dest-menu]");
    if (!menu) return;
    const chevron = btn.querySelector("svg");

    const setOpen = (open) => {
      menu.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (chevron) chevron.style.transform = open ? "rotate(180deg)" : "";
    };

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(menu.hidden);
    });

    document.addEventListener("click", (e) => {
      if (!menu.hidden && !btn.parentElement.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  });

  /* ---------- Mobile drawer ---------- */
  const drawer = qs("[data-dg-drawer]");
  const overlay = qs("[data-dg-drawer-overlay]");
  const openBtn = qs("[data-dg-menu-open]");
  const closeBtn = qs("[data-dg-menu-close]");

  function setMenu(open) {
    if (!drawer) return;
    drawer.hidden = false;
    if (overlay) overlay.hidden = false;
    // Let the elements paint before the transform so the slide-in is visible.
    requestAnimationFrame(() => {
      drawer.classList.toggle("is-open", open);
      if (overlay) overlay.classList.toggle("is-open", open);
    });
    if (openBtn) openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) {
      window.setTimeout(() => {
        if (drawer.classList.contains("is-open")) return;
        drawer.hidden = true;
        if (overlay) overlay.hidden = true;
      }, 300);
    }
  }

  openBtn?.addEventListener("click", () => setMenu(true));
  closeBtn?.addEventListener("click", () => setMenu(false));
  overlay?.addEventListener("click", () => setMenu(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------- Header search: same behaviour as the homepage (jump to the grid) ---------- */
  qsa("[data-dg-header-search]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const base = form.getAttribute("action") || "index.html";
      location.href = base + "#popular";
    });
  });

  /* ---------- Sticky header shadow, matching the homepage ---------- */
  const header = qs("[data-dg-header]");
  if (header) {
    const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
