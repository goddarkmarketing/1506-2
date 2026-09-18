// Compares the shared chrome between the homepage and the generated region pages:
// the Destinations dropdown entries, the webfont stylesheet, and the nav items.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function labelsFromSiteJs() {
  const js = fs.readFileSync(path.join(root, "js", "site.js"), "utf8");
  const block = js.match(/const destinations = \[[\s\S]*?\];/);
  return [...block[0].matchAll(/label: "([^"]+)"/g)].map((m) => m[1]);
}

function labelsFromTourJs() {
  const js = fs.readFileSync(path.join(root, "tours", "_shared", "tour.js"), "utf8");
  const block = js.match(/const destinations = \[[\s\S]*?\];/);
  return [...block[0].matchAll(/label: "([^"]+)"/g)].map((m) => m[1]);
}

function labelsFromRegionPage(rel) {
  const html = fs.readFileSync(path.join(root, rel), "utf8");
  const menu = html.match(/<div class="dg-top__menu"[^>]*>([\s\S]*?)<\/div>/);
  if (!menu) return null;
  return [...menu[1].matchAll(/>([^<]+)<\/a>/g)].map((m) =>
    m[1].replace(/&amp;/g, "&").trim()
  );
}

const site = labelsFromSiteJs();
const tour = labelsFromTourJs();
const region = labelsFromRegionPage("destinations/chiang-mai/index.html");

const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

console.log("site.js dropdown      :", site.length, "items");
console.log("tour.js dropdown      :", tour.length, "items");
console.log("region page dropdown  :", region ? region.length : "not found", "items");
console.log("site.js == tour.js    :", same(site, tour));
console.log("site.js == region page:", region ? same(site, region) : false);
if (region && !same(site, region)) {
  console.log(" site  :", site.join(" | "));
  console.log(" region:", region.join(" | "));
}

const fontsCss = path.join(root, "css", "dg-fonts.css");
console.log("\ncss/dg-fonts.css exists:", fs.existsSync(fontsCss));

const sample = fs.readFileSync(
  path.join(root, "tours", "chiang-rai-temple-trio-day", "index.html"),
  "utf8"
);
console.log("tour page links fonts  :", sample.includes("css/dg-fonts.css"));
console.log("nav items on region page:", [
  ...sample.matchAll(/<li><a href="[^"]*">([^<]+)<\/a><\/li>/g),
].map((m) => m[1]).slice(0, 8).join(" | "));
