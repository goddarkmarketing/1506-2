// Copies shared blocks from tours/_shared/tour.js into each per-tour copy.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const toursDir = path.join(root, "tours");
const shared = fs.readFileSync(path.join(toursDir, "_shared", "tour.js"), "utf8");

function grab(re, name) {
  const m = shared.match(re);
  if (!m) throw new Error("shared block not found: " + name);
  return m[0];
}

const destRe = /  const destinations = \[[\s\S]*?\];/;
const navRe = /  \/\* ---------- How to book link next to FAQ ---------- \*\/[\s\S]*?\n  \}\);/;
const anchorRe = /  \/\* ---------- Currency \/ search: stay local ---------- \*\//;

const destBlock = grab(destRe, "destinations");
const navBlock = grab(navRe, "how-to-book nav");

let updated = 0;
for (const dir of fs.readdirSync(toursDir)) {
  const file = path.join(toursDir, dir, "js", "tour.js");
  if (!fs.existsSync(file)) continue;

  const before = fs.readFileSync(file, "utf8");
  let out = before.replace(destRe, () => destBlock);
  if (!navRe.test(out) && anchorRe.test(out)) {
    out = out.replace(anchorRe, (m) => navBlock + "\n\n" + m);
  }

  if (out !== before) {
    fs.writeFileSync(file, out);
    updated += 1;
    console.log("synced", dir);
  }
}
console.log("per-tour tour.js updated:", updated);
