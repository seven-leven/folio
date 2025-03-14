// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

// src/components/common/Navbar.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

// src/utils/imageUtils.ts
var handleImgError = (e) => {
  const img = e.target;
  console.error(`Image not found: ${img.src}`);
  img.src = `./assets/placeholder.png`;
};

// src/components/common/Navbar.module.css
var Navbar_default = {
  navbar: "Navbar_navbar",
  container: "Navbar_container",
  logo: "Navbar_logo",
  logoImage: "Navbar_logoImage",
  logoText: "Navbar_logoText",
  desktopLinks: "Navbar_desktopLinks",
  navLink: "Navbar_navLink",
  active: "Navbar_active",
  menuButton: "Navbar_menuButton",
  mobileLinks: "Navbar_mobileLinks",
  open: "Navbar_open"
};

// src/components/common/Navbar.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = [
    { path: "./", name: "Home" },
    { path: "./architecture", name: "Architecture" },
    { path: "./coding", name: "Coding" },
    { path: "./misc", name: "Misc" }
  ];
  return /* @__PURE__ */ jsx("nav", { className: Navbar_default.navbar, children: /* @__PURE__ */ jsxs("div", { className: Navbar_default.container, children: [
    /* @__PURE__ */ jsxs(NavLink, { to: "./", className: Navbar_default.logo, children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: "./assets/logo.png",
          alt: "Logo",
          className: Navbar_default.logoImage,
          onError: handleImgError
        }
      ),
      /* @__PURE__ */ jsx("span", { className: Navbar_default.logoText, children: "Folio" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: Navbar_default.desktopLinks, children: navLinks.map((link) => /* @__PURE__ */ jsx(
      NavLink,
      {
        to: link.path,
        className: ({ isActive }) => `${Navbar_default.navLink} ${isActive ? Navbar_default.active : ""}`,
        children: link.name
      },
      link.path
    )) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: Navbar_default.menuButton,
        onClick: () => setIsMenuOpen(!isMenuOpen),
        "aria-label": "Toggle navigation menu",
        type: "button",
        children: isMenuOpen ? /* @__PURE__ */ jsx(FiX, { size: 24 }) : /* @__PURE__ */ jsx(FiMenu, { size: 24 })
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `${Navbar_default.mobileLinks} ${isMenuOpen ? Navbar_default.open : ""}`,
        children: navLinks.map((link) => /* @__PURE__ */ jsx(
          NavLink,
          {
            to: link.path,
            className: ({ isActive }) => `${Navbar_default.navLink} ${isActive ? Navbar_default.active : ""}`,
            onClick: () => setIsMenuOpen(false),
            children: link.name
          },
          link.path
        ))
      }
    )
  ] }) });
};
var Navbar_default2 = Navbar;

// src/Routes.tsx
import { Route, Routes } from "react-router-dom";

// src/components/common/ProjectCard.tsx
import { Link } from "react-router-dom";

// src/components/common/ProjectCard.module.css
var ProjectCard_default = {
  card: "ProjectCard_card",
  imageContainer: "ProjectCard_imageContainer",
  image: "ProjectCard_image",
  content: "ProjectCard_content",
  link: "ProjectCard_link",
  arrow: "ProjectCard_arrow",
  right: "ProjectCard_right"
};

