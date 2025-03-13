import React from "react";
import styles from "./SlideCard.module.css"; // Assuming you are using CSS modules
import { type SlideCardProps } from "../../types/portfolioTypes.ts";

const SlideCard: React.FC<SlideCardProps> = ({
  image,
  title,
  text,
  imageSide,
  onError,
}) => {
  return (
    <div className={`${styles.slideCard} ${styles[`imageSide-${imageSide}`]}`}>
      <div className={styles.imageContainer}>
        <img
          src={image}
          alt={title}
          className={styles.slideImage}
          onError={onError} // This is the critical line
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
