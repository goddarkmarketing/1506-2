(() => {
  const STORAGE_KEY = "dg_booking_draft";
  const CONFIRM_KEY = "dg_booking_confirm";
  const DEPOSIT_RATE = 0.3;
  const WA = "66821479553";
  const CHANNELS = {
    line: { label: "Line @354ejhoo", url: "https://line.me/R/ti/p/~@354ejhoo", prefill: false },
    messenger: { label: "Messenger", url: "http://m.me/dgholidaythailand", prefill: false },
    whatsapp: { label: "WhatsApp", url: "https://wa.me/" + WA, prefill: true },
    phone: { label: "Phone 084-2148155", url: "tel:+66842148155", prefill: false },
  };

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  function money(n) {
    return "฿" + Math.round(n).toLocaleString("en-US");
  }

  function tomorrowISO() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }

  function formatDate(iso) {
    if (!iso) return "Select a date";
    try {
      return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (_) {
      return iso;
    }
  }

  function saveDraft(d) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    } catch (_) {}
  }

  function parseStorageDraft() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (!d || !d.title) return null;
      const adultPrice = Number(d.adultPrice) || 0;
      const enquire = Boolean(d.enquire) || adultPrice <= 0;
      if (!enquire && adultPrice <= 0) return null;
      return { ...d, adultPrice, enquire };
    } catch (_) {
      return null;
    }
  }

  async function lookupTour(slug) {
    if (!slug) return null;
    const paths = ["../data/region-tours-flat.json", "../tours/_tours-data.json"];
    for (const path of paths) {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) continue;
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.tours || [];
        const hit = list.find((t) => t && t.slug === slug);
        if (hit) return hit;
      } catch (_) {}
    }
    return null;
  }

  async function resolveDraft() {
    const params = new URLSearchParams(location.search);
    const slug = (params.get("tour") || params.get("slug") || "").trim();
    const titleQ = (params.get("title") || "").trim();
    const hasPrice = params.has("price");
    const hasChild = params.has("child") || params.has("childPrice");
    const priceQ = hasPrice ? Number(params.get("price")) : NaN;
    const childQ = hasChild
      ? Number(params.get("child") || params.get("childPrice"))
      : NaN;

    if (slug || titleQ) {
      const catalog = slug ? await lookupTour(slug) : null;
      const title = titleQ || (catalog && catalog.title) || "";
      if (title) {
        const adultPrice = Number.isFinite(priceQ)
          ? priceQ
          : Number(catalog && catalog.price) || 0;
        const childPrice = Number.isFinite(childQ)
          ? childQ
          : Number(catalog && catalog.childPrice) || 0;
        const enquire = adultPrice <= 0;
        const draft = {
          title,
          slug: slug || (catalog && catalog.slug) || "",
          returnUrl: slug ? `../tours/${slug}/` : "../destinations/",
          adultPrice,
          childPrice,
          enquire,
          adults: 1,
          children: 0,
          infants: 0,
          date: tomorrowISO(),
          payMode: enquire ? "enquire" : "deposit",
        };
        saveDraft(draft);
        return draft;
      }
    }

    return parseStorageDraft();
  }

  function calc(state) {
    const adults = Math.max(1, state.adults | 0);
    const children = Math.max(0, state.children | 0);
    const infants = Math.max(0, state.infants | 0);
    const subtotal = adults * state.adultPrice + children * state.childPrice;
    const deposit = Math.round(subtotal * DEPOSIT_RATE);
    const balance = subtotal - deposit;
    const dueNow =
      state.enquire || state.payMode === "enquire"
        ? 0
        : state.payMode === "full"
          ? subtotal
          : deposit;
    return { adults, children, infants, subtotal, deposit, balance, dueNow };
  }

  function voucherCode() {
    const part = Math.random().toString(36).slice(2, 6).toUpperCase();
    const n = String(Math.floor(1000 + Math.random() * 9000));
    return `DG-${part}${n}`;
  }

  function requestMessage(state, c, code) {
    const lines = [
      `Hi D&G Holiday, booking request ${code}`,
      `Tour: ${state.title}`,
      `Date: ${formatDate(state.date)}`,
      `Guests: ${c.adults} adult(s), ${c.children} child(ren), ${c.infants} infant(s)`,
      `Name: ${state.name}`,
      `Email: ${state.email}`,
      `Phone: ${state.phone}`,
      `Pickup: ${state.hotel}`,
    ];
    if (state.notes) lines.push(`Notes: ${state.notes}`);
    if (state.enquire) {
      lines.push("Type: Enquire / private package (please quote)");
    } else {
      lines.push(`Total: ${money(c.subtotal)}`);
      lines.push(
        state.payMode === "full"
          ? `Prefer to pay: in full (${money(c.subtotal)})`
          : `Prefer to pay: deposit ${money(c.deposit)}, balance ${money(c.balance)}`
      );
    }
    return lines.join("\n");
  }

  function tt(key, fallback) {
    return (window.DG_I18N && window.DG_I18N.t(key)) || fallback;
  }

  function startApp(draft) {
    const empty = qs("#empty-state");
    const app = qs("#booking-app");

    if (!draft) {
      empty.hidden = false;
      app.hidden = true;
      return;
    }

    empty.hidden = true;
    app.hidden = false;

    const state = {
      title: draft.title,
      slug: draft.slug || "",
      returnUrl: draft.returnUrl || "../index.html#popular",
      adultPrice: Number(draft.adultPrice) || 0,
      childPrice: Number(draft.childPrice) || 0,
      enquire: Boolean(draft.enquire) || Number(draft.adultPrice) <= 0,
      adults: Math.max(1, Number(draft.adults) || 1),
      children: Math.max(0, Number(draft.children) || 0),
      infants: Math.max(0, Number(draft.infants) || 0),
      date: draft.date || tomorrowISO(),
      name: draft.name || "",
      email: draft.email || "",
      phone: draft.phone || "",
      hotel: draft.hotel || "",
      notes: draft.notes || "",
      payMode: draft.payMode || (draft.enquire ? "enquire" : "deposit"),
      step: 1,
    };
    if (state.enquire) state.payMode = "enquire";

    qs("#back-tour").setAttribute("href", state.returnUrl);
    const adultLine = qs("#adult-price-line");
    const childLine = qs("#child-price-line");
    if (state.enquire) {
      if (adultLine) adultLine.textContent = "Price on request";
      if (childLine) childLine.textContent = "Price on request";
    } else {
      qs("#adult-price-label").textContent = state.adultPrice.toLocaleString("en-US");
      qs("#child-price-label").textContent = state.childPrice.toLocaleString("en-US");
    }
    qs("#sum-title").textContent = state.title;

    const dateInput = qs("#tour-date");
    dateInput.min = tomorrowISO();
    dateInput.value = state.date >= dateInput.min ? state.date : tomorrowISO();
    state.date = dateInput.value;

    qs("#guest-name").value = state.name;
    qs("#guest-email").value = state.email;
    qs("#guest-phone").value = state.phone;
    qs("#guest-hotel").value = state.hotel;
    qs("#guest-notes").value = state.notes;

    const payPanel = qs('.panel[data-panel="3"]');
    const payModes = qs("#pay-mode-group", payPanel);

    if (state.enquire) {
      if (payModes) payModes.hidden = true;
      const noticeTitle = qs("#deposit-notice-title", payPanel);
      const noticeBody = qs("#deposit-notice-body", payPanel);
      if (noticeTitle) noticeTitle.textContent = "This package is quoted on request";
      if (noticeBody) {
        noticeBody.innerHTML =
          "Our team prepares your quote first. Once you accept it, the deposit is transferred to <strong>บริษัท ดีแอนด์จี ฮอลิเดย์ (ประเทศไทย) จำกัด</strong> only, and you receive an official deposit receipt.";
      }
      const h2 = qs("h2", payPanel);
      if (h2) h2.textContent = "Confirm request";
    } else {
      qsa('input[name="pay-mode"]').forEach((r) => {
        r.checked = r.value === state.payMode;
      });
    }

    function selectedChannel() {
      const el = qs('input[name="contact-channel"]:checked');
      const key = el ? el.value : "line";
      return { key, ...(CHANNELS[key] || CHANNELS.line) };
    }

    function syncQtyUI() {
      qs("#adults-val").textContent = String(state.adults);
      qs("#children-val").textContent = String(state.children);
      qs("#infants-val").textContent = String(state.infants);
    }

    function renderSummary() {
      const c = calc(state);
      qs("#sum-date").textContent = formatDate(state.date);
      const lines = [];
      if (state.enquire) {
        lines.push([`Adults × ${c.adults}`, "Enquire"]);
        lines.push([`Children × ${c.children}`, "Enquire"]);
        if (c.infants > 0) lines.push([`Infants × ${c.infants}`, "Free"]);
        lines.push(["Quote", "On request"]);
      } else {
        lines.push([`Adults × ${c.adults}`, money(c.adults * state.adultPrice)]);
        lines.push([`Children × ${c.children}`, money(c.children * state.childPrice)]);
        if (c.infants > 0) lines.push([`Infants × ${c.infants}`, "Free"]);
        lines.push(["Subtotal", money(c.subtotal)]);
        if (state.payMode === "deposit") {
          lines.push(["Deposit due now (30%)", money(c.deposit)]);
          lines.push(["Balance on tour day", money(c.balance)]);
        } else {
          lines.push(["Pay now (full)", money(c.subtotal)]);
        }
      }
      qs("#sum-lines").innerHTML = lines
        .map(([a, b]) => {
          const isTotal =
            a.startsWith("Subtotal") ||
            a.startsWith("Deposit") ||
            a.startsWith("Pay now") ||
            a === "Quote";
          return `<div${isTotal ? ' class="total"' : ""}><span>${a}</span><strong>${b}</strong></div>`;
        })
        .join("");

      const amountEl = qs("#pay-btn-amount");
      if (amountEl) {
        amountEl.textContent =
          state.enquire || !c.dueNow ? "" : `(deposit ${money(c.dueNow)})`;
      }
    }

    function setStep(n) {
      state.step = n;
      qsa(".panel").forEach((p) => {
        p.hidden = Number(p.getAttribute("data-panel")) !== n;
      });
      qsa("#stepper li").forEach((li) => {
        const s = Number(li.getAttribute("data-step"));
        li.classList.toggle("active", s === n);
        li.classList.toggle("done", s < n);
      });
      saveDraft({ ...state });
      renderSummary();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function validateTrip() {
      const err = qs("#date-err");
      if (!state.date || state.date < dateInput.min) {
        err.hidden = false;
        return false;
      }
      err.hidden = true;
      if (state.adults < 1) state.adults = 1;
      return true;
    }

    function validateDetails() {
      state.name = qs("#guest-name").value.trim();
      state.email = qs("#guest-email").value.trim();
      state.phone = qs("#guest-phone").value.trim();
      state.hotel = qs("#guest-hotel").value.trim();
      state.notes = qs("#guest-notes").value.trim();

      const phoneDigits = state.phone.replace(/\D/g, "");
      const err = qs("#details-err");
      const problems = [];
      if (state.name.length < 2) problems.push("full name");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) problems.push("a valid email");
      if (phoneDigits.length < 8) problems.push("phone (at least 8 digits)");
      if (state.hotel.length < 2) problems.push("hotel / pickup point");

      const ok = problems.length === 0;
      if (err) {
        err.hidden = ok;
        err.textContent = ok
          ? ""
          : "Please fill in " + problems.join(", ") + ".";
      }
      return ok;
    }

    function validatePay() {
      const ok = Boolean(qs('input[name="contact-channel"]:checked'));
      qs("#pay-err").hidden = ok;
      return ok;
    }

    function completeBooking() {
      const c = calc(state);
      const code = voucherCode();
      const channel = selectedChannel();
      state.channel = channel.key;
      const summary = requestMessage(state, c, code);
      const confirm = {
        code,
        ...state,
        ...c,
        channelLabel: channel.label,
        summary,
        createdAt: new Date().toISOString(),
      };
      try {
        sessionStorage.setItem(CONFIRM_KEY, JSON.stringify(confirm));
      } catch (_) {}

      qs("#voucher-code").textContent = code;
      const confirmSub = qs('.panel[data-panel="4"] .mb-4.flex span');

      qs("#confirm-lines").innerHTML = [
        ["Reference", code],
        ["Tour", state.title],
        ["Date", formatDate(state.date)],
        [
          "Guests",
          `${c.adults} adult(s), ${c.children} child(ren), ${c.infants} infant(s)`,
        ],
        ["Lead guest", state.name],
        ["Email", state.email],
        ["Phone", state.phone],
        ["Pickup", state.hotel],
        ["Reply on", channel.label],
        ["Total", state.enquire ? "On request" : money(c.subtotal)],
        [
          "Deposit",
          state.enquire
            ? "Quoted with your program"
            : state.payMode === "full"
              ? "Paying in full: " + money(c.subtotal)
              : money(c.deposit) + " (balance " + money(c.balance) + ")",
        ],
      ]
        .map(
          ([a, b]) =>
            `<div><span>${a}</span><strong style="text-align:right;max-width:60%">${b}</strong></div>`
        )
        .join("");

      let sendBtn = qs("#channel-send");
      if (!sendBtn) {
        const actions = qs('.panel[data-panel="4"] .mt-6');
        sendBtn = document.createElement("a");
        sendBtn.id = "channel-send";
        sendBtn.className =
          "inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[color:var(--brand-accent)] px-5 text-sm font-semibold text-white shadow-md hover:opacity-90";
        sendBtn.rel = "noopener";
        actions.insertBefore(sendBtn, actions.firstChild);
      }
      sendBtn.href = channel.prefill
        ? channel.url + "?text=" + encodeURIComponent(summary)
        : channel.url;
      sendBtn.target = channel.key === "phone" ? "_self" : "_blank";

      const copyBtn = qs("#copy-summary");
      if (copyBtn) copyBtn.dataset.summary = summary;

      setStep(4);
      if (window.DG_I18N && typeof window.DG_I18N.apply === "function") {
        window.DG_I18N.apply(window.DG_I18N.getLang());
      }
      if (confirmSub) {
        confirmSub.textContent = tt(
          "book.doneLead",
          "Save your reference code below, then open your chosen channel (or copy the summary) when you are ready."
        );
      }
      sendBtn.textContent =
        channel.key === "phone"
          ? tt("book.nextCall", "Next: Call") + " " + channel.label
          : tt("book.nextOpen", "Next: Open") + " " + channel.label;
      if (window.DG_I18N && typeof window.DG_I18N.retranslate === "function") {
        window.setTimeout(() => window.DG_I18N.retranslate(), 200);
      }
    }

    qsa("[data-qty]").forEach((row) => {
      const key = row.getAttribute("data-qty");
      row.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const delta = Number(btn.getAttribute("data-delta")) || 0;
          if (key === "adults") state.adults = Math.min(20, Math.max(1, state.adults + delta));
          if (key === "children")
            state.children = Math.min(20, Math.max(0, state.children + delta));
          if (key === "infants")
            state.infants = Math.min(10, Math.max(0, state.infants + delta));
          syncQtyUI();
          renderSummary();
          saveDraft({ ...state });
        });
      });
    });

    dateInput.addEventListener("change", () => {
      state.date = dateInput.value;
      renderSummary();
    });

    qsa('input[name="pay-mode"]').forEach((r) => {
      r.addEventListener("change", () => {
        if (r.checked && !state.enquire) {
          state.payMode = r.value;
          renderSummary();
        }
      });
    });

    qsa("[data-next]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = Number(btn.getAttribute("data-next"));
        if (state.step === 1 && next === 2 && !validateTrip()) return;
        if (state.step === 2 && next === 3 && !validateDetails()) return;
        if (next >= 1 && next <= 3) setStep(next);
      });
    });

    qs("#pay-btn").addEventListener("click", () => {
      if (!validatePay()) return;
      const btn = qs("#pay-btn");
      btn.disabled = true;
      const prev = btn.innerHTML;
      btn.textContent = tt("book.sending", "Sending…");
      setTimeout(() => {
        completeBooking();
        btn.disabled = false;
        btn.innerHTML = prev;
        renderSummary();
      }, 400);
    });

    qs("#print-voucher").addEventListener("click", () => window.print());

    const copyBtn = qs("#copy-summary");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        const text = copyBtn.dataset.summary || "";
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
        } catch (_) {
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        const prev = copyBtn.textContent;
        copyBtn.textContent = tt("book.copied", "Copied ✓");
        setTimeout(() => {
          copyBtn.textContent = tt("book.copySummary", "Copy summary");
        }, 1600);
      });
    }

    syncQtyUI();
    setStep(1);
  }

  resolveDraft().then(startApp);
})();
