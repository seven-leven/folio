import SlideCard from "../components/common/SlideCard.tsx"; // Adjust path if needed
import { handleImgError } from "../utils/imageUtils.ts"; // Adjust path if needed
import { design1Data } from "../data/design1.ts";

const Design1 = () => {
  const slideData = design1Data;
  return (
    <div className="design1-page">
      <h1
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          textAlign: "center",
          paddingTop: "10px",
        }}
      >
        Design 1 Page
      </h1>
      {slideData.map((slide, index) => (
        <SlideCard
          key={index}
          image={slide.image}
          title={slide.title}
          text={slide.text}
          imageSide={slide.imageSide}
          onError={handleImgError}
        />
      ))}
    </div>
  );
};

export default Design1;
