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
    const w = list.offsetWidth;
    // Ausgeblendetes Laufband (Breite 0) nicht vervielfältigen
    let copies = w > 0 ? Math.min(10, Math.max(1, Math.ceil(window.innerWidth / w))) : 1;
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

  // FAQ-Akkordeon: Höhe weich animieren, ein Eintrag gleichzeitig offen
  const faqItems = [...document.querySelectorAll(".faq__item")];
  const animateItem = (item, open) => {
    const body = item.querySelector(".faq__body");
    if (reduceMotion || !body.animate) {
      item.open = open;
      return;
    }
    if (open) item.open = true;
    const full = body.scrollHeight;
    body.getAnimations().forEach((a) => a.cancel());
    const anim = body.animate(
      open ? [{ height: "0px" }, { height: `${full}px` }] : [{ height: `${full}px` }, { height: "0px" }],
      { duration: open ? 420 : 280, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
    );
    if (!open) anim.onfinish = () => (item.open = false);
  };
  faqItems.forEach((item) => {
    item.querySelector("summary").addEventListener("click", (e) => {
      e.preventDefault();
      const willOpen = !item.open;
      if (willOpen) faqItems.forEach((other) => other !== item && other.open && animateItem(other, false));
      animateItem(item, willOpen);
    });
  });

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

// Moodboard-Filter, Lightbox und Kontaktformular
(() => {
  const chips = document.querySelectorAll(".chips [data-filter]");
  const items = document.querySelectorAll(".mood__item, .acard[data-cat], .wcard-l[data-cat]");
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.toggle("is-active", c === chip));
      const f = chip.dataset.filter;
      items.forEach((it) => {
        const show = f === "*" || it.dataset.cat === f;
        it.classList.toggle("is-hidden", !show);
        if (show) it.classList.add("is-in"), it.querySelector("[data-blur]")?.classList.add("is-in");
      });
    })
  );

  const box = document.querySelector("[data-lightbox]");
  if (box && box.showModal) {
    const media = box.querySelector(".lightbox__media");
    document.querySelectorAll(".mood__btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const ph = btn.querySelector(".ph").cloneNode(true);
        ph.classList.add("is-in");
        media.replaceChildren(ph);
        box.showModal();
      })
    );
    box.querySelector("[data-lightbox-close]").addEventListener("click", () => box.close());
    box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
  }

  const form = document.querySelector("[data-form]");
  if (form) {
    const status = form.querySelector(".form__status");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll("[required]").forEach((el) => {
        const valid = el.checkValidity() && el.value.trim() !== "";
        el.closest(".field").classList.toggle("is-invalid", !valid);
        if (!valid) ok = false;
      });
      status.textContent = ok
        ? "Danke! (Platzhalter – hier ist noch kein Versand angebunden.)"
        : "Bitte die markierten Felder ausfüllen.";
      if (ok) form.reset();
    });
  }
})();

// Academy: Newsletter-Formular und aktives Kapitel im Inhaltsverzeichnis
(() => {
  const nl = document.querySelector("[data-newsletter]");
  if (nl) {
    const status = nl.querySelector(".form__status");
    nl.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = nl.querySelector("input[type=email]");
      const ok = input.checkValidity() && input.value.trim() !== "";
      input.closest(".field").classList.toggle("is-invalid", !ok);
      status.textContent = ok
        ? "Danke! (Platzhalter – hier ist noch kein Versand angebunden.)"
        : "Bitte eine gültige E-Mail-Adresse eingeben.";
      if (ok) nl.reset();
    });
  }

  const tocLinks = [...document.querySelectorAll(".article__toc a")];
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map(tocLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          tocLinks.forEach((a) => a.classList.toggle("is-current", a === map.get(en.target.id)));
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    map.forEach((_, id) => { const h = document.getElementById(id); if (h) io.observe(h); });
  }
})();

// Dropdown-Navigation: per Klick, Tastatur und Escape bedienbar
(() => {
  const subs = [...document.querySelectorAll(".has-sub")];
  if (!subs.length) return;
  const close = (except) => subs.forEach((li) => {
    if (li === except) return;
    li.classList.remove("is-open");
    li.querySelector(".nav__toggle").setAttribute("aria-expanded", "false");
  });
  subs.forEach((li) => {
    const btn = li.querySelector(".nav__toggle");
    btn.addEventListener("click", () => {
      const open = !li.classList.contains("is-open");
      close(li);
      li.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
    li.addEventListener("mouseenter", () => btn.setAttribute("aria-expanded", "true"));
    li.addEventListener("mouseleave", () => { if (!li.classList.contains("is-open")) btn.setAttribute("aria-expanded", "false"); });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".has-sub")) close(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const openLi = subs.find((li) => li.classList.contains("is-open"));
    close();
    openLi?.querySelector(".nav__toggle").focus();
  });
})();

// Academy-Übersicht: Suche und Kategorie-Filter für das Marken-Wiki
(() => {
  const list = document.querySelector(".awiki__list");
  if (!list) return;
  const rows = [...list.querySelectorAll(".wrow")];
  const groups = [...list.querySelectorAll(".awiki__group")];
  const buttons = [...document.querySelectorAll(".awiki__filter button")];
  const search = document.getElementById("wiki-search");
  const count = document.querySelector("[data-count]");
  const empty = list.querySelector(".awiki__empty");
  let cat = "*";

  const apply = () => {
    const q = (search?.value || "").trim().toLowerCase();
    let shown = 0;
    rows.forEach((r) => {
      const ok = (cat === "*" || r.dataset.cat === cat) && (!q || r.dataset.text.includes(q));
      r.hidden = !ok;
      if (ok) shown++;
    });
    groups.forEach((g) => { g.hidden = !g.querySelector(".wrow:not([hidden])"); });
    if (count) count.textContent = shown;
    if (empty) empty.hidden = shown > 0;
  };
  const setCat = (c) => {
    cat = c;
    buttons.forEach((b) => {
      const on = b.dataset.cat === c;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    apply();
  };
  buttons.forEach((b) => b.addEventListener("click", () => setCat(b.dataset.cat)));
  search?.addEventListener("input", apply);
  list.querySelector("[data-reset]")?.addEventListener("click", () => { if (search) search.value = ""; setCat("*"); search?.focus(); });

  // Anker aus dem Menü (#identitaet, #strategie, #design) wählen die Kategorie
  const fromHash = () => {
    const map = { "#identitaet": "Identität", "#strategie": "Strategie", "#design": "Design" };
    if (map[location.hash]) { if (search) search.value = ""; setCat(map[location.hash]); }
  };
  window.addEventListener("hashchange", fromHash);
  fromHash();
})();
