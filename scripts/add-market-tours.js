// Adds the Chiang Mai / Chiang Rai day programs that the local market sells.
// Routes and price levels were researched from public listings (mychiangmaitour.com
// budget day tours, takemetour.com Chiang Rai listings); all wording here is ours.
// Re-running replaces the same slugs instead of duplicating them.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const catalogPath = path.join(root, "data", "region-tours.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

const NEW_TOURS = {
  "chiang-mai": [
    {
      slug: "chiang-mai-doi-suthep-half-day",
      title: "Doi Suthep Temple & City Viewpoint Half-Day Tour",
      titleTh: "ทัวร์ครึ่งวัน วัดพระธาตุดอยสุเทพ–จุดชมวิวเมืองเชียงใหม่",
      type: "day",
      duration: "Half day (~4 hours)",
      price: 800,
      childPrice: 600,
      priceNote: "Join-in group rate · temple entrance ฿50 per person paid on site",
      description:
        "The short introduction to Chiang Mai: a mountain road up to the city's most revered temple, the golden chedi of Wat Phra That Doi Suthep, and a viewpoint over the whole Ping valley. Easy pace, back in town for lunch.",
      highlights: [
        "Wat Phra That Doi Suthep golden chedi",
        "306-step Naga stairway (lift available)",
        "Ping valley viewpoint photo stop",
        "Back in the old city by early afternoon",
      ],
      itinerary: [
        "08:30 Hotel pickup in Chiang Mai city",
        "09:15 Doi Suthep mountain road · viewpoint stop",
        "09:45 Wat Phra That Doi Suthep with guide",
        "11:30 Free time for photos and coffee",
        "12:30 Drop-off at your hotel",
      ],
      includes: [
        "Air-con transfer with driver & Thai/English guide",
        "Hotel pickup and drop-off in Chiang Mai city",
        "Drinking water",
        "Travel insurance (as operator terms)",
      ],
      excludes: ["Temple entrance ฿50 per person", "Meals and personal expenses"],
      badges: ["Day trip", "Temples", "Chiang Mai"],
    },
    {
      slug: "chiang-mai-doi-inthanon-day",
      title: "Doi Inthanon, Twin Pagodas & Karen Village Day Tour",
      titleTh: "ทัวร์ดอยอินทนนท์ 1 วัน (น้ำตกวชิรธาร–พระมหาธาตุ–บ้านแม่กลางหลวง)",
      type: "day",
      duration: "Full day (~10 hours)",
      price: 1400,
      childPrice: 1100,
      priceNote: "Join-in group rate · national park fee ฿300 adult / ฿150 child paid on site",
      description:
        "A full day on the highest mountain in Thailand. Cool air, a big waterfall, the Royal Twin Pagodas with their mountain gardens, and a Karen village where the rice terraces run right up to the coffee plots.",
      highlights: [
        "Wachirathan Waterfall",
        "Doi Inthanon summit and nature trail",
        "Royal Twin Pagodas and gardens",
        "Ban Mae Klang Luang rice terraces & village coffee",
      ],
      itinerary: [
        "07:30 Hotel pickup in Chiang Mai city",
        "09:30 Wachirathan Waterfall",
        "11:00 Doi Inthanon summit · Ang Ka nature trail",
        "12:30 Thai lunch near the park",
        "13:30 Royal Twin Pagodas (Phra Mahathat Napamethanidol & Napaphonphumisiri)",
        "15:00 Ban Mae Klang Luang rice terraces and coffee stop",
        "17:30 Back in Chiang Mai city",
      ],
      includes: [
        "Air-con transfer with driver & Thai/English guide",
        "Hotel pickup and drop-off in Chiang Mai city",
        "1 Thai lunch",
        "Drinking water",
        "Travel insurance (as operator terms)",
      ],
      excludes: [
        "National park fee ฿300 adult / ฿150 child",
        "Twin Pagodas ticket ฿40 per person",
        "Personal expenses",
      ],
      badges: ["Day trip", "Nature", "Chiang Mai"],
    },
    {
      slug: "chiang-mai-elephant-inthanon-hike-day",
      title: "Elephant Care & Pha Dok Siew Trail Day Tour",
      titleTh: "ทัวร์ 1 วัน ดูแลช้าง–เดินป่าเส้นทางผาดอกเสี้ยว ดอยอินทนนท์",
      type: "day",
      duration: "Full day (~10 hours)",
      price: 2400,
      childPrice: 1900,
      priceNote: "Join-in group rate · national park fee ฿300 adult / ฿150 child paid on site",
      description:
        "For guests who want elephants without a ride: watch and feed the herd at a Karen-run camp in the morning, then walk the Pha Dok Siew trail through rice terraces and coffee plots to the waterfall with a village guide.",
      highlights: [
        "Feeding and observing elephants (no riding)",
        "Pha Dok Siew nature trail with a Karen guide",
        "Waterfall swim stop",
        "Village lunch and highland coffee tasting",
      ],
      itinerary: [
        "07:30 Hotel pickup in Chiang Mai city",
        "09:30 Elephant observation, feeding and learning about care",
        "11:30 Transfer into Doi Inthanon National Park",
        "12:30 Lunch in Ban Mae Klang Luang",
        "13:30 Pha Dok Siew trail walk (~2 hours, easy to moderate)",
        "15:30 Waterfall stop and village coffee",
        "18:00 Back in Chiang Mai city",
      ],
      includes: [
        "Air-con transfer with driver & Thai/English guide",
        "Local Karen trail guide",
        "1 village lunch and fruit for the elephants",
        "Drinking water",
        "Travel insurance (as operator terms)",
      ],
      excludes: [
        "National park fee ฿300 adult / ฿150 child",
        "Personal expenses and tips",
      ],
      badges: ["Day trip", "Elephants", "Soft adventure"],
    },
    {
      slug: "chiang-mai-doi-inthanon-private-charter",
      title: "Doi Inthanon Private Charter — Car or Van",
      titleTh: "เหมารถส่วนตัวเที่ยวดอยอินทนนท์ (รถเก๋ง 1–3 / รถตู้ 4–10)",
      type: "day",
      duration: "Full day (7–8 hours)",
      price: 0,
      childPrice: 0,
      priceNote:
        "Car 1–3 guests ฿3,300 · van 4–10 guests ฿3,800 · English-speaking guide +฿1,200/day · park fee ฿300 per person",
      description:
        "Your own vehicle and driver for the Doi Inthanon loop, so you set the pace and pick the stops. Priced per vehicle rather than per person, which usually works out cheaper for families and small groups.",
      highlights: [
        "Private air-con car or van, price per vehicle",
        "Flexible route and departure time",
        "Waterfalls, summit and pagodas at your own pace",
        "Guide optional — driver only keeps the cost down",
      ],
      itinerary: [
        "08:00 Hotel pickup (or the time you prefer)",
        "Mae Klang and Wachirathan waterfalls",
        "Doi Inthanon summit and Ang Ka nature trail",
        "Royal Twin Pagodas and mountain gardens",
        "Optional: Mae Ya Waterfall, Karen village, coffee farm",
        "Back in Chiang Mai after 7–8 hours",
      ],
      includes: [
        "Private air-con car (1–3) or van (4–10) with driver",
        "Fuel and hotel pickup / drop-off in Chiang Mai city",
        "Drinking water",
        "Insurance (as operator terms)",
      ],
      excludes: [
        "National park and pagoda entrance fees",
        "Meals and drinks",
        "English-speaking guide (add ฿1,200 per day)",
      ],
      badges: ["Private charter", "Flexible", "Chiang Mai"],
    },
  ],
  "chiang-rai": [
    {
      slug: "chiang-rai-temple-trio-day",
      title: "White Temple, Blue Temple & Black House Day Tour",
      titleTh: "ทัวร์เชียงราย 1 วัน วัดร่องขุ่น–วัดร่องเสือเต้น–บ้านดำ–วัดห้วยปลากั้ง",
      type: "day",
      duration: "Full day (~9 hours)",
      price: 3490,
      childPrice: 3490,
      priceNote: "Private car · from 2 guests · site entrance ฿80–100 per person paid on site",
      description:
        "Chiang Rai's four landmark art sites in one private day: Chalermchai's white temple, the sapphire blue hall of Wat Rong Suea Ten, Thawan Duchanee's Black House, and the nine-tier pagoda at Wat Huay Pla Kang.",
      highlights: [
        "Wat Rong Khun (White Temple)",
        "Wat Rong Suea Ten (Blue Temple)",
        "Baan Dam Museum (Black House)",
        "Wat Huay Pla Kang and the Big Buddha viewpoint",
      ],
      itinerary: [
        "08:00 Hotel pickup in Chiang Rai",
        "08:45 Wat Rong Khun with guide",
        "10:30 Wat Rong Suea Ten",
        "11:45 Northern Thai lunch",
        "13:00 Baan Dam Museum",
        "15:00 Wat Huay Pla Kang · viewpoint",
        "17:00 Drop-off at your hotel",
      ],
      includes: [
        "Private air-con car with driver & Thai/English guide",
        "Hotel pickup and drop-off in Chiang Rai",
        "1 Northern Thai lunch",
        "Drinking water",
        "Travel insurance (as operator terms)",
      ],
      excludes: [
        "Site entrance fees ฿80–100 per person",
        "Personal expenses and tips",
      ],
      badges: ["Day trip", "Temples", "Private car"],
    },
    {
      slug: "chiang-rai-golden-triangle-day",
      title: "Golden Triangle, Mae Sai Border & Hall of Opium Day Tour",
      titleTh: "ทัวร์ 1 วัน สามเหลี่ยมทองคำ–แม่สาย–หอฝิ่น",
      type: "day",
      duration: "Full day (~11 hours)",
      price: 3500,
      childPrice: 3500,
      priceNote: "Private car · from 2 guests · Mekong boat and entrance fees paid on site",
      description:
        "North to the edge of the country: the White Temple on the way up, the northernmost point of Thailand at Mae Sai, and the Mekong bend at Sop Ruak where Thailand, Laos and Myanmar meet.",
      highlights: [
        "Wat Rong Khun photo stop",
        "Mae Sai — northernmost point of Thailand",
        "Golden Triangle viewpoint at Sop Ruak",
        "Hall of Opium museum · optional Mekong longtail boat",
      ],
      itinerary: [
        "07:00 Hotel pickup in Chiang Rai",
        "08:00 Wat Rong Khun",
        "10:00 Mae Sai border market and northernmost marker",
        "12:00 Lunch by the Mekong",
        "13:30 Golden Triangle viewpoint · optional boat to Don Sao (Laos)",
        "15:00 Hall of Opium or Opium Hall museum",
        "18:00 Drop-off at your hotel",
      ],
      includes: [
        "Private air-con car with driver & Thai/English guide",
        "Hotel pickup and drop-off in Chiang Rai",
        "1 lunch by the Mekong",
        "Drinking water",
        "Travel insurance (as operator terms)",
      ],
      excludes: [
        "Museum tickets and Mekong boat charter",
        "Personal expenses and tips",
      ],
      badges: ["Day trip", "Border", "Private car"],
    },
    {
      slug: "chiang-rai-tea-coffee-day",
      title: "Choui Fong Tea & Doi Chang Coffee Day Tour",
      titleTh: "ทัวร์ 1 วัน ไร่ชาฉุยฟง–กาแฟดอยช้าง",
      type: "day",
      duration: "Full day (~9 hours)",
      price: 3300,
      childPrice: 3300,
      priceNote: "Private car · from 2 guests · tastings and tickets paid on site",
      description:
        "A slow day through the hills that grow Chiang Rai's two famous exports. Walk the terraced tea rows at Choui Fong, then climb to the Doi Chang villages where the arabica is washed and roasted.",
      highlights: [
        "Choui Fong tea terraces and hillside cafe",
        "Doi Chang coffee village and roastery",
        "Highland viewpoints and photo stops",
        "Wat Rong Suea Ten on the way back",
      ],
      itinerary: [
        "08:00 Hotel pickup in Chiang Rai",
        "09:30 Choui Fong tea plantation · tea tasting",
        "11:30 Drive up to Doi Chang",
        "12:30 Village lunch",
        "13:30 Coffee farm walk, washing station and roastery",
        "15:30 Wat Rong Suea Ten photo stop",
        "17:00 Drop-off at your hotel",
      ],
      includes: [
        "Private air-con car with driver & Thai/English guide",
        "Hotel pickup and drop-off in Chiang Rai",
        "1 village lunch",
        "Drinking water",
        "Travel insurance (as operator terms)",
      ],
      excludes: [
        "Tea and coffee tastings, purchases",
        "Personal expenses and tips",
      ],
      badges: ["Day trip", "Food & farm", "Private car"],
    },
    {
      slug: "chiang-rai-city-highlights-join-day",
      title: "Chiang Rai 7 Highlights Join-In Day Tour",
      titleTh: "ทัวร์เชียงราย 1 วัน 7 จุดไฮไลต์ (รถตู้ร่วมกลุ่ม)",
      type: "day",
      duration: "Full day (~9 hours)",
      price: 1125,
      childPrice: 1125,
      priceNote: "Join-in van · shared group · entrance fees paid on site",
      description:
        "The budget way to see Chiang Rai: a shared air-con van covering seven landmarks in one day, from the White Temple to Singha Park and the golden clock tower in town.",
      highlights: [
        "Wat Rong Khun (White Temple)",
        "Wat Rong Suea Ten (Blue Temple)",
        "Baan Dam Museum and Wat Huay Pla Kang",
        "Singha Park, Wat Phra Kaew and the clock tower",
      ],
      itinerary: [
        "08:00 Pickup from the meeting point or your hotel in town",
        "08:45 Wat Rong Khun",
        "10:15 Wat Rong Suea Ten",
        "11:15 Wat Huay Pla Kang",
        "12:15 Lunch stop (own account)",
        "13:30 Baan Dam Museum",
        "15:00 Singha Park",
        "16:30 Wat Phra Kaew and the golden clock tower",
        "17:00 Drop-off in town",
      ],
      includes: [
        "Shared air-con van with driver & Thai/English guide",
        "Pickup and drop-off in Chiang Rai town",
        "Drinking water",
        "Travel insurance (as operator terms)",
      ],
      excludes: [
        "All site entrance fees",
        "Meals and personal expenses",
      ],
      badges: ["Day trip", "Budget", "Join-in group"],
    },
  ],
};

let added = 0;
let replaced = 0;

for (const region of catalog) {
  const additions = NEW_TOURS[region.region];
  if (!additions) continue;
  for (const tour of additions) {
    const at = region.tours.findIndex((t) => t.slug === tour.slug);
    // Keep any images that were already downloaded for this slug.
    const keep = at >= 0 ? region.tours[at] : null;
    const entry = Object.assign({}, tour);
    if (keep && keep.images) {
      entry.images = keep.images;
      entry.image = keep.image;
    } else {
      entry.image = "images/regions/" + tour.slug + "-1.jpg";
    }
    if (at >= 0) {
      region.tours[at] = entry;
      replaced += 1;
    } else {
      region.tours.push(entry);
      added += 1;
    }
  }
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
console.log("added", added, "replaced", replaced);
console.log(
  "tours per region:",
  catalog.map((r) => r.region + "=" + r.tours.length).join(", ")
);
