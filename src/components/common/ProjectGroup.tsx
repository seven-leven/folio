// src/components/ProjectGroup.tsx
import React from "react";
import ProjectCard from "./ProjectCard.tsx";
import styles from "./ProjectGroup.module.css"; // Assuming styles are in this file
import { type ProjectGroupProps } from "../../types/portfolioTypes.ts";
import { Link } from "react-router-dom";

const ProjectGroup: React.FC<ProjectGroupProps> = ({ title, projects }) => {
  const getPath = (title: string) => {
    switch (title.toLowerCase()) {
      case "architecture":
        return "/architecture";
      case "coding":
        return "/coding";
      case "miscellaneous":
        return "/misc";
      default:
        return "#"; // Or some default path or handle error
    }
  };

  return (
    <div className={styles.projectGroup}>
      <h3>
        <Link to={getPath(title)}>{title}</Link>
      </h3>
      <div className={styles.projectList}>
        {projects.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectGroup;
