const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data", "region-tours.json"), "utf8"));

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n) {
  if (!n || n <= 0) return "Enquire";
  return "฿" + Number(n).toLocaleString("en-US");
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

// Same items, order and wording as the homepage header/footer so the chrome does
// not change when a guest moves between the Phuket pages and the region pages.
const NAV_LINKS = [
  ["index.html", "Home"],
  ["index.html#popular", "Tours"],
  ["__destinations__", "Destinations"],
  ["how-to-book/", "How to book"],
  ["faq/", "FAQ"],
  ["contact/", "Contact Us"],
];

// Must stay identical to the `destinations` array in js/site.js, which builds the
// same dropdown on the scraped pages.
const DEST_LINKS = [
  ["destinations/chiang-mai/", "Chiang Mai"],
  ["destinations/chiang-rai/", "Chiang Rai"],
  ["destinations/krabi/", "Krabi"],
  ["destinations/koh-samui/", "Koh Samui"],
  ["tours/phi-phi-maya-bay-bamboo-island-tour-speedboat/", "Phi Phi Bamboo Island"],
  ["tours/phi-phi-maya-bay-khai-islands-speedboat/", "Phi Phi & Khai Islands"],
  ["tours/james-bond-island-tour-speedboat/", "James Bond Island"],
  ["tours/khai-islands-half-day-tour/", "Khai Islands"],
  ["tours/similan-island-tour-from-phuket/", "Similan Islands"],
  ["tours/raya-coral-island-tour-phuket-full-day/", "Raya & Coral Island"],
  ["tours/phuket-atv-tour/", "ATV Tour"],
  ["tours/phuket-city-tour-half-day/", "City Tour"],
  ["destinations/", "All destinations"],
];

const FOOTER_EXPLORE = [
  ["index.html", "Home"],
  ["index.html#popular", "Tours"],
  ["faq/", "FAQ"],
  ["contact/", "Contact Us"],
  ["how-to-book/", "How to book"],
  ["index.html#how-booking-works", "How booking works"],
  ["index.html#credentials", "Credentials"],
];

const FOOTER_DESTINATIONS = [
  ["destinations/chiang-mai/", "Chiang Mai"],
  ["destinations/chiang-rai/", "Chiang Rai"],
  ["destinations/krabi/", "Krabi"],
  ["destinations/koh-samui/", "Koh Samui"],
  ["index.html#popular", "Phuket tours"],
  ["destinations/", "All destinations"],
];

const MAP_URL =
  "https://www.google.com/maps/dir/19.9753728,99.8703104/13.75101,100.83938/@16.8331169,97.6363631,7z/data=!3m1!4b1!4m4!4m3!1m1!4e1!1m0?entry=ttu&g_ep=EgoyMDI2MDkwMi4wIKXMDSoASAFQAw%3D%3D";

const ICON_CHEVRON =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';
const ICON_SEARCH =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
const ICON_BURGER =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
const ICON_CLOSE =
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

function headerHtml(prefix) {
  const destMenu = DEST_LINKS.map(
    ([href, label]) => `<a href="${prefix}${href}">${esc(label)}</a>`
  ).join("");

  const navItems = NAV_LINKS.map(([href, label]) => {
    if (href !== "__destinations__") {
      return `<li><a href="${prefix}${href}">${esc(label)}</a></li>`;
    }
    return `<li class="dg-top__submenu">
            <button type="button" aria-haspopup="true" aria-expanded="false" data-dg-dest-toggle>${esc(
              label
            )}${ICON_CHEVRON}</button>
            <div class="dg-top__menu" data-dg-dest-menu hidden>${destMenu}</div>
          </li>`;
  }).join("\n          ");

  const drawerItems = NAV_LINKS.map(([href, label]) => {
    if (href !== "__destinations__") {
      return `<li><a href="${prefix}${href}">${esc(label)}</a></li>`;
    }
    return `<li>
            <button type="button" aria-expanded="false" data-dg-dest-toggle>${esc(
              label
            )}${ICON_CHEVRON}</button>
            <div class="dg-drawer__sub" data-dg-dest-menu hidden>${destMenu}</div>
          </li>`;
  }).join("\n          ");

  return `  <header class="dg-top" data-dg-header>
    <div class="dg-top__inner">
      <a class="dg-top__logo" href="${prefix}index.html" aria-label="D&amp;G Holiday"><img src="${prefix}images/logo-dg-holiday.png" alt="D&amp;G Holiday" width="491" height="194"></a>
      <nav class="dg-top__nav" aria-label="Main">
        <ul>
          ${navItems}
        </ul>
      </nav>
      <div class="dg-top__tools">
        <form class="dg-top__search" role="search" data-dg-header-search action="${prefix}index.html">
          <span class="dg-top__search-icon">${ICON_SEARCH}</span>
          <input type="search" name="q" placeholder="Search tours…" aria-label="Search tours">
        </form>
      </div>
      <button class="dg-top__burger" type="button" aria-label="Open menu" aria-expanded="false" data-dg-menu-open>${ICON_BURGER}</button>
    </div>
  </header>
  <div class="dg-drawer__overlay" data-dg-drawer-overlay hidden></div>
  <div class="dg-drawer" role="dialog" aria-modal="true" aria-label="Menu" data-dg-drawer hidden>
    <div class="dg-drawer__head">
      <span>Menu</span>
      <button type="button" aria-label="Close menu" data-dg-menu-close>${ICON_CLOSE}</button>
    </div>
    <nav class="dg-drawer__nav" aria-label="Mobile">
      <ul>
          ${drawerItems}
      </ul>
    </nav>
    <div class="dg-drawer__foot">
      <a class="dg-btn dg-btn--primary" href="https://wa.me/66821479553" target="_blank" rel="noopener">WhatsApp us</a>
      <a class="dg-btn dg-btn--ghost" href="tel:+66821479553">082 147 9553</a>
    </div>
  </div>`;
}

function footerHtml(prefix) {
  const list = (items) =>
    items
      .map(([href, label]) => `<li><a href="${prefix}${href}">${esc(label)}</a></li>`)
      .join("\n          ");

  return `  <footer class="dg-foot">
    <div class="dg-wrap">
      <div class="dg-foot__grid">
        <div>
          <a href="${prefix}index.html"><img class="dg-foot__logo" src="${prefix}images/logo-dg-holiday.png" alt="D&amp;G Holiday" width="140" height="40"></a>
          <p class="dg-foot__blurb">Phuket and Thailand tours with clear prices, hotel pickup, and a mobile voucher.</p>
          <p class="dg-foot__hours">Daily 08:00–21:00 (GMT+7)</p>
        </div>
        <div>
          <h2>Explore</h2>
          <ul>
          ${list(FOOTER_EXPLORE)}
          </ul>
        </div>
        <div>
          <h2>Destinations</h2>
          <ul>
          ${list(FOOTER_DESTINATIONS)}
          </ul>
        </div>
        <div>
          <h2>Contact</h2>
          <ul>
            <li><a href="${MAP_URL}" target="_blank" rel="noopener noreferrer">852/7 พฤกษา อเวนิว Thap Yao, Lat Krabang, Bangkok 10520</a></li>
            <li><a href="tel:+66842148155">084 214 8155</a></li>
            <li><a href="tel:+66821479553">082 147 9553</a></li>
            <li><a href="https://line.me/R/ti/p/~@354ejhoo" target="_blank" rel="noopener noreferrer">Line @354ejhoo</a></li>
            <li><a href="http://m.me/dgholidaythailand" target="_blank" rel="noopener noreferrer">Messenger</a></li>
            <li><a href="mailto:dgholidaythailand@gmail.com">dgholidaythailand@gmail.com</a></li>
            <li><a href="https://wa.me/66821479553" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
          </ul>
        </div>
      </div>
      <div class="dg-foot__bottom">
        <p>&copy; 2026 D&amp;G Holiday Co., Ltd.</p>
        <div>
          <a href="${prefix}faq/">Terms &amp; Conditions</a>
          <a href="${prefix}faq/">Privacy Policy</a>
        </div>
      </div>
    </div>
  </footer>`;
}

function shell({ title, description, depth, body, image, scripts = [] }) {
  const prefix = "../".repeat(depth);
  const extraScripts = scripts
    .map((s) => `\n  <script src="${prefix}${s}" defer></script>`)
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} — D&amp;G Holiday</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)} — D&amp;G Holiday">
  <meta property="og:description" content="${esc(description)}">${
    image ? `\n  <meta property="og:image" content="${prefix}${esc(image)}">` : ""
  }
  <link rel="icon" href="${prefix}images/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}images/favicon-32.png">
  <link rel="apple-touch-icon" href="${prefix}images/apple-touch-icon.png">
  <link rel="stylesheet" href="${prefix}css/dg-fonts.css">
  <link rel="stylesheet" href="${prefix}css/dg-region.css">
