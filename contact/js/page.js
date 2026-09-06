(() => {
  const HOME = "../index.html";
  const FAQ = "../faq/";
  const CONTACT = "../contact/";
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  const here = location.pathname.replace(/\\/g, "/");
  const isFaq = /\/faq(\/|\/index\.html)?$/i.test(here);
  const isContact = /\/contact(\/|\/index\.html)?$/i.test(here);

  qsa("a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (/^https?:\/\/(www\.)?kohtour(phuket|krabi)?\.com/i.test(href) ||
        /^https?:\/\/(kohlanta|gobangkok)\.tours/i.test(href)) {
      if (/\/tours\/([^/?#]+)/.test(href)) {
        a.setAttribute("href", "../tours/" + href.match(/\/tours\/([^/?#]+)/)[1] + "/");
      } else if (/\/faq/i.test(href)) a.setAttribute("href", isFaq ? "./" : FAQ);
      else if (/\/contact|about/i.test(href)) a.setAttribute("href", isContact ? "./" : CONTACT);
      else if (/phuket-tours/i.test(href)) a.setAttribute("href", HOME + "#popular");
      else a.setAttribute("href", HOME);
    }
  });

  qsa("nav a").forEach((a) => {
    const t = a.textContent.trim();
    if (t === "Home") a.setAttribute("href", HOME);
    if (t === "Tours") a.setAttribute("href", HOME + "#popular");
    if (t === "FAQ") a.setAttribute("href", isFaq ? "./" : FAQ);
    if (t === "Contact Us") a.setAttribute("href", isContact ? "./" : CONTACT);
  });

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
    }
    openBtn?.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }
  openBtn?.addEventListener("click", () => setMenu(true));
  closeBtn?.addEventListener("click", () => setMenu(false));
  overlay?.addEventListener("click", () => setMenu(false));

  const destinations = [
    { label: "Phi Phi Bamboo Island", href: "../tours/phi-phi-maya-bay-bamboo-island-tour-speedboat/" },
    { label: "James Bond Island", href: "../tours/james-bond-island-tour-speedboat/" },
    { label: "Khai Islands", href: "../tours/khai-islands-half-day-tour/" },
    { label: "Similan Islands", href: "../tours/similan-island-tour-from-phuket/" },
    { label: "Raya & Coral Island", href: "../tours/raya-coral-island-tour-phuket-full-day/" },
    { label: "ATV Tour", href: "../tours/phuket-atv-tour/" },
    { label: "All tours", href: HOME + "#popular" },
  ];
  const destHtml = destinations.map((d) =>
    `<a class="block rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--brand-secondary)] hover:bg-zinc-100" href="${d.href}">${d.label}</a>`
  ).join("");

  const destBtn = qsa('nav[aria-label="Main"] button[aria-haspopup="true"]').find((b) => b.textContent.includes("Destinations"));
  if (destBtn) {
    const wrap = destBtn.parentElement;
    wrap.classList.add("relative");
    const panel = document.createElement("div");
    panel.hidden = true;
    panel.className = "absolute left-0 top-full z-50 mt-1 min-w-[220px] rounded-xl border border-black/10 bg-white p-2 shadow-lg";
    panel.innerHTML = destHtml;
    wrap.appendChild(panel);
    destBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); panel.hidden = !panel.hidden; });
    document.addEventListener("click", () => { panel.hidden = true; });
  }
  const mobileDest = qsa('nav[aria-label="Mobile"] button[aria-expanded]').find((b) => b.textContent.includes("Destinations"));
  if (mobileDest) {
    const sub = document.createElement("div");
    sub.hidden = true;
    sub.className = "space-y-0.5 pb-2 pl-3";
    sub.innerHTML = destHtml;
    mobileDest.parentElement.appendChild(sub);
    mobileDest.addEventListener("click", () => { sub.hidden = !sub.hidden; });
  }

  qsa('button[aria-haspopup="dialog"]').forEach((btn) => {
    if (!/Currency|THB/i.test(btn.getAttribute("aria-label") || btn.textContent || "")) return;
    btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); });
  });
  qsa('form[role="search"]').forEach((form) => {
    form.addEventListener("submit", (e) => { e.preventDefault(); location.href = HOME + "#popular"; });
  });

  qsa("main button[aria-expanded], section button[aria-expanded]").forEach((btn) => {
    if (btn.getAttribute("aria-haspopup") || btn.getAttribute("aria-label")) return;
    if (/Destinations|Menu|Open menu|Close menu/i.test(btn.textContent + (btn.getAttribute("aria-label") || ""))) return;
    const panel = btn.nextElementSibling || btn.closest("h3")?.nextElementSibling || btn.parentElement?.nextElementSibling;
    if (!panel) return;
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      const next = !open;
      btn.setAttribute("aria-expanded", next ? "true" : "false");
      if (panel.style) {
        if (panel.style.maxHeight != null || panel.classList.contains("overflow-hidden")) {
          panel.style.maxHeight = next ? panel.scrollHeight + 48 + "px" : "0px";
          panel.style.opacity = next ? "1" : "0";
        }
        if (panel.style.gridTemplateRows != null || panel.classList.contains("grid")) {
          panel.style.gridTemplateRows = next ? "1fr" : "0fr";
          panel.classList.toggle("grid-rows-[1fr]", next);
          panel.classList.toggle("grid-rows-[0fr]", !next);
        }
      }
      const svg = btn.querySelector("svg");
      if (svg) svg.style.transform = next ? "rotate(180deg)" : "";
      const plus = [...btn.querySelectorAll("span")].find((s) => s.textContent.trim() === "+" || s.textContent.trim() === "−");
      if (plus) plus.textContent = next ? "−" : "+";
    });
  });

  if (isContact) {
    const form = qsa("form").find((f) => !f.getAttribute("role") && /email|message|name/i.test(f.innerHTML));
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        let note = form.querySelector("[data-form-success]");
        if (!note) {
          note = document.createElement("div");
          note.setAttribute("data-form-success", "1");
          note.className = "mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800";
          note.textContent = "Thank you! Your message has been noted. For a faster reply, contact us on WhatsApp or phone.";
          form.appendChild(note);
        }
        note.hidden = false;
        form.reset();
      });
    }
  }

  const header = qs("header");
  if (header) {
    window.addEventListener("scroll", () => header.classList.toggle("shadow-sm", window.scrollY > 8), { passive: true });
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
})();