// src/components/ProjectGroup.tsx
import React from "react";
import ProjectCard from "./ProjectCard.tsx";
import styles from "./ProjectSection.module.css";
import { type ProjectGroupProps } from "../../types/portfolioTypes.ts";

const ProjectGroup: React.FC<ProjectGroupProps> = ({ title, projects }) => {
  return (
    <div className={styles.projectGroup}>
      <h3>{title}</h3>
      <div className={styles.projectList}>
        {projects.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectGroup;
