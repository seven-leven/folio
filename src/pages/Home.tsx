// src/pages/HomePage.tsx
import ProjectCard from '../components/ProjectCard';
import { homeData } from '../data/Home';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { 
    architectureProjects, 
    codingProjects, 
    miscProjects, 
    employmentHistory, 
    educationHistory, 
    skills, 
    interests 
  } = homeData;

  const ListSection = ({ title, items }: { title: string; items: string[] }) => (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <h2>{title}</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );

  return (
    <div className={styles.homePage}>
      <section className={`${styles.section} ${styles.personalStatement}`}>
        <h1>Personal Statement</h1>
        <p>
          I am a passionate architect and developer, blending creativity with technology to build impactful projects. 
          With a focus on design and user experience, I aim to create functional and beautiful spaces and applications.
        </p>
      </section>

      <section className={styles.section}>
        <h2>My Work</h2>
        <div className={styles.projectCategories}>
          <div className={styles.projectGroup}>
            <h3>Architecture</h3>
            <div className={styles.projectList}>
              {architectureProjects.map((project, index) => (
                <ProjectCard key={index} {...project} />
              ))}
            </div>
          </div>

          <div className={styles.projectGroup}>
            <h3>Coding</h3>
            <div className={styles.projectList}>
              {codingProjects.map((project, index) => (
                <ProjectCard key={index} {...project} />
              ))}
            </div>
          </div>

          <div className={styles.projectGroup}>
            <h3>Miscellaneous</h3>
            <div className={styles.projectList}>
              {miscProjects.map((project, index) => (
                <ProjectCard key={index} {...project} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <ListSection title="Employment History" items={employmentHistory} />
      <ListSection title="Education" items={educationHistory} />
      <ListSection title="Skills" items={skills} />

      <section className={styles.section}>
        <h2>Interests</h2>
        <p className={styles.interestsText}>{interests}</p>
      </section>
    </div>
  );
};

export default HomePage;