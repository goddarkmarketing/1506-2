(() => {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Gallery ---------- */
  const main = qs("[data-dg-gallery-main]");
  const thumbs = qsa("[data-dg-gallery-thumb]");
  if (main && thumbs.length) {
    const show = (btn) => {
      const src = btn.getAttribute("data-src");
      if (!src) return;
      main.src = src;
      thumbs.forEach((t) => t.setAttribute("aria-current", t === btn ? "true" : "false"));
    };
    thumbs.forEach((btn) => btn.addEventListener("click", () => show(btn)));
    show(thumbs[0]);
  }

  /* ---------- Section tabs + scroll spy ---------- */
  const tabs = qsa("[data-dg-tab]");
  if (tabs.length) {
    const sections = tabs
      .map((t) => qs(t.getAttribute("href")))
      .filter(Boolean);

    const setActive = (id) => {
      tabs.forEach((t) =>
        t.classList.toggle("is-active", t.getAttribute("href") === "#" + id)
      );
    };

    if ("IntersectionObserver" in window && sections.length) {
      const io = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          if (visible) setActive(visible.target.id);
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach((s) => io.observe(s));
    }
    setActive(sections.length ? sections[0].id : "");
  }

  /* ---------- Booking card ---------- */
  const card = qs("#booking-card");
  if (!card) return;

  const STORAGE_KEY = "dg_booking_draft";
  const BOOK_URL = "../../book/";
  const adultPrice = Number(card.getAttribute("data-adult-price")) || 0;
  const childPrice = Number(card.getAttribute("data-child-price")) || 0;
  const enquire = adultPrice <= 0;

  const state = { adults: 1, children: 0 };
  const dateEl = qs("[data-dg-date]", card);
  const totalEl = qs("[data-dg-total]", card);

  function tomorrowISO() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }

  if (dateEl) {
    dateEl.min = tomorrowISO();
    if (!dateEl.value) dateEl.value = tomorrowISO();
  }

  function money(n) {
    return "฿" + Math.round(n).toLocaleString("en-US");
  }

  function render() {
    qsa("[data-dg-qty]", card).forEach((row) => {
      const key = row.getAttribute("data-dg-qty");
      const val = qs("[data-dg-qty-val]", row);
      if (val) val.textContent = String(state[key]);
    });
    if (totalEl) {
      totalEl.textContent = enquire
        ? "Quoted on request"
        : money(state.adults * adultPrice + state.children * childPrice);
    }
  }

  qsa("[data-dg-qty] button", card).forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("[data-dg-qty]");
      const key = row.getAttribute("data-dg-qty");
      const delta = Number(btn.getAttribute("data-delta")) || 0;
      const min = key === "adults" ? 1 : 0;
      state[key] = Math.min(20, Math.max(min, state[key] + delta));
      render();
    });
  });

  const bookBtn = qs("[data-dg-book]", card);
  if (bookBtn) {
    bookBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (dateEl && !dateEl.value) {
        dateEl.focus();
        return;
      }
      const draft = {
        title: card.getAttribute("data-title") || document.title,
        slug: card.getAttribute("data-slug") || "",
        returnUrl: "../tours/" + (card.getAttribute("data-slug") || "") + "/",
        adultPrice,
        childPrice,
        enquire,
        adults: state.adults,
        children: state.children,
        infants: 0,
        date: dateEl ? dateEl.value : tomorrowISO(),
        payMode: enquire ? "enquire" : "deposit",
      };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch (_) {}
      location.href = BOOK_URL;
    });
  }

  render();
})();
