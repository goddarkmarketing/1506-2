// Every photo in images/regions must have an attribution entry, and every
// attribution must point at a file that still exists.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "images", "regions");
const credits = JSON.parse(
  fs.readFileSync(path.join(root, "data", "region-image-credits.json"), "utf8")
);

const onDisk = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f));
const credited = new Set(credits.map((c) => path.basename(c.file)));

const missing = onDisk.filter((f) => !credited.has(f));
const stale = credits.filter((c) => !fs.existsSync(path.join(root, c.file)));
const noLicence = credits.filter((c) => !c.license || /^see /i.test(c.license));

console.log("photos on disk:", onDisk.length);
console.log("attributions:", credits.length);
if (missing.length) console.log("MISSING ATTRIBUTION:", missing.join(", "));
if (stale.length) console.log("STALE ENTRIES:", stale.map((c) => c.file).join(", "));
if (noLicence.length)
  console.log("LICENCE NEEDS A LOOK:", noLicence.map((c) => c.file).join(", "));
if (!missing.length && !stale.length) console.log("attribution complete");