</head>
<body>
${headerHtml(prefix)}
  ${body}
${footerHtml(prefix)}
  <script src="${prefix}js/dg-region-nav.js" defer></script>
  <script src="${prefix}js/dg-float-contact.js" defer></script>
  <script src="${prefix}js/dg-i18n.js" defer></script>${extraScripts}
</body>
</html>`;
}

function write(file, html) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, html, "utf8");
  console.log("wrote", path.relative(root, file));
}

// How to book (source: ขั้นตอนการจองทัวร์ / D&G Holiday)
{
  const steps = [
    {
      title: "เลือกโปรแกรมทัวร์",
      titleEn: "Choose your tour",
      body: "เข้าเว็บไซต์ www.dg-holiday.com เลือกโปรแกรมทัวร์และช่วงเวลาเดินทางที่ต้องการ",
      extra: `<div class="dg-actions" style="margin-top:1rem">
        <a class="dg-btn dg-btn--primary" href="../destinations/">ดูปลายทางทั้งหมด</a>
        <a class="dg-btn dg-btn--ghost" href="../index.html#popular">ทัวร์ภูเก็ต</a>
      </div>`,
    },
    {
      title: "แจ้งรายละเอียดกับเจ้าหน้าที่",
      titleEn: "Tell us your trip details",
      body: "สนใจโปรแกรมไหน แค่แจ้งรหัส, วันที่เดินทาง, จำนวนผู้เดินทาง กับเจ้าหน้าที่ผ่าน 3 ช่องทางที่สะดวก เพื่อให้เจ้าหน้าที่เช็คที่ว่างให้ได้เร็วขึ้น",
      extra: `<ul class="dg-channels">
        <li><span>โทรศัพท์</span><a href="tel:+66842148155">084-2148155</a><a href="tel:+66821479553">082-1479553</a></li>
        <li><span>Line</span><a href="https://line.me/R/ti/p/~@354ejhoo" target="_blank" rel="noopener">@354ejhoo</a></li>
        <li><span>Inbox</span><a href="http://m.me/dgholidaythailand" target="_blank" rel="noopener">m.me/dgholidaythailand</a></li>
      </ul>
      <p class="dg-note">ถ้ายังไม่พบโปรแกรมที่ถูกใจ ให้เราแนะนำทัวร์ที่ใช่ในราคาที่ชอบได้นะคะ</p>`,
    },
    {
      title: "ยืนยันการจองและชำระมัดจำ",
      titleEn: "Confirm & pay deposit",
      body: 'ยืนยันการจอง ชำระเงินมัดจำได้อย่างมั่นใจผ่านบัญชีบริษัท "บริษัท ดีแอนด์จี ฮอลิเดย์ (ประเทศไทย) จำกัด" เท่านั้น และรับใบรับเงินมัดจำ',
      extra: `<p class="dg-note">เจ้าหน้าที่จะส่งเลขบัญชีบริษัทและใบรับเงินมัดจำให้ทางช่องทางที่ท่านติดต่อไว้</p>`,
    },
    {
      title: "ส่งหน้าพาสปอร์ต",
      titleEn: "Send your passport page",
      body: "ส่งหน้าพาสปอร์ต (วันหมดอายุพาสปอร์ตต้องมากกว่า 6 เดือนขึ้นไป) ในกรณีที่ต้องทำวีซ่า เจ้าหน้าที่จะแจ้งรายละเอียดการทำวีซ่าอีกครั้ง",
      extra: "",
    },
    {
      title: "ชำระเงินส่วนที่เหลือ",
      titleEn: "Pay the balance",
      body: "ชำระเงินส่วนที่เหลือก่อนเดินทาง 20 - 30 วัน และรับใบเสร็จ",
      extra: "",
    },
  ];

  const stepHtml = steps
    .map(
      (s, i) => `<li class="dg-step">
      <span class="dg-step__num">${i + 1}</span>
      <div class="dg-step__body">
        <h2>${esc(s.title)}</h2>
        <p class="dg-step__en">${esc(s.titleEn)}</p>
        <p>${esc(s.body)}</p>
        ${s.extra}
      </div>
    </li>`
    )
    .join("\n");

  const body = `
  <section class="dg-hero-mini"><div class="dg-wrap">
    <p class="dg-crumbs"><a href="../index.html">Home</a> / How to book</p>
    <p class="dg-eyebrow">D&amp;G Holiday</p>
    <h1>ขั้นตอนการจองทัวร์</h1>
    <p>ง่าย ครบ จบในที่เดียว กับ D&amp;G Holiday</p>
  </div></section>
  <main class="dg-wrap">
    <ol class="dg-steps-list">${stepHtml}</ol>

    <section class="dg-panel" style="margin:0 0 3rem">
      <h2>หลังจองทัวร์เรียบร้อย</h2>
      <ul class="dg-timeline">
        <li><strong>3 - 5 วัน ก่อนการเดินทาง</strong><span>เจ้าหน้าที่จะส่งใบนัดหมายการเดินทาง</span></li>
        <li><strong>1 วัน ก่อนการเดินทาง</strong><span>หัวหน้าทัวร์จะติดต่อมาแนะนำตัวทางโทรศัพท์</span></li>
      </ul>
    </section>
  </main>`;

  write(
    path.join(root, "how-to-book", "index.html"),
    shell({
      title: "ขั้นตอนการจองทัวร์ (How to book)",
      description:
        "ขั้นตอนการจองทัวร์กับ D&G Holiday: เลือกโปรแกรม แจ้งรายละเอียด ชำระมัดจำผ่านบัญชีบริษัท ส่งพาสปอร์ต และชำระส่วนที่เหลือ",
      depth: 1,
      body,
    })
  );
}

// Photo credits (CC attribution for the Commons images used on region pages)
{
  const creditsFile = path.join(root, "data", "region-image-credits.json");
  if (fs.existsSync(creditsFile)) {
    const credits = JSON.parse(fs.readFileSync(creditsFile, "utf8"));
    const rows = credits
      .map(
        (c) => `<tr>
        <td><img src="../${esc(c.file)}" alt="" width="96" height="64" loading="lazy"></td>
        <td><a href="${esc(c.source)}" target="_blank" rel="noopener">${esc(c.title)}</a></td>
        <td>${esc(c.author)}</td>
        <td>${esc(c.license)}</td>
      </tr>`
      )
      .join("\n");
    const body = `
  <section class="dg-hero-mini"><div class="dg-wrap">
    <p class="dg-crumbs"><a href="../index.html">Home</a> / Photo credits</p>
    <p class="dg-eyebrow">Attribution</p>
    <h1>Photo credits</h1>
    <p>Photos on our Chiang Mai, Chiang Rai, Krabi and Koh Samui pages come from Wikimedia Commons and are used under their respective licences. Phuket tour photos are our own.</p>
  </div></section>
  <main class="dg-wrap">
    <div class="dg-panel" style="overflow-x:auto">
      <table class="dg-credit-table">
        <thead><tr><th>Photo</th><th>Source file</th><th>Author</th><th>Licence</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </main>`;
    write(
      path.join(root, "credits", "index.html"),
      shell({
        title: "Photo credits",
        description:
          "Attribution for Wikimedia Commons photos used on D&G Holiday destination pages.",
        depth: 1,
        body,
      })
    );
  }
}

// Destinations index
{
  const cards = catalog
    .map(
      (r) => `<a class="dg-region-link" href="../destinations/${r.region}/">
      <span class="dg-region-link__media"><img src="../${esc(
        r.heroImage || r.tours[0].image
      )}" alt="${esc(r.regionLabel)}" loading="lazy"></span>
      <strong>${esc(r.regionLabel)}</strong>
      <span>${esc(r.regionLabelTh)} · ${r.tours.length} tours</span>
      <span>${esc(r.blurb)}</span>
    </a>`
    )
    .join("\n");
  const body = `
  <section class="dg-hero-mini"><div class="dg-wrap">
    <p class="dg-crumbs"><a href="../index.html">Home</a> / Destinations</p>
    <p class="dg-eyebrow">D&amp;G Holiday</p>
    <h1>Explore Thailand beyond Phuket</h1>
    <p>Day trips and multi-day packages for Chiang Mai, Chiang Rai, Krabi and Koh Samui — based on our operator programs.</p>
  </div></section>
  <main class="dg-wrap"><div class="dg-regions">${cards}</div></main>`;
  write(path.join(root, "destinations", "index.html"), shell({ title: "Destinations", description: "Chiang Mai, Chiang Rai, Krabi and Koh Samui tours with D&G Holiday.", depth: 1, body }));
}

function tourCards(tours) {
  return tours
    .map((t) => {
      const price =
        t.price > 0
          ? `${money(t.price)} <span>${esc(t.type === "package" ? "from / person" : "adult")}</span>`
          : `Enquire <span>${esc(t.priceNote || "")}</span>`;
      return `<a class="dg-card" href="../../tours/${t.slug}/">
      <div class="dg-card__media">
        <img src="../../${esc(t.image)}" alt="${esc(t.title)}" loading="lazy">
        <span class="dg-card__badge">${esc(t.type === "package" ? "Package" : "Day trip")}</span>
      </div>
      <div class="dg-card__body">
        <h2>${esc(t.title)}</h2>
        <p class="dg-card__meta">${esc(t.duration)}</p>
        <p class="dg-card__price">${price}</p>
      </div>
    </a>`;
    })
    .join("\n");
}

function galleryHtml(t) {
  const images = t.images && t.images.length ? t.images : [t.image];
  const thumbs = images
    .map(
      (src, i) =>
        `<li><button type="button" data-dg-gallery-thumb data-src="../../${esc(src)}" aria-current="${
          i === 0 ? "true" : "false"
        }" aria-label="Photo ${i + 1}"><img src="../../${esc(src)}" alt="" loading="lazy"></button></li>`
    )
    .join("");
  return `<section class="dg-gallery" aria-label="Photos">
    <figure class="dg-gallery__main">
      <img data-dg-gallery-main src="../../${esc(images[0])}" alt="${esc(t.title)}">
    </figure>
    ${images.length > 1 ? `<ul class="dg-gallery__thumbs">${thumbs}</ul>` : ""}
  </section>`;
}

