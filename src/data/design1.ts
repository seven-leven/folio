import { SlideCardProps } from "../types/portfolioTypes.ts";

export const design1Data: SlideCardProps[] = [
  {
    image: "./slide1.jpg",
    title: "Slide Card One",
    text:
      "This is the text for the first slide card. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    imageSide: "Left",
  },
  {
    image: "./slide1.jpg",
    title: "Slide Card Two with Error Handling",
    text:
      "This slide demonstrates image error handling using handleImgError. The image path is intentionally incorrect.",
    imageSide: "Right",
  },
  {
    image: "./slide3.png",
    title: "Slide Card Three",
    text:
      "Another slide with a different layout and image. More placeholder text to fill up space.",
    imageSide: "Full",
  },
  {
    image: "./another-non-existent-image.jpeg",
    title: "Slide Card Four - Error Again",
    text:
      "Testing error handling once more with a different non-existent image file.",
    imageSide: "Right",
  },
  {
    image: "./slide5.webp",
    title: "Slide Card Five",
    text:
      "The final slide card example in this design page. Just some more filler text.",
    imageSide: "Left",
  },
];
