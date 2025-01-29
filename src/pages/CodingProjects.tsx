//  src/pages/CodingProjects.tsx
import { useEffect } from 'react';
import ProjectCard from '../components/ProjectCard.tsx';
import styles from './CodingProjects.module.css';

const colors = [
  '#f0f4ff', // Light blue
  '#fff0f4', // Light pink
  '#f4fff0'  // Light green
];

export default function CodingProjects() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <main className={styles.container}>
      <section className={styles.githubSection}>
        <a 
          href="https://github.com/seven-leven/"
          className={styles.githubCard}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles.githubImage}>
            <img 
              src="/github-logo.png"
              alt="GitHub"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = `${process.env.PUBLIC_URL}/assets/placeholder.png`;
              }}
            />
          </div>
          <div className={styles.githubContent}>
            <h2>Explore My GitHub</h2>
            <p>Discover repositories, contributions, and coding activity</p>
          </div>
        </a>
      </section>

      <h1 className={styles.heading}>Featured Projects</h1>

      <div className={styles.projectsGrid}>
        <ProjectCard
          title="Terminal Sphere Animation"
          description="Dynamic ASCII art sphere with real-time lighting calculations"
          link="/coding/sphere"
          image="/sphere-preview.jpg"
          side="left"
          bgColor={colors[0]}
        />

        <ProjectCard
          title="Bird Tracking Dashboard"
          description="Interactive visualization of bird migration patterns"
          link="https://seven-leven.github.io/bird_dash/"
          image="/bird-dash.jpg"
          side="right"
          bgColor={colors[1]}
        />
      </div>
    </main>
  );
}