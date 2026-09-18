// Downloads freely licensed photos for the 4-region tours from Wikimedia Commons.
// Writes images into images/regions/, credits into data/region-image-credits.json,
// and back-fills an `images` array on every tour in data/region-tours.json.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "images", "regions");
const catalogPath = path.join(root, "data", "region-tours.json");
const creditsPath = path.join(root, "data", "region-image-credits.json");

const UA = "DGHolidaySiteBuilder/1.0 (local build script; contact dgholidaythailand@gmail.com)";
const API = "https://commons.wikimedia.org/w/api.php";
const PER_TOUR = 4;
// Spread picks across the query list so a tour does not end up with 4 near-identical shots.
const MAX_PER_QUERY = 2;
// Commons tags a lot of wildlife macros with the park name; those are not scenery.
// Binomial names ("Minla strigula - Doi Inthanon") are the main offender, plus a keyword list.
const REJECT_BINOMIAL = /^[A-Z][a-z]+ [a-z]+ (-|\d)/;
const REJECT_KEYWORD =
  /bird|beetle|moth|butterfl|spider|snake|frog|fungus|lichen|specimen|map of|diagram|logo|coat of arms|stamp|banknote|mandarin oriental|dhara dhevi|resort|hotel|doi chang mo?ob|doi chang mup|peaceful head|african|etosha|namibia|kenya|tanzania|zimbabwe|botswana|sri lanka|\bnepal\b|\bindia\b|\bzoo\b/i;

// Scanned book plates come back from Commons full-text search and look nothing
// like a tour photo; their titles carry a 4-digit publication year in brackets.
const REJECT_BOOK_SCAN = /\((1[5-9]\d\d)\)|^travels in|plate \d|illustration/i;

function rejectTitle(title) {
  return (
    REJECT_BINOMIAL.test(title) ||
    REJECT_KEYWORD.test(title) ||
    REJECT_BOOK_SCAN.test(title)
  );
}

// Commons search happily returns loosely related files, so require the file name
// to share at least one meaningful word with the query.
function matchesQuery(title, query) {
  const words = query
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 4 && w !== "thailand");
  if (!words.length) return true;
  const lower = title.toLowerCase();
  return words.some((w) => lower.includes(w));
}