// src/components/common/ProjectCard.tsx
import { Fragment, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function ProjectCard({
  title,
  description,
  link,
  image,
  side,
  bgColor
}) {
  const isExternal = link.startsWith("http");
  const commonProps = {
    className: `${ProjectCard_default.card} ${side === "right" ? ProjectCard_default.right : ""}`,
    style: { backgroundColor: bgColor }
  };
  if (isExternal) {
    return /* @__PURE__ */ jsx2(
      "a",
      {
        href: link,
        target: "_blank",
        rel: "noopener noreferrer",
        ...commonProps,
        children: renderContent()
      }
    );
  }
  return /* @__PURE__ */ jsx2(
    Link,
    {
      to: link,
      ...commonProps,
      children: renderContent()
    }
  );
  function renderContent() {
    return /* @__PURE__ */ jsxs2(Fragment, { children: [
      /* @__PURE__ */ jsx2("div", { className: ProjectCard_default.imageContainer, children: /* @__PURE__ */ jsx2(
        "img",
        {
          src: image,
          alt: title,
          className: ProjectCard_default.image,
          onError: handleImgError
        }
      ) }),
      /* @__PURE__ */ jsxs2("div", { className: ProjectCard_default.content, children: [
        /* @__PURE__ */ jsx2("h3", { children: title }),
        /* @__PURE__ */ jsx2("p", { children: description }),
        /* @__PURE__ */ jsxs2("div", { className: ProjectCard_default.link, children: [
          "View Project",
          /* @__PURE__ */ jsx2("svg", { className: ProjectCard_default.arrow, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx2(
            "path",
            {
              d: isExternal ? "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" : "M9 5l7 7-7 7"
            }
          ) })
        ] })
      ] })
    ] });
  }
}

// src/components/common/ProjectGroup.module.css
var ProjectGroup_default = {
  projectGroup: "ProjectGroup_projectGroup",
  projectList: "ProjectGroup_projectList"
};

// src/components/common/ProjectGroup.tsx
import { Link as Link2 } from "react-router-dom";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var ProjectGroup = ({ title, projects }) => {
  const getPath = (title2) => {
    switch (title2.toLowerCase()) {
      case "architecture":
        return "/architecture";
      case "coding":
        return "/coding";
      case "miscellaneous":
        return "/misc";
      default:
        return "#";
    }
  };
  return /* @__PURE__ */ jsxs3("div", { className: ProjectGroup_default.projectGroup, children: [
    /* @__PURE__ */ jsx3("h3", { children: /* @__PURE__ */ jsx3(Link2, { to: getPath(title), children: title }) }),
    /* @__PURE__ */ jsx3("div", { className: ProjectGroup_default.projectList, children: projects.map((project, index) => /* @__PURE__ */ jsx3(ProjectCard, { ...project }, index)) })
  ] });
};
var ProjectGroup_default2 = ProjectGroup;

// src/data/Home.ts
var homeData = {
  statement: "I am a passionate architect and developer, blending creativity with technology to build impactful projects. With a focus on design and user experience, I aim to create functional and beautiful spaces and applications.",
  architectureProjects: [
    {
      title: "Modern House",
      description: "A sleek and modern house design.",
      link: "./architecture/modern-house",
      image: "./assets/architecture1.jpg",
      side: "left",
      // Ensuring it's 'left' or 'right'
      bgColor: "#f0f0f0"
    },
    {
      title: "Urban Loft",
      description: "An urban loft design with minimalist interiors.",
      link: "./architecture/urban-loft",
      image: "./assets/architecture2.jpg",
      side: "right",
      // Same here
      bgColor: "#e0e0e0"
    }
  ],
  codingProjects: [
    {
      title: "Personal Portfolio",
      description: "A portfolio website built with React and TypeScript.",
      link: "./coding/personal-portfolio",
      image: "./assets/coding1.jpg",
      side: "left",
      bgColor: "#f9f9f9"
    },
    {
      title: "Task Manager App",
      description: "A task manager app built with React and Firebase.",
      link: "./coding/task-manager",
      image: "./assets/coding2.jpg",
      side: "right",
      bgColor: "#fafafa"
    }
  ],
  miscProjects: [
    {
      title: "Graphic Design Portfolio",
      description: "A collection of graphic design projects.",
      link: "./misc/graphic-design",
      image: "./assets/misc1.jpg",
      side: "left",
      bgColor: "#ececec"
    }
  ],
  employmentHistory: [
    "Architect at XYZ Design Studio (2020 - Present)",
    "Frontend Developer at ABC Tech (2018 - 2020)"
  ],
  educationHistory: [
    "Master's in Architecture - University of Design (2017)",
    "Bachelor's in Computer Science - Tech University (2015)"
  ],
  skills: [
    "Architecture Design",
    "Web Development (React, TypeScript)",
    "UI/UX Design"
  ],
  interests: [
    "I am interested in sustainable design, open-source projects, and creative coding."
  ]
};

// src/pages/HomePage.module.css
var HomePage_default = {
  homePage: "HomePage_homePage",
  section: "HomePage_section",
  sectionAlt: "HomePage_sectionAlt",
  personalStatement: "HomePage_personalStatement",
  statementContainer: "HomePage_statementContainer",
  logoContainer: "HomePage_logoContainer",
  logo: "HomePage_logo",
  statementText: "HomePage_statementText",
  projectCategories: "HomePage_projectCategories",
  interestsText: "HomePage_interestsText"
};

// src/pages/Home.tsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var ListSection = ({ title, items }) => /* @__PURE__ */ jsxs4("section", { className: `${HomePage_default.section} ${HomePage_default.sectionAlt}`, children: [
  /* @__PURE__ */ jsx4("h2", { children: title }),
  /* @__PURE__ */ jsx4("ul", { children: items.map((item, index) => /* @__PURE__ */ jsx4("li", { children: item }, index)) })
] });
var PersonalStatement = ({ statement }) => /* @__PURE__ */ jsx4("section", { className: `${HomePage_default.section} ${HomePage_default.personalStatement}`, children: /* @__PURE__ */ jsxs4("div", { className: HomePage_default.statementContainer, children: [
  /* @__PURE__ */ jsx4("div", { className: HomePage_default.logoContainer, children: /* @__PURE__ */ jsx4(
    "img",
    {
      src: "./assets/logo.png",
      alt: "Logo",
      className: HomePage_default.logo,
      onError: handleImgError
    }
  ) }),
  /* @__PURE__ */ jsxs4("div", { className: HomePage_default.statementText, children: [
    /* @__PURE__ */ jsx4("h1", { children: "Personal Statement" }),
    /* @__PURE__ */ jsx4("p", { children: statement })
  ] })
] }) });
var HomePage = () => {
  const {
    statement,
    architectureProjects,
    codingProjects,
    miscProjects: miscProjects2,
    employmentHistory,
    educationHistory,
    skills,
    interests
  } = homeData;
  return /* @__PURE__ */ jsxs4("div", { className: HomePage_default.homePage, children: [
    /* @__PURE__ */ jsx4(PersonalStatement, { statement }),
    /* @__PURE__ */ jsxs4("section", { className: HomePage_default.section, children: [
      /* @__PURE__ */ jsx4("h2", { children: "My Work" }),
      /* @__PURE__ */ jsxs4("div", { className: HomePage_default.projectCategories, children: [
        /* @__PURE__ */ jsx4(
          ProjectGroup_default2,
          {
            title: "Architecture",
            projects: architectureProjects
          }
        ),
        /* @__PURE__ */ jsx4(ProjectGroup_default2, { title: "Coding", projects: codingProjects }),
        /* @__PURE__ */ jsx4(ProjectGroup_default2, { title: "Miscellaneous", projects: miscProjects2 })
      ] })
    ] }),
    /* @__PURE__ */ jsx4(ListSection, { title: "Employment History", items: employmentHistory }),
    /* @__PURE__ */ jsx4(ListSection, { title: "Education", items: educationHistory }),
    /* @__PURE__ */ jsx4(ListSection, { title: "Skills", items: skills }),
    /* @__PURE__ */ jsxs4("section", { className: HomePage_default.section, children: [
      /* @__PURE__ */ jsx4("h2", { children: "Interests" }),
      /* @__PURE__ */ jsx4("p", { className: HomePage_default.interestsText, children: interests })
    ] })
  ] });
};
var Home_default = HomePage;

