/**
 * Lightweight full-page EN ↔ TH via Google Website Translator.
 * Custom EN|TH pills only — Google's own gadget/banner is hidden.
 * Preference: cookie `googtrans=/en/th` (or cleared for English).
 */
(() => {
  const STORAGE_KEY = "dg_lang";
  const COOKIE = "googtrans";

  function getLang() {
    try {
      const c = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
      if (c && decodeURIComponent(c[1]).indexOf("/th") !== -1) return "th";
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "th" || v === "en") return v;
    } catch (_) {}
    return "en";
  }

  function writeCookie(value) {
    const host = location.hostname;
    const parts = [
      COOKIE + "=" + value + "; path=/",
      COOKIE + "=" + value + "; path=/; domain=" + host,
    ];
    // Also clear/set for .hostname parent when useful
    if (host.indexOf(".") !== -1) {
      parts.push(COOKIE + "=" + value + "; path=/; domain=." + host);
    }
    parts.forEach((p) => {
      document.cookie = p;
    });
  }

  function clearCookie() {
    const host = location.hostname;
    const expired = "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = COOKIE + expired;
    document.cookie = COOKIE + expired + "; domain=" + host;
    if (host.indexOf(".") !== -1) {
      document.cookie = COOKIE + expired + "; domain=." + host;
    }
  }

  function setLang(lang) {
    const next = lang === "th" ? "th" : "en";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (_) {}

    if (next === "th") {
      writeCookie("/en/th");
    } else {
      clearCookie();
    }
    location.reload();
  }

  function makeToggle() {
    const uid = "f" + Math.random().toString(36).slice(2, 8);
    const flagEn =
      '<svg class="dg-lang__flag" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" aria-hidden="true"><clipPath id="' +
      uid +
      '"><path d="M0 0v30h60V0z"/></clipPath><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6" clip-path="url(#' +
      uid +
      ')"/><path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" stroke-width="4" clip-path="url(#' +
      uid +
      ')"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></svg>';
    const flagTh =
      '<svg class="dg-lang__flag" xmlns="http://www.w3.org/2000/svg" viewBox="0 85.333 512 341.333" aria-hidden="true"><path fill="#FFF" d="M0 85.334h512V426.66H0z"/><path fill="#0052B4" d="M0 194.056h512v123.882H0z"/><path d="M0 85.334h512v54.522H0zm0 286.809h512v54.522H0z" fill="#D80027"/></svg>';

    const wrap = document.createElement("div");
    wrap.className = "dg-lang notranslate";
    wrap.setAttribute("data-dg-lang", "");
    wrap.setAttribute("translate", "no");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Language");
    wrap.innerHTML =
      '<button type="button" class="notranslate" translate="no" data-lang="en" aria-pressed="false" aria-label="English">' +
      flagEn +
      "<span>EN</span></button>" +
      '<button type="button" class="notranslate" translate="no" data-lang="th" aria-pressed="false" aria-label="ไทย">' +
      flagTh +
      "<span>TH</span></button>";
    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-lang]");
      if (!btn) return;
      const want = btn.getAttribute("data-lang");
      if (want === getLang()) return;
      setLang(want);
    });
    return wrap;
  }

  function syncToggle(lang) {
    document.querySelectorAll("[data-dg-lang] button").forEach((btn) => {
      const on = btn.getAttribute("data-lang") === lang;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-active", on);
    });
  }

  function findCurrencyButtons() {
    return Array.from(
      document.querySelectorAll(
        'header button[aria-haspopup="dialog"], .dg-top__currency, header button'
      )
    ).filter((el) =>
      /Currency|THB|Baht/i.test(el.getAttribute("aria-label") || el.textContent || "")
    );
  }

  function hideCurrencyButtons() {
    findCurrencyButtons().forEach((btn) => {
      btn.hidden = true;
      btn.setAttribute("aria-hidden", "true");
      btn.style.display = "none";
    });
  }

  function ensureToggle() {
    const currencyBtns = findCurrencyButtons();

    currencyBtns.forEach((currency) => {
      const row = currency.parentElement;
      if (!row || row.querySelector("[data-dg-lang]")) return;
      row.insertBefore(makeToggle(), currency);
    });

    const regionTools = document.querySelector(".dg-top__tools");
    if (regionTools && !regionTools.querySelector("[data-dg-lang]")) {
      const search = regionTools.querySelector(".dg-top__search, form[role='search']");
      regionTools.insertBefore(makeToggle(), search || regionTools.firstChild);
    }

    const burger =
      document.querySelector("[data-dg-menu-open]") ||
      document.querySelector('button[aria-label="Open menu"]');
    if (
      burger &&
      burger.parentElement &&
      !burger.parentElement.querySelector("[data-dg-lang]")
    ) {
      burger.parentElement.insertBefore(makeToggle(), burger);
    }

    if (!document.querySelector("[data-dg-lang]")) {
      const headerInner =
        document.querySelector(".dg-top__inner") ||
        document.querySelector("header .relative.mx-auto") ||
        document.querySelector("header > div");
      if (headerInner) headerInner.appendChild(makeToggle());
    }

    // Currency switcher is unused — keep EN|TH only
    hideCurrencyButtons();
  }

  // Brand names only — do NOT protect place names here (that caused
  // "Phi Phiเกาะต่างๆ"). Places get proper Thai via PLACE_LABELS below.
  const PROTECT = [
    "D&G Holiday",
    "D&G Holiday (Thailand) Co., Ltd.",
    "WhatsApp",
    "Messenger",
    "Facebook",
    "Instagram",
    "YouTube",
    "TikTok",
    "Line OA",
    "Line @354ejhoo",
    "Line · @354ejhoo",
    "@354ejhoo",
    "dgholidaythailand",
    "THB",
    "GMT+7",
    "ATV",
    "UTV",
    "GPS",
    "PDF",
    "SMS",
    "OTP",
  ];

  // Standalone tokens that need word boundaries (avoid "timeline" → Line)
  const PROTECT_WORD = ["Line", "EN", "TH"];

  // Canonical English → Thai for destinations / filter categories
  const PLACE_LABELS = {
    "All Thailand": "ทั่วไทย",
    "All tours": "ทัวร์ทั้งหมด",
    Phuket: "ภูเก็ต",
    "Phuket (land)": "ภูเก็ต (ทัวร์บก)",
    "Phuket tours": "ทัวร์ภูเก็ต",
    "Chiang Mai": "เชียงใหม่",
    "Chiang Rai": "เชียงราย",
    Krabi: "กระบี่",
    "Koh Samui": "เกาะสมุย",
    "Ko Samui": "เกาะสมุย",
    "Phi Phi Islands": "หมู่เกาะพีพี",
    "Phi Phi Bamboo Island": "พีพี–เกาะไผ่",
    "Phi Phi & Khai Islands": "พีพีและเกาะไข่",
    "Phang Nga Bay": "อ่าวพังงา",
    "Khai Islands": "หมู่เกาะไข่",
    "Similan Islands": "หมู่เกาะสิมิลัน",
    "Racha Island": "เกาะราชา",
    "Phuket Bay Islands": "เกาะอ่าวภูเก็ต",
    "James Bond Island": "เกาะเจมส์บอนด์",
    "Raya & Coral Island": "ราชาและเกาะคอรัล",
    "ATV Tour": "ทัวร์ ATV",
    "City Tour": "ทัวร์เมือง",
    "All destinations": "ปลายทางทั้งหมด",
    Destinations: "ปลายทาง",
    "Island & boat": "เกาะ / เรือ",
    "Land / adventure": "บก / ผจญภัย",
    "Half day": "ครึ่งวัน",
    "Full day": "เต็มวัน",
    "Multi-day": "หลายวัน",
    "Any duration": "ทุกระยะเวลา",
    "Any price": "ทุกราคา",
    "All types": "ทุกประเภท",
    Filters: "ตัวกรอง",
    Reset: "รีเซ็ต",
    Destination: "ปลายทาง",
    Category: "หมวดหมู่",
    "Tour type": "ประเภททัวร์",
    Duration: "ระยะเวลา",
    Price: "ราคา",
    FAQ: "คำถามที่พบบ่อย",
  };

  const PLACE_LABELS_EN = Object.keys(PLACE_LABELS).reduce((acc, en) => {
    acc[PLACE_LABELS[en]] = en;
    acc[en] = en;
    return acc;
  }, {});

  function normalizePlaceKey(text) {
    const raw = (text || "").replace(/\s+/g, " ").trim();
    if (!raw) return "";
    if (PLACE_LABELS[raw]) return raw;
    if (PLACE_LABELS_EN[raw]) return PLACE_LABELS_EN[raw];
    // Recover mangled Google leftovers like "Phi Phiเกาะต่างๆ"
    if (/^Phi\s*Phi/i.test(raw)) return "Phi Phi Islands";
    if (/^Similan/i.test(raw)) return "Similan Islands";
    if (/^Racha|^ราชา/i.test(raw) && /island|เกาะ/i.test(raw)) return "Racha Island";
    return raw;
  }

  function applyPlaceLabels(lang) {
    const useTh = lang === "th";
    const targets = document.querySelectorAll(
      [
        ".dg-tours-chip__text",
        ".dg-tours-chip > span:not(.dg-tours-chip__count)",
        ".dg-tours-sidebar__label",
        ".dg-tours-sidebar__head h3",
        ".dg-tours-sidebar__reset",
        "[data-dg-filter-toggle]",
        ".dg-top__menu a",
        ".dg-drawer__sub a",
        'nav[aria-label="Main"] a',
        'nav[aria-label="Mobile"] a',
        "header nav a",
        'div[role="dialog"][aria-label="Menu"] a',
        "footer a",
        ".dg-foot a",
        ".dg-top__menu a",
      ].join(",")
    );

    targets.forEach((el) => {
      if (el.querySelector && el.querySelector("svg,img,input,button")) return;
      if (el.children.length > 0 && !el.classList.contains("dg-tours-chip__text")) {
        // allow plain <a> / <span> with only text
        if (![...el.childNodes].every((n) => n.nodeType === 3 || (n.nodeType === 1 && n.tagName === "SPAN")))
          return;
      }

      if (!el.getAttribute("data-dg-place-en")) {
        const key = normalizePlaceKey(el.textContent);
        if (!PLACE_LABELS[key] && !PLACE_LABELS_EN[el.textContent.trim()]) return;
        el.setAttribute("data-dg-place-en", PLACE_LABELS[key] ? key : PLACE_LABELS_EN[el.textContent.trim()] || key);
      }

      const en = el.getAttribute("data-dg-place-en");
      if (!en || !PLACE_LABELS[en]) return;
      markNoTranslate(el);
      el.textContent = useTh ? PLACE_LABELS[en] : en;
    });

    // Filter group headings that are bare <p>
    document.querySelectorAll(".dg-tours-sidebar__label, .dg-tours-sidebar__head h3").forEach((el) => {
      if (!el.getAttribute("data-dg-place-en")) {
        const key = normalizePlaceKey(el.textContent);
        if (PLACE_LABELS[key]) el.setAttribute("data-dg-place-en", key);
      }
      const en = el.getAttribute("data-dg-place-en");
      if (!en || !PLACE_LABELS[en]) return;
      markNoTranslate(el);
      el.textContent = useTh ? PLACE_LABELS[en] : en;
    });
  }

  function markNoTranslate(el) {
    if (!el || el.nodeType !== 1) return;
    el.classList.add("notranslate");
    el.setAttribute("translate", "no");
  }

  function protectFixedUi() {
    document.querySelectorAll("[data-dg-lang], .dg-lang, .dg-top__currency, .dg-top__logo, header img[alt], footer img[alt]").forEach(markNoTranslate);

    // Currency pill / THB label
    document.querySelectorAll('header button[aria-haspopup="dialog"]').forEach((btn) => {
      if (/THB|Currency|Baht/i.test(btn.getAttribute("aria-label") || btn.textContent || "")) {
        markNoTranslate(btn);
      }
    });

    // Tel / mailto / chat links keep their brand labels
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"], a[href*="line.me"], a[href*="m.me"], a[href^="tel:"], a[href^="mailto:"]').forEach(markNoTranslate);
  }

  function wrapMatchesInTextNode(textNode, patterns) {
    const text = textNode.nodeValue;
    if (!text || !text.trim()) return;

    let match = null;
    let matchIndex = -1;
    let matched = null;
    for (const p of patterns) {
      const re = p.re;
      re.lastIndex = 0;
      const m = re.exec(text);
      if (m && (matchIndex < 0 || m.index < matchIndex)) {
        match = m;
        matchIndex = m.index;
        matched = p;
      }
    }
    if (!match) return;

    const parent = textNode.parentNode;
    if (!parent || parent.closest(".notranslate,[translate='no']")) return;

    const before = text.slice(0, match.index);
    const hit = match[0];
    const after = text.slice(match.index + hit.length);

    const span = document.createElement("span");
    span.className = "notranslate";
    span.setAttribute("translate", "no");
    span.textContent = hit;

    const frag = document.createDocumentFragment();
    if (before) frag.appendChild(document.createTextNode(before));
    frag.appendChild(span);
    if (after) frag.appendChild(document.createTextNode(after));
    parent.replaceChild(frag, textNode);

    // Continue on the leftover "after" text node
    if (after && span.nextSibling && span.nextSibling.nodeType === 3) {
      wrapMatchesInTextNode(span.nextSibling, patterns);
    }
  }

  function protectBrandNames(root) {
    const patterns = PROTECT.map((s) => ({
      re: new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      label: s,
    })).concat(
      PROTECT_WORD.map((s) => ({
        re: new RegExp("\\b" + s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g"),
        label: s,
      }))
    );

    const skip = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE", "SVG", "NOSCRIPT"]);
    const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p || skip.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.closest(".notranslate,[translate='no'],.dg-lang,[data-dg-lang]"))
          return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !/[A-Za-z@]/.test(node.nodeValue))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => wrapMatchesInTextNode(n, patterns));
  }

  function ensureStyles() {
    if (document.getElementById("dg-i18n-style")) return;
    const style = document.createElement("style");
    style.id = "dg-i18n-style";
    style.textContent = `
.dg-lang{display:inline-flex;align-items:center;gap:0;border:1px solid rgba(0,0,0,.15);border-radius:999px;overflow:hidden;flex-shrink:0;height:2.75rem}
.dg-lang button{appearance:none;border:0;background:transparent;margin:0;padding:0 .7rem;height:100%;font:inherit;font-size:.78rem;font-weight:700;letter-spacing:.04em;color:#3f3f46;cursor:pointer;line-height:1;display:inline-flex;align-items:center;gap:.35rem}
.dg-lang button.is-active{background:#1f354c;color:#fff}
.dg-lang button:not(.is-active):hover{background:#f4f4f5}
.dg-lang__flag{width:1.15rem;height:.8rem;border-radius:2px;display:block;flex-shrink:0;box-shadow:0 0 0 1px rgba(0,0,0,.12);object-fit:cover;overflow:hidden}
/* Hide unused currency (THB) pill in header */
.dg-top__currency,header button[aria-label*="Currency" i],header button[aria-label*="currency" i]{display:none!important}
/* Hide Google Translate chrome */
.goog-te-banner-frame,.goog-te-balloon-frame,#goog-gt-tt,.goog-te-spinner-pos,.goog-te-menu-frame{display:none!important}
body{top:0!important}
.skiptranslate,.goog-te-gadget{display:none!important}
iframe.skiptranslate{display:none!important}
#google_translate_element{display:none!important;height:0;overflow:hidden}
`;
    document.head.appendChild(style);
  }

  function ensureGoogleHost() {
    if (document.getElementById("google_translate_element")) return;
    const host = document.createElement("div");
    host.id = "google_translate_element";
    host.setAttribute("aria-hidden", "true");
    document.body.appendChild(host);
  }

  window.googleTranslateElementInit = function () {
    try {
      new google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,th",
          autoDisplay: false,
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    } catch (_) {}
  };

  function loadGoogle() {
    if (document.getElementById("dg-google-translate-script")) return;
    const s = document.createElement("script");
    s.id = "dg-google-translate-script";
    s.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.head.appendChild(s);
  }

  // Tiny helper kept for book.js call sites — Google handles visible text.
  function t(key, fallback) {
    return fallback || key;
  }

  function retranslate() {
    protectFixedUi();
    protectBrandNames(document.body);
    applyPlaceLabels(getLang());
    // Ask Google to re-run on newly inserted nodes (booking confirmation, etc.)
    const select = document.querySelector(".goog-te-combo");
    if (!select) return;
    const want = getLang() === "th" ? "th" : "en";
    const prev = select.value;
    select.value = want;
    select.dispatchEvent(new Event("change"));
    if (prev === want) {
      // Force a flip when already on the target language
      select.value = want === "th" ? "en" : "th";
      select.dispatchEvent(new Event("change"));
      setTimeout(() => {
        select.value = want;
        select.dispatchEvent(new Event("change"));
        applyPlaceLabels(getLang());
      }, 50);
    } else {
      setTimeout(() => applyPlaceLabels(getLang()), 100);
    }
  }

  window.DG_I18N = {
    t,
    getLang,
    setLang,
    retranslate,
    protect: function () {
      protectFixedUi();
      protectBrandNames(document.body);
      applyPlaceLabels(getLang());
    },
    apply: function (lang) {
      ensureStyles();
      ensureToggle();
      protectFixedUi();
      applyPlaceLabels(lang || getLang());
      syncToggle(lang || getLang());
    },
  };

  function boot() {
    ensureStyles();
    ensureGoogleHost();
    ensureToggle();
    protectFixedUi();
    protectBrandNames(document.body);
    const lang = getLang();
    // Set proper Thai place names BEFORE Google runs, and lock them with notranslate
    applyPlaceLabels(lang);
    syncToggle(lang);
    document.documentElement.lang = lang === "th" ? "th" : "en";
    document.documentElement.setAttribute("data-dg-lang-active", lang);
    if (lang === "th") writeCookie("/en/th");
    loadGoogle();
    // Re-assert after Google paints
    setTimeout(() => applyPlaceLabels(getLang()), 800);
    setTimeout(() => applyPlaceLabels(getLang()), 2000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
