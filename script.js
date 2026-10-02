(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Jahr
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // Laufband: Liste duplizieren, damit die Schleife nahtlos ist
  const track = document.querySelector(".ticker__track");
  if (track) {
    const list = track.querySelector(".ticker__list");
    // So oft kopieren, bis eine Hälfte breiter als der Viewport ist
    let copies = Math.max(1, Math.ceil(window.innerWidth / list.offsetWidth));
    for (let i = 1; i < copies; i++) track.appendChild(list.cloneNode(true));
    const half = track.innerHTML;
    track.insertAdjacentHTML("beforeend", half);
    track.querySelectorAll(".ticker__list").forEach((l, i) => {
      if (i > 0) l.setAttribute("aria-hidden", "true");
      if (i > 0) l.querySelectorAll("a").forEach((a) => a.setAttribute("tabindex", "-1"));
    });
  }

  // Hero-Zeilen nach dem Laden der Schriften einblenden
  const markLoaded = () => requestAnimationFrame(() => document.body.classList.add("is-loaded"));
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(markLoaded);
  } else {
    markLoaded();
  }

  // Kunden: Stagger-Index setzen
  document.querySelectorAll("[data-clients] li").forEach((li, i) => li.style.setProperty("--i", i));

  // Scroll-Reveals
  const revealTargets = document.querySelectorAll(
    "[data-reveal], [data-blur], [data-reveal-clip], [data-clients], .footer__cta"
  );
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  }

  // Header: beim Runterscrollen ausblenden, beim Hochscrollen zeigen
  const header = document.querySelector("[data-header]");
  let lastY = window.scrollY;

  // Parallax für das Hero-Bild
  const parallax = reduceMotion ? [] : [...document.querySelectorAll("[data-parallax]")];

  // Aktiver Navigationspunkt
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const menuOpen = document.body.classList.contains("menu-open");
    if (header && !menuOpen) {
      const goingDown = y > lastY && y > header.offsetHeight * 2;
      header.classList.toggle("is-hidden", goingDown);
    }
    lastY = y;

    parallax.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });

    const probe = window.innerHeight * 0.4;
    let current = null;
    sections.forEach((s) => {
      if (s.getBoundingClientRect().top <= probe) current = s;
    });
    navLinks.forEach((a) => {
      a.classList.toggle("is-active", current && a.getAttribute("href") === `#${current.id}`);
    });

    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  // Mobil-Menü
  const burger = document.querySelector("[data-burger]");
  const menu = document.querySelector("[data-menu]");
  if (burger && menu) {
    const setOpen = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
      header.classList.remove("is-hidden");
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
      } else {
        menu.classList.remove("is-open");
        setTimeout(() => {
          if (!menu.classList.contains("is-open")) menu.hidden = true;
        }, 250);
      }
    };
    burger.addEventListener("click", () => setOpen(burger.getAttribute("aria-expanded") !== "true"));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") setOpen(false);
    });
  }
})();
