// Points the homepage region tour cards (and the "More of Thailand" grid)
// at the region photo library instead of the Phuket stock images.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, "data", "region-tours.json"), "utf8")
);
const file = path.join(root, "index.html");
let html = fs.readFileSync(file, "utf8");
let changed = 0;

function swapAfter(anchor, newSrc) {
  const at = html.indexOf(anchor);
  if (at < 0) {
    console.warn("anchor not found:", anchor);
    return;
  }
  const imgAt = html.indexOf('src="images/', at);
  if (imgAt < 0 || imgAt - at > 1200) {
    console.warn("no image near:", anchor);
    return;
  }
  const end = html.indexOf('"', imgAt + 5);
  const before = html.slice(imgAt + 5, end);
  if (before === newSrc) return;
  html = html.slice(0, imgAt + 5) + newSrc + html.slice(end);
  changed += 1;
}

for (const region of catalog) {
  for (const tour of region.tours) {
    swapAfter(`href="tours/${tour.slug}/"`, tour.image);
  }
}

/* Rebuild the text-only "More of Thailand" cards as photo cards. */
const ZONE = {
  "chiang-mai": "North",
  "chiang-rai": "North",
  krabi: "South",
  "koh-samui": "Gulf",
};

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const regionCards = catalog
  .map((r) => {
    const teaser = r.tours
      .map((t) => t.title.replace(/^.*?(?:—|-)\s*/, "").split(/[(,]/)[0].trim())
      .slice(0, 3)
      .join(" · ");
    const hero = r.heroImage || r.tours[0].image;
    return `    <a href="destinations/${r.region}/" class="group relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:border-[color:var(--brand-accent)]/40 hover:shadow-md">
      <div class="relative aspect-[4/3] w-full overflow-hidden bg-black/5">
        <img src="${esc(hero)}" alt="${esc(r.regionLabel)}" loading="lazy" decoding="async" class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110">
        <span class="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--brand-secondary)] shadow-sm backdrop-blur">${esc(
          ZONE[r.region] || "Thailand"
        )}</span>
      </div>
      <div class="p-5">
        <h3 class="text-lg font-bold text-[color:var(--brand-secondary)]">${esc(r.regionLabel)}</h3>
        <p class="mt-1 text-sm text-zinc-600">${esc(teaser)}</p>
        <p class="mt-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-accent)]">${
          r.tours.length
        } tours</p>
      </div>
    </a>`;
  })
  .join("\n");

const gridStart = html.indexOf(
  '<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">',
  html.indexOf("More of Thailand")
);
if (gridStart < 0) {
  console.warn('could not find the "More of Thailand" grid');
} else {
  const gridEnd = html.indexOf("</div>\n</section>", gridStart);
  if (gridEnd < 0) {
    console.warn("could not find the end of the region grid");
  } else {
    html =
      html.slice(0, gridStart) +
      '<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">\n' +
      regionCards +
      "\n  " +
      html.slice(gridEnd);
    changed += 4;
  }
}

fs.writeFileSync(file, html, "utf8");
console.log("homepage image slots updated:", changed);
