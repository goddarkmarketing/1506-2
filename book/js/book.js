(() => {
  const STORAGE_KEY = "dg_booking_draft";
  const CONFIRM_KEY = "dg_booking_confirm";
  const DEPOSIT_RATE = 0.3;

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  function money(n) {
    return "฿" + Math.round(n).toLocaleString("en-US");
  }

  function parseDraft() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (!d || !d.title || !d.adultPrice) return null;
      return d;
    } catch (_) {
      return null;
    }
  }

  function saveDraft(d) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(d));
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

  function calc(state) {
    const adults = Math.max(1, state.adults | 0);
    const children = Math.max(0, state.children | 0);
    const infants = Math.max(0, state.infants | 0);
    const subtotal = adults * state.adultPrice + children * state.childPrice;
    const deposit = Math.round(subtotal * DEPOSIT_RATE);
    const balance = subtotal - deposit;
    const dueNow = state.payMode === "full" ? subtotal : deposit;
    return { adults, children, infants, subtotal, deposit, balance, dueNow };
  }

  function voucherCode() {
    const part = Math.random().toString(36).slice(2, 6).toUpperCase();
    const n = String(Math.floor(1000 + Math.random() * 9000));
    return `DG-${part}${n}`;
  }

  const draft = parseDraft();
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
    adults: Math.max(1, Number(draft.adults) || 1),
    children: Math.max(0, Number(draft.children) || 0),
    infants: Math.max(0, Number(draft.infants) || 0),
    date: draft.date || tomorrowISO(),
    name: draft.name || "",
    email: draft.email || "",
    phone: draft.phone || "",
    hotel: draft.hotel || "",
    notes: draft.notes || "",
    payMode: draft.payMode || "deposit",
    step: 1,
  };

  qs("#back-tour").setAttribute("href", state.returnUrl);
  qs("#adult-price-label").textContent = state.adultPrice.toLocaleString("en-US");
  qs("#child-price-label").textContent = state.childPrice.toLocaleString("en-US");
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
  qsa('input[name="pay-mode"]').forEach((r) => {
    r.checked = r.value === state.payMode;
  });

  function syncQtyUI() {
    qs("#adults-val").textContent = String(state.adults);
    qs("#children-val").textContent = String(state.children);
    qs("#infants-val").textContent = String(state.infants);
  }

  function renderSummary() {
    const c = calc(state);
    qs("#sum-date").textContent = formatDate(state.date);
    const lines = [
      [`Adults × ${c.adults}`, money(c.adults * state.adultPrice)],
      [`Children × ${c.children}`, money(c.children * state.childPrice)],
    ];
    if (c.infants > 0) lines.push([`Infants × ${c.infants}`, "Free"]);
    lines.push(["Subtotal", money(c.subtotal)]);
    if (state.payMode === "deposit") {
      lines.push(["Deposit due now (30%)", money(c.deposit)]);
      lines.push(["Balance on tour day", money(c.balance)]);
    } else {
      lines.push(["Pay now (full)", money(c.subtotal)]);
    }
    qs("#sum-lines").innerHTML = lines
      .map(([a, b], i) => {
        const cls = i === lines.length - 1 || a.startsWith("Subtotal") ? (a.startsWith("Subtotal") || a.startsWith("Pay") || a.startsWith("Deposit") ? ' class="total"' : "") : "";
        const isTotal = a.startsWith("Subtotal") || a.startsWith("Deposit") || a.startsWith("Pay now");
        return `<div${isTotal ? ' class="total"' : ""}><span>${a}</span><strong>${b}</strong></div>`;
      })
      .join("");
    qs("#pay-btn-amount").textContent = `(${money(c.dueNow)})`;
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
    const ok =
      state.name.length > 1 &&
      /@/.test(state.email) &&
      state.phone.length > 6 &&
      state.hotel.length > 1;
    qs("#details-err").hidden = ok;
    return ok;
  }

  function validatePay() {
    const name = qs("#card-name").value.trim();
    const num = qs("#card-number").value.replace(/\s+/g, "");
    const exp = qs("#card-exp").value.trim();
    const cvc = qs("#card-cvc").value.trim();
    const ok = name.length > 1 && num.length >= 12 && exp.length >= 3 && cvc.length >= 3;
    qs("#pay-err").hidden = ok;
    return ok;
  }

  function completeBooking() {
    const c = calc(state);
    const code = voucherCode();
    const confirm = {
      code,
      ...state,
      ...c,
      createdAt: new Date().toISOString(),
    };
    sessionStorage.setItem(CONFIRM_KEY, JSON.stringify(confirm));
    qs("#voucher-code").textContent = code;
    qs("#confirm-lines").innerHTML = [
      ["Tour", state.title],
      ["Date", formatDate(state.date)],
      ["Guests", `${c.adults} adult(s), ${c.children} child(ren), ${c.infants} infant(s)`],
      ["Lead guest", state.name],
      ["Email", state.email],
      ["Phone", state.phone],
      ["Pickup", state.hotel],
      ["Total", money(c.subtotal)],
      ["Paid now", money(c.dueNow)],
      [
        "Remaining",
        state.payMode === "deposit" ? money(c.balance) + " (cash on day)" : "None (except park fees if any)",
      ],
    ]
      .map(([a, b]) => `<div><span>${a}</span><strong style="text-align:right;max-width:60%">${b}</strong></div>`)
      .join("");
    setStep(4);
  }

  qsa(".qty").forEach((row) => {
    const key = row.getAttribute("data-qty");
    row.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const delta = Number(btn.getAttribute("data-delta"));
        if (key === "adults") state.adults = Math.min(20, Math.max(1, state.adults + delta));
        if (key === "children") state.children = Math.min(20, Math.max(0, state.children + delta));
        if (key === "infants") state.infants = Math.min(10, Math.max(0, state.infants + delta));
        syncQtyUI();
        renderSummary();
      });
    });
  });

  dateInput.addEventListener("change", () => {
    state.date = dateInput.value;
    renderSummary();
  });

  qsa('input[name="pay-mode"]').forEach((r) => {
    r.addEventListener("change", () => {
      if (r.checked) {
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
    btn.textContent = "Processing…";
    setTimeout(() => {
      completeBooking();
      btn.disabled = false;
      btn.innerHTML = 'Confirm &amp; pay <span id="pay-btn-amount"></span>';
      renderSummary();
    }, 700);
  });

  qs("#print-voucher").addEventListener("click", () => window.print());

  // Card number spacing helper
  qs("#card-number").addEventListener("input", (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    e.target.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  });

  syncQtyUI();
  setStep(1);
})();
