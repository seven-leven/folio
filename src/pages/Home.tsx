// src/pages/HomePage.tsx
import ProjectGroup from "../components/common/ProjectGroup.tsx";
import { homeData } from "../data/Home.ts";
import { handleImgError } from "../utils/imageUtils.ts";
import styles from "./HomePage.module.css";
import {
  type ListSectionProps,
  type PersonalStatementProps,
} from "../types/portfolioTypes.ts";

const ListSection = ({ title, items }: ListSectionProps) => (
  <section className={`${styles.section} ${styles.sectionAlt}`}>
    <h2>{title}</h2>
    <ul>
      {items.map((item, index) => <li key={index}>{item}</li>)}
    </ul>
  </section>
);

const PersonalStatement = ({ statement }: PersonalStatementProps) => (
  <section className={`${styles.section} ${styles.personalStatement}`}>
    <div className={styles.statementContainer}>
      <div className={styles.logoContainer}>
        <img
          src="./assets/logo.png"
          alt="Logo"
          className={styles.logo}
          onError={handleImgError}
        />
      </div>
      <div className={styles.statementText}>
        <h1>Personal Statement</h1>
        <p>{statement}</p>
      </div>
    </div>
  </section>
);

const HomePage = () => {
  const {
    statement,
    architectureProjects,
    codingProjects,
    miscProjects,
    employmentHistory,
    educationHistory,
    skills,
    interests,
  } = homeData;

  return (
    <div className={styles.homePage}>
      <PersonalStatement statement={statement} />

      <section className={styles.section}>
        <h2>My Work</h2>
        <div className={styles.projectCategories}>
          <ProjectGroup
            title="Architecture"
            projects={architectureProjects}
          />
          <ProjectGroup title="Coding" projects={codingProjects} />
          <ProjectGroup title="Miscellaneous" projects={miscProjects} />
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
