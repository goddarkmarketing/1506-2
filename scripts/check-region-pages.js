// Sanity check: every local asset/link on the generated region pages resolves,
// and each tour page has the booking card + gallery + tabs wired up.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, "data", "region-tours.json"), "utf8")
);

const pages = [
  "destinations/index.html",
  "how-to-book/index.html",
  "credits/index.html",
  "index.html",
];
for (const r of catalog) {
  pages.push(`destinations/${r.region}/index.html`);
  for (const t of r.tours) pages.push(`tours/${t.slug}/index.html`);
}

let problems = 0;

function resolveRef(pageFile, ref) {
  if (
    !ref ||
    /^(https?:|mailto:|tel:|data:|#|javascript:)/i.test(ref) ||
    ref.startsWith("//")
  )
    return null;
  const clean = ref.split("#")[0].split("?")[0];
  // The scraped Phuket cards carry JSON inside data-kt-item, which makes the
  // attribute regex pick up fragments like `THB`; those are not real refs.
  if (!clean || !/[/.]/.test(clean)) return null;
  const target = path.resolve(path.dirname(path.join(root, pageFile)), clean);
  return target;
}

for (const page of pages) {
  const file = path.join(root, page);
  if (!fs.existsSync(file)) {
    console.log("MISSING PAGE", page);
    problems += 1;
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  for (const ref of refs) {
    if (seen.has(ref)) continue;
    seen.add(ref);
    const target = resolveRef(page, ref);
    if (!target) continue;
    const ok =
      fs.existsSync(target) ||
      (fs.existsSync(path.join(target, "index.html")) &&
        fs.statSync(target).isDirectory());
    if (!ok) {
      console.log("BROKEN", page, "->", ref);
      problems += 1;
    }
  }
}

for (const r of catalog) {
  for (const t of r.tours) {
    const html = fs.readFileSync(path.join(root, "tours", t.slug, "index.html"), "utf8");
    const checks = [
      ['id="booking-card"', 'data-adult-price="'],
      ["data-dg-gallery-main", "data-dg-gallery-thumb"],
      ["data-dg-tab", 'id="reviews"'],
      ['id="itinerary"', 'id="faq"'],
      ["js/dg-region-tour.js", "js/dg-float-contact.js"],
    ].flat();
    for (const needle of checks) {
      if (!html.includes(needle)) {
        console.log("MISSING", t.slug, needle);
        problems += 1;
      }
    }
    const imgs = (t.images || [t.image]).length;
    const thumbs = (html.match(/data-dg-gallery-thumb/g) || []).length;
    if (imgs > 1 && thumbs !== imgs) {
      console.log("THUMB COUNT", t.slug, thumbs, "!=", imgs);
      problems += 1;
    }
  }
}

console.log(problems ? "\nproblems: " + problems : "\nall region pages check out");