function bookingCardHtml(region, t) {
  const priceLine =
    t.price > 0
      ? `<strong>${money(t.price)}</strong><span> / adult${
          t.childPrice ? ` · child ${money(t.childPrice)}` : ""
        }</span>`
      : `<strong>Enquire</strong><span> / quoted per group</span>`;
  const wa =
    "https://wa.me/66821479553?text=" +
    encodeURIComponent("Hi D&G Holiday, I am interested in: " + t.title);

  return `<aside class="dg-book" id="booking-card" data-slug="${esc(t.slug)}" data-title="${esc(
    t.title
  )}" data-adult-price="${t.price || 0}" data-child-price="${t.childPrice || 0}">
    <div class="dg-book__price">${priceLine}</div>
    <p class="dg-book__note">${esc(t.priceNote || "")}</p>

    <label class="dg-book__label" for="dg-date-${esc(t.slug)}">Tour date</label>
    <input class="dg-book__date" type="date" id="dg-date-${esc(t.slug)}" data-dg-date>

    <div class="dg-book__qty" data-dg-qty="adults">
      <span>Adults<small>${t.price > 0 ? money(t.price) + " each" : "price on request"}</small></span>
      <span class="dg-book__ctrl">
        <button type="button" data-delta="-1" aria-label="Fewer adults">−</button>
        <b data-dg-qty-val>1</b>
        <button type="button" data-delta="1" aria-label="More adults">+</button>
      </span>
    </div>
    <div class="dg-book__qty" data-dg-qty="children">
      <span>Children<small>${
        t.childPrice > 0 ? money(t.childPrice) + " each" : "ask for child rate"
      }</small></span>
      <span class="dg-book__ctrl">
        <button type="button" data-delta="-1" aria-label="Fewer children">−</button>
        <b data-dg-qty-val>0</b>
        <button type="button" data-delta="1" aria-label="More children">+</button>
      </span>
    </div>

    <div class="dg-book__total"><span>Total</span><strong data-dg-total>${
      t.price > 0 ? money(t.price) : "Quoted on request"
    }</strong></div>

    <div class="dg-actions">
      <a class="dg-btn dg-btn--primary" href="../../book/?tour=${encodeURIComponent(
        t.slug
      )}&title=${encodeURIComponent(t.title)}&price=${t.price || 0}&child=${
    t.childPrice || 0
  }" data-dg-book>Book now</a>
      <a class="dg-btn dg-btn--ghost" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>
    </div>
    <p class="dg-book__fine">Deposit is transferred to our company account only. <a href="../../how-to-book/">See booking steps</a>.</p>
  </aside>`;
}

