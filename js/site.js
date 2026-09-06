(() => {
  function qs(sel, root = document) {
    return root.querySelector(sel);
  }
  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  /* Keep clicks inside this local site */
  qsa("a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (/^https?:\/\/(www\.)?kohtour(phuket|krabi)?\.com/i.test(href) ||
        /^https?:\/\/(kohlanta|gobangkok)\.tours/i.test(href)) {
      if (/\/tours\/([^/?#]+)/.test(href)) {
        const slug = href.match(/\/tours\/([^/?#]+)/)[1];
        a.setAttribute("href", "tours/" + slug + "/");
      } else if (/faq/i.test(href)) a.setAttribute("href", "faq/");
      else if (/contact|about/i.test(href)) a.setAttribute("href", "contact/");
      else if (/phuket-tours/i.test(href)) a.setAttribute("href", "#popular");
      else a.setAttribute("href", "index.html");
    }
  });

  /* ---------- Mobile menu ---------- */
  const openBtn = qs('button[aria-label="Open menu"]');
  const closeBtn = qs('button[aria-label="Close menu"]');
  const drawer = qs('div[role="dialog"][aria-label="Menu"]');
  const overlay = drawer?.previousElementSibling;

  function setMenu(open) {
    if (!drawer) return;
    drawer.style.transform = open ? "translateX(0)" : "translateX(100%)";
    if (overlay && overlay.classList.contains("fixed")) {
      overlay.classList.toggle("opacity-0", !open);
      overlay.classList.toggle("pointer-events-none", !open);
      overlay.setAttribute("aria-hidden", open ? "false" : "true");
    }
    if (openBtn) openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }

  openBtn?.addEventListener("click", () => setMenu(true));
  closeBtn?.addEventListener("click", () => setMenu(false));
  overlay?.addEventListener("click", () => setMenu(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* Currency stays local */
  qsa('button[aria-haspopup="dialog"]').forEach((btn) => {
    if (!/Currency|THB/i.test(btn.getAttribute("aria-label") || btn.textContent || "")) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  qsa('form[role="search"]').forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (form.id === "dg-hero-search") {
        const dest = form.querySelector('[data-dg-dest-select]')?.value || "";
        if (dest) {
          window.location.href = dest;
          return;
        }
      }
      document.getElementById("popular")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* Hero search: custom destination menu + date button */
  (() => {
    const root = qs("#dg-hero-search");
    if (!root) return;

    const select = qs("[data-dg-dest-select]", root);
    const btn = qs("[data-dg-dest-btn]", root);
    const label = qs("[data-dg-dest-label]", root);
    const menu = qs("[data-dg-dest-menu]", root);
    const whenBtn = qs("[data-dg-when-btn]", root);
    const whenLabel = qs("[data-dg-when-label]", root);
    const whenInput = qs("[data-dg-when-input]", root);

    function closeMenu() {
      if (!menu || !btn) return;
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
      if (!menu || !btn || !select) return;
      menu.innerHTML = "";
      Array.from(select.options).forEach((opt, i) => {
        if (i === 0) return;
        const li = document.createElement("li");
        const b = document.createElement("button");
        b.type = "button";
        b.className = "dg-bar__option";
        b.setAttribute("role", "option");
        b.setAttribute("aria-selected", opt.selected ? "true" : "false");
        b.textContent = opt.textContent;
        b.addEventListener("click", () => {
          select.value = opt.value;
          label.textContent = opt.textContent;
          btn.classList.add("is-filled");
          closeMenu();
        });
        li.appendChild(b);
        menu.appendChild(li);
      });
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    }

    btn?.addEventListener("click", (e) => {
      e.preventDefault();
      if (menu?.hidden) openMenu();
      else closeMenu();
    });

    document.addEventListener("click", (e) => {
      if (!root.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    whenBtn?.addEventListener("click", () => {
      if (!whenInput) return;
      if (typeof whenInput.showPicker === "function") whenInput.showPicker();
      else whenInput.focus();
    });
    whenInput?.addEventListener("change", () => {
      if (!whenLabel || !whenBtn) return;
      if (whenInput.value) {
        const d = new Date(whenInput.value + "T00:00:00");
        whenLabel.textContent = d.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        whenBtn.classList.add("is-filled");
      } else {
        whenLabel.textContent = "Add dates";
        whenBtn.classList.remove("is-filled");
      }
    });
  })();

  qsa("nav a").forEach((a) => {
    const t = a.textContent.trim();
    if (t === "Tours") a.setAttribute("href", "#popular");
    if (t === "FAQ") a.setAttribute("href", "faq/");
    if (t === "Contact Us") a.setAttribute("href", "contact/");
    if (t === "Home") a.setAttribute("href", "index.html");
  });

  /* ---------- Destinations dropdown (desktop) ---------- */
  const destBtn = qsa('nav[aria-label="Main"] button[aria-haspopup="true"]').find(
    (b) => b.textContent.includes("Destinations")
  );

  const destinations = [
    { label: "Phi Phi Bamboo Island", href: "tours/phi-phi-maya-bay-bamboo-island-tour-speedboat/" },
    { label: "Phi Phi & Khai Islands", href: "tours/phi-phi-maya-bay-khai-islands-speedboat/" },
    { label: "James Bond Island", href: "tours/james-bond-island-tour-speedboat/" },
    { label: "Khai Islands", href: "tours/khai-islands-half-day-tour/" },
    { label: "Similan Islands", href: "tours/similan-island-tour-from-phuket/" },
    { label: "Raya & Coral Island", href: "tours/raya-coral-island-tour-phuket-full-day/" },
    { label: "ATV Tour", href: "tours/phuket-atv-tour/" },
    { label: "City Tour", href: "tours/phuket-city-tour-half-day/" },
  ];

  function destLinksHtml(linkClass) {
    return destinations
      .map((d) => `<a class="${linkClass}" href="${d.href}">${d.label}</a>`)
      .join("");
  }

  if (destBtn) {
    const wrap = destBtn.parentElement;
    wrap.classList.add("relative");
    const panel = document.createElement("div");
    panel.hidden = true;
    panel.className =
      "absolute left-0 top-full z-50 mt-1 min-w-[220px] rounded-xl border border-black/10 bg-white p-2 shadow-lg";
    panel.innerHTML = destLinksHtml(
      "block rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--brand-secondary)] hover:bg-zinc-100"
    );
    wrap.appendChild(panel);

    destBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = panel.hidden;
      panel.hidden = !open;
      destBtn.setAttribute("aria-expanded", open ? "true" : "false");
      const chevron = destBtn.querySelector("svg");
      if (chevron) chevron.style.transform = open ? "rotate(180deg)" : "";
    });

    document.addEventListener("click", () => {
      panel.hidden = true;
      destBtn.setAttribute("aria-expanded", "false");
      const chevron = destBtn.querySelector("svg");
      if (chevron) chevron.style.transform = "";
    });
  }

  /* Mobile destinations accordion */
  const mobileDestBtn = qsa('nav[aria-label="Mobile"] button[aria-expanded]').find(
    (b) => b.textContent.includes("Destinations")
  );
  if (mobileDestBtn) {
    const li = mobileDestBtn.parentElement;
    const sub = document.createElement("div");
    sub.hidden = true;
    sub.className = "space-y-0.5 pb-2 pl-3";
    sub.innerHTML = destLinksHtml(
      "block rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--brand-secondary)] hover:bg-zinc-100"
    );
    li.appendChild(sub);
    mobileDestBtn.addEventListener("click", () => {
      const open = sub.hidden;
      sub.hidden = !open;
      mobileDestBtn.setAttribute("aria-expanded", open ? "true" : "false");
      const chevron = mobileDestBtn.querySelector("svg");
      if (chevron) chevron.style.transform = open ? "rotate(180deg)" : "";
    });
  }

  /* ---------- FAQ accordion ---------- */
  qsa("button[aria-expanded]").forEach((btn) => {
    const panel = btn.closest("h3")?.nextElementSibling;
    if (!panel || !panel.classList.contains("grid")) return;
    if (!btn.querySelector("span")?.textContent?.trim()) return;
    // skip menu / currency buttons
    if (btn.getAttribute("aria-haspopup") || btn.getAttribute("aria-label")) return;

    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      const next = !open;
      btn.setAttribute("aria-expanded", next ? "true" : "false");
      panel.classList.toggle("grid-rows-[0fr]", !next);
      panel.classList.toggle("grid-rows-[1fr]", next);
      const chevron = btn.querySelector("svg");
      if (chevron) chevron.style.transform = next ? "rotate(180deg)" : "";
    });
  });

  /* ---------- Horizontal carousels ---------- */
  qsa('button[aria-label="Scroll right"], button[aria-label="Scroll left"]').forEach((btn) => {
    const parent = btn.parentElement;
    const scroller =
      parent?.querySelector("ul.snap-x, ul[class*='snap-x'], ul[class*='overflow-x']") ||
      (btn.previousElementSibling?.tagName === "UL" ? btn.previousElementSibling : null) ||
      parent?.querySelector("ul");

    if (!scroller) return;
    // Destinations loop carousel handles its own arrows
    if (scroller.hasAttribute("data-dg-dest-carousel")) return;

    btn.addEventListener("click", () => {
      const dir = btn.getAttribute("aria-label")?.includes("left") ? -1 : 1;
      const amount = Math.max(280, scroller.clientWidth * 0.8) * dir;
      scroller.scrollBy({ left: amount, behavior: "smooth" });
    });
  });

  qsa("ul.snap-x, ul[class*='overflow-x']").forEach((ul) => {
    if (ul.hasAttribute("data-dg-dest-carousel")) return;
    ul.style.scrollBehavior = "smooth";
  });

  /* ---------- Destinations carousel: full cards + infinite loop ---------- */
  function initDestCarousel(ul) {
    if (!ul || ul.dataset.dgLoopReady === "1") return;
    ul.dataset.dgLoopReady = "1";

    const GAP = 16;
    const originals = Array.from(ul.children);
    if (!originals.length) return;

    ul.classList.remove("snap-x", "snap-mandatory");
    ul.style.scrollSnapType = "none";
    ul.style.scrollBehavior = "auto";
    ul.style.gap = GAP + "px";

    originals.forEach((li) => {
      const clone = li.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("a").forEach((a) => a.setAttribute("tabindex", "-1"));
      ul.appendChild(clone);
    });

    let setWidth = 0;
    let cardW = 240;
    let step = 256;
    let timer = 0;
    let animating = false;

    function cardsPerView() {
      const w = ul.clientWidth;
      if (w < 520) return 2;
      if (w < 860) return 3;
      return 4;
    }

    function measure() {
      const n = cardsPerView();
      cardW = Math.max(160, Math.floor((ul.clientWidth - GAP * (n - 1)) / n));
      step = cardW + GAP;
      ul.querySelectorAll(":scope > li").forEach((li) => {
        li.style.width = cardW + "px";
        li.style.minWidth = cardW + "px";
        li.style.maxWidth = cardW + "px";
        li.style.flex = "0 0 auto";
        li.classList.remove("snap-start");
      });
      setWidth = originals.length * step;
      if (setWidth > 0) {
        const idx = Math.round(ul.scrollLeft / step);
        ul.scrollLeft = ((idx % originals.length) + originals.length) % originals.length * step;
      }
    }

    function normalize() {
      if (setWidth <= 0) return;
      while (ul.scrollLeft >= setWidth) ul.scrollLeft -= setWidth;
      while (ul.scrollLeft < 0) ul.scrollLeft += setWidth;
    }

    function go(dir) {
      if (animating || setWidth <= 0) return;
      animating = true;
      ul.scrollBy({ left: dir * step, behavior: "smooth" });
      window.setTimeout(() => {
        normalize();
        const idx = Math.round(ul.scrollLeft / step);
        ul.scrollLeft = idx * step;
        normalize();
        animating = false;
      }, 480);
    }

    function start() {
      stop();
      timer = window.setInterval(() => go(1), 3000);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    const wrap = ul.parentElement;
    wrap?.querySelectorAll('button[aria-label="Scroll right"], button[aria-label="Scroll left"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const dir = btn.getAttribute("aria-label")?.includes("left") ? -1 : 1;
        stop();
        go(dir);
        window.setTimeout(start, 4000);
      });
    });

    const pauseRoot = ul.closest("section") || ul;
    pauseRoot.addEventListener("mouseenter", stop);
    pauseRoot.addEventListener("mouseleave", start);
    ul.addEventListener("touchstart", stop, { passive: true });
    ul.addEventListener(
      "touchend",
      () => window.setTimeout(start, 2800),
      { passive: true }
    );
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        measure();
      }, 120);
    });

    measure();
    window.setTimeout(start, 800);
  }
  qsa("[data-dg-dest-carousel]").forEach(initDestCarousel);
  // Fallback: section titled "best destinations"
  qsa("section").forEach((section) => {
    const h2 = section.querySelector("h2");
    if (!h2 || !/best destinations/i.test((h2.textContent || "").replace(/\s+/g, " "))) return;
    const ul =
      section.querySelector("[data-dg-dest-carousel]") ||
      section.querySelector("ul.snap-x") ||
      section.querySelector('ul[class*="snap-x"]') ||
      section.querySelector('ul[class*="overflow-x"]');
    initDestCarousel(ul);
  });

  /* Tour card: swipe-back close (mobile highlights panel) */
  qsa('button[data-kt-card-close="true"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const scroller = btn.closest("[data-kt-card-scroller]") || btn.closest(".snap-x, [class*='overflow-x-auto']");
      if (scroller) scroller.scrollTo({ left: 0, behavior: "smooth" });
    });
  });

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = qs("header");
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) {
        header.classList.add("shadow-sm");
        header.classList.remove("border-transparent");
        header.classList.add("border-black/5");
      } else {
        header.classList.remove("shadow-sm", "border-black/5");
        header.classList.add("border-transparent");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Soft fade-in for hero ---------- */
  const hero = qs("h1");
  if (hero) {
    const block = hero.closest("section") || hero.parentElement;
    if (block) {
      block.style.opacity = "0";
      block.style.transform = "translateY(12px)";
      block.style.transition = "opacity .6s ease, transform .6s ease";
      requestAnimationFrame(() => {
        block.style.opacity = "1";
        block.style.transform = "translateY(0)";
      });
    }
  }

  /* ---------- Reveal tour cards on scroll ---------- */
  const cards = qsa("article.group, li.shrink-0").filter(
    (el) =>
      !el.closest('aside[aria-label="On this page"]') &&
      !el.classList.contains("dg-rev__slide") &&
      !el.closest("[data-dg-reviews]") &&
      !el.closest("ul.snap-x") &&
      !el.closest('ul[class*="snap-x"]')
  );
  if ("IntersectionObserver" in window && cards.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.style.transition = "opacity .45s ease, transform .45s ease";
          entry.target.style.opacity = "1";
          entry.target.style.transform = "none";
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.08 }
    );
    cards.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transitionDelay = `${Math.min(i % 8, 6) * 40}ms`;
      io.observe(el);
    });
  }

  /* ---------- Planning "On this page" scroll spy ---------- */
  const planNav = qs('aside[aria-label="On this page"] nav');
  if (planNav) {
    const ACTIVE =
      "block rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:border-l-2 lg:rounded-none lg:rounded-r-full bg-[color:var(--brand-accent)]/10 text-[color:var(--brand-secondary)] lg:border-[color:var(--brand-accent)]";
    const IDLE =
      "block rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:border-l-2 lg:rounded-none lg:rounded-r-full text-zinc-600 hover:bg-zinc-50 hover:text-[color:var(--brand-secondary)] lg:border-transparent";

    const links = qsa("a[href^='#']", planNav).filter((a) => {
      const id = a.getAttribute("href").slice(1);
      return id && document.getElementById(id);
    });

    const sections = links
      .map((a) => {
        const id = a.getAttribute("href").slice(1);
        const heading = document.getElementById(id);
        return {
          id,
          link: a,
          el: heading?.closest("article") || heading,
        };
      })
      .filter((s) => s.el);

    function setActive(id) {
      links.forEach((a) => {
        const on = a.getAttribute("href") === "#" + id;
        a.className = on ? ACTIVE : IDLE;
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }

    function spy() {
      if (!sections.length) return;
      const marker = window.matchMedia("(min-width: 1024px)").matches ? 140 : 96;
      let current = sections[0].id;
      for (const s of sections) {
        const top = s.el.getBoundingClientRect().top;
        if (top <= marker) current = s.id;
      }
      setActive(current);
    }

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          spy();
          ticking = false;
        });
      },
      { passive: true }
    );
    window.addEventListener("resize", spy, { passive: true });
    spy();

    links.forEach((a) => {
      a.addEventListener("click", () => {
        const id = a.getAttribute("href").slice(1);
        setActive(id);
      });
    });
  }

  /* ---------- Credentials lightbox ---------- */
  const credLb = qs("#dg-cred-lightbox");
  const credImg = qs("#dg-cred-lightbox-img");
  function closeCredLb() {
    if (!credLb) return;
    credLb.classList.add("hidden");
    credLb.classList.remove("flex");
    credLb.setAttribute("hidden", "");
    document.body.style.overflow = "";
    if (credImg) {
      credImg.removeAttribute("src");
      credImg.alt = "";
    }
  }
  function openCredLb(src, alt) {
    if (!credLb || !credImg || !src) return;
    credImg.src = src;
    credImg.alt = alt || "Credential document";
    credLb.removeAttribute("hidden");
    credLb.classList.remove("hidden");
    credLb.classList.add("flex");
    document.body.style.overflow = "hidden";
  }
  qsa("[data-dg-cred-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openCredLb(btn.getAttribute("data-dg-cred-open"), btn.getAttribute("data-dg-cred-alt"));
    });
  });
  qsa("[data-dg-cred-close]").forEach((btn) => {
    btn.addEventListener("click", closeCredLb);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && credLb && !credLb.classList.contains("hidden")) closeCredLb();
  });
})();