// Search terms per tour, ordered by how well they match the program highlights.
const QUERIES = {
  "chiang-mai-elephant-hilltribe-day": [
    "Elephant Nature Park Chiang Mai",
    "Mae Taeng bamboo rafting",
    "Karen long neck village Thailand",
    "Asian elephant bathing Thailand",
    "Chiang Mai countryside",
  ],
  "chiang-mai-doi-suthep-half-day": [
    "Wat Phra That Doi Suthep",
    "Doi Suthep naga staircase",
    "Chiang Mai city view",
    "Doi Suthep chedi",
  ],
  "chiang-mai-doi-inthanon-day": [
    "Wachirathan Waterfall",
    "Phra Mahathat Napamethanidol",
    "Ban Mae Klang Luang",
    "Doi Inthanon summit",
  ],
  "chiang-mai-elephant-inthanon-hike-day": [
    "Elephant Nature Park",
    "Elephant bathing Thailand",
    "Pha Dok Siew",
    "Rice terrace Ban Mae Klang Luang",
    "Karen village Chiang Mai",
    "Coffee farm Chiang Mai",
  ],
  "chiang-mai-doi-inthanon-private-charter": [
    "Mae Ya Waterfall",
    "Kew Mae Pan",
    "Mae Klang Waterfall",
    "Doi Inthanon National Park",
  ],
  "chiang-rai-temple-trio-day": [
    "Wat Rong Suea Ten",
    "Baan Dam Museum Chiang Rai",
    "Wat Rong Khun",
    "Wat Huay Pla Kang",
  ],
  "chiang-rai-golden-triangle-day": [
    "Sop Ruak Golden Triangle",
    "Mae Sai Chiang Rai",
    "Hall of Opium",
    "Mekong River Chiang Rai",
  ],
  "chiang-rai-tea-coffee-day": [
    "Choui Fong tea plantation",
    "Tea plantation Chiang Rai",
    "Tea farm Thailand",
    "Coffee plantation Thailand",
    "Coffee cherries Thailand",
  ],
  "chiang-rai-city-highlights-join-day": [
    "Wat Phra Kaew Chiang Rai",
    "Singha Park Chiang Rai",
    "Chiang Rai clock tower",
    "Chiang Rai city",
  ],
  "chiang-mai-3d2n-private": [
    "Phra Mahathat Napamethanidol",
    "Mon Cham Chiang Mai",
    "Wat Ban Den",
    "Queen Sirikit Botanic Garden",
    "Tha Phae Gate",
    "Mae Kampong village",
    "Doi Inthanon summit",
    "Wachirathan Waterfall",
  ],
  "chiang-rai-phu-chi-fa-day": [
    "Phu Chi Fa",
    "Phu Chi Dao",
    "Sea of fog Chiang Rai",
    "Chiang Rai mountains",
  ],
  "chiang-rai-doi-mae-mon-day": [
    "Wat Rong Khun",
    "Wat Huay Pla Kang",
    "Singha Park Chiang Rai",
    "Chiang Rai tea plantation",
  ],
  "chiang-rai-doi-chang-4d3n": [
    "Golden Triangle Thailand",
    "Doi Tung",
    "Wat Rong Suea Ten",
    "Choui Fong tea plantation",
    "Doi Chang coffee",
  ],
  "krabi-emerald-pool-hot-spring-day": [
    "Emerald Pool Krabi",
    "Khlong Thom hot spring",
    "Wat Tham Suea",
    "Krabi rainforest",
  ],
  "krabi-7-islands-sunset": [
    "Ko Poda",
    "Ko Kai Krabi",
    "Railay Beach sunset",
    "Ao Nang beach",
    "Thale Waek Krabi",
  ],
  "krabi-phi-phi-3d2n": [
    "Phi Phi Islands",
    "Ton Sai Bay Phi Phi",
    "Maya Bay",
    "Phi Phi Don viewpoint",
  ],
  "koh-samui-zipline-adventure": [
    "Zip line jungle Thailand",
    "Na Muang Waterfall",
    "Ko Samui jungle",
    "Ko Samui waterfall",
  ],
  "koh-samui-ang-thong-speedboat": [
    "Mu Ko Ang Thong",
    "Ang Thong National Marine Park",
    "Ko Mae Ko emerald lake",
    "Kayaking Thailand islands",
  ],
  "koh-samui-angels-joy-4d3n": [
    "Ko Nang Yuan",
    "Ko Tao",
    "Lamai Beach",
    "Ko Mat Sum",
    "Ko Samui beach",
  ],
};

// Hero image for each destination hub.
const REGION_QUERIES = {
  "chiang-mai": ["Wat Phra That Doi Suthep", "Chiang Mai old city"],
  "chiang-rai": ["Wat Rong Khun", "Chiang Rai landscape"],
  krabi: ["Railay Beach", "Krabi limestone karst"],
  "koh-samui": ["Big Buddha Ko Samui", "Chaweng Beach"],
};

