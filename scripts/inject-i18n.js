// Injects js/dg-i18n.js into every index.html that does not already load it.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "_docx_tmp")
      continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name === "index.html") pages.push(p);
  }
})(root);

let updated = 0;
for (const file of pages) {
  let html = fs.readFileSync(file, "utf8");
  if (/dg-i18n\.js/.test(html)) continue;

  const rel = path.relative(root, file).replace(/\\/g, "/");
  const depth = rel.split("/").length - 1;
  const prefix = "../".repeat(depth);
  const tag = `<script src="${prefix}js/dg-i18n.js" defer></script>`;

  // Prefer injecting before the first of our known site scripts.
  const anchors = [
    `${prefix}js/dg-float-contact.js`,
    `${prefix}js/dg-region-nav.js`,
    `${prefix}js/site.js`,
    `js/dg-float-contact.js`,
    `js/site.js`,
    `js/page.js`,
    `js/tour.js`,
    `../../js/dg-float-contact.js`,
    `../js/dg-float-contact.js`,
  ];

  let done = false;
  for (const a of anchors) {
    const needle = `<script src="${a}"`;
    const at = html.indexOf(needle);
    if (at >= 0) {
      html = html.slice(0, at) + tag + html.slice(at);
      done = true;
      break;
    }
  }
  if (!done) {
    html = html.replace(/<\/body>/i, tag + "</body>");
  }
  fs.writeFileSync(file, html, "utf8");
  updated += 1;
  console.log("i18n →", rel);
}
console.log("pages updated:", updated);
