const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    siteNav.classList.toggle("is-open");

    if (isExpanded) {
      siteNav.querySelectorAll(".site-nav-item.is-open").forEach((item) => {
        item.classList.remove("is-open");
        const button = item.querySelector(".site-nav-parent");

        if (button) {
          button.setAttribute("aria-expanded", "false");
        }
      });
    }
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

const submenuItems = Array.from(document.querySelectorAll(".site-nav-item.has-submenu"));

if (submenuItems.length > 0) {
  const closeAllSubmenus = (exceptItem = null) => {
    submenuItems.forEach((item) => {
      if (item === exceptItem) {
        return;
      }

      const button = item.querySelector(".site-nav-parent");
      item.classList.remove("is-open");

      if (button) {
        button.setAttribute("aria-expanded", "false");
      }
    });
  };

  submenuItems.forEach((item, index) => {
    const button = item.querySelector(".site-nav-parent");
    const submenu = item.querySelector(".site-submenu");
    const firstSubmenuLink = submenu?.querySelector("a");

    if (!button || !submenu) {
      return;
    }

    const submenuId = submenu.id || `site-submenu-${index + 1}`;
    submenu.id = submenuId;
    button.setAttribute("aria-controls", submenuId);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-haspopup", "true");

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = item.classList.contains("is-open");

      closeAllSubmenus(item);
      item.classList.toggle("is-open", !isOpen);
      button.setAttribute("aria-expanded", String(!isOpen));
    });

    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown") {
        return;
      }

      event.preventDefault();
      closeAllSubmenus(item);
      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      firstSubmenuLink?.focus();
    });

    item.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      closeAllSubmenus();
      button.focus();
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInsideSubmenu = submenuItems.some((item) => item.contains(event.target));

    if (!clickedInsideSubmenu) {
      closeAllSubmenus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllSubmenus();
    }
  });
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealElements.length > 0) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const pillNavs = document.querySelectorAll("[data-pill-nav]");

const initPillNav = (nav) => {
  const indicator = nav.querySelector("[data-pill-indicator]");
  const links = Array.from(nav.querySelectorAll("a[href^='#']"));

  if (!indicator || links.length === 0) {
    return;
  }

  const sectionEntries = links
    .map((link) => {
      const id = link.getAttribute("href");

      if (!id) {
        return null;
      }

      const section = document.querySelector(id);

      if (!section) {
        return null;
      }

      return { link, section };
    })
    .filter(Boolean);

  if (sectionEntries.length === 0) {
    return;
  }

  let activeLink = null;

  const moveIndicator = (link) => {
    if (!link || window.innerWidth <= 760) {
      indicator.style.opacity = "0";
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const offsetX = linkRect.left - navRect.left;
    const offsetY = linkRect.top - navRect.top;

    indicator.style.width = `${linkRect.width}px`;
    indicator.style.height = `${linkRect.height}px`;
    indicator.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    indicator.style.opacity = "1";
  };

  const setActiveLink = (link) => {
    if (!link) {
      return;
    }

    activeLink = link;

    links.forEach((item) => {
      const isActive = item === link;
      item.classList.toggle("is-active", isActive);

      if (isActive) {
        item.setAttribute("aria-current", "true");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    moveIndicator(link);
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveLink(link);
    });
  });

  if ("IntersectionObserver" in window) {
    const visibilityMap = new Map();
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibilityMap.set(entry.target.id, entry);
        });

        const visibleSections = Array.from(visibilityMap.values())
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections.length === 0) {
          return;
        }

        const currentSection = visibleSections[0].target;
        const match = sectionEntries.find(({ section }) => section === currentSection);

        if (match) {
          setActiveLink(match.link);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.18, 0.35, 0.55, 0.75],
      }
    );

    sectionEntries.forEach(({ section }) => navObserver.observe(section));
  }

  const initialLink =
    links.find((link) => link.getAttribute("href") === window.location.hash) || links[0];

  setActiveLink(initialLink);

  window.addEventListener("resize", () => moveIndicator(activeLink), { passive: true });
};

pillNavs.forEach((nav) => initPillNav(nav));

const familySliders = document.querySelectorAll("[data-family-slider]");

const initFamilySlider = (slider) => {
  const track = slider.querySelector("[data-slider-track]");
  const prevButton = slider.querySelector("[data-slider-prev]");
  const nextButton = slider.querySelector("[data-slider-next]");
  const dots = Array.from(slider.querySelectorAll("[data-slider-dot]"));
  const slides = Array.from(track?.children || []);

  if (!track || slides.length === 0) {
    return;
  }

  let activeIndex = 0;
  let autoRotate = null;
  let touchStartX = 0;
  let touchDeltaX = 0;

  const setActiveSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
    });
  };

  const stopAutoRotate = () => {
    if (autoRotate) {
      window.clearInterval(autoRotate);
      autoRotate = null;
    }
  };

  const startAutoRotate = () => {
    stopAutoRotate();
    autoRotate = window.setInterval(() => {
      setActiveSlide(activeIndex + 1);
    }, 5200);
  };

  prevButton?.addEventListener("click", () => {
    setActiveSlide(activeIndex - 1);
    startAutoRotate();
  });

  nextButton?.addEventListener("click", () => {
    setActiveSlide(activeIndex + 1);
    startAutoRotate();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      setActiveSlide(index);
      startAutoRotate();
    });
  });

  slider.addEventListener("mouseenter", stopAutoRotate);
  slider.addEventListener("mouseleave", startAutoRotate);

  slider.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0]?.clientX || 0;
    touchDeltaX = 0;
    stopAutoRotate();
  }, { passive: true });

  slider.addEventListener("touchmove", (event) => {
    const currentX = event.touches[0]?.clientX || 0;
    touchDeltaX = currentX - touchStartX;
  }, { passive: true });

  slider.addEventListener("touchend", () => {
    if (Math.abs(touchDeltaX) > 50) {
      setActiveSlide(activeIndex + (touchDeltaX < 0 ? 1 : -1));
    }

    startAutoRotate();
  });

  setActiveSlide(0);
  startAutoRotate();
};

familySliders.forEach((slider) => initFamilySlider(slider));