function slugifyFile(name) {
  return name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function api(params) {
  const url = new URL(API);
  url.search = new URLSearchParams({ format: "json", origin: "*", ...params }).toString();
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error("API " + res.status + " for " + params.gsrsearch);
  return res.json();
}

async function search(query, limit = 10) {
  const data = await api({
    action: "query",
    generator: "search",
    gsrsearch: query + " filetype:bitmap",
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1600",
  });
  const pages = data && data.query && data.query.pages ? Object.values(data.query.pages) : [];
  return pages
    .map((p) => {
      const info = p.imageinfo && p.imageinfo[0];
      if (!info) return null;
      const meta = info.extmetadata || {};
      const ratio = info.width / info.height;
      return {
        title: p.title,
        mime: info.mime,
        width: info.width,
        height: info.height,
        ratio,
        thumb: info.thumburl || info.url,
        page: info.descriptionurl,
        license: (meta.LicenseShortName && meta.LicenseShortName.value) || "",
        artist: ((meta.Artist && meta.Artist.value) || "").replace(/<[^>]+>/g, "").trim(),
      };
    })
    .filter(
      (x) =>
        x &&
        /^image\/(jpeg|png)$/.test(x.mime) &&
        x.width >= 1200 &&
        x.ratio >= 1.2 &&
        x.ratio <= 2.4 &&
        !/^(Public domain|CC0)?$/.test(x.license) !== false // keep all; license recorded below
    );
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error("download " + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function collect(queries, count, prefix, credits, seen) {
  const picked = [];
  for (const q of queries) {
    if (picked.length >= count) break;
    let results = [];
    try {
      results = await search(q);
    } catch (err) {
      console.warn("  search failed:", q, err.message);
      continue;
    }
    let fromThisQuery = 0;
    for (const r of results) {
      if (picked.length >= count) break;
      if (fromThisQuery >= MAX_PER_QUERY) break;
      if (seen.has(r.title)) continue;
      const plainTitle = r.title.replace(/^File:/, "").replace(/\.[a-z0-9]+$/i, "");
      if (rejectTitle(plainTitle)) continue;
      if (!matchesQuery(plainTitle, q)) continue;
      const ext = r.mime === "image/png" ? ".jpg" : ".jpg";
      const file = prefix + "-" + (picked.length + 1) + ext;
      const dest = path.join(outDir, file);
      try {
        const size = await download(r.thumb, dest);
        if (size < 20000) {
          fs.unlinkSync(dest);
          continue;
        }
        seen.add(r.title);
        fromThisQuery += 1;
        picked.push("images/regions/" + file);
        credits.push({
          file: "images/regions/" + file,
          source: r.page,
          title: r.title.replace(/^File:/, ""),
          author: r.artist || "See Commons page",
          license: r.license || "See Commons page",
          query: q,
        });
        console.log("  +", file, "<-", r.title.replace(/^File:/, "").slice(0, 60));
      } catch (err) {
        console.warn("  download failed:", r.title, err.message);
      }
    }
  }
  return picked;
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const credits = [];
  const seen = new Set();

  // Remember which Commons files are already in use so kept photos are not
  // re-downloaded under a second name for another tour.
  const priorCredits = fs.existsSync(creditsPath)
    ? JSON.parse(fs.readFileSync(creditsPath, "utf8"))
    : [];
  const titleByFile = new Map(priorCredits.map((c) => [c.file, "File:" + c.title]));

  for (const region of catalog) {
    console.log("\n== " + region.regionLabel + " ==");
    if (region.heroImage && fs.existsSync(path.join(root, region.heroImage))) {
      console.log("  hero kept: " + region.heroImage);
    } else {
      const heroQueries = REGION_QUERIES[region.region] || [region.regionLabel + " Thailand"];
      const hero = await collect(heroQueries, 1, "region-" + region.region, credits, seen);
      if (hero.length) region.heroImage = hero[0];
    }

    for (const tour of region.tours) {
      const have = (tour.images || []).filter((p) => fs.existsSync(path.join(root, p)));
      if (have.length >= 3) {
        // Already has a usable set on disk — leave it alone so re-runs stay cheap.
        tour.images = have;
        tour.image = have[0];
        have.forEach((p) => {
          const commonsTitle = titleByFile.get(p);
          if (commonsTitle) seen.add(commonsTitle);
        });
        console.log(" " + tour.slug + " — keeping " + have.length + " photos");
        continue;
      }
      console.log(" " + tour.slug);
      const queries = QUERIES[tour.slug] || [region.regionLabel + " Thailand"];
      const imgs = await collect(queries, PER_TOUR, slugifyFile(tour.slug), credits, seen);
      if (imgs.length) {
        tour.images = imgs;
        tour.image = imgs[0];
        if (imgs.length < PER_TOUR) {
          console.warn("  only " + imgs.length + "/" + PER_TOUR + " images");
        }
      } else {
        console.warn("  NO IMAGES FOUND for " + tour.slug + " — keeping " + tour.image);
      }
    }
  }

  // Every referenced file must exist on disk.
  for (const region of catalog) {
    for (const tour of region.tours) {
      const list = (tour.images || [tour.image]).filter((p) =>
        fs.existsSync(path.join(root, p))
      );
      if (!list.length) throw new Error("no valid image files for " + tour.slug);
      tour.images = list;
      tour.image = list[0];
    }
    if (region.heroImage && !fs.existsSync(path.join(root, region.heroImage))) {
      delete region.heroImage;
    }
    if (!region.heroImage) region.heroImage = region.tours[0].image;
  }

  // Merge new attributions with the ones already recorded for files we kept.
  let merged = credits;
  if (fs.existsSync(creditsPath)) {
    const fresh = new Set(credits.map((c) => c.file));
    const previous = JSON.parse(fs.readFileSync(creditsPath, "utf8")).filter(
      (c) => !fresh.has(c.file) && fs.existsSync(path.join(root, c.file))
    );
    merged = credits.concat(previous);
  }
  merged.sort((a, b) => a.file.localeCompare(b.file));

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
  fs.writeFileSync(creditsPath, JSON.stringify(merged, null, 2) + "\n");
  console.log("\nimages downloaded this run:", credits.length);
  console.log("attributions on file:", merged.length);
})();
