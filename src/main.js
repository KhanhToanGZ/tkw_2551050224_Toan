(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // -----------------------------
  // Theme toggle (dark / light)
  // -----------------------------
  const themeToggles = document.querySelectorAll("[data-theme-toggle]");
  let themeAnimTimer;

  const syncThemeControls = () => {
    const isLight = document.documentElement.classList.contains("light");
    themeToggles.forEach((button) => {
      button.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
      button.setAttribute("aria-pressed", String(isLight));
    });
  };

  themeToggles.forEach((button) => {
    button.addEventListener("click", () => {
      const isLight = document.documentElement.classList.toggle("light");

      try {
        localStorage.setItem("cf-theme", isLight ? "light" : "dark");
      } catch (e) { /* storage unavailable — theme still applies for this session */ }

      // Brief color cross-fade, then restore normal transition behaviour.
      document.documentElement.classList.add("theme-anim");
      clearTimeout(themeAnimTimer);
      themeAnimTimer = setTimeout(() => {
        document.documentElement.classList.remove("theme-anim");
      }, 400);

      syncThemeControls();
    });
  });

  syncThemeControls();

  // -----------------------------
  // Mobile menu
  // -----------------------------
  const menuButton = document.querySelector("#menu-button");
  const mobileMenu = document.querySelector("#mobile-menu");

  if (menuButton && mobileMenu) {
    const isMenuOpen = () => !mobileMenu.classList.contains("hidden");

    const closeMobileMenu = () => {
      mobileMenu.classList.add("hidden");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.focus();
    };

    menuButton.addEventListener("click", () => {
      const open = isMenuOpen();
      mobileMenu.classList.toggle("hidden", open);
      menuButton.setAttribute("aria-expanded", String(!open));
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });

    // Close the mobile menu with Escape and return focus to the hamburger button.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isMenuOpen()) {
        closeMobileMenu();
      }
    });
  }

  if (prefersReducedMotion) {
    document.body.classList.remove("page-enter");
    return;
  }

  // -----------------------------
  // Lenis smooth scroll
  // -----------------------------
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // -----------------------------
  // GSAP / ScrollTrigger
  // -----------------------------
  if (!window.gsap || !window.ScrollTrigger) {
    document.body.classList.remove("page-enter");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Page entrance transition.
  const pageTransition = document.querySelector("#page-transition");
  gsap.fromTo(
    pageTransition,
    { scaleY: 1, transformOrigin: "top" },
    {
      scaleY: 0,
      duration: 0.8,
      ease: "power3.inOut",
      onComplete: () => document.body.classList.remove("page-enter")
    }
  );

  // -----------------------------
  // Text reveal
  // -----------------------------
  document.querySelectorAll("[data-reveal]").forEach((element, index) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 28, clipPath: "inset(0 0 18% 0)" },
      {
        opacity: 1,
        y: 0,
        clipPath: "inset(0 0 0% 0)",
        duration: 0.85,
        delay: Math.min(index * 0.035, 0.25),
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true
        }
      }
    );
  });

  // Hero title: word-level reveal.
  const heroTitle = document.querySelector("[data-reveal].reveal-text");
  if (heroTitle) {
    const words = heroTitle.textContent.trim().split(/\s+/);
    heroTitle.innerHTML = words.map(word =>
      `<span class="reveal-word">${word}</span>`
    ).join(" ");
    gsap.fromTo(".reveal-word",
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.045, ease: "power4.out", delay: 0.2 }
    );
  }

  // -----------------------------
  // Scroll storytelling
  // -----------------------------
  document.querySelectorAll("[data-story-section]").forEach((section) => {
    gsap.fromTo(section,
      { backgroundPositionY: "0%" },
      {
        backgroundPositionY: "30%",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  });

  // -----------------------------
  // Light parallax
  // -----------------------------
  document.querySelectorAll("[data-parallax]").forEach((element) => {
    const amount = Number(element.dataset.parallax || 0.08);
    gsap.to(element, {
      y: () => window.innerHeight * amount,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });

  // -----------------------------
  // Counter stats
  // -----------------------------
  const counters = document.querySelectorAll("[data-counter]");
  counters.forEach((counter) => {
    const target = counter.dataset.counter;
    const match = target.replace(/,/g, "").match(/[\d.]+/);
    const numericTarget = match ? Number(match[0]) : 0;
    const suffix = target.includes("%") ? "%" : target.includes("+") ? "+" : target.includes("50ms") ? "ms" : "";
    const prefix = target.includes("<") ? "< " : "";

    const state = { value: 0 };
    gsap.to(state, {
      value: numericTarget,
      duration: 1.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: counter,
        start: "top 88%",
        once: true
      },
      onUpdate: () => {
        const decimals = target.includes(".") ? 2 : 0;
        const value = decimals ? state.value.toFixed(decimals) : Math.round(state.value).toLocaleString();
        counter.textContent = `${prefix}${value}${suffix}`;
      }
    });
  });

  // -----------------------------
  // Hover cards
  // -----------------------------
  document.querySelectorAll(".hover-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      gsap.to(card, {
        rotateY: x * 4,
        rotateX: y * -4,
        y: -5,
        duration: 0.25,
        ease: "power2.out",
        overwrite: true
      });
    });

    card.addEventListener("pointerleave", () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.55)"
      });
    });
  });

  // -----------------------------
  // Page transition for internal links
  // -----------------------------
  document.querySelectorAll("[data-page-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      if (lenis) {
        lenis.scrollTo(target, {
          offset: -72,
          duration: 1.2
        });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Refresh ScrollTrigger after fonts/layout settle.
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
