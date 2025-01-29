import { useRef } from 'react';
import ProjectCard from './ProjectCard';
import styles from '../pages/Architecture.module.css';

interface HorizontalScrollSectionProps {
  title: string;
  projects: Array<{
    title: string;
    description: string;
    link: string;
    image: string;
  }>;
}

export default function HorizontalScrollSection({ title, projects }: HorizontalScrollSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (sectionRef.current) {
      const scrollAmount = sectionRef.current.offsetWidth * 0.8;
      sectionRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.projectsSection}>
      <h2>{title}</h2>
      <div className={styles.scrollContainer} ref={sectionRef}>
        {projects.map((project, index) => (
          <ProjectCard
          key={index}
          title={project.title}
          description={project.description}
          link={project.link}
          image={project.image}
          side="left" 
          bgColor="lightgray"  
          onError={(e) => console.error(e)}  
          />
        ))}
      </div>
      <button className={styles.scrollButton} onClick={scrollRight}>
        Next
      </button>
    </section>
  );
}