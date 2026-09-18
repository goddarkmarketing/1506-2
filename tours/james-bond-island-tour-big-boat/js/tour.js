(() => {
  const HOME = "../../index.html";
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Neutralize leftover external site links ---------- */
  const LOCAL_TOURS = new Set(
    qsa('a[href*="/tours/"], a[href^="../"]').map(() => null)
  );
  // Build from known folder pattern when rewriting
  const known = [
    "green-elephant-sanctuary-park",
    "hong-by-starlight-john-grays-sea-canoe",
    "james-bond-island-tour-big-boat",
    "james-bond-island-tour-speedboat",
    "khai-islands-half-day-tour",
    "khao-sok-day-trip-from-phuket",
    "lazy-james-bond-island-tour-speedboat",
    "lazy-similan-island-tour-speed-catamaran",
    "phi-phi-maya-bay-bamboo-island-tour-speedboat",
    "phi-phi-maya-bay-khai-islands-speedboat",
    "phuket-atv-tour",
    "phuket-bamboo-rafting-tour",
    "phuket-big-game-fishing",
    "phuket-city-tour-half-day",
    "phuket-jetski-tour",
    "phuket-rafting-tour",
    "raya-coral-island-tour-phuket-full-day",
    "similan-island-tour-from-phuket",
    "similan-island-tour-speed-catamaran",
    "utv-adventure-tour",
  ];
  const alias = {
    "phi-phi-islands-maya-bay-bamboo-island-premium-speed-catamaran":
      "phi-phi-maya-bay-bamboo-island-tour-speedboat",
    "phi-phi-maya-bay-khai-islands-by-catamaran":
      "phi-phi-maya-bay-khai-islands-speedboat",
  };

  function localizeHref(href) {
    if (!href) return href;
    if (href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("https://wa.me")) {
      return href;
    }
    if (href.startsWith("#") || href.startsWith("../../") || href.startsWith("../") || href.startsWith("./")) {
      return href;
    }
    try {
      const u = new URL(href, window.location.href);
      const host = u.hostname.replace(/^www\./, "");
      if (
        host === "kohtourphuket.com" ||
        host === "kohtour.com" ||
        host === "kohtourkrabi.com" ||
        host === "kohlanta.tours" ||
        host === "gobangkok.tours"
      ) {
        const path = u.pathname.replace(/\/+$/, "") || "/";
        if (path === "/" || path === "") return HOME;
        if (path.startsWith("/phuket-tours")) return HOME + "#popular";
        if (path === "/faq") return "../../faq/";
        if (path === "/contact" || path === "/about-us") return "../../contact/";
        if (path.startsWith("/tours/")) {
          let slug = path.slice("/tours/".length);
          if (alias[slug]) slug = alias[slug];
          if (known.includes(slug)) return "../" + slug + "/";
          return HOME + "#popular";
        }
        return HOME;
      }
    } catch (_) {}
    return href;
  }

  qsa("a[href]").forEach((a) => {
    const next = localizeHref(a.getAttribute("href"));
    if (next !== a.getAttribute("href")) a.setAttribute("href", next);
  });

  /* ---------- Mobile menu ---------- */
  const openBtn = qs('button[aria-label="Open menu"]');
  const closeBtn = qs('button[aria-label="Close menu"]');
  const drawer = qs('div[role="dialog"][aria-label="Menu"]');
  const overlay = drawer?.previousElementSibling;

  function setMenu(open) {
    if (!drawer) return;
    drawer.style.transform = open ? "translateX(0)" : "translateX(100%)";
    if (overlay?.classList?.contains("fixed")) {
      overlay.classList.toggle("opacity-0", !open);
      overlay.classList.toggle("pointer-events-none", !open);
      overlay.setAttribute("aria-hidden", open ? "false" : "true");
    }
    openBtn?.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }
  openBtn?.addEventListener("click", () => setMenu(true));
  closeBtn?.addEventListener("click", () => setMenu(false));
  overlay?.addEventListener("click", () => setMenu(false));

  /* ---------- Destinations (local) ---------- */
  const destinations = [
    { label: "Chiang Mai", href: "../../destinations/chiang-mai/" },
    { label: "Chiang Rai", href: "../../destinations/chiang-rai/" },
    { label: "Krabi", href: "../../destinations/krabi/" },
    { label: "Koh Samui", href: "../../destinations/koh-samui/" },
    { label: "Phi Phi Bamboo Island", href: "../phi-phi-maya-bay-bamboo-island-tour-speedboat/" },
    { label: "Phi Phi & Khai Islands", href: "../phi-phi-maya-bay-khai-islands-speedboat/" },
    { label: "James Bond Island", href: "../james-bond-island-tour-speedboat/" },
    { label: "Khai Islands", href: "../khai-islands-half-day-tour/" },
    { label: "Similan Islands", href: "../similan-island-tour-from-phuket/" },
    { label: "Raya & Coral Island", href: "../raya-coral-island-tour-phuket-full-day/" },
    { label: "ATV Tour", href: "../phuket-atv-tour/" },
    { label: "City Tour", href: "../phuket-city-tour-half-day/" },
    { label: "All destinations", href: "../../destinations/" },
  ];
  const destHtml = destinations
    .map(
      (d) =>
        `<a class="block rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--brand-secondary)] hover:bg-zinc-100" href="${d.href}">${d.label}</a>`
    )
    .join("");

  const destBtn = qsa('nav[aria-label="Main"] button[aria-haspopup="true"]').find((b) =>
    b.textContent.includes("Destinations")
  );
  if (destBtn) {
    const wrap = destBtn.parentElement;
    wrap.classList.add("relative");
    const panel = document.createElement("div");
    panel.hidden = true;
    panel.className =
      "absolute left-0 top-full z-50 mt-1 min-w-[220px] rounded-xl border border-black/10 bg-white p-2 shadow-lg";
    panel.innerHTML = destHtml;
    wrap.appendChild(panel);
    destBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      panel.hidden = !panel.hidden;
    });
    document.addEventListener("click", () => {
      panel.hidden = true;
    });
  }

  const mobileDest = qsa('nav[aria-label="Mobile"] button[aria-expanded]').find((b) =>
    b.textContent.includes("Destinations")
  );
  if (mobileDest) {
    const sub = document.createElement("div");
    sub.hidden = true;
    sub.className = "space-y-0.5 pb-2 pl-3";
    sub.innerHTML = destHtml;
    mobileDest.parentElement.appendChild(sub);
    mobileDest.addEventListener("click", () => {
      sub.hidden = !sub.hidden;
    });
  }

  /* ---------- Nav links Home/Tours/FAQ/Contact ---------- */
  qsa('nav a').forEach((a) => {
    const t = a.textContent.trim();
    if (t === "Home") a.setAttribute("href", HOME);
    if (t === "Tours") a.setAttribute("href", HOME + "#popular");
    if (t === "FAQ") a.setAttribute("href", "../../faq/");
    if (t === "Contact Us") a.setAttribute("href", "../../contact/");
  });

  /* ---------- How to book link next to FAQ ---------- */
  qsa("nav").forEach((nav) => {
    if (qsa("a", nav).some((a) => /how to book/i.test(a.textContent))) return;
    const faq = qsa("a", nav).find((a) => a.textContent.trim() === "FAQ");
    if (!faq) return;
    const item = faq.closest("li");
    if (!item) return;
    const clone = item.cloneNode(true);
    const link = clone.querySelector("a");
    link.textContent = "How to book";
    link.setAttribute("href", "../../how-to-book/");
    item.parentElement.insertBefore(clone, item);
  });

  /* ---------- Currency / search: stay local ---------- */
  qsa('button[aria-haspopup="dialog"]').forEach((btn) => {
    if (!/Currency|THB|currency/i.test(btn.getAttribute("aria-label") || btn.textContent)) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.add("ring-2", "ring-[color:var(--brand-primary)]");
      setTimeout(() => btn.classList.remove("ring-2", "ring-[color:var(--brand-primary)]"), 600);
    });
  });
  qsa('form[role="search"]').forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      window.location.href = HOME + "#popular";
    });
  });

  /* ---------- Section tabs ---------- */
  const tabBtns = qsa("button[data-tab-id]");
  function setActiveTab(id) {
    tabBtns.forEach((btn) => {
      const active = btn.getAttribute("data-tab-id") === id;
      btn.classList.toggle("text-zinc-600", !active);
      btn.classList.toggle("hover:text-zinc-900", !active);
      btn.classList.toggle("text-[color:var(--brand-primary)]", active);
      const bar = btn.querySelector("span[aria-hidden='true']");
      if (bar) bar.style.opacity = active ? "1" : "0";
    });
  }
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-tab-id");
      setActiveTab(id);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  if (tabBtns.length) setActiveTab("description");

  if ("IntersectionObserver" in window) {
    const ids = [...new Set(tabBtns.map((b) => b.getAttribute("data-tab-id")))];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveTab(entry.target.id);
        });
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ---------- FAQ ---------- */
  qsa("#faqs button[aria-expanded]").forEach((btn) => {
    const panel = btn.nextElementSibling;
    if (!panel) return;
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      const wrap = btn.closest(".divide-y, .rounded-2xl, #faqs");
      qsa("button[aria-expanded]", wrap).forEach((other) => {
        if (other === btn) return;
        other.setAttribute("aria-expanded", "false");
        const p = other.nextElementSibling;
        if (p?.style) {
          p.style.maxHeight = "0px";
          p.style.opacity = "0";
        }
        const icon = other.querySelector("span[aria-hidden='true'], [data-faq-icon]");
        if (icon && (icon.textContent.trim() === "−" || icon.textContent.trim() === "+")) {
          icon.textContent = "+";
        }
      });
      const next = !open;
      btn.setAttribute("aria-expanded", next ? "true" : "false");
      panel.style.maxHeight = next ? panel.scrollHeight + 32 + "px" : "0px";
      panel.style.opacity = next ? "1" : "0";
      const icon = btn.querySelector("span[aria-hidden='true'], [data-faq-icon]");
      if (icon && (icon.textContent.trim() === "+" || icon.textContent.trim() === "−")) {
        icon.textContent = next ? "−" : "+";
      }
    });
  });

  /* ---------- Section accordions: What to bring / Pickup / Meeting point ---------- */
  function setSectionAccordion(btn, open) {
    const panel = btn.nextElementSibling;
    if (!panel) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    panel.style.gridTemplateRows = open ? "1fr" : "0fr";
    panel.style.opacity = open ? "1" : "0";
    panel.classList.toggle("grid-rows-[1fr]", open);
    panel.classList.toggle("grid-rows-[0fr]", !open);
    panel.classList.toggle("opacity-0", !open);
    panel.classList.toggle("opacity-100", open);
    const chevron = btn.querySelector("span[aria-hidden='true']");
    if (chevron) chevron.style.transform = open ? "rotate(180deg)" : "rotate(0deg)";
  }

  qsa(
    "#what-to-bring button[aria-expanded], #pickup-areas button[aria-expanded], #meeting-point button[aria-expanded], #included button[aria-expanded]"
  ).forEach((btn) => {
    // Only the section header buttons (contain h2), not nested ones
    if (!btn.querySelector("h2")) return;
    const panel = btn.nextElementSibling;
    if (!panel || !panel.classList.contains("grid")) return;
    setSectionAccordion(btn, btn.getAttribute("aria-expanded") === "true");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const open = btn.getAttribute("aria-expanded") === "true";
      setSectionAccordion(btn, !open);
    });
  });

  /* ---------- Read more ---------- */
  qsa("button").forEach((el) => {
    if (!el.textContent.trim().startsWith("Read more")) return;
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const section = el.closest("#description") || el.closest("section");
      const more = section?.querySelector("[style*='grid-template-rows']");
      if (!more) return;
      const open = more.style.gridTemplateRows === "1fr";
      more.style.gridTemplateRows = open ? "0fr" : "1fr";
      more.style.opacity = open ? "0" : "1";
      const label = el.childNodes[0];
      if (label && label.nodeType === 3) {
        label.textContent = open ? "Read more" : "Read less";
      }
    });
  });

  /* ---------- Gallery lightbox slider ---------- */
  const lightbox = document.getElementById("gallery-lightbox");
  let lbImgs = [];
  let lbIndex = 0;

  function collectGallery() {
    const seen = new Set();
    lbImgs = [];
    qsa('button[popovertarget="gallery-lightbox"] img, [aria-label^="Open photo"] img, main img').forEach(
      (img) => {
        const src = img.getAttribute("src") || img.currentSrc || "";
        if (!src || src.includes("logo") || src.includes("favicon")) return;
        if (!src.includes("images/")) return;
        if (seen.has(src)) return;
        seen.add(src);
        lbImgs.push({
          src,
          srcset: img.getAttribute("srcset") || "",
          alt: img.getAttribute("alt") || "",
        });
      }
    );
    // Prefer lightbox's own imgs if present
    if (lightbox) {
      const fromLb = [];
      const seen2 = new Set();
      qsa("img", lightbox).forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (!src || seen2.has(src)) return;
        seen2.add(src);
        fromLb.push({
          src,
          srcset: img.getAttribute("srcset") || "",
          alt: img.getAttribute("alt") || "",
        });
      });
      if (fromLb.length >= 2) lbImgs = fromLb;
    }
  }

  function renderLightbox() {
    if (!lightbox || !lbImgs.length) return;
    const img = lightbox.querySelector(".relative.flex-1 img, .relative.h-full img, img");
    const counter = lightbox.querySelector(".flex.shrink-0 span, [class*='text-sm']");
    const item = lbImgs[lbIndex];
    if (img && item) {
      img.setAttribute("src", item.src);
      if (item.srcset) img.setAttribute("srcset", item.srcset);
      if (item.alt) img.setAttribute("alt", item.alt);
    }
    // Update "1 / 8" style counters
    qsa("span", lightbox).forEach((sp) => {
      const t = sp.textContent.replace(/\s+/g, " ").trim();
      if (/^\d+\s*\/\s*\d+$/.test(t) || sp.parentElement?.className.includes("shrink-0")) {
        if (sp.childNodes.length <= 3 || /^\d/.test(t)) {
          sp.textContent = `${lbIndex + 1} / ${lbImgs.length}`;
        }
      }
    });
    const head = lightbox.querySelector(".flex.shrink-0.items-center span");
    if (head) head.textContent = `${lbIndex + 1} / ${lbImgs.length}`;
  }

  function openGallery(i) {
    collectGallery();
    if (!lbImgs.length) return;
    lbIndex = ((i % lbImgs.length) + lbImgs.length) % lbImgs.length;
    renderLightbox();
    if (lightbox?.showPopover) {
      try {
        lightbox.showPopover();
      } catch (_) {
        lightbox.style.display = "flex";
      }
    } else if (lightbox) {
      lightbox.style.display = "flex";
      lightbox.setAttribute("open", "");
    }
  }

  if (lightbox) {
    collectGallery();
    qs('button[aria-label="Previous photo"]', lightbox)?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!lbImgs.length) collectGallery();
      lbIndex = (lbIndex - 1 + lbImgs.length) % lbImgs.length;
      renderLightbox();
    });
    qs('button[aria-label="Next photo"]', lightbox)?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!lbImgs.length) collectGallery();
      lbIndex = (lbIndex + 1) % lbImgs.length;
      renderLightbox();
    });

    // Thumb buttons / open photo
    qsa('button[popovertarget="gallery-lightbox"], button[aria-label^="Open photo"]').forEach(
      (btn, i) => {
        btn.addEventListener("click", () => {
          // slight delay so popover opens first
          setTimeout(() => openGallery(i), 0);
        });
      }
    );

    // Thumbnail strip inside lightbox
    qsa('button[aria-label^="Photo "]', lightbox).forEach((btn) => {
      btn.addEventListener("click", () => {
        const n = parseInt(btn.getAttribute("aria-label").replace(/\D/g, ""), 10);
        if (!Number.isNaN(n)) {
          lbIndex = n - 1;
          renderLightbox();
        }
      });
    });
  }

  /* ---------- Booking card: date, qty, live total, Book now ---------- */
  const card = document.getElementById("booking-card");
  if (card) {
    const BOOK_URL = "../../book/";
    const STORAGE_KEY = "dg_booking_draft";

    function parsePrice(text) {
      const m = String(text).replace(/,/g, "").match(/(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    }

    function tomorrowISO() {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    }

    // Inject date picker above guest rows
    if (!card.querySelector("[data-dg-date]")) {
      const guestWrap = card.querySelector(".mt-4.space-y-2") || card.querySelector(".space-y-2");
      const dateBlock = document.createElement("div");
      dateBlock.className = "mt-4";
      dateBlock.innerHTML = `
        <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500" for="dg-tour-date">Tour date</label>
        <input data-dg-date type="date" id="dg-tour-date" class="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-semibold text-[color:var(--brand-secondary)] outline-none focus:border-[color:var(--brand-primary)]" />`;
      if (guestWrap) guestWrap.parentNode.insertBefore(dateBlock, guestWrap);
      else card.insertBefore(dateBlock, card.querySelector("a"));
      const dateInput = dateBlock.querySelector("input");
      dateInput.min = tomorrowISO();
      dateInput.value = tomorrowISO();
    }

    const qtyState = { adults: 1, children: 0 };

    const rows = qsa("label", card);
    rows.forEach((label) => {
      const row = label.nextElementSibling;
      if (!row || !row.className.includes("flex")) return;
      const countEl = row.querySelector(".tabular-nums");
      if (!countEl) return;
      const isChild = /child/i.test(label.textContent);
      let count = parseInt(countEl.textContent.trim(), 10);
      if (Number.isNaN(count)) count = isChild ? 0 : 1;
      const min = isChild ? 0 : 1;
      if (isChild) qtyState.children = count;
      else qtyState.adults = count;

      const controls = document.createElement("div");
      controls.className = "flex items-center gap-2";
      controls.innerHTML = `
        <button type="button" data-qty="-1" class="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-lg leading-none hover:bg-zinc-50" aria-label="Decrease">−</button>
        <span class="tabular-nums text-sm font-semibold w-4 text-center" data-dg-count="${isChild ? "children" : "adults"}">${count}</span>
        <button type="button" data-qty="1" class="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-lg leading-none hover:bg-zinc-50" aria-label="Increase">+</button>`;
      countEl.replaceWith(controls);
      const val = controls.querySelector("span");
      controls.querySelectorAll("button").forEach((b) => {
        b.addEventListener("click", () => {
          const delta = parseInt(b.getAttribute("data-qty"), 10);
          count = Math.max(min, Math.min(20, count + delta));
          val.textContent = String(count);
          if (isChild) qtyState.children = count;
          else qtyState.adults = count;
          updateBookingTotal();
        });
      });
    });

    function getPrices() {
      const priceSpans = qsa(".text-sm.text-zinc-700", card);
      return {
        adultPrice: priceSpans[0] ? parsePrice(priceSpans[0].textContent) : 0,
        childPrice: priceSpans[1] ? parsePrice(priceSpans[1].textContent) : 0,
      };
    }

    function tourTitle() {
      const h1 = qs("h1");
      if (h1) return h1.textContent.replace(/\s+/g, " ").trim();
      return (document.title || "Phuket tour").split("|")[0].trim();
    }

    function tourSlug() {
      const parts = location.pathname.split("/").filter(Boolean);
      return parts[parts.length - 1] || parts[parts.length - 2] || "";
    }

    function updateBookingTotal() {
      const { adultPrice, childPrice } = getPrices();
      const total = adultPrice * qtyState.adults + childPrice * qtyState.children;
      const fromPrice = card.querySelector(".text-3xl");
      if (fromPrice && total > 0) {
        fromPrice.innerHTML = "&#3647;" + total.toLocaleString("en-US");
      }
      const per = fromPrice?.nextElementSibling;
      if (per && qtyState.adults + qtyState.children > 1) per.textContent = "total";
      else if (per) per.textContent = "per person";
    }
    updateBookingTotal();

    function buildDraft() {
      const { adultPrice, childPrice } = getPrices();
      const dateEl = card.querySelector("[data-dg-date]");
      return {
        title: tourTitle(),
        slug: tourSlug(),
        returnUrl: "../tours/" + tourSlug() + "/",
        adultPrice,
        childPrice,
        adults: qtyState.adults,
        children: qtyState.children,
        infants: 0,
        date: dateEl?.value || tomorrowISO(),
        payMode: "deposit",
      };
    }

    const book = qsa("a", card).find((a) => /Book now/i.test(a.textContent));
    if (book) {
      book.setAttribute("href", BOOK_URL);
      book.addEventListener("click", (e) => {
        e.preventDefault();
        const dateEl = card.querySelector("[data-dg-date]");
        if (dateEl && !dateEl.value) {
          dateEl.focus();
          return;
        }
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(buildDraft()));
        } catch (_) {}
        location.href = BOOK_URL;
      });
    }

    const chat = qsa("a", card).find((a) => /^Chat$/i.test(a.textContent.trim()));
    if (chat) chat.setAttribute("href", "../../contact/");
  }

  /* ---------- Save / Share ---------- */
  qsa("button[data-kt-save]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", on ? "false" : "true");
      btn.classList.toggle("text-[color:var(--brand-primary)]", !on);
      const label = btn.querySelector("span");
      if (label && /Save|Saved/i.test(label.textContent)) {
        label.textContent = on ? "Save" : "Saved";
      }
    });
  });
  qsa("button").forEach((btn) => {
    const label = (btn.textContent || "").replace(/\s+/g, " ").trim();
    if (!/^Share$/i.test(label) && !/Share$/i.test(label)) return;
    if (btn.closest("#faqs") || btn.closest("#description")) return;
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(window.location.href);
        const span = [...btn.querySelectorAll("span")].pop() || btn;
        const old = span.textContent;
        span.textContent = "Copied";
        setTimeout(() => {
          span.textContent = /Copied/i.test(old) ? "Share" : old;
        }, 1200);
      } catch (_) {}
    });
  });

  /* Maps link -> stay local */
  qsa('a[href*="maps.google"]').forEach((a) => a.setAttribute("href", "../../contact/"));

  /* ---------- Reviews carousel nudge ---------- */
  qsa("ul.snap-x, ul[class*='snap-x']").forEach((ul) => {
    ul.style.scrollBehavior = "smooth";
  });

  /* ---------- Header shadow ---------- */
  const header = qs("header");
  if (header) {
    window.addEventListener(
      "scroll",
      () => {
        header.classList.toggle("shadow-sm", window.scrollY > 8);
        header.classList.toggle("border-black/5", window.scrollY > 8);
      },
      { passive: true }
    );
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });
})();
