// Re-merges data/region-tours-flat.json into tours/_tours-data.json,
// replacing any previously merged region entries.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataFile = path.join(root, "tours", "_tours-data.json");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

const flat = readJson(path.join(root, "data", "region-tours-flat.json"));
const existing = readJson(dataFile);
const list = Array.isArray(existing) ? existing : existing.tours;
if (!Array.isArray(list)) throw new Error("unexpected _tours-data.json shape");

const regionSlugs = new Set(flat.map((t) => t.slug));
const kept = list.filter((t) => !regionSlugs.has(t.slug));
const merged = kept.concat(flat);

if (Array.isArray(existing)) {
  fs.writeFileSync(dataFile, JSON.stringify(merged, null, 2), "utf8");
} else {
  existing.tours = merged;
  fs.writeFileSync(dataFile, JSON.stringify(existing, null, 2), "utf8");
}
console.log("kept", kept.length, "+ region", flat.length, "= total", merged.length);
