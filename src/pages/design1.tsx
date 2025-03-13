import SlideCard from "../components/common/SlideCard.tsx"; // Adjust path if needed
import { handleImgError } from "../utils/imageUtils.ts"; // Adjust path if needed
import { type SlideCardProps } from "../types/portfolioTypes.ts";

const Design1 = () => {
  const slideData: SlideCardProps[] = [
    {
      image: "./slide1.jpg",
      title: "Slide Card One",
      text:
        "This is the text for the first slide card. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      imageSide: "left",
    },
    {
      image: "./slide1.jpg",
      title: "Slide Card Two with Error Handling",
      text:
        "This slide demonstrates image error handling using handleImgError. The image path is intentionally incorrect.",
      imageSide: "right",
    },
    {
      image: "./slide3.png",
      title: "Slide Card Three",
      text:
        "Another slide with a different layout and image. More placeholder text to fill up space.",
      imageSide: "left",
    },
    {
      image: "./another-non-existent-image.jpeg",
      title: "Slide Card Four - Error Again",
      text:
        "Testing error handling once more with a different non-existent image file.",
      imageSide: "right",
    },
    {
      image: "./slide5.webp",
      title: "Slide Card Five",
      text:
        "The final slide card example in this design page. Just some more filler text.",
      imageSide: "left",
    },
  ];

  return (
    <div className="design1-page">
      <h1>Design 1 Page</h1>
      {slideData.map((slide, index) => (
        <SlideCard
          key={index}
          image={slide.image}
          title={slide.title}
          text={slide.text}
          imageSide={slide.imageSide}
          onError={slide.image.includes("non-existent")
            ? handleImgError
            : undefined} // Apply handleImgError conditionally
        />
      ))}
    </div>
  );
};

export default Design1;
