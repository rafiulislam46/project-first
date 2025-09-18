import { NextResponse } from "next/server";

/**
 * Mock copywriting API.
 * POST { productName, context } -> { title, description, hashtags[] }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productName: string = (body?.productName || "Your Product").toString();
    const context: string = (body?.context || "").toString();

    const title = generateTitle(productName);
    const description = generateDescription(productName, context);
    const hashtags = generateHashtags(productName, context);

    return NextResponse.json({ title, description, hashtags });
  } catch {
    return NextResponse.json({
      title: "Premium Product Spotlight",
      description:
        "Crafted for attention and built for everyday use. Sleek, reliable, and effortlessly stylish—this essential elevates your routine with premium details and a timeless finish.",
      hashtags: [
        "#NewDrop",
        "#PremiumDesign",
        "#EverydayCarry",
        "#Aesthetic",
        "#StyleInspo",
        "#ModernLiving",
        "#MustHave",
        "#CleanDesign",
        "#QualityFirst",
        "#TrendingNow",
      ],
    });
  }
}

function generateTitle(name: string) {
  // Keep <= 8 words, tasteful and short
  const options = [
    `${name}: Effortless Everyday Luxury`,
    `${name} — Elevated. Essential. Timeless.`,
    `Essential ${name} in a Premium Finish`,
    `${name} • Crafted for Modern Living`,
    `${name} — Clean Design, Bold Impact`,
  ];
  return pick(options);
}

function generateDescription(name: string, ctx: string) {
  const base =
    `${name} blends refined design with day-to-day practicality. ` +
    `Built with premium materials for comfort and durability, it delivers a polished look in any setting. ` +
    `Effortless, modern, and ready for your routine.`;
  const extra = ctx ? ` ${clean(ctx)} ` : " ";
  // Target ~40 words
  return trimToWords((base + extra).trim(), 40);
}

function generateHashtags(name: string, ctx: string) {
  const tags = new Set<string>([
    "#PremiumDesign",
    "#ModernStyle",
    "#CleanAesthetic",
    "#EverydayEssentials",
    "#QualityFirst",
    "#StyleInspo",
    "#MinimalVibes",
    "#CraftedWell",
    "#DesignDetails",
    "#TrendingNow",
  ]);

  const words = (name + " " + ctx).toLowerCase();
  if (words.includes("skin") || words.includes("beauty")) {
    addMany(tags, ["#Skincare", "#BeautyDaily"]);
  }
  if (words.includes("bag") || words.includes("tote")) {
    addMany(tags, ["#EverydayCarry", "#BagGoals"]);
  }
  if (words.includes("shoe") || words.includes("sneaker")) {
    addMany(tags, ["#SneakerStyle", "#StreetReady"]);
  }
  if (words.includes("home") || words.includes("decor")) {
    addMany(tags, ["#HomeStyle", "#InteriorInspo"]);
  }

  return Array.from(tags).slice(0, 10);
}

/* helpers */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function clean(s: string) {
  return s.replace(/\s+/g, " ").trim();
}
function trimToWords(s: string, n: number) {
  const words = s.split(/\s+/);
  return words.slice(0, n).join(" ").replace(/[.,;:!?]*$/, "") + ".";
}
function addMany(set: Set<string>, arr: string[]) {
  for (const t of arr) set.add(t);
}