document.addEventListener("DOMContentLoaded", () => {
  // Set current year in footer
  const currentYearSpan = document.getElementById("currentYear");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Initial hero animation for the main page
  const mainPageHero = document.querySelector("#home.hero"); // Targets hero on index.html specifically
  if (mainPageHero) {
    setTimeout(() => {
      mainPageHero.classList.add("is-visible"); // Assuming 'is-visible' is defined in CSS for this
    }, 100);
  }

  // Initial hero animation for project detail pages
  const projectShowcaseHero = document.getElementById("project-showcase-hero"); // Targets hero on project pages
  if (projectShowcaseHero) {
    setTimeout(() => {
      projectShowcaseHero.classList.add("is-visible");
    }, 100);
  }

  // Scroll animation for sections with .animate-on-scroll-target
  const sectionsToAnimate = document.querySelectorAll(
    ".animate-on-scroll-target",
  );

  if ("IntersectionObserver" in window) {
    const observerOptions = {
      root: null, // relative to document viewport
      rootMargin: "0px",
      threshold: 0.1, // 10% of the target is visible
    };

    const observer = new IntersectionObserver((entries, _observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          // Optional: Unobserve after animation to save resources
          // observerInstance.unobserve(entry.target);
        }
        // Optional: To re-animate if it scrolls out and back in (remove unobserve)
        // else {
        //     entry.target.classList.remove('is-visible');
        // }
      });
    }, observerOptions);

    sectionsToAnimate.forEach((section) => {
      if (section !== mainPageHero && section !== projectShowcaseHero) { // Don't re-observe heroes if already handled
        observer.observe(section);
      } else if (!section.classList.contains("is-visible")) { // Observe if not yet visible
        observer.observe(section);
      }
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    sectionsToAnimate.forEach((section) => {
      section.classList.add("is-visible"); // Make them visible directly
    });
  }
});

// CSS for .is-visible (if not already in style.css, ensure it is for the animations)
// Example (this should ideally be in your CSS file):
/*
.animate-on-scroll-target, #home.hero, #project-showcase-hero {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.animate-on-scroll-target.is-visible,
#home.hero.is-visible,
#project-showcase-hero.is-visible {
    opacity: 1;
    transform: translateY(0);
}
*/
