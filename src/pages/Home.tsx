// src/pages/HomePage.tsx
import ProjectCard from '../components/ProjectCard';
import { homeData } from '../data/Home'; // Import the data
import styles from './HomePage.module.css'; // Optional: for custom styling

const HomePage = () => {
  const { architectureProjects, codingProjects, miscProjects, employmentHistory, educationHistory, skills, interests } = homeData;

  return (
    <div className={styles.homePage}>
      <section className={styles.personalStatement}>
        <h1>Personal Statement</h1>
        <p>
          I am a passionate architect and developer, blending creativity with technology to build impactful projects. With a focus on design and user experience, I aim to create functional and beautiful spaces and applications.
        </p>
      </section>

      <section className={styles.workCategories}>
        <h2>My Work</h2>
        <div className={styles.projects}>
          <h3>Architecture</h3>
          {architectureProjects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>

        <div className={styles.projects}>
          <h3>Coding</h3>
          {codingProjects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>

        <div className={styles.projects}>
          <h3>Miscellaneous</h3>
          {miscProjects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>
      </section>

      <section className={styles.employmentHistory}>
        <h2>Employment History</h2>
        <ul>
          {employmentHistory.map((job, index) => (
            <li key={index}>{job}</li>
          ))}
        </ul>
      </section>

      <section className={styles.educationHistory}>
        <h2>Education</h2>
        <ul>
          {educationHistory.map((edu, index) => (
            <li key={index}>{edu}</li>
          ))}
        </ul>
      </section>

      <section className={styles.skills}>
        <h2>Skills</h2>
        <ul>
          {skills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </section>

      <section className={styles.interests}>
        <h2>Interests</h2>
        <p>{interests}</p>
      </section>
    </div>
  );
};

export default HomePage;
