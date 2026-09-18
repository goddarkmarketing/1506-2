(() => {
  const grid = document.querySelector("[data-dg-tours-grid]");
  const layout = document.querySelector(".dg-tours-layout");
  if (!grid || !layout) return;

  const sidebar = layout.querySelector(".dg-tours-sidebar");
  const toggle = layout.querySelector("[data-dg-filter-toggle]");
  const resetBtn = layout.querySelector("[data-dg-filter-reset]");
  const countEl = layout.querySelector("[data-dg-tours-count]");
  const cards = Array.from(grid.querySelectorAll("[data-dg-tour-card]"));

  function countFor(attr, value) {
    if (value === "all") return cards.length;
    return cards.filter((card) => {
      if (attr === "region") return (card.dataset.region || "phuket") === value;
      if (attr === "cat") return card.dataset.cat === value;
      return false;
    }).length;
  }

  function paintFilterCounts() {
    const groups = [
      { sel: '[data-dg-filter-group="region"] input[name="dg-region"]', attr: "region" },
      { sel: '[data-dg-filter-group="cat"] input[name="dg-cat"]', attr: "cat" },
    ];
    groups.forEach(({ sel, attr }) => {
      layout.querySelectorAll(sel).forEach((input) => {
        const label = input.closest("label");
        if (!label) return;
        let text = label.querySelector(".dg-tours-chip__text");
        if (!text) {
          const bare = Array.from(label.children).find(
            (el) => el.tagName === "SPAN" && !el.classList.contains("dg-tours-chip__count")
          );
          if (!bare) return;
          bare.classList.add("dg-tours-chip__text");
          text = bare;
        }
        let count = label.querySelector(".dg-tours-chip__count");
        if (!count) {
          count = document.createElement("span");
          count.className = "dg-tours-chip__count";
          label.appendChild(count);
        }
        count.textContent = String(countFor(attr, input.value));
      });
    });
  }

  paintFilterCounts();

  let emptyEl = grid.querySelector(".dg-tours-empty");
  if (!emptyEl) {
    emptyEl = document.createElement("li");
    emptyEl.className = "dg-tours-empty";
    emptyEl.hidden = true;
    emptyEl.setAttribute("data-i18n", "filters.empty");
    emptyEl.textContent =
      (window.DG_I18N && window.DG_I18N.t("filters.empty")) ||
      "No tours match these filters.";
    grid.appendChild(emptyEl);
  }

  function val(name) {
    const el = layout.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : "all";
  }

  function priceMatch(price, range) {
    if (range === "all") return true;
    // Enquire-only tours carry no price, so they stay out of numeric brackets
    if (!price) return false;
    const [min, max] = range.split("-").map(Number);
    return price >= min && price <= max;
  }

  function apply() {
    const region = val("dg-region");
    const cat = val("dg-cat");
    const type = val("dg-type");
    const duration = val("dg-duration");
    const price = val("dg-price");
    let shown = 0;

    cards.forEach((card) => {
      const okRegion = region === "all" || (card.dataset.region || "phuket") === region;
      const okCat = cat === "all" || card.dataset.cat === cat;
      const okType = type === "all" || card.dataset.type === type;
      const okDur = duration === "all" || card.dataset.duration === duration;
      const okPrice = priceMatch(Number(card.dataset.price || 0), price);
      const show = okRegion && okCat && okType && okDur && okPrice;
      card.hidden = !show;
      if (show) shown += 1;
    });

    if (countEl) countEl.textContent = String(shown);
    emptyEl.hidden = shown > 0;
  }

  layout.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener("change", apply);
  });

  resetBtn?.addEventListener("click", () => {
    layout.querySelectorAll('input[type="radio"][value="all"]').forEach((input) => {
      input.checked = true;
    });
    apply();
  });

  function setOpen(open) {
    if (!sidebar || !toggle) return;
    sidebar.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open && window.matchMedia("(max-width: 1023px)").matches ? "hidden" : "";
  }

  toggle?.addEventListener("click", () => {
    setOpen(!sidebar.classList.contains("is-open"));
  });

  sidebar?.addEventListener("click", (e) => {
    if (e.target === sidebar && window.matchMedia("(max-width: 1023px)").matches) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  apply();
})();
