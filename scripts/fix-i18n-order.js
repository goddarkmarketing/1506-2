// Ensures dg-i18n.js is the last deferred site script on every page.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name === "index.html") pages.push(p);
  }
})(root);

let n = 0;
for (const file of pages) {
  let html = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file).replace(/\\/g, "/");
  const depth = rel.split("/").length - 1;
  const prefix = "../".repeat(depth);
  const tag = `<script src="${prefix}js/dg-i18n.js" defer></script>`;

  // Strip any existing i18n tags (wrong order / wrong relative path)
  html = html.replace(/<script[^>]*dg-i18n\.js[^>]*><\/script>\s*/g, "");

  if (!/<\/body>/i.test(html)) continue;
  html = html.replace(/<\/body>/i, tag + "</body>");
  fs.writeFileSync(file, html, "utf8");
  n += 1;
}
console.log("i18n ordered last on", n, "pages");