function faqHtml(region, t) {
  const pickup =
    t.type === "package"
      ? "Your Driver Guide meets you as written in the program (airport or hotel). We confirm the exact time when the booking is finalised."
      : `Hotel pickup is included for the zones listed in the program around ${region.regionLabel}. We confirm your pickup time the day before.`;
  const items = [
    ["Where does the tour start?", pickup],
    [
      "How do I pay?",
      "Tell our staff the program, travel date and number of guests. After we confirm availability, the deposit is transferred to บริษัท ดีแอนด์จี ฮอลิเดย์ (ประเทศไทย) จำกัด only and you receive a deposit receipt. The balance is paid 20–30 days before departure.",
    ],
    [
      "Do you need my passport?",
      "For packages we ask for your passport page (valid more than 6 months). If a visa is needed, our staff explains the steps.",
    ],
    [
      "What happens before departure?",
      "3–5 days before the trip you receive the appointment sheet. 1 day before, the tour leader calls to introduce themselves.",
    ],
    [
      "Can the program change?",
      "Yes — order of stops can change for weather, sea conditions or safety. We always keep the highlights listed above.",
    ],
  ];
  return items
    .map(
      ([q, a]) => `<details class="dg-faq">
      <summary>${esc(q)}</summary>
      <p>${esc(a)}</p>
    </details>`
    )
    .join("");
}

