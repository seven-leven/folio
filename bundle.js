// src/index.tsx
import React2 from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

// src/components/common/Navbar.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

// src/components/common/Navbar.module.css
var Navbar_default = {
  navbar: "Navbar_navbar",
  container: "Navbar_container",
  logo: "Navbar_logo",
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
    /* @__PURE__ */ jsx(NavLink, { to: "./", className: Navbar_default.logo, children: "YourPortfolio" }),
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

// src/components/ProjectCard.tsx
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

// src/utils/imageUtils.ts
var handleImgError = (e) => {
  const img = e.target;
  console.error(`Image not found: ${img.src}`);
  img.src = `./assets/placeholder.png`;
};

// src/components/ProjectCard.tsx
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

// src/data/Home.ts
var homeData = {
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
  interests: "I am interested in sustainable design, open-source projects, and creative coding."
};

// src/pages/HomePage.module.css
var HomePage_default = {
  homePage: "HomePage_homePage",
  section: "HomePage_section",
  sectionAlt: "HomePage_sectionAlt",
  personalStatement: "HomePage_personalStatement",
  projectCategories: "HomePage_projectCategories",
  projectGroup: "HomePage_projectGroup",
  projectList: "HomePage_projectList",
  interestsText: "HomePage_interestsText"
};

// src/pages/Home.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var HomePage = () => {
  const {
    architectureProjects,
    codingProjects,
    miscProjects: miscProjects2,
    employmentHistory,
    educationHistory,
    skills,
    interests
  } = homeData;
  const ListSection = ({ title, items }) => /* @__PURE__ */ jsxs3("section", { className: `${HomePage_default.section} ${HomePage_default.sectionAlt}`, children: [
    /* @__PURE__ */ jsx3("h2", { children: title }),
    /* @__PURE__ */ jsx3("ul", { children: items.map((item, index) => /* @__PURE__ */ jsx3("li", { children: item }, index)) })
  ] });
  return /* @__PURE__ */ jsxs3("div", { className: HomePage_default.homePage, children: [
    /* @__PURE__ */ jsxs3("section", { className: `${HomePage_default.section} ${HomePage_default.personalStatement}`, children: [
      /* @__PURE__ */ jsx3("h1", { children: "Personal Statement" }),
      /* @__PURE__ */ jsx3("p", { children: "I am a passionate architect and developer, blending creativity with technology to build impactful projects. With a focus on design and user experience, I aim to create functional and beautiful spaces and applications." })
    ] }),
    /* @__PURE__ */ jsxs3("section", { className: HomePage_default.section, children: [
      /* @__PURE__ */ jsx3("h2", { children: "My Work" }),
      /* @__PURE__ */ jsxs3("div", { className: HomePage_default.projectCategories, children: [
        /* @__PURE__ */ jsxs3("div", { className: HomePage_default.projectGroup, children: [
          /* @__PURE__ */ jsx3("h3", { children: "Architecture" }),
          /* @__PURE__ */ jsx3("div", { className: HomePage_default.projectList, children: architectureProjects.map((project, index) => /* @__PURE__ */ jsx3(ProjectCard, { ...project }, index)) })
        ] }),
        /* @__PURE__ */ jsxs3("div", { className: HomePage_default.projectGroup, children: [
          /* @__PURE__ */ jsx3("h3", { children: "Coding" }),
          /* @__PURE__ */ jsx3("div", { className: HomePage_default.projectList, children: codingProjects.map((project, index) => /* @__PURE__ */ jsx3(ProjectCard, { ...project }, index)) })
        ] }),
        /* @__PURE__ */ jsxs3("div", { className: HomePage_default.projectGroup, children: [
          /* @__PURE__ */ jsx3("h3", { children: "Miscellaneous" }),
          /* @__PURE__ */ jsx3("div", { className: HomePage_default.projectList, children: miscProjects2.map((project, index) => /* @__PURE__ */ jsx3(ProjectCard, { ...project }, index)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx3(ListSection, { title: "Employment History", items: employmentHistory }),
    /* @__PURE__ */ jsx3(ListSection, { title: "Education", items: educationHistory }),
    /* @__PURE__ */ jsx3(ListSection, { title: "Skills", items: skills }),
    /* @__PURE__ */ jsxs3("section", { className: HomePage_default.section, children: [
      /* @__PURE__ */ jsx3("h2", { children: "Interests" }),
      /* @__PURE__ */ jsx3("p", { className: HomePage_default.interestsText, children: interests })
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
  scrollButton: "Architecture_scrollButton"
};

// src/components/HorizontalScrollSection.tsx
import { useRef } from "react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function HorizontalScrollSection({ title, projects }) {
  const sectionRef = useRef(null);
  const scrollRight = () => {
    if (sectionRef.current) {
      const scrollAmount = sectionRef.current.offsetWidth * 0.8;
      sectionRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
  return /* @__PURE__ */ jsxs4("section", { className: Architecture_default.projectsSection, children: [
    /* @__PURE__ */ jsx4("h2", { children: title }),
    /* @__PURE__ */ jsx4("div", { className: Architecture_default.scrollContainer, ref: sectionRef, children: projects.map((project, index) => /* @__PURE__ */ jsx4(
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
    /* @__PURE__ */ jsx4("button", { className: Architecture_default.scrollButton, onClick: scrollRight, children: "Next" })
  ] });
}

// src/data/architectureData.ts
var mainProjects = [
  {
    title: "Design 1 Main",
    description: "A conceptual design for the main building.",
    link: "./projects/design-1-main",
    image: "./assets/design1-main.jpg"
  },
  {
    title: "Design 2 Main",
    description: "A conceptual design for the second main building.",
    link: "./projects/design-2-main",
    image: "./assets/design2-main.jpg"
  },
  {
    title: "Engineering Project",
    description: "A complex engineering project with detailed analysis.",
    link: "./projects/engineering-project",
    image: "./assets/engineering-project.jpg"
  },
  {
    title: "Thesis",
    description: "A thesis project focusing on urban planning and sustainability.",
    link: "./projects/thesis",
    image: "./assets/thesis.jpg"
    // Add image for Thesis
  }
];
var trips = [
  {
    title: "Coastal Engineering Trip 2022",
    description: "An exploration of coastal engineering methods and sites.",
    link: "./projects/coastal-engineering-trip-2022",
    image: "./assets/coastal-engineering-2022.jpg"
  },
  {
    title: "Coastal Engineering Trip 2023",
    description: "A continuation of coastal engineering explorations in 2023.",
    link: "./projects/coastal-engineering-trip-2023",
    image: "./assets/coastal-engineering-2023.jpg"
  },
  {
    title: "Culture 2 Trip 2024",
    description: "A cultural exploration focusing on architecture and history.",
    link: "./projects/culture-2-trip-2024",
    image: "./assets/culture-2-trip-2024.jpg"
  }
];
var precedentStudies = [
  {
    title: "Precedent Study 1",
    description: "Study of historical and modern architectural precedents.",
    link: "./projects/precedent-study-1",
    image: "./assets/precedent-study-1.jpg"
  },
  {
    title: "Precedent Study 2",
    description: "An analysis of urban planning precedents.",
    link: "./projects/precedent-study-2",
    image: "./assets/precedent-study-2.jpg"
  },
  {
    title: "Precedent Study 3",
    description: "Detailed precedent studies of residential buildings.",
    link: "./projects/precedent-study-3",
    image: "./assets/precedent-study-3.jpg"
  }
];
var miscProjects = [
  {
    title: "Regulation Booklet",
    description: "A booklet on building regulations and codes.",
    link: "./projects/regulation-booklet",
    image: "./assets/regulation-booklet.jpg"
  },
  {
    title: "Urban Sketches",
    description: "A collection of sketches capturing urban scenes.",
    link: "./projects/urban-sketches",
    image: "./assets/urban-sketches.jpg"
  }
];

// src/pages/Architecture.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function Architecture() {
  const [mainProjectIndex, setMainProjectIndex] = useState2(0);
  const memoizedMainProjects = useMemo(() => mainProjects, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setMainProjectIndex((prev) => (prev + 1) % memoizedMainProjects.length);
    }, 5e3);
    return () => clearInterval(interval);
  }, [memoizedMainProjects.length]);
  return /* @__PURE__ */ jsxs5("main", { children: [
    /* @__PURE__ */ jsx5("section", { className: Architecture_default.mainProjectSection, children: /* @__PURE__ */ jsxs5("div", { className: Architecture_default.mainProject, children: [
      /* @__PURE__ */ jsx5(
        "img",
        {
          src: memoizedMainProjects[mainProjectIndex].image,
          alt: memoizedMainProjects[mainProjectIndex].title,
          className: Architecture_default.mainProjectImage,
          onError: handleImgError
        }
      ),
      /* @__PURE__ */ jsxs5("div", { className: Architecture_default.overlay, children: [
        /* @__PURE__ */ jsx5("h2", { children: memoizedMainProjects[mainProjectIndex].title }),
        /* @__PURE__ */ jsx5("p", { children: memoizedMainProjects[mainProjectIndex].description })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx5(HorizontalScrollSection, { title: "Trips", projects: trips }),
    /* @__PURE__ */ jsx5(
      HorizontalScrollSection,
      {
        title: "Precedent Studies",
        projects: precedentStudies
      }
    ),
    /* @__PURE__ */ jsx5(HorizontalScrollSection, { title: "Miscellaneous", projects: miscProjects })
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
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs6("main", { className: CodingProjects_default.container, children: [
    /* @__PURE__ */ jsx6("section", { className: CodingProjects_default.githubSection, children: /* @__PURE__ */ jsxs6(
      "a",
      {
        href: "https://github.com/seven-leven/",
        className: CodingProjects_default.githubCard,
        target: "_blank",
        rel: "noopener noreferrer",
        children: [
          /* @__PURE__ */ jsx6("div", { className: CodingProjects_default.githubImage, children: /* @__PURE__ */ jsx6(
            "img",
            {
              src: "./github-logo.png",
              alt: "GitHub",
              onError: (e) => {
                const img = e.target;
                img.src = `./assets/placeholder.png`;
              }
            }
          ) }),
          /* @__PURE__ */ jsxs6("div", { className: CodingProjects_default.githubContent, children: [
            /* @__PURE__ */ jsx6("h2", { children: "Explore My GitHub" }),
            /* @__PURE__ */ jsx6("p", { children: "Discover repositories, contributions, and coding activity" })
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx6("h1", { className: CodingProjects_default.heading, children: "Featured Projects" }),
    /* @__PURE__ */ jsxs6("div", { className: CodingProjects_default.projectsGrid, children: [
      /* @__PURE__ */ jsx6(
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
      /* @__PURE__ */ jsx6(
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
import { jsx as jsx7 } from "react/jsx-runtime";
function miscellaneous() {
  return /* @__PURE__ */ jsx7("main", { children: /* @__PURE__ */ jsx7("h1", { children: "miscellaneous" }) });
}

// src/pages/NotFound.tsx
import { Fragment as Fragment2, jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
var notfound = () => {
  return /* @__PURE__ */ jsxs7(Fragment2, { children: [
    /* @__PURE__ */ jsx8(Navbar_default2, {}),
    /* @__PURE__ */ jsx8("h1", { children: "NotFound" })
  ] });
};
var NotFound_default = notfound;

// src/components/SphereAnimation.tsx
import { useEffect as useEffect3, useRef as useRef2, useState as useState3 } from "react";

// src/components/SphereAnimation.module.css
var SphereAnimation_default = {
  container: "SphereAnimation_container",
  terminalContainer: "SphereAnimation_terminalContainer",
  output: "SphereAnimation_output",
  controls: "SphereAnimation_controls",
  sliderGroup: "SphereAnimation_sliderGroup",
  toggleButton: "SphereAnimation_toggleButton"
};

// src/components/SphereAnimation.tsx
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs8("div", { className: SphereAnimation_default.container, children: [
    /* @__PURE__ */ jsx9("div", { className: SphereAnimation_default.terminalContainer, children: /* @__PURE__ */ jsx9("pre", { ref: outputRef, className: SphereAnimation_default.output }) }),
    /* @__PURE__ */ jsxs8("div", { className: SphereAnimation_default.controls, children: [
      /* @__PURE__ */ jsxs8("div", { className: SphereAnimation_default.sliderGroup, children: [
        /* @__PURE__ */ jsxs8("label", { children: [
          "Light X: ",
          lightDir.x.toFixed(2)
        ] }),
        /* @__PURE__ */ jsx9(
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
      /* @__PURE__ */ jsxs8("div", { className: SphereAnimation_default.sliderGroup, children: [
        /* @__PURE__ */ jsxs8("label", { children: [
          "Light Y: ",
          lightDir.y.toFixed(2)
        ] }),
        /* @__PURE__ */ jsx9(
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
      /* @__PURE__ */ jsxs8("div", { className: SphereAnimation_default.sliderGroup, children: [
        /* @__PURE__ */ jsxs8("label", { children: [
          "Light Z: ",
          lightDir.z.toFixed(2)
        ] }),
        /* @__PURE__ */ jsx9(
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
      /* @__PURE__ */ jsx9(
        "button",
        {
          className: SphereAnimation_default.toggleButton,
          onClick: () => setAutoRotate(!autoRotate),
          children: autoRotate ? "\u23F8 Stop Rotation" : "\u25B6 Start Rotation"
        }
      )
    ] })
  ] });
};
var SphereAnimation_default2 = SphereAnimation;

// src/pages/SphereAnimation.tsx
import { jsx as jsx10 } from "react/jsx-runtime";
var SphereAnimationPage = () => {
  return /* @__PURE__ */ jsx10("div", { children: /* @__PURE__ */ jsx10(SphereAnimation_default2, {}) });
};
var SphereAnimation_default3 = SphereAnimationPage;

// src/Routes.tsx
import { jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
var AppRoutes = () => {
  return /* @__PURE__ */ jsxs9(Routes, { children: [
    /* @__PURE__ */ jsx11(Route, { path: "/", element: /* @__PURE__ */ jsx11(Home_default, {}) }),
    /* @__PURE__ */ jsx11(Route, { path: "/architecture", element: /* @__PURE__ */ jsx11(Architecture, {}) }),
    /* @__PURE__ */ jsx11(Route, { path: "/coding", element: /* @__PURE__ */ jsx11(CodingProjects, {}) }),
    /* @__PURE__ */ jsx11(Route, { path: "/misc", element: /* @__PURE__ */ jsx11(miscellaneous, {}) }),
    /* @__PURE__ */ jsx11(Route, { path: "/coding/sphere", element: /* @__PURE__ */ jsx11(SphereAnimation_default3, {}) }),
    /* @__PURE__ */ jsx11(Route, { path: "*", element: /* @__PURE__ */ jsx11(NotFound_default, {}) })
  ] });
};
var Routes_default = AppRoutes;

// src/App.tsx
import { Fragment as Fragment3, jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
function App() {
  return /* @__PURE__ */ jsxs10(Fragment3, { children: [
    /* @__PURE__ */ jsx12(Navbar_default2, {}),
    /* @__PURE__ */ jsx12("div", { className: "content", children: /* @__PURE__ */ jsx12(Routes_default, {}) })
  ] });
}
var App_default = App;

// src/index.tsx
import { jsx as jsx13 } from "react/jsx-runtime";
var root = ReactDOM.createRoot(
  document.getElementById("root")
);
root.render(
  /* @__PURE__ */ jsx13(React2.StrictMode, { children: /* @__PURE__ */ jsx13(HashRouter, { children: /* @__PURE__ */ jsx13(App_default, {}) }) })
);
//# sourceMappingURL=bundle.js.map
