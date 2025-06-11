document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the item is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once it's visible if you don't want re-animation
                // observer.unobserve(entry.target); 
            } else {
                // Optional: Remove class if you want animation to repeat on scroll up/down
                // entry.target.classList.remove('is-visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
});