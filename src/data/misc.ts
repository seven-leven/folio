import type { ItemGroup } from "./types.ts";

// Misc keeps three categories: general art, 3D/making, and drawings (its own
// third category, per design decision).
export const miscGroups: ItemGroup[] = [
  {
    title: "Art",
    items: [
      { title: "Sketches", description: "General sketches.", image: "./assets/sketches.png", status: "planned" },
      { title: "Sweets & Treats", description: "Drawings of sweets and treats.", image: "./assets/sweets.png", status: "planned" },
      { title: "Landscapes", description: "Landscape studies.", image: "./assets/landscapes.png", status: "planned" },
      { title: "Character Portraits", description: "Character portrait studies.", image: "./assets/portraits.png", status: "planned" },
    ],
  },
  {
    title: "Making",
    items: [
      { title: "Blender Works", description: "3D work made in Blender.", image: "./assets/blender.png", status: "planned" },
      { title: "T-Shirts", description: "T-shirt designs.", image: "./assets/tshirts.png", status: "planned" },
    ],
  },
  {
    title: "Drawings",
    items: [
      { title: "Bird Drawings", description: "Drawings of birds.", image: "./assets/birds.png", status: "planned" },
      { title: "Seashells", description: "Drawings of seashells.", image: "./assets/seashells.png", status: "planned" },
      { title: "Butterflies", description: "Drawings of butterflies.", image: "./assets/butterflies.png", status: "planned" },
    ],
  },
];
