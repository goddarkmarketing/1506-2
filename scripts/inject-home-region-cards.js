const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const homePath = path.join(root, "index.html");
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, "data", "region-tours.json"), "utf8")
);

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Card footers are narrow, so keep the note to its first clause.
function shortNote(note) {
  if (!note) return "";
  const first = note.split("·")[0].trim();
  return first.length > 44 ? first.slice(0, 41).trimEnd() + "…" : first;
}

// island/boat vs land classification per slug
const BOAT = new Set([
  "krabi-7-islands-sunset",
  "krabi-phi-phi-3d2n",
  "koh-samui-ang-thong-speedboat",
  "koh-samui-angels-joy-4d3n",
]);

function cardHtml(region, t) {
  const type = BOAT.has(t.slug) ? "island" : "land";
  const duration =
    t.type === "package" ? "multi" : /half/i.test(t.duration) ? "half" : "full";
  const badge = t.type === "package" ? "Package" : "Day trip";
  const price =
    t.price > 0
      ? `<span class="contents" data-kt-price="${t.price}" data-kt-src="THB"><span class="block tabular-nums font-bold text-base sm:text-lg leading-tight text-[color:var(--color-price)]"><span class="mr-0.5 text-xs font-normal text-black/60">from</span><span data-kt-amount="true">THB ${Number(
          t.price
        ).toLocaleString("en-US")}</span></span></span>`
      : `<span class="block text-base font-bold leading-tight text-[color:var(--color-price)]">Enquire</span>`;

  return `<li class="h-full" data-dg-tour-card data-region="${region.region}" data-cat="${region.region}" data-cat-label="${esc(
    region.regionLabel
  )}" data-type="${type}" data-price="${t.price || 0}" data-duration="${duration}"><article class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-all duration-300"><a class="absolute inset-0 z-0 rounded-2xl" href="tours/${t.slug}/" aria-label="${esc(
    t.title
  )}"></a><div class="pointer-events-none relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-black/5"><img src="${esc(
    t.image
  )}" alt="${esc(
    t.title
  )}" loading="lazy" decoding="async" class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"><div class="absolute left-3 top-3 z-20 flex max-w-[75%] flex-wrap items-start gap-1.5"><span class="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--brand-secondary)] shadow-sm backdrop-blur">${badge}</span></div></div><div class="pointer-events-none relative z-20 -mt-3 px-4"><a class="pointer-events-auto inline-flex min-h-[24px] items-center rounded-full border border-[color:var(--brand-accent)] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[color:var(--brand-accent-strong)] shadow-sm transition-colors hover:bg-[color:var(--brand-accent-tint)]" href="destinations/${
    region.region
  }/">${esc(
    region.regionLabel
  )}</a></div><div class="pointer-events-none relative z-10 flex flex-1 flex-col space-y-2 p-4"><h3 class="font-semibold leading-snug text-[color:var(--brand-secondary)] transition-colors group-hover:text-[color:var(--brand-primary)]">${esc(
    t.title
  )}</h3><div class="flex items-center gap-1.5 text-sm text-black/60"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>${esc(
    t.duration
  )}</span></div><div class="mt-auto flex items-end justify-between gap-2 pt-1 text-sm"><span class="text-black/60">${esc(
    shortNote(t.priceNote)
  )}</span><span class="text-right">${price}</span></div></div></article></li>`;
}

let html = fs.readFileSync(homePath, "utf8");

// 1. Tag existing Phuket cards with data-region
html = html.replace(/<li class="h-full" data-dg-tour-card(?! data-region)/g, (m) =>
  m.replace("data-dg-tour-card", 'data-dg-tour-card data-region="phuket"')
);

// 2. Locate grid and its matching closing </ul>
const gridAttr = "data-dg-tours-grid";
const gridIdx = html.indexOf(gridAttr);
if (gridIdx < 0) throw new Error("tours grid not found");
const gridStart = html.indexOf(">", gridIdx) + 1;

let depth = 1;
let cursor = gridStart;
let gridEnd = -1;
while (cursor < html.length) {
  const open = html.indexOf("<ul", cursor);
  const close = html.indexOf("</ul>", cursor);
  if (close < 0) break;
  if (open >= 0 && open < close) {
    depth += 1;
    cursor = open + 3;
  } else {
    depth -= 1;
    if (depth === 0) {
      gridEnd = close;
      break;
    }
    cursor = close + 5;
  }
}
if (gridEnd < 0) throw new Error("grid closing </ul> not found");

// 3. Build/replace region cards block
const cards = catalog
  .map((region) => region.tours.map((t) => cardHtml(region, t)).join(""))
  .join("");
const BLOCK_START = "<!-- dg-region-cards:start -->";
const BLOCK_END = "<!-- dg-region-cards:end -->";
const block = BLOCK_START + cards + BLOCK_END;

if (html.includes(BLOCK_START)) {
  html = html.replace(
    new RegExp(BLOCK_START + "[\\s\\S]*?" + BLOCK_END),
    () => block
  );
} else {
  html = html.slice(0, gridEnd) + block + html.slice(gridEnd);
}

// 4. Destination filter group (insert before Category group)
const catGroupMarker = `      <div class="dg-tours-sidebar__group">
        <p class="dg-tours-sidebar__label">Category</p>`;
const regionChips = catalog
  .map(
    (r) =>
      `          <label class="dg-tours-chip"><input type="radio" name="dg-region" value="${r.region}"><span>${esc(
        r.regionLabel
      )}</span></label>`
  )
  .join("\n");
const destGroup = `      <div class="dg-tours-sidebar__group">
        <p class="dg-tours-sidebar__label">Destination</p>
        <div class="dg-tours-sidebar__options" data-dg-filter-group="region">
          <label class="dg-tours-chip"><input type="radio" name="dg-region" value="all" checked><span>All Thailand</span></label>
          <label class="dg-tours-chip"><input type="radio" name="dg-region" value="phuket"><span>Phuket</span></label>
${regionChips}
        </div>
      </div>

`;
if (!html.includes('data-dg-filter-group="region"')) {
  html = html.replace(catGroupMarker, destGroup + catGroupMarker);
}

// 5. Category chips for the 4 regions
const lastCatChip =
  '<label class="dg-tours-chip"><input type="radio" name="dg-cat" value="phuket"><span>Phuket (land)</span></label>';
if (!html.includes('name="dg-cat" value="chiang-mai"')) {
  const extra = catalog
    .map(
      (r) =>
        `\n          <label class="dg-tours-chip"><input type="radio" name="dg-cat" value="${r.region}"><span>${esc(
          r.regionLabel
        )}</span></label>`
    )
    .join("");
  html = html.replace(lastCatChip, lastCatChip + extra);
}

// 6. Multi-day duration chip
const fullDurChip =
  '<label class="dg-tours-chip"><input type="radio" name="dg-duration" value="full"><span>Full day</span></label>';
if (!html.includes('name="dg-duration" value="multi"')) {
  html = html.replace(
    fullDurChip,
    fullDurChip +
      '\n          <label class="dg-tours-chip"><input type="radio" name="dg-duration" value="multi"><span>Multi-day</span></label>'
  );
}

// 7. Section heading now covers all of Thailand
html = html.replace(
  '>Popular Phuket tours</h2>',
  '>Popular tours in Thailand</h2>'
);

fs.writeFileSync(homePath, html, "utf8");

const total = (html.match(/data-dg-tour-card/g) || []).length;
console.log("region cards injected:", catalog.reduce((n, r) => n + r.tours.length, 0));
console.log("total cards in grid:", total);
