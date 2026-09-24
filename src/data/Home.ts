import { type HomeData } from "../types/portfolioTypes.ts";

export const homeData: HomeData = {
  statement:
    "I am a passionate architect and developer, blending creativity with technology to build impactful projects. With a focus on design and user experience, I aim to create functional and beautiful spaces and applications.",
  architectureProjects: [
    {
      title: "Modern House",
      description: "A sleek and modern house design.",
      link: "./architecture/modern-house",
      image: "./assets/architecture1.jpg",
      side: "left" as "left" | "right", // Ensuring it's 'left' or 'right'
      bgColor: "#f0f0f0",
    },
    {
      title: "Urban Loft",
      description: "An urban loft design with minimalist interiors.",
      link: "./architecture/urban-loft",
      image: "./assets/architecture2.jpg",
      side: "right" as "left" | "right", // Same here
      bgColor: "#e0e0e0",
    },
  ],

  codingProjects: [
    {
      title: "Personal Portfolio",
      description: "A portfolio website built with React and TypeScript.",
      link: "./coding/personal-portfolio",
      image: "./assets/coding1.jpg",
      side: "left" as "left" | "right",
      bgColor: "#f9f9f9",
    },
    {
      title: "Task Manager App",
      description: "A task manager app built with React and Firebase.",
      link: "./coding/task-manager",
      image: "./assets/coding2.jpg",
      side: "right" as "left" | "right",
      bgColor: "#fafafa",
    },
  ],

  miscProjects: [
    {
      title: "Graphic Design Portfolio",
      description: "A collection of graphic design projects.",
      link: "./misc/graphic-design",
      image: "./assets/misc1.jpg",
      side: "left" as "left" | "right",
      bgColor: "#ececec",
    },
  ],

  employmentHistory: [
    "Architect at XYZ Design Studio (2020 - Present)",
    "Frontend Developer at ABC Tech (2018 - 2020)",
  ],

  educationHistory: [
    "Master's in Architecture - University of Design (2017)",
    "Bachelor's in Computer Science - Tech University (2015)",
  ],

  skills: [
    "Architecture Design",
    "Web Development (React, TypeScript)",
    "UI/UX Design",
  ],

  interests: [
    "I am interested in sustainable design, open-source projects, and creative coding.",
  ],
};