// src/pages/Architecture.tsx
import { useEffect, useMemo, useState as useState2 } from "react";

// src/pages/Architecture.module.css
var Architecture_default = {
  mainProjectSection: "Architecture_mainProjectSection",
  mainProject: "Architecture_mainProject",
  mainProjectImage: "Architecture_mainProjectImage",
  overlay: "Architecture_overlay",
  projectsSection: "Architecture_projectsSection",
  scrollContainer: "Architecture_scrollContainer",
  scrollButton: "Architecture_scrollButton",
  clickable: "Architecture_clickable",
  viewProject: "Architecture_viewProject"
};

// src/components/common/HorizontalScrollSection.tsx
import { useRef } from "react";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function HorizontalScrollSection({ title, projects }) {
  const sectionRef = useRef(null);
  const scrollRight = () => {
    if (sectionRef.current) {
      const scrollAmount = sectionRef.current.offsetWidth * 0.8;
      sectionRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
  return /* @__PURE__ */ jsxs5("section", { className: Architecture_default.projectsSection, children: [
    /* @__PURE__ */ jsx5("h2", { children: title }),
    /* @__PURE__ */ jsx5("div", { className: Architecture_default.scrollContainer, ref: sectionRef, children: projects.map((project, index) => /* @__PURE__ */ jsx5(
      ProjectCard,
      {
        title: project.title,
        description: project.description,
        link: project.link,
        image: project.image,
        side: "left",
        bgColor: "lightgray",
        onError: (e) => console.error(e)
      },
      index
    )) }),
    /* @__PURE__ */ jsx5(
      "button",
      {
        type: "button",
        className: Architecture_default.scrollButton,
        onClick: scrollRight,
        children: "Next"
      }
    )
  ] });
}

// src/data/architectureData.ts
var mainProjects = [
  {
    title: "Design 1 Main",
    description: "A conceptual design for the main building.",
    link: "./#/architecture/design1",
    image: "./assets/design1-main.jpg"
  },
  {
    title: "Design 2 Main",
    description: "A conceptual design for the second main building.",
    link: "./architecture/design-2-main",
    image: "./assets/design2-main.jpg"
  },
  {
    title: "Engineering Project",
    description: "A complex engineering project with detailed analysis.",
    link: "./architecture/engineering-project",
    image: "./assets/engineering-project.jpg"
  },
  {
    title: "Thesis",
    description: "A thesis project focusing on urban planning and sustainability.",
    link: "./architecture/thesis",
    image: "./assets/thesis.jpg"
    // Add image for Thesis
  }
];
var trips = [
  {
    title: "Coastal Engineering Trip 2022",
    description: "An exploration of coastal engineering methods and sites.",
    link: "./architecture/coastal-engineering-trip-2022",
    image: "./assets/coastal-engineering-2022.jpg"
  },
  {
    title: "Coastal Engineering Trip 2023",
    description: "A continuation of coastal engineering explorations in 2023.",
    link: "./architecture/coastal-engineering-trip-2023",
    image: "./assets/coastal-engineering-2023.jpg"
  },
  {
    title: "Culture 2 Trip 2024",
    description: "A cultural exploration focusing on architecture and history.",
    link: "./architecture/culture-2-trip-2024",
    image: "./assets/culture-2-trip-2024.jpg"
  }
];
var precedentStudies = [
  {
    title: "Precedent Study 1",
    description: "Study of historical and modern architectural precedents.",
    link: "./architecture/precedent-study-1",
    image: "./assets/precedent-study-1.jpg"
  },
  {
    title: "Precedent Study 2",
    description: "An analysis of urban planning precedents.",
    link: "./architecture/precedent-study-2",
    image: "./assets/precedent-study-2.jpg"
  },
  {
    title: "Precedent Study 3",
    description: "Detailed precedent studies of residential buildings.",
    link: "./architecture/precedent-study-3",
    image: "./assets/precedent-study-3.jpg"
  }
];
var miscProjects = [
  {
    title: "Regulation Booklet",
    description: "A booklet on building regulations and codes.",
    link: "./architecture/regulation-booklet",
    image: "./assets/regulation-booklet.jpg"
  },
  {
    title: "Urban Sketches",
    description: "A collection of sketches capturing urban scenes.",
    link: "./architecture/urban-sketches",
    image: "./assets/urban-sketches.jpg"
  }
];

// src/pages/Architecture.tsx
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function Architecture() {
  const [mainProjectIndex, setMainProjectIndex] = useState2(0);
  const memoizedMainProjects = useMemo(() => mainProjects, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setMainProjectIndex((prev) => (prev + 1) % memoizedMainProjects.length);
    }, 5e3);
    return () => clearInterval(interval);
  }, [memoizedMainProjects.length]);
  const handleMainProjectClick = () => {
    const currentProject = memoizedMainProjects[mainProjectIndex];
    if (currentProject.link) {
      globalThis.location.href = currentProject.link;
    }
  };
  return /* @__PURE__ */ jsxs6("main", { children: [
    /* @__PURE__ */ jsx6("section", { className: Architecture_default.mainProjectSection, children: /* @__PURE__ */ jsxs6(
      "div",
      {
        className: `${Architecture_default.mainProject} ${memoizedMainProjects[mainProjectIndex].link ? Architecture_default.clickable : ""}`,
        onClick: handleMainProjectClick,
        role: "button",
        tabIndex: 0,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleMainProjectClick();
          }
        },
        children: [
          /* @__PURE__ */ jsx6(
            "img",
            {
              src: memoizedMainProjects[mainProjectIndex].image,
              alt: memoizedMainProjects[mainProjectIndex].title,
              className: Architecture_default.mainProjectImage,
              onError: handleImgError
            }
          ),
          /* @__PURE__ */ jsxs6("div", { className: Architecture_default.overlay, children: [
            /* @__PURE__ */ jsx6("h2", { children: memoizedMainProjects[mainProjectIndex].title }),
            /* @__PURE__ */ jsx6("p", { children: memoizedMainProjects[mainProjectIndex].description }),
            memoizedMainProjects[mainProjectIndex].link && /* @__PURE__ */ jsx6("div", { className: Architecture_default.viewProject, children: "View Project" })
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx6(HorizontalScrollSection, { title: "Trips", projects: trips }),
    /* @__PURE__ */ jsx6(
      HorizontalScrollSection,
      {
        title: "Precedent Studies",
        projects: precedentStudies
      }
    ),
    /* @__PURE__ */ jsx6(HorizontalScrollSection, { title: "Miscellaneous", projects: miscProjects })
  ] });
}

// src/pages/CodingProjects.tsx
import { useEffect as useEffect2 } from "react";

// src/pages/CodingProjects.module.css
var CodingProjects_default = {
  container: "CodingProjects_container",
  githubSection: "CodingProjects_githubSection",
  fadeIn: "CodingProjects_fadeIn",
  githubCard: "CodingProjects_githubCard",
  githubImage: "CodingProjects_githubImage",
  githubContent: "CodingProjects_githubContent",
  heading: "CodingProjects_heading",
  projectsGrid: "CodingProjects_projectsGrid"
};

// src/pages/CodingProjects.tsx
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var colors = [
  "#f0f4ff",
  // Light blue
  "#fff0f4",
  // Light pink
  "#f4fff0"
  // Light green
];
function CodingProjects() {
  useEffect2(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }, []);
  return /* @__PURE__ */ jsxs7("main", { className: CodingProjects_default.container, children: [
    /* @__PURE__ */ jsx7("section", { className: CodingProjects_default.githubSection, children: /* @__PURE__ */ jsxs7(
      "a",
      {
        href: "https://github.com/seven-leven/",
        className: CodingProjects_default.githubCard,
        target: "_blank",
        rel: "noopener noreferrer",
        children: [
          /* @__PURE__ */ jsx7("div", { className: CodingProjects_default.githubImage, children: /* @__PURE__ */ jsx7(
            "img",
            {
              src: "./github-logo.png",
              alt: "GitHub",
              onError: handleImgError
            }
          ) }),
          /* @__PURE__ */ jsxs7("div", { className: CodingProjects_default.githubContent, children: [
            /* @__PURE__ */ jsx7("h2", { children: "Explore My GitHub" }),
            /* @__PURE__ */ jsx7("p", { children: "Discover repositories, contributions, and coding activity" })
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx7("h1", { className: CodingProjects_default.heading, children: "Featured Projects" }),
    /* @__PURE__ */ jsxs7("div", { className: CodingProjects_default.projectsGrid, children: [
      /* @__PURE__ */ jsx7(
        ProjectCard,
        {
          title: "Terminal Sphere Animation",
          description: "Dynamic ASCII art sphere with real-time lighting calculations",
          link: "/coding/sphere",
          image: "./sphere-preview.jpg",
          side: "left",
          bgColor: colors[0]
        }
      ),
      /* @__PURE__ */ jsx7(
        ProjectCard,
        {
          title: "Bird Tracking Dashboard",
          description: "Interactive visualization of bird migration patterns",
          link: "https://seven-leven.github.io/bird_dash/",
          image: "./bird-dash.jpg",
          side: "right",
          bgColor: colors[1]
        }
      )
    ] })
  ] });
}

// src/pages/Miscellaneous.tsx
import { jsx as jsx8 } from "react/jsx-runtime";
function miscellaneous() {
  return /* @__PURE__ */ jsx8("main", { children: /* @__PURE__ */ jsx8("h1", { children: "miscellaneous" }) });
}

// src/pages/NotFound.tsx
import { Fragment as Fragment2, jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
var notfound = () => {
  return /* @__PURE__ */ jsxs8(Fragment2, { children: [
    /* @__PURE__ */ jsx9(Navbar_default2, {}),
    /* @__PURE__ */ jsx9("h1", { children: "NotFound" })
  ] });
};
var NotFound_default = notfound;

// src/components/Coding/SphereAnimation.tsx
import { useEffect as useEffect3, useRef as useRef2, useState as useState3 } from "react";

// src/components/Coding/SphereAnimation.module.css
var SphereAnimation_default = {
  container: "SphereAnimation_container",
  terminalContainer: "SphereAnimation_terminalContainer",
  output: "SphereAnimation_output",
  controls: "SphereAnimation_controls",
  sliderGroup: "SphereAnimation_sliderGroup",
  toggleButton: "SphereAnimation_toggleButton"
};

// src/components/Coding/SphereAnimation.tsx
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
var SphereAnimation = () => {
  const outputRef = useRef2(null);
  const [lightDir, setLightDir] = useState3({ x: 0, y: 5, z: 5 });
  const [autoRotate, setAutoRotate] = useState3(true);
  const [angle, setAngle] = useState3(0);
  useEffect3(() => {
    const CHARACTER_LIST = ".,-~:;=!*#$@";
    const WIDTH = 21, HEIGHT = 21;
    const X_OFFSET = 10, Y_OFFSET = 10;
    const RADIUS = 16;
    const ANGLE_INCREMENT = 0.05;
    const drawFrame = (light) => {
      if (!outputRef.current) return;
      const length = Math.sqrt(light.x ** 2 + light.y ** 2 + light.z ** 2);
      const [lx, ly, lz] = [
        light.x / length,
        light.y / length,
        light.z / length
      ];
      const matrix = Array.from(
        { length: HEIGHT },
        () => Array(WIDTH).fill(" ")
      );
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const xScaled = (x - X_OFFSET) * 0.6;
          const yScaled = y - Y_OFFSET;
          const distanceSq = xScaled ** 2 + yScaled ** 2;
          if (distanceSq <= RADIUS) {
            const z = Math.sqrt(RADIUS - distanceSq);
            const intensity = xScaled * lx + yScaled * ly + z * lz;
            const j = Math.floor((intensity + 1) * 6);
            matrix[y][x] = CHARACTER_LIST[Math.max(0, Math.min(j, CHARACTER_LIST.length - 1))];
          }
        }
      }
      outputRef.current.textContent = matrix.map((row) => row.join("")).join(
        "\n"
      );
    };
    let animationFrame;
    const animate = () => {
      let currentLight = { ...lightDir };
      if (autoRotate) {
        const newAngle = angle + ANGLE_INCREMENT;
        setAngle(newAngle);
        currentLight = {
          x: 5 * Math.cos(newAngle),
          y: 5 * Math.sin(newAngle),
          z: 5 * Math.sin(newAngle * 0.5)
        };
        setLightDir(currentLight);
      }
      drawFrame(currentLight);
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [angle, autoRotate, lightDir]);
  return /* @__PURE__ */ jsxs9("div", { className: SphereAnimation_default.container, children: [
    /* @__PURE__ */ jsx10("div", { className: SphereAnimation_default.terminalContainer, children: /* @__PURE__ */ jsx10("pre", { ref: outputRef, className: SphereAnimation_default.output }) }),
    /* @__PURE__ */ jsxs9("div", { className: SphereAnimation_default.controls, children: [
      /* @__PURE__ */ jsxs9("div", { className: SphereAnimation_default.sliderGroup, children: [
        /* @__PURE__ */ jsxs9("label", { children: [
          "Light X: ",
          lightDir.x.toFixed(2)
        ] }),
        /* @__PURE__ */ jsx10(
          "input",
          {
            type: "range",
            min: "-10",
            max: "10",
            step: "0.1",
            value: lightDir.x,
            onChange: (e) => setLightDir({ ...lightDir, x: parseFloat(e.target.value) })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: SphereAnimation_default.sliderGroup, children: [
        /* @__PURE__ */ jsxs9("label", { children: [
          "Light Y: ",
          lightDir.y.toFixed(2)
        ] }),
        /* @__PURE__ */ jsx10(
          "input",
          {
            type: "range",
            min: "-10",
            max: "10",
            step: "0.1",
            value: lightDir.y,
            onChange: (e) => setLightDir({ ...lightDir, y: parseFloat(e.target.value) })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: SphereAnimation_default.sliderGroup, children: [
        /* @__PURE__ */ jsxs9("label", { children: [
          "Light Z: ",
          lightDir.z.toFixed(2)
        ] }),
        /* @__PURE__ */ jsx10(
          "input",
          {
            type: "range",
            min: "-10",
            max: "10",
            step: "0.1",
            value: lightDir.z,
            onChange: (e) => setLightDir({ ...lightDir, z: parseFloat(e.target.value) })
          }
        )
      ] }),
      /* @__PURE__ */ jsx10(
        "button",
        {
          className: SphereAnimation_default.toggleButton,
          onClick: () => setAutoRotate(!autoRotate),
          type: "button",
          children: autoRotate ? "\u23F8 Stop Rotation" : "\u25B6 Start Rotation"
        }
      )
    ] })
  ] });
};
var SphereAnimation_default2 = SphereAnimation;

// src/pages/SphereAnimation.tsx
import { jsx as jsx11 } from "react/jsx-runtime";
var SphereAnimationPage = () => {
  return /* @__PURE__ */ jsx11("div", { children: /* @__PURE__ */ jsx11(SphereAnimation_default2, {}) });
};
var SphereAnimation_default3 = SphereAnimationPage;

// src/components/common/SlideCard.module.css
var SlideCard_default = {
  slideCard: "SlideCard_slideCard",
  imageLeft: "SlideCard_imageLeft",
  imageRight: "SlideCard_imageRight",
  imageContainer: "SlideCard_imageContainer",
  contentContainer: "SlideCard_contentContainer",
  slideImage: "SlideCard_slideImage",
  imageFull: "SlideCard_imageFull",
  imageContainerFull: "SlideCard_imageContainerFull",
  slideTitle: "SlideCard_slideTitle",
  slideText: "SlideCard_slideText"
};

// src/components/common/SlideCard.tsx
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
var SlideCard = ({
  image,
  title,
  text,
  imageSide
}) => {
  if (imageSide === "Full") {
    return /* @__PURE__ */ jsx12("div", { className: `${SlideCard_default.slideCard} ${SlideCard_default.imageFull}`, children: /* @__PURE__ */ jsx12("div", { className: SlideCard_default.imageContainerFull, children: /* @__PURE__ */ jsx12(
      "img",
      {
        src: image,
        alt: title || "Slide image",
        className: SlideCard_default.slideImage,
        onError: handleImgError
      }
    ) }) });
  }
  return /* @__PURE__ */ jsxs10("div", { className: `${SlideCard_default.slideCard} ${SlideCard_default[`image${imageSide}`]}`, children: [
    /* @__PURE__ */ jsx12("div", { className: SlideCard_default.imageContainer, children: /* @__PURE__ */ jsx12(
      "img",
      {
        src: image,
        alt: title,
        className: SlideCard_default.slideImage,
        onError: handleImgError
      }
    ) }),
    /* @__PURE__ */ jsxs10("div", { className: SlideCard_default.contentContainer, children: [
      /* @__PURE__ */ jsx12("h2", { className: SlideCard_default.slideTitle, children: title }),
      /* @__PURE__ */ jsx12("p", { className: SlideCard_default.slideText, children: text })
    ] })
  ] });
};
var SlideCard_default2 = SlideCard;

// src/data/design1.ts
var design1Data = [
  {
    image: "./slide1.jpg",
    title: "Slide Card One",
    text: "This is the text for the first slide card. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    imageSide: "Left"
  },
  {
    image: "./slide1.jpg",
    title: "Slide Card Two with Error Handling",
    text: "This slide demonstrates image error handling using handleImgError. The image path is intentionally incorrect.",
    imageSide: "Right"
  },
  {
    image: "./slide3.png",
    title: "Slide Card Three",
    text: "Another slide with a different layout and image. More placeholder text to fill up space.",
    imageSide: "Full"
  },
  {
    image: "./another-non-existent-image.jpeg",
    title: "Slide Card Four - Error Again",
    text: "Testing error handling once more with a different non-existent image file.",
    imageSide: "Right"
  },
  {
    image: "./slide5.webp",
    title: "Slide Card Five",
    text: "The final slide card example in this design page. Just some more filler text.",
    imageSide: "Left"
  }
];

// src/pages/design1.tsx
import { jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
var Design1 = () => {
  const slideData = design1Data;
  return /* @__PURE__ */ jsxs11("div", { className: "design1-page", children: [
    /* @__PURE__ */ jsx13(
      "h1",
      {
        style: {
          fontFamily: "Arial, Helvetica, sans-serif",
          textAlign: "center",
          paddingTop: "10px"
        },
        children: "Design 1 Page"
      }
    ),
    slideData.map((slide, index) => /* @__PURE__ */ jsx13(
      SlideCard_default2,
      {
        image: slide.image,
        title: slide.title,
        text: slide.text,
        imageSide: slide.imageSide,
        onError: handleImgError
      },
      index
    ))
  ] });
};
var design1_default = Design1;

// src/Routes.tsx
import { jsx as jsx14, jsxs as jsxs12 } from "react/jsx-runtime";
var AppRoutes = () => {
  return /* @__PURE__ */ jsxs12(Routes, { children: [
    /* @__PURE__ */ jsx14(Route, { path: "/", element: /* @__PURE__ */ jsx14(Home_default, {}) }),
    /* @__PURE__ */ jsx14(Route, { path: "/architecture", element: /* @__PURE__ */ jsx14(Architecture, {}) }),
    /* @__PURE__ */ jsx14(Route, { path: "/architecture/design1", element: /* @__PURE__ */ jsx14(design1_default, {}) }),
    /* @__PURE__ */ jsx14(Route, { path: "/coding", element: /* @__PURE__ */ jsx14(CodingProjects, {}) }),
    /* @__PURE__ */ jsx14(Route, { path: "/misc", element: /* @__PURE__ */ jsx14(miscellaneous, {}) }),
    /* @__PURE__ */ jsx14(Route, { path: "/coding/sphere", element: /* @__PURE__ */ jsx14(SphereAnimation_default3, {}) }),
    /* @__PURE__ */ jsx14(Route, { path: "*", element: /* @__PURE__ */ jsx14(NotFound_default, {}) })
  ] });
};
var Routes_default = AppRoutes;

// src/App.module.css
var App_default = {
  navbar: "App_navbar",
  content: "App_content"
};

// src/App.tsx
import { Fragment as Fragment3, jsx as jsx15, jsxs as jsxs13 } from "react/jsx-runtime";
function App() {
  return /* @__PURE__ */ jsxs13(Fragment3, { children: [
    /* @__PURE__ */ jsx15(Navbar_default2, {}),
    /* @__PURE__ */ jsx15("div", { className: App_default.content, children: /* @__PURE__ */ jsx15(Routes_default, {}) })
  ] });
}
var App_default2 = App;

// src/index.tsx
import { jsx as jsx16 } from "react/jsx-runtime";
var root = ReactDOM.createRoot(
  document.getElementById("root")
);
root.render(
  /* @__PURE__ */ jsx16(React.StrictMode, { children: /* @__PURE__ */ jsx16(HashRouter, { children: /* @__PURE__ */ jsx16(App_default2, {}) }) })
);
//# sourceMappingURL=bundle.js.map