function relatedHtml(region, t) {
  const others = region.tours.filter((x) => x.slug !== t.slug).slice(0, 3);
  if (!others.length) return "";
  return `<section class="dg-panel" style="margin:0 0 3rem">
      <h2>More in ${esc(region.regionLabel)}</h2>
      <div class="dg-grid" style="padding-bottom:0">${tourCards(others)}</div>
    </section>`;
}

function tourPageBody(region, t) {
  const highlights = (t.highlights || []).map((x) => `<li>${esc(x)}</li>`).join("");
  const itinerary = (t.itinerary || []).map((x) => `<li>${esc(x)}</li>`).join("");
  const includes = (t.includes || []).map((x) => `<li>${esc(x)}</li>`).join("");
  const excludes = (t.excludes || []).map((x) => `<li>${esc(x)}</li>`).join("");
  const excludesBlock = excludes
    ? `<h3 class="dg-subhead">Not included</h3><ul>${excludes}</ul>`
    : "";

  const tabs = [
    ["#overview", "Overview"],
    ["#itinerary", "Itinerary"],
    ["#included", "What's included"],
    ["#faq", "FAQ"],
    ["#reviews", "Reviews"],
  ]
    .map(
      ([href, label]) =>
        `<a class="dg-tab" data-dg-tab href="${href}">${esc(label)}</a>`
    )
    .join("");

  return `
  <section class="dg-hero-mini"><div class="dg-wrap">
    <p class="dg-crumbs"><a href="../../index.html">Home</a> / <a href="../../destinations/">Destinations</a> / <a href="../../destinations/${
      region.region
    }/">${esc(region.regionLabel)}</a> / Tour</p>
    <p class="dg-eyebrow">${esc(region.regionLabel)} · ${esc(
      t.type === "package" ? "Package" : "Day trip"
    )}</p>
    <h1>${esc(t.title)}</h1>
    <p>${esc(t.titleTh || "")}</p>
    <p class="dg-meta-row"><span>${esc(t.duration)}</span><span>${esc(
      t.badges && t.badges.length ? t.badges.join(" · ") : region.regionLabel
    )}</span></p>
  </div></section>

  <main class="dg-wrap">
    ${galleryHtml(t)}

    <nav class="dg-tabs" aria-label="Sections">${tabs}</nav>

    <div class="dg-tour">
      <div>
        <section class="dg-panel" id="overview">
          <h2>Overview</h2>
          <p class="dg-lead">${esc(t.description)}</p>
          <h3 class="dg-subhead">Highlights</h3>
          <ul>${highlights}</ul>
        </section>

        <section class="dg-panel" id="itinerary" style="margin-top:1rem">
          <h2>Itinerary</h2>
          <ol class="dg-timeline-list">${itinerary}</ol>
        </section>

        <section class="dg-panel" id="included" style="margin-top:1rem">
          <h2>What's included</h2>
          <ul>${includes}</ul>
          ${excludesBlock}
          <h3 class="dg-subhead">Meeting point</h3>
          <p>${
            t.type === "package"
              ? esc(
                  "As written in the program — airport or hotel pickup with your Driver Guide. Confirmed with your appointment sheet 3–5 days before departure."
                )
              : esc(
                  "Hotel pickup inside the zones listed in the program around " +
                    region.regionLabel +
                    ". Pickup time is confirmed the day before."
                )
          }</p>
        </section>

        <section class="dg-panel" id="faq" style="margin-top:1rem">
          <h2>Frequently asked</h2>
          ${faqHtml(region, t)}
        </section>

        <section class="dg-panel" id="reviews" style="margin-top:1rem">
          <h2>Reviews</h2>
          <div class="dg-rating">
            <div>
              <strong>4.7</strong>
              <span>★★★★★</span>
              <small>80 Google reviews for D&amp;G Holiday</small>
            </div>
            <a class="dg-btn dg-btn--ghost" href="../../faq/#reviews">Read guest notes</a>
          </div>
          <p class="dg-note" style="margin-top:1rem">This ${esc(
            region.regionLabel
          )} program is newly published, so it has no tour-specific reviews yet. The rating above is our company rating across all D&amp;G Holiday trips.</p>
        </section>
      </div>

      ${bookingCardHtml(region, t)}
    </div>

    ${relatedHtml(region, t)}

    <p class="dg-credits">Photos of ${esc(
      region.regionLabel
    )} by Wikimedia Commons contributors — <a href="../../credits/">see photo credits</a>.</p>
  </main>`;
}

