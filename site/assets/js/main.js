(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Order used for the previous/next links at the bottom of project pages.
  const PROJECTS = [
    { href: "sem1.html", title: "Enchanting Reading Nook", label: "Semester 1" },
    { href: "sem2.html", title: "Blue Canvas", label: "Semester 2" },
    { href: "sem3.html", title: "Urban Acupuncture", label: "Semester 3" },
    { href: "sem4.html", title: "Measured Embrace", label: "Semester 4" },
    { href: "sem5.html", title: "Yield, Register, Transmit", label: "Semester 5" },
  ];

  const ICON = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M20 20l-4-4"/></svg>',
  };

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  onReady(() => {
    setYear();
    initNav();
    initNavGroups();
    initReveal();
    initScrollSpy();
    initSectionNav();
    initContactForm();
    initTumblrFeed();
    initWildlife();

    if (document.body.classList.contains("project-page")) {
      initBrokenImages();
      initProgress();
      initLightbox();
      initPager();
    }
  });

  function setYear() {
    const el = document.getElementById("currentYear");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  // --- Navbar: shadow on scroll + mobile menu --------------------------------
  function initNav() {
    const nav = document.getElementById("navbar");
    if (!nav) return;

    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const toggle = nav.querySelector(".nav-toggle");
    const links = nav.querySelector(".nav-links");
    if (!toggle || !links) return;

    const setOpen = (open) => {
      nav.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("nav-open")));
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("nav-open") && !nav.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("nav-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 1081px)").addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });
  }

  // --- Navbar dropdown groups (desktop; the mobile menu shows them open) ----
  function initNavGroups() {
    const groups = [...document.querySelectorAll("#navbar .nav-group")];
    if (!groups.length) return;
    const desktop = window.matchMedia("(min-width: 1081px)");

    const setOpen = (group, open) => {
      group.classList.toggle("is-open", open);
      group.querySelector(".nav-group__btn").setAttribute("aria-expanded", String(open));
    };
    const closeAll = (except) => groups.forEach((g) => g !== except && setOpen(g, false));

    groups.forEach((group) => {
      const button = group.querySelector(".nav-group__btn");
      button.addEventListener("click", () => {
        if (!desktop.matches) return;
        closeAll(group);
        setOpen(group, !group.classList.contains("is-open"));
      });
      group.addEventListener("mouseleave", () => desktop.matches && setOpen(group, false));
      // Close when keyboard focus leaves the group.
      group.addEventListener("focusout", (e) => {
        if (!group.contains(e.relatedTarget)) setOpen(group, false);
      });
      // After choosing a link, drop focus so :focus-within doesn't hold the menu open.
      group.querySelectorAll(".nav-group__menu a").forEach((a) =>
        a.addEventListener("click", () => {
          setOpen(group, false);
          a.blur();
        })
      );
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#navbar .nav-group")) closeAll();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const open = groups.find((g) => g.classList.contains("is-open") || g.contains(document.activeElement));
      closeAll();
      // Return focus to the group's button; the menu stays closed.
      if (open) open.querySelector(".nav-group__btn").focus();
    });
  }

  // --- Fade/slide sections in as they scroll into view ----------------------
  function initReveal() {
    const hero = document.getElementById("project-showcase-hero");
    if (hero) setTimeout(() => hero.classList.add("is-visible"), 100);

    const targets = document.querySelectorAll(".animate-on-scroll-target, .reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("is-visible"));
      return;
    }

    // threshold 0: tall sections still reveal as soon as their top edge enters.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
    targets.forEach((t) => {
      if (!t.classList.contains("is-visible")) io.observe(t);
    });
  }

  // --- Highlight the nav link for the section in view (home page) -----------
  function initScrollSpy() {
    if (!document.body.classList.contains("home") || !("IntersectionObserver" in window)) return;

    const links = [...document.querySelectorAll('#navbar .nav-links a[href^="#"]')];
    const bySection = new Map();
    links.forEach((a) => {
      const section = document.querySelector(a.getAttribute("href"));
      if (section) bySection.set(section, a);
    });

    const groupButtons = [...document.querySelectorAll("#navbar .nav-group__btn")];
    const setActive = (link) => {
      links.forEach((l) => {
        l.classList.toggle("is-active", l === link);
        if (l === link) l.setAttribute("aria-current", "true");
        else l.removeAttribute("aria-current");
      });
      // Highlight the dropdown group that contains the active link.
      groupButtons.forEach((b) => b.classList.toggle("is-active", !!link && b.parentElement.contains(link)));
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(bySection.get(entry.target));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    bySection.forEach((_, section) => io.observe(section));
  }

  // --- In-page chapter nav (nav[data-spy]) on long project pages -----------
  function initSectionNav() {
    const nav = document.querySelector("nav[data-spy]");
    if (!nav || !("IntersectionObserver" in window)) return;

    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const targets = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const active = byId.get(entry.target.id);
          links.forEach((l) => l.classList.toggle("is-active", l === active));
          // Keep the active chip visible when the chip row scrolls sideways (phones).
          const row = active?.parentElement;
          if (row && row.scrollWidth > row.clientWidth) {
            row.scrollTo({ left: active.offsetLeft - (row.clientWidth - active.offsetWidth) / 2 });
          }
        });
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    targets.forEach((t) => io.observe(t));
  }

  // --- Live Tumblr journal ([data-tumblr-feed="blogname"]) -----------------
  // Tumblr's public v1 API answers with `var tumblr_api_read = {...}`, so it
  // loads as a plain script (no CORS). Posts are rebuilt from their text and
  // image URLs only; no Tumblr HTML is ever inserted into the page.
  function initTumblrFeed() {
    const feed = document.querySelector("[data-tumblr-feed]");
    if (!feed) return;
    const blog = feed.dataset.tumblrFeed;
    const count = Number(feed.dataset.count) || 9;
    const list = feed.querySelector(".tf-list");
    const status = feed.querySelector(".tf-status");
    const total = (feed.closest("section") || document).querySelector(".tf-total");

    const fail = () => {
      feed.classList.add("is-error");
      if (status) status.textContent = "The journal couldn’t be loaded right now. Read it on Tumblr instead.";
    };

    const script = document.createElement("script");
    script.src = `https://${blog}.tumblr.com/api/read/json?num=${count}`;
    script.async = true;
    script.onerror = fail;
    script.onload = () => {
      const data = window.tumblr_api_read;
      if (!data || !Array.isArray(data.posts) || !list) return fail();
      data.posts.forEach((post) => list.appendChild(tumblrCard(blog, post)));
      if (total && data["posts-total"]) total.textContent = `all ${data["posts-total"]} entries`;
      if (status) status.hidden = true;
      feed.classList.add("is-loaded");
    };
    document.body.appendChild(script);
  }

  function tumblrCard(blog, post) {
    const html = post["regular-body"] || post["photo-caption"] || post["video-caption"] || "";
    const doc = new DOMParser().parseFromString(html, "text/html"); // inert: nothing loads or runs
    const imgSrc = post["photo-url-500"] || doc.querySelector("img")?.getAttribute("src") || "";
    // textContent glues adjacent blocks/links together ("@studiowork"); pad them first.
    doc.body.querySelectorAll("p, div, br, li, h1, h2, h3, h4, figure, blockquote, a").forEach((el) => el.append(" "));
    const text = `${post["regular-title"] || ""} ${doc.body.textContent || ""}`.replace(/\s+/g, " ").trim();
    const num = text.match(/entry\s*\/\/\s*#?\s*(\d+)/i)?.[1];
    const caption = text
      .replace(/^.*?entry\s*\/\/\s*#?\s*\d+\s*/i, "")
      .replace(/@[\w-]+/g, "")
      .trim();
    const date = new Date(Number(post["unix-timestamp"]) * 1000);

    const card = document.createElement("a");
    card.className = "tf-card";
    card.href = `https://www.tumblr.com/${blog}/${encodeURIComponent(post.id)}`;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    if (/^https:\/\//.test(imgSrc)) {
      const media = document.createElement("span");
      media.className = "tf-media";
      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      media.appendChild(img);
      card.appendChild(media);
    }

    const meta = document.createElement("span");
    meta.className = "tf-meta";
    const label = document.createElement("span");
    label.textContent = num ? `Entry #${num}` : "Journal";
    const time = document.createElement("time");
    time.dateTime = date.toISOString();
    time.textContent = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    meta.append(label, time);

    const cap = document.createElement("span");
    cap.className = "tf-caption";
    cap.textContent = caption || "View entry";

    card.append(meta, cap);
    return card;
  }

  // --- Wildlife Illustrated: live progress from the bird_dash data ---------
  // The page ships with the latest known numbers; this refreshes them from
  // the collection's own JSON so the portfolio never goes stale.
  async function initWildlife() {
    const section = document.querySelector("[data-wildlife]");
    if (!section || !window.fetch) return;
    const base = section.dataset.wildlife;

    try {
      const getJSON = (path) =>
        fetch(base + path, { cache: "no-cache" }).then((r) => {
          if (!r.ok) throw new Error(`${path}: ${r.status}`);
          return r.json();
        });

      const collections = await getJSON("collections.json");
      const lists = await Promise.all(collections.map((c) => getJSON(`lists/${c.id}.json`)));

      const stats = { all: { drawn: 0, total: 0 } };
      const drawnItems = [];
      collections.forEach((c, i) => {
        const items = Object.values(lists[i]).flat();
        const drawn = items.filter((it) => it.drawn);
        stats[c.id] = { drawn: drawn.length, total: items.length };
        stats.all.drawn += drawn.length;
        stats.all.total += items.length;
        drawn.forEach((it) => drawnItems.push({ ...it, collection: c }));
      });

      Object.entries(stats).forEach(([id, s]) => {
        section.querySelectorAll(`[data-count="${id}"]`).forEach((el) => (el.textContent = String(s.drawn)));
        section.querySelectorAll(`[data-total="${id}"]`).forEach((el) => (el.textContent = String(s.total)));
        const bar = section.querySelector(`[data-bar="${id}"]`);
        if (bar && s.total) {
          bar.setAttribute("aria-valuenow", String(s.drawn));
          bar.setAttribute("aria-valuemax", String(s.total));
          bar.firstElementChild.style.width = `${((s.drawn / s.total) * 100).toFixed(1)}%`;
        }
      });

      const grid = section.querySelector("[data-latest]");
      if (grid && drawnItems.length) {
        drawnItems.sort((a, b) => String(b.drawn).localeCompare(String(a.drawn)));
        grid.replaceChildren(...drawnItems.slice(0, 6).map((it) => wildlifeCard(base, it)));
      }
    } catch (err) {
      // Keep the numbers baked into the page.
      console.warn("Wildlife Illustrated: using cached numbers.", err);
    }
  }

  function wildlifeCard(base, it) {
    const kind = it.collection.itemLabel || it.collection.id;
    const card = document.createElement("a");
    card.className = "wl-card";
    card.href = base;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const media = document.createElement("span");
    media.className = "wl-card__img";
    const img = document.createElement("img");
    img.src = `${base}thumb/${encodeURIComponent(it.collection.id)}/${encodeURIComponent(it.id)}.webp`;
    img.alt = `Drawing of a ${it.name}`;
    img.loading = "lazy";
    media.appendChild(img);

    const body = document.createElement("span");
    body.className = "wl-card__body";
    const id = document.createElement("span");
    id.className = "wl-card__id";
    id.textContent = `${kind.charAt(0).toUpperCase()}${kind.slice(1)} #${it.id}`;
    const name = document.createElement("b");
    name.textContent = it.name;
    body.append(id, name);
    if (it.dhiv_script) {
      const dv = document.createElement("span");
      dv.className = "wl-card__dv";
      dv.lang = "dv";
      dv.dir = "rtl";
      dv.textContent = it.dhiv_script;
      body.appendChild(dv);
    }

    card.append(media, body);
    return card;
  }

  // --- Contact form: open the visitor's mail app with a pre-filled message --
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const message = String(data.get("message") || "").trim();

      const subject = `Portfolio enquiry from ${name}`;
      const body = `${message}\n\n${name}\n${email}`;
      window.location.href =
        `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      const status = form.querySelector(".form-note");
      if (status) status.textContent = "Opening your email app…";
    });
  }

  // --- Project pages: hide images whose file is missing ---------------------
  function initBrokenImages() {
    const hide = (img) => {
      img.dataset.broken = "true";
      (img.closest("figure") || img).hidden = true;
    };
    document.querySelectorAll("img").forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) hide(img);
      else img.addEventListener("error", () => hide(img), { once: true });
    });
  }

  // --- Project pages: reading progress bar ----------------------------------
  function initProgress() {
    const bar = document.createElement("div");
    bar.id = "read-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    let queued = false;
    const update = () => {
      const max = root.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.transform = `scaleX(${progress})`;
      queued = false;
    };
    const queue = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    update();
  }

  // --- Project pages: click any drawing/render to view it full screen -------
  function initLightbox() {
    const images = [...document.querySelectorAll("img")].filter(
      (img) => !img.closest("#navbar, .site-footer, #project-pager, #lightbox"),
    );
    if (!images.length) return;

    const lb = document.createElement("div");
    lb.id = "lightbox";
    lb.hidden = true;
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Image viewer");
    lb.innerHTML = `
      <div class="lb-stage"><img class="lb-img" alt=""></div>
      <div class="lb-bar"><p class="lb-caption"></p><span class="lb-count"></span></div>
      <button type="button" class="lb-btn lb-close" aria-label="Close">${ICON.close}</button>
      <button type="button" class="lb-btn lb-zoom" aria-label="Toggle full size">${ICON.zoom}</button>
      <button type="button" class="lb-btn lb-prev" aria-label="Previous image">${ICON.prev}</button>
      <button type="button" class="lb-btn lb-next" aria-label="Next image">${ICON.next}</button>`;
    document.body.appendChild(lb);

    const stage = lb.querySelector(".lb-stage");
    const big = lb.querySelector(".lb-img");
    const caption = lb.querySelector(".lb-caption");
    const count = lb.querySelector(".lb-count");
    const closeBtn = lb.querySelector(".lb-close");
    const buttons = [...lb.querySelectorAll("button")];

    if (images.length < 2) {
      lb.querySelector(".lb-prev").hidden = true;
      lb.querySelector(".lb-next").hidden = true;
    }

    let index = 0;
    let lastFocus = null;
    let hideTimer = 0;

    const captionFor = (img) => {
      const sibling = img.nextElementSibling;
      if (sibling && /caption/i.test(sibling.className)) return sibling.textContent.trim();
      const figcaption = img.closest("figure")?.querySelector("figcaption");
      if (figcaption) return figcaption.textContent.trim();
      const nearby = img.parentElement?.querySelector('[class*="caption"]');
      if (nearby) return nearby.textContent.trim();
      return img.alt || "";
    };

    const wrap = (i) => ((i % images.length) + images.length) % images.length;

    // Step in `dir` from i, skipping images whose file failed to load.
    const show = (i, dir = 1) => {
      index = wrap(i);
      for (let guard = 0; images[index].dataset.broken && guard < images.length; guard++) {
        index = wrap(index + dir);
      }
      const img = images[index];
      const live = images.filter((x) => !x.dataset.broken);
      lb.classList.remove("is-zoomed");
      big.src = img.currentSrc || img.src;
      big.alt = img.alt || "";
      caption.textContent = captionFor(img);
      count.textContent = `${live.indexOf(img) + 1} / ${live.length}`;
      stage.scrollTo(0, 0);
    };

    const open = (i) => {
      clearTimeout(hideTimer);
      lastFocus = document.activeElement;
      show(i);
      lb.hidden = false;
      root.classList.add("lb-lock");
      void lb.offsetWidth; // force a reflow so the fade-in transition runs
      lb.classList.add("is-open");
      closeBtn.focus();
    };

    const close = () => {
      lb.classList.remove("is-open");
      root.classList.remove("lb-lock");
      hideTimer = setTimeout(() => {
        lb.hidden = true;
        big.removeAttribute("src");
      }, reduceMotion ? 0 : 200);
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    };

    images.forEach((img, i) => {
      img.classList.add("zoomable");
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `View larger: ${img.alt || "image"}`);
      img.addEventListener("click", () => open(i));
      img.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(i);
        }
      });
    });

    closeBtn.addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", () => show(index - 1, -1));
    lb.querySelector(".lb-next").addEventListener("click", () => show(index + 1));
    lb.querySelector(".lb-zoom").addEventListener("click", () => lb.classList.toggle("is-zoomed"));
    big.addEventListener("click", () => lb.classList.toggle("is-zoomed"));
    stage.addEventListener("click", (e) => {
      if (e.target === stage) close();
    });

    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(index - 1, -1);
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "Tab") {
        // Keep focus inside the viewer.
        const visible = buttons.filter((b) => !b.hidden);
        const first = visible[0];
        const last = visible[visible.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Swipe left/right on touch screens (when not zoomed in).
    let startX = null;
    stage.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" && !lb.classList.contains("is-zoomed")) startX = e.clientX;
    });
    stage.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });
  }

  // --- Project pages: previous / next project links above the footer --------
  function initPager() {
    const page = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
    const i = PROJECTS.findIndex((p) => p.href.replace(/\.html$/, "") === page);
    if (i === -1) return;

    const link = (p, dir) => {
      if (!p) return '<span class="pp-link pp-empty" aria-hidden="true"></span>';
      const label = dir === "prev" ? `← Previous · ${p.label}` : `Next · ${p.label} →`;
      return `<a class="pp-link pp-${dir}" href="${p.href}"><span class="pp-label">${label}</span><span class="pp-title">${p.title}</span></a>`;
    };

    const pager = document.createElement("nav");
    pager.id = "project-pager";
    pager.setAttribute("aria-label", "More projects");
    pager.innerHTML = `<div class="pp-inner">${link(PROJECTS[i - 1], "prev")}<a class="pp-all" href="index.html#architecture">All architecture</a>${link(PROJECTS[i + 1], "next")}</div>`;

    const footer = document.querySelector(".site-footer, footer");
    if (footer) footer.before(pager);
    else document.body.appendChild(pager);
  }
})();
