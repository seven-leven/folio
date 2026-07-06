import type { ItemGroup } from "./types.ts";

// Image paths point at public/assets/*. Missing files fall back to the
// placeholder via the ImageCard error handler.
export const architectureGroups: ItemGroup[] = [
  {
    title: "Main Designs",
    items: [
      { title: "Design 1", description: "Studio design project.", image: "./assets/design1.png", link: "/architecture/design-1", status: "done" },
      { title: "Design 2", description: "Studio design project.", image: "./assets/design2.png", link: "/architecture/design-2", status: "done" },
      { title: "Design 3", description: "Studio design project.", image: "./assets/design3.png", link: "/architecture/design-3", status: "done" },
      { title: "Design 4", description: "Coming soon.", image: "./assets/design4.png", status: "planned" },
      { title: "Design 5", description: "Coming soon.", image: "./assets/design5.png", status: "planned" },
    ],
  },
  {
    title: "Trip Books",
    items: [
      { title: "Semester 5 Book", description: "Studio trip book.", image: "./assets/trip-sem5.png", status: "planned" },
      { title: "Semester 4 Book", description: "Studio trip book.", image: "./assets/trip-sem4.png", status: "planned" },
      { title: "Semester 2", description: "Studio trip.", image: "./assets/trip-sem2.png", status: "planned" },
    ],
  },
  {
    title: "Coastal Engineering Trips",
    items: [
      { title: "Coastal Engineering Trip 2022", description: "Field study of coastal engineering.", image: "./assets/coastal-2022.png", status: "planned" },
      { title: "Coastal Engineering Trip 2023", description: "Field study of coastal engineering.", image: "./assets/coastal-2023.png", status: "planned" },
    ],
  },
  {
    title: "Academic",
    items: [
      { title: "Engineering Project", description: "Detailed engineering project with analysis.", image: "./assets/engineering.png", status: "planned" },
      { title: "Thesis", description: "Thesis project.", image: "./assets/thesis.png", status: "planned" },
    ],
  },
  {
    title: "Precedent Studies",
    items: [
      { title: "Precedent Study 1", description: "Precedent analysis.", image: "./assets/precedent1.png", status: "planned" },
      { title: "Precedent Study 2", description: "Precedent analysis.", image: "./assets/precedent2.png", status: "planned" },
      { title: "Precedent Study 3", description: "Precedent analysis.", image: "./assets/precedent3.png", status: "planned" },
      { title: "Precedent Study 4", description: "Precedent analysis.", image: "./assets/precedent4.png", status: "planned" },
      { title: "Precedent Study 5", description: "Precedent analysis.", image: "./assets/precedent5.png", status: "planned" },
    ],
  },
  {
    title: "Sketches & Documents",
    items: [
      { title: "Urban Sketches", description: "Sketches of urban scenes.", image: "./assets/urban-sketches.png", status: "planned" },
      { title: "Regulation Booklet", description: "Booklet on building regulations and codes.", image: "./assets/regulation-booklet.png", status: "planned" },
    ],
  },
];