for (const region of catalog) {
  const days = region.tours.filter((t) => t.type === "day");
  const packages = region.tours.filter((t) => t.type === "package");
  const sections = [];
  if (days.length) {
    sections.push(`<h2 class="dg-section-title">Day trips</h2><div class="dg-grid">${tourCards(days)}</div>`);
  }
  if (packages.length) {
    sections.push(`<h2 class="dg-section-title" style="margin-top:2rem">Packages</h2><div class="dg-grid">${tourCards(packages)}</div>`);
  }

  const ref = region.ref
    ? `<p class="dg-hero-ref">Route inspiration: <a href="${esc(region.ref)}" target="_blank" rel="noopener">${esc(region.ref.replace(/^https?:\/\//, ""))}</a></p>`
    : "";

  const hero = region.heroImage || region.tours[0].image;
  const body = `
  <section class="dg-hero-region">
    <img class="dg-hero-region__bg" src="../../${esc(hero)}" alt="${esc(region.regionLabel)}">
    <div class="dg-wrap dg-hero-region__inner">
      <p class="dg-crumbs"><a href="../../index.html">Home</a> / <a href="../">Destinations</a> / ${esc(region.regionLabel)}</p>
      <p class="dg-eyebrow">${esc(region.regionLabelTh)}</p>
      <h1>${esc(region.regionLabel)} tours</h1>
      <p>${esc(region.blurb)}</p>
      ${ref}
    </div>
  </section>
  <main class="dg-wrap">${sections.join("\n")}
    <p class="dg-credits">Photos of ${esc(
      region.regionLabel
    )} by Wikimedia Commons contributors — <a href="../../credits/">see photo credits</a>.</p>
  </main>`;

  write(
    path.join(root, "destinations", region.region, "index.html"),
    shell({
      title: `${region.regionLabel} tours`,
      description: region.blurb,
      depth: 2,
      image: hero,
      body,
    })
  );

  for (const t of region.tours) {
    write(
      path.join(root, "tours", t.slug, "index.html"),
      shell({
        title: t.title,
        description: t.description,
        depth: 2,
        image: t.image,
        scripts: ["js/dg-region-tour.js"],
        body: tourPageBody(region, t),
      })
    );
  }
}

// Flatten for tours-data merge helper
const flat = [];
for (const region of catalog) {
  for (const t of region.tours) {
    flat.push({
      slug: t.slug,
      title: t.title,
      duration: t.duration,
      rating: "New",
      reviews: "0",
      price: t.price || 0,
      priceLabel: t.price > 0 ? Number(t.price).toLocaleString("en-US") : "Enquire",
      childPrice: t.childPrice || 0,
      destination: region.regionLabel,
      region: region.region,
      type: t.type,
      images: t.images && t.images.length ? t.images : [t.image],
      highlights: t.highlights || [],
      description: t.description,
      itinerary: t.itinerary || [],
      badges: t.badges || [],
      feeAdult: 0,
      feeChild: 0,
      feeLabel: "",
    });
  }
}
fs.writeFileSync(path.join(root, "data", "region-tours-flat.json"), JSON.stringify(flat, null, 2));
console.log("flat tours", flat.length);
