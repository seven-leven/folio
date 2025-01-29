import { Link } from 'react-router-dom';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  title: string;
  description: string;
  link: string;
  image: string;
  side: 'left' | 'right';
  bgColor: string;
}

export default function ProjectCard({
  title,
  description,
  link,
  image,
  side,
  bgColor
}: ProjectCardProps) {
  const isExternal = link.startsWith('http');

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    console.error(`Image not found: ${img.src}`);
    img.src = '/assets/placeholder.png';
  };

  const commonProps = {
    className: `${styles.card} ${side === 'right' ? styles.right : ''}`,
    style: { backgroundColor: bgColor }
  };

  // Render different components based on link type
  if (isExternal) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        {...commonProps}
      >
        {renderContent()}
      </a>
    );
  }

  return (
    <Link
      to={link}
      {...commonProps}
    >
      {renderContent()}
    </Link>
  );

  function renderContent() {
    return (
      <>
        <div className={styles.imageContainer}>
          <img 
            src={image}
            alt={title}
            className={styles.image}
            onError={handleImgError}
          />
        </div>
        <div className={styles.content}>
          <h3>{title}</h3>
          <p>{description}</p>
          <div className={styles.link}>
            View Project
            <svg className={styles.arrow} viewBox="0 0 24 24">
              <path d={isExternal ? "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" : "M9 5l7 7-7 7"} />
            </svg>
          </div>
        </div>
      </>
    );
  }
}