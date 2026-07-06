// Design 1 — "Pages, Serenity & Cosmic Wonders" reading-nook board, broken
// down into web sections. Text is transcribed from the presentation board.
// Drop cropped board images into public/assets/design1/ using the filenames
// referenced below (missing files fall back to a placeholder).

export interface Attribute {
  label: string;
  value: string;
}

export interface Drawing {
  title: string;
  scale: string;
  image: string;
}

export interface Detail {
  label: string;
  note: string;
}

export const design1 = {
  id: "S69483 · Gaahis Yaugoob",
  title: "Pages, Serenity & Cosmic Wonders",
  subtitle: "A Reading Nook at a House Courtyard",

  statement:
    "Step into this enchanting reading nook, a space that invites book lovers " +
    "to immerse themselves in a world of literary wonder. The bookshelf " +
    "showcases your beloved books, while ambient and natural lighting bathes " +
    "the nook in a soft glow. LED strips illuminate the spines, casting a " +
    "spellbinding aura. Sink into the plush comfort of a bean bag, where time " +
    "stands still as you delve into the pages of your chosen adventure. The " +
    "mirrored flooring offers a glimpse into the boundless realms that await " +
    "within the pages. This haven is an invitation to step inside, unplug, and " +
    "surrender to the enchantment of literature.",

  // Full board scan, shown as an overview at the top.
  board: "./assets/design1/board.png",
  hero: "./assets/design1/hero.png",

  concept: {
    image: "./assets/design1/bubble-diagram.png",
    attributes: <Attribute[]> [
      { label: "Inspiration", value: "Bedside lamp & stack of books" },
      { label: "Materials", value: "Canvas, wood, acrylic, G.I. pipe" },
      { label: "Lighting", value: "Diffused sunlight, LED light, ambient light" },
      { label: "Features", value: "Bookshelves, seating, lighting" },
      { label: "Space Size", value: "Allowed space 8ft × 8ft × 8ft" },
      { label: "Climate Consideration", value: "Protective wall and roof, drainage" },
      { label: "Quality Enhancement", value: "Bean bag, stool, humidifier, AC, power outlet" },
      { label: "Feeling of Space", value: "Me, books, my fuzzy eyes against the world" },
      { label: "Colour Palette", value: "Minimalist and natural" },
    ],
  },

  site: {
    image: "./assets/design1/site-analysis.png",
    swot: {
      Strengths: ["Natural light", "Privately owned unused land"],
      Weaknesses: ["Limited road access", "Limited existing vegetation"],
      Opportunities: ["Natural light for daytime lighting", "Privacy", "Less noise"],
      Threats: ["Prone to weathering", "Harsh direct sunlight"],
    } as Record<string, string[]>,
  },

  development: [
    {
      title: "Form",
      image: "./assets/design1/form.png",
      text:
        "Starting from the allocated 8ft cube, a translucent volume was added " +
        "for a dreamy glow, carried on steel supports with wooden shelving. " +
        "Early models stacked like books but felt unnatural and left corners " +
        "hard to reach — the final model averages the slope for a natural fit.",
    },
    {
      title: "Roof Design",
      image: "./assets/design1/roof-design.png",
      text:
        "A flat roof risked water pooling and a pointy top didn't fit the " +
        "flow, so the roof was resolved into a slope that drains water to two " +
        "points without needing a gutter.",
    },
  ],

  drawings: <Drawing[]> [
    { title: "Ground Floor Plan", scale: "1:20", image: "./assets/design1/ground-floor-plan.png" },
    { title: "Roof Plan", scale: "1:20", image: "./assets/design1/roof-plan.png" },
    { title: "Elevation E1", scale: "1:20", image: "./assets/design1/elevation-e1.png" },
    { title: "Elevation E2", scale: "1:20", image: "./assets/design1/elevation-e2.png" },
    { title: "Section X–X", scale: "1:20", image: "./assets/design1/section-xx.png" },
    { title: "Section Y–Y", scale: "1:20", image: "./assets/design1/section-yy.png" },
  ],

  externalViews: [
    { title: "Daytime", image: "./assets/design1/view-day.png" },
    { title: "Night", image: "./assets/design1/view-night.png" },
  ],

  details: <Detail[]> [
    { label: "Sloping Roof", note: "Matches the building form" },
    { label: "Dual-Coloured Strands", note: "Give form to the building" },
    { label: "Simple Door", note: "Blends in while standing out" },
    { label: "Translucent Facade", note: "Gives the dreamy glow" },
    { label: "LED Strips", note: "Illuminate the spines of the books" },
    { label: "Maximum Utilisation", note: "For storage" },
    { label: "Wooden Stool", note: "Storage, and reaching higher shelves" },
    { label: "Bean Bag Chair", note: "For comfy reading" },
    { label: "~1,000 Book Capacity", note: "2h of reading a day for 11 years" },
    { label: "Acrylic Sheet", note: "Protects the mirror" },
    { label: "Mirror Flooring", note: "Gives a spacious feeling" },
    { label: "Leaning Concrete", note: "Provides a solid base" },
    { label: "Keyhole Hanger", note: "Holds the building facade together" },
    { label: "Pipe Clamp", note: "Connects plank to pipe" },
    { label: "Rubber Ring", note: "Prevents water seepage" },
  ],
};
