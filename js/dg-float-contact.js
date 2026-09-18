(() => {
  if (document.getElementById("dg-float-contact")) return;

  const path = location.pathname.replace(/\\/g, "/");
  let base = "";
  if (/\/(tours|destinations)\/[^/]+/.test(path)) base = "../../";
  else if (/\/(faq|contact|book|destinations|how-to-book)(\/|$)/.test(path)) base = "../";

  const wa = "https://wa.me/66821479553?text=" + encodeURIComponent("Hi D&G Holiday, I’d like to ask about a tour.");
  const contact = base + "contact/";
  const tel = "tel:+66821479553";
  const line = "https://line.me/R/ti/p/~@354ejhoo";
  const messenger = "http://m.me/dgholidaythailand";

  const style = document.createElement("style");
  style.textContent = `
    #dg-float-contact{
      position:fixed;right:1.1rem;bottom:1.1rem;z-index:60;
      display:flex;flex-direction:column;align-items:flex-end;gap:.55rem;
      font-family:inherit;
    }
    #dg-float-contact .dg-fab-menu{
      display:flex;flex-direction:column;gap:.45rem;align-items:flex-end;
      opacity:0;pointer-events:none;transform:translateY(8px);
      transition:opacity .2s ease,transform .2s ease;
    }
    #dg-float-contact.is-open .dg-fab-menu{
      opacity:1;pointer-events:auto;transform:translateY(0);
    }
    #dg-float-contact .dg-fab-link{
      display:inline-flex;align-items:center;gap:.5rem;
      border-radius:999px;background:#fff;color:#1F354C;
      border:1px solid rgba(31,53,76,.12);
      box-shadow:0 8px 24px rgba(31,53,76,.16);
      padding:.45rem .85rem .45rem .45rem;text-decoration:none;
      font-size:.82rem;font-weight:700;white-space:nowrap;
    }
    #dg-float-contact .dg-fab-link span.icon{
      width:2rem;height:2rem;border-radius:999px;display:grid;place-items:center;
      background:#f4f7f9;flex:none;
    }
    #dg-float-contact .dg-fab-main{
      width:3.5rem;height:3.5rem;border-radius:999px;border:0;cursor:pointer;
      display:grid;place-items:center;
      background:var(--cta, var(--brand-primary, #F97150));
      color:#fff;box-shadow:0 10px 28px rgba(249,113,80,.45);
      transition:transform .15s ease,filter .15s ease;
    }
    #dg-float-contact .dg-fab-main:hover{filter:brightness(.97);transform:scale(1.04)}
    #dg-float-contact .dg-fab-main svg{width:1.55rem;height:1.55rem}
    #dg-float-contact.is-open .dg-fab-main{background:#1F354C;box-shadow:0 10px 28px rgba(31,53,76,.35)}
    @media (max-width:640px){
      #dg-float-contact{right:.85rem;bottom:.85rem}
      #dg-float-contact .dg-fab-link span.label{display:none}
      #dg-float-contact .dg-fab-link{padding:.35rem}
    }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement("div");
  wrap.id = "dg-float-contact";
  wrap.innerHTML = `
    <div class="dg-fab-menu" role="menu" aria-label="Contact options">
      <a class="dg-fab-link" role="menuitem" href="${wa}" target="_blank" rel="noopener noreferrer">
        <span class="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 2.1 17.2L1 23l5.9-1.5A11 11 0 0 0 20.5 3.5zm-8.6 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.5.9.9-3.4-.2-.3a9.1 9.1 0 1 1 7.7 4.3zm5-6.8c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.3-.4c.1-.2 0-.3 0-.5l-.9-2.1c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3a2.4 2.4 0 0 0-.8 1.8 4.2 4.2 0 0 0 .9 2.2 9.6 9.6 0 0 0 3.7 3.4 12 12 0 0 0 1.3.5 3.1 3.1 0 0 0 1.4.1 2.3 2.3 0 0 0 1.5-1.1 1.9 1.9 0 0 0 .1-1.1c-.1-.2-.3-.2-.5-.3z"/></svg>
        </span>
        <span class="label">WhatsApp</span>
      </a>
      <a class="dg-fab-link" role="menuitem" href="${line}" target="_blank" rel="noopener noreferrer">
        <span class="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 5.6 2 10.1c0 4 3.5 7.4 8.2 8 .4.1.9.3 1 .6.1.3.1.7 0 1l-.2 1c-.1.3-.2 1.1 1 .6 1.2-.5 6.4-3.8 8.5-6.4A7.2 7.2 0 0 0 22 10.1C22 5.6 17.5 2 12 2zM8 12.6H6.4a.4.4 0 0 1-.4-.4V8.5a.4.4 0 0 1 .8 0v3.3H8a.4.4 0 0 1 0 .8zm1.8-.4a.4.4 0 0 1-.8 0V8.5a.4.4 0 0 1 .8 0v3.7zm4.4 0a.4.4 0 0 1-.7.3l-1.9-2.6v2.3a.4.4 0 0 1-.8 0V8.5a.4.4 0 0 1 .7-.2l1.9 2.6V8.5a.4.4 0 0 1 .8 0v3.7zm3.2-2.2a.4.4 0 0 1 0 .8h-1.2v.8h1.2a.4.4 0 0 1 0 .8h-1.6a.4.4 0 0 1-.4-.4V8.5a.4.4 0 0 1 .4-.4h1.6a.4.4 0 0 1 0 .8h-1.2v.8h1.2z"/></svg>
        </span>
        <span class="label">Line</span>
      </a>
      <a class="dg-fab-link" role="menuitem" href="${messenger}" target="_blank" rel="noopener noreferrer">
        <span class="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.3 2 2 6.2 2 11.7c0 2.9 1.2 5.4 3.1 7.1.2.1.3.3.3.6l-.1 2c0 .5.5.9 1 .7l2.2-1a.8.8 0 0 1 .6 0c1 .3 2 .4 3 .4 5.7 0 10-4.2 10-9.7S17.7 2 12 2zm5.9 7.6-2.9 4.6c-.5.7-1.4.9-2.1.4l-2.3-1.7a.6.6 0 0 0-.7 0l-3.1 2.4c-.4.3-1-.2-.7-.7l2.9-4.6c.5-.7 1.4-.9 2.1-.4l2.3 1.7a.6.6 0 0 0 .7 0l3.1-2.4c.4-.3 1 .2.7.7z"/></svg>
        </span>
        <span class="label">Messenger</span>
      </a>
      <a class="dg-fab-link" role="menuitem" href="${tel}">
        <span class="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.11 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </span>
        <span class="label">Call</span>
      </a>
      <a class="dg-fab-link" role="menuitem" href="${contact}">
        <span class="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
        </span>
        <span class="label">Contact</span>
      </a>
    </div>
    <button type="button" class="dg-fab-main" aria-label="Contact us" aria-expanded="false" aria-controls="dg-float-menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
      </svg>
    </button>
  `;
  const menu = wrap.querySelector(".dg-fab-menu");
  menu.id = "dg-float-menu";
  document.body.appendChild(wrap);

  const btn = wrap.querySelector(".dg-fab-main");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !wrap.classList.contains("is-open");
    wrap.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("click", () => {
    wrap.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  });
  wrap.addEventListener("click", (e) => e.stopPropagation());

  // Nudge back-to-top above the FAB if present
  const topBtn = document.querySelector('button[aria-label="Back to top"]');
  if (topBtn) {
    topBtn.style.bottom = "5.5rem";
    topBtn.style.right = "1.15rem";
  }
})();
