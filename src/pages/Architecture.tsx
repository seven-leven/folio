import { useState, useEffect, useMemo } from 'react';
import styles from './Architecture.module.css';
import HorizontalScrollSection from '../components/HorizontalScrollSection';
import { 
  mainProjects,
  trips,
  precedentStudies,
  miscProjects
} from '../data/architectureData';
import { handleImgError } from '../utils/imageUtils';

export default function Architecture() {
  const [mainProjectIndex, setMainProjectIndex] = useState(0);
  const memoizedMainProjects = useMemo(() => mainProjects, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMainProjectIndex(prev => (prev + 1) % memoizedMainProjects.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [memoizedMainProjects.length]);

  return (
    <main>
      <section className={styles.mainProjectSection}>
        <div className={styles.mainProject}>
          <img
            src={memoizedMainProjects[mainProjectIndex].image}
            alt={memoizedMainProjects[mainProjectIndex].title}
            className={styles.mainProjectImage}
            onError={handleImgError}
          />
          <div className={styles.overlay}>
            <h2>{memoizedMainProjects[mainProjectIndex].title}</h2>
            <p>{memoizedMainProjects[mainProjectIndex].description}</p>
          </div>
        </div>
      </section>

      <HorizontalScrollSection title="Trips" projects={trips} />
      <HorizontalScrollSection title="Precedent Studies" projects={precedentStudies} />
      <HorizontalScrollSection title="Miscellaneous" projects={miscProjects} />
    </main>
  );
}