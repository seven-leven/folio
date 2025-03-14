// SlideCard.tsx
import React from "react";
import styles from "./SlideCard.module.css";
import { type SlideCardProps } from "../../types/portfolioTypes.ts";
import { handleImgError } from "../../utils/imageUtils.ts";

const SlideCard: React.FC<SlideCardProps> = ({
  image,
  title,
  text,
  imageSide,
}) => {
  // For full image slide, we'll only render the image
  if (imageSide === "Full") {
    return (
      <div className={`${styles.slideCard} ${styles.imageFull}`}>
        <div className={styles.imageContainerFull}>
          <img
            src={image}
            alt={title || "Slide image"}
            className={styles.slideImage}
            onError={handleImgError} // Corrected prop name
          />
        </div>
      </div>
    );
  }

  // For Left/Right layouts, render both image and content
  return (
    <div className={`${styles.slideCard} ${styles[`image${imageSide}`]}`}>
      <div className={styles.imageContainer}>
        <img
          src={image}
          alt={title}
          className={styles.slideImage}
          onError={handleImgError} // Corrected prop name
        />
      </div>
      <div className={styles.contentContainer}>
        <h2 className={styles.slideTitle}>{title}</h2>
        <p className={styles.slideText}>{text}</p>
      </div>
    </div>
  );
};

export default SlideCard;
