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

// Startseite: Anfrage in drei Schritten
(() => {
  const form = document.querySelector("[data-steps]");
  if (!form) return;
  const steps = [...form.querySelectorAll(".hform__step")];
  const bars = [...form.querySelectorAll(".hform__progress li")];
  const back = form.querySelector("[data-back]");
  const next = form.querySelector("[data-next]");
  const submit = form.querySelector("[data-submit]");
  const status = form.querySelector(".form__status");
  let i = 0;

  const show = (n) => {
    i = n;
    steps.forEach((s, k) => { s.hidden = k !== i; s.classList.toggle("is-current", k === i); });
    bars.forEach((b, k) => b.classList.toggle("is-on", k <= i));
    back.hidden = i === 0;
    next.hidden = i === steps.length - 1;
    submit.hidden = i !== steps.length - 1;
    status.textContent = "";
    steps[i].querySelector("input")?.focus({ preventScroll: true });
  };
  const valid = () => {
    const step = steps[i];
    const radios = step.querySelectorAll("input[type=radio]");
    if (radios.length) return [...radios].some((r) => r.checked);
    let ok = true;
    step.querySelectorAll("input[required]").forEach((el) => {
      const good = el.checkValidity() && el.value.trim() !== "";
      el.closest(".field").classList.toggle("is-invalid", !good);
      if (!good) ok = false;
    });
    return ok;
  };
  next.addEventListener("click", () => {
    if (!valid()) { status.textContent = "Bitte eine Antwort wählen."; return; }
    show(i + 1);
  });
  back.addEventListener("click", () => show(i - 1));
  // Auswahl einer Option führt direkt zum nächsten Schritt
  form.querySelectorAll("input[type=radio]").forEach((r) =>
    r.addEventListener("change", () => setTimeout(() => { if (i < steps.length - 1) show(i + 1); }, 180))
  );
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!valid()) { status.textContent = "Bitte Name und eine gültige E-Mail-Adresse angeben."; return; }
    form.classList.add("is-done");
    status.textContent = "Danke! Wir melden uns innerhalb von zwei Werktagen. (Platzhalter – hier ist noch kein Versand angebunden.)";
  });
})();

// Showreel-Platzhalter: Button gibt Rückmeldung, bis ein Video eingebunden ist
(() => {
  const btn = document.querySelector("[data-reel]");
  if (!btn) return;
  const note = btn.parentElement.querySelector(".hreel__note");
  btn.addEventListener("click", () => {
    note.textContent = "Hier läuft später euer Showreel-Video.";
  });
})();

// ==========================================================================
// MEGA-Startseite: Cursor, kinetische Buchstaben, Scroll-Szenen, Vorschau
// ==========================================================================
(() => {
  if (!document.body.classList.contains("page-home")) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const mobile = () => window.innerWidth <= 760;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, moved: false };
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved = true; }, { passive: true });

  // Manifest in Wörter zerlegen
  document.querySelectorAll("[data-words]").forEach((p) => {
    p.innerHTML = p.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
  });

  // ---------- Eigener Cursor (weich nachgeführt) ----------
  const cursor = null; // website-weit gesteuert, siehe unten
  const cur = { x: mouse.x, y: mouse.y };
  if (cursor && finePointer && !reduce) {
    document.body.classList.add("has-cursor");
    const label = cursor.querySelector("span");
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor], a, button, summary, label");
      const lab = t?.dataset?.cursor;
      cursor.classList.toggle("is-label", !!lab);
      cursor.classList.toggle("is-link", !!t && !lab);
      label.textContent = lab || "";
    });
    document.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("pointerenter", () => cursor.classList.remove("is-hidden"));
  }

  // ---------- Kinetische Buchstaben ----------
  const kinetic = document.querySelector("[data-kinetic]");
  const letters = kinetic ? [...kinetic.querySelectorAll(".kl")] : [];
  let centers = [];
  const measure = () => {
    centers = letters.map((l) => { const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 + scrollY }; });
  };
  const state = letters.map(() => 0);
  const kineticOn = letters.length && finePointer && !reduce;
  if (kineticOn) {
    setTimeout(measure, 1400);
    window.addEventListener("resize", measure);
  }

  // ---------- Scroll-Szenen ----------
  const reel = document.querySelector('[data-scrub="reel"]');
  const reelFrame = reel?.querySelector(".mreel__frame");
  const mani = document.querySelector('[data-scrub="mani"]');
  const words = mani ? [...mani.querySelectorAll(".w")] : [];
  const gal = document.querySelector('[data-scrub="gallery"]');
  const track = gal?.querySelector(".mgal__track");
  const bar = gal?.querySelector(".mgal__bar i");
  const pinned = () => !reduce && !mobile();
  const sizeGallery = () => {
    if (!gal) return;
    if (!pinned()) { gal.style.height = ""; return; }
    const extra = Math.max(0, track.scrollWidth - innerWidth);
    gal.style.height = `${innerHeight + extra}px`;
  };
  sizeGallery();
  window.addEventListener("resize", sizeGallery);
  window.addEventListener("load", sizeGallery);
  const progress = (el) => {
    const r = el.getBoundingClientRect();
    const span = r.height - innerHeight;
    return span > 0 ? clamp01(-r.top / span) : 0;
  };

  // ---------- Leistungs-Vorschau ----------
  const preview = document.querySelector(".mserv__preview");
  const prev = { x: mouse.x, y: mouse.y };
  if (preview && finePointer && !reduce) {
    document.querySelectorAll("[data-preview]").forEach((a) => {
      a.addEventListener("pointerenter", () => {
        const src = a.dataset.preview;
        preview.innerHTML = src.startsWith("assets/") ? `<img src="${src}" alt="">` : `<div class="ph ${src}"></div>`;
        preview.classList.add("is-on");
      });
      a.addEventListener("pointerleave", () => preview.classList.remove("is-on"));
    });
  }

  // ---------- Eine gemeinsame Animationsschleife ----------
  const tick = () => {
    // Cursor
    if (cursor && document.body.classList.contains("has-cursor")) {
      cur.x += (mouse.x - cur.x) * 0.22;
      cur.y += (mouse.y - cur.y) * 0.22;
      cursor.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
    }
    // Buchstaben: breiter und fetter in Mausnähe
    if (kineticOn && centers.length) {
      const R = Math.max(180, innerWidth * 0.16);
      for (let i = 0; i < letters.length; i++) {
        const c = centers[i];
        const d = Math.hypot(mouse.x - c.x, mouse.y - (c.y - scrollY));
        const target = mouse.moved ? clamp01(1 - d / R) : 0;
        state[i] += (target - state[i]) * 0.14;
        if (Math.abs(target - state[i]) > 0.001 || state[i] > 0.001) {
          const t = easeOut(state[i]);
          letters[i].style.fontStretch = `${62 + t * 38}%`;
          letters[i].style.fontWeight = String(Math.round(700 + t * 200));
        }
      }
    }
    if (!reduce && !mobile()) {
      if (reelFrame) reelFrame.style.transform = `scale(${0.55 + 0.45 * easeOut(progress(reel))})`;
      if (words.length) {
        const n = Math.floor(progress(mani) * 1.15 * words.length);
        words.forEach((w, i) => w.classList.toggle("is-on", i < n));
      }
      if (track && pinned()) {
        const p = progress(gal);
        const extra = Math.max(0, track.scrollWidth - innerWidth);
        track.style.transform = `translate3d(${-p * extra}px, 0, 0)`;
        if (bar) bar.style.transform = `scaleX(${p})`;
      }
    }
    if (preview?.classList.contains("is-on")) {
      prev.x += (mouse.x - prev.x) * 0.16;
      prev.y += (mouse.y - prev.y) * 0.16;
      preview.style.transform = `translate3d(calc(${prev.x}px - 50%), calc(${prev.y}px - 50%), 0)`;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // ---------- Zahlen zählen hoch ----------
  const nums = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const el = en.target, end = parseFloat(el.dataset.count);
        if (reduce) { el.textContent = end; return; }
        const t0 = performance.now(), dur = 1400;
        const step = (now) => {
          const t = clamp01((now - t0) / dur);
          el.textContent = Math.round(end * easeOut(t));
          if (t < 1) requestAnimationFrame(step);
        };
        el.textContent = "0";
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    nums.forEach((n) => io.observe(n));
  }
})();

// ==========================================================================
// Website-weit: Cursor mit Label, Prozess-Linie, Zitat-Slider
// ==========================================================================
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Cursor
  const cursor = document.querySelector(".mcursor");
  if (cursor && fine && !reduce && document.body.classList.contains("fx")) {
    document.body.classList.add("has-cursor");
    const label = cursor.querySelector("span");
    const m = { x: innerWidth / 2, y: innerHeight / 2 }, c = { ...m };
    window.addEventListener("pointermove", (e) => { m.x = e.clientX; m.y = e.clientY; }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor], a, button, summary, label");
      const lab = t?.dataset?.cursor;
      cursor.classList.toggle("is-label", !!lab);
      cursor.classList.toggle("is-link", !!t && !lab);
      label.textContent = lab || "";
    });
    document.documentElement.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));
    document.documentElement.addEventListener("pointerenter", () => cursor.classList.remove("is-hidden"));
    const loop = () => {
      c.x += (m.x - c.x) * 0.22;
      c.y += (m.y - c.y) * 0.22;
      cursor.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    // Projekt- und Artikelbilder bekommen das Label „Ansehen“
    document.querySelectorAll(".card, .wcard, .acard a, .mgal__card a, .hcase a, .story-feature").forEach((el) => {
      if (!el.dataset.cursor) el.dataset.cursor = "Ansehen";
    });
  }

  // Prozess: Linie und Schritte folgen dem Scrollen
  const steps = document.querySelector(".hsteps");
  if (steps && !reduce) {
    steps.classList.add("is-scrub");
    const line = steps.querySelector(".hsteps__line i");
    const items = [...steps.querySelectorAll(".hsteps__list li")];
    let ticking = false;
    const update = () => {
      const r = steps.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height * 0.9)));
      if (line) line.style.transform = `scaleX(${p})`;
      items.forEach((li, i) => li.classList.toggle("is-on", p >= (i + 0.5) / items.length));
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // Zitat-Slider
  const mq = document.querySelector(".mq");
  if (mq) {
    const items = [...mq.querySelectorAll(".mq__item")];
    const now = mq.querySelector("[data-q-now]");
    let i = 0;
    const show = (n) => {
      i = (n + items.length) % items.length;
      items.forEach((it, k) => { it.hidden = k !== i; it.classList.toggle("is-active", k === i); });
      if (now) now.textContent = String(i + 1).padStart(2, "0");
    };
    mq.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => show(i + Number(b.dataset.q))));
    mq.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") show(i + 1);
      if (e.key === "ArrowLeft") show(i - 1);
    });
  }
})();

// Startseite V2: Vollbild-Slider im Einstieg
(() => {
  const hero = document.querySelector(".v2hero");
  if (!hero) return;
  const slides = [...hero.querySelectorAll(".v2hero__slide")];
  const caps = [...hero.querySelectorAll(".v2hero__caps li")];
  const bars = [...hero.querySelectorAll(".v2hero__bars li")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DUR = 5000;
  hero.style.setProperty("--slide", DUR + "ms");
  let i = 0, timer;
  const show = (n) => {
    i = n % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-on", k === i));
    caps.forEach((c, k) => c.classList.toggle("is-on", k === i));
    bars.forEach((b, k) => {
      b.classList.remove("is-run");
      b.classList.toggle("is-done", k < i);
    });
    if (!reduce) {
      void bars[i].offsetWidth; // Balken neu starten
      bars[i].classList.add("is-run");
    }
  };
  const next = () => show(i + 1);
  const start = () => { clearInterval(timer); timer = setInterval(next, DUR); };
  show(0);
  if (!reduce) start();
  // Pause, wenn der Tab nicht sichtbar ist
  document.addEventListener("visibilitychange", () => { if (document.hidden) clearInterval(timer); else if (!reduce) start(); });
})();

// ==========================================================================
// V2 Ultra: Intro, Wisch-Slider, Magnet-Buttons, Parallax, Wort-Masken
// ==========================================================================
(() => {
  if (!document.body.classList.contains("v2")) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Intro einmal pro Besuch
  let seen = false;
  try { seen = sessionStorage.getItem("sx-intro") === "1"; } catch (e) {}
  if (!reduce && !seen) {
    const body = document.body;
    body.classList.add("is-intro");
    const num = document.querySelector(".v2loader__num");
    const t0 = performance.now(), dur = 1300;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      num.textContent = Math.round(100 * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
      else {
        body.classList.add("is-revealed");
        setTimeout(() => body.classList.remove("is-intro", "is-revealed"), 1000);
      }
    };
    requestAnimationFrame(step);
    try { sessionStorage.setItem("sx-intro", "1"); } catch (e) {}
  }

  // Slider: vorheriges Bild bleibt liegen, das neue wischt darüber
  const slides = [...document.querySelectorAll(".v2hero__slide")];
  if (slides.length) {
    const obs = new MutationObserver((muts) => {
      muts.forEach((m) => {
        const el = m.target;
        if (m.oldValue && m.oldValue.includes("is-on") && !el.classList.contains("is-on")) {
          slides.forEach((s) => s.classList.remove("is-prev"));
          el.classList.add("is-prev");
        }
      });
    });
    slides.forEach((s) => obs.observe(s, { attributes: true, attributeFilter: ["class"], attributeOldValue: true }));
  }

  // Überschriften in Wörter teilen
  const heads = document.querySelectorAll("[data-split]");
  heads.forEach((h) => {
    h.innerHTML = h.textContent.trim().split(/\s+/).map((w, i) => `<span class="sw"><span style="transition-delay:${i * 70}ms">${w}</span></span>`).join(" ");
  });
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -15% 0px" });
    heads.forEach((h) => io.observe(h));
  } else heads.forEach((h) => h.classList.add("is-in"));

  if (reduce) return;

  // Magnetische Buttons
  if (fine) {
    document.querySelectorAll(".v2btn, .v2badge, .header__contact").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.25;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.35;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform 450ms cubic-bezier(0.23, 1, 0.32, 1)";
        el.style.transform = "";
        setTimeout(() => (el.style.transition = ""), 460);
      });
    });
  }

  // Parallax in den Projektbildern
  const media = [...document.querySelectorAll(".v2work__media")];
  let ticking = false;
  const update = () => {
    const vh = innerHeight;
    media.forEach((m) => {
      const r = m.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh; // -1 … 1
      const img = m.querySelector("img, .ph");
      if (img) img.style.transform = `translate3d(0, ${(-p * 6).toFixed(2)}%, 0)`;
    });
    ticking = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

// ==========================================================================
// Social-Bühne: Telefone drehen beim Scrollen, WebGL-Flüssigkeit, Liquid-Hover
// ==========================================================================
(() => {
  const sec = document.querySelector('[data-scrub="social"]');
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Telefone auffächern je nach Scrollposition
  if (sec && !reduce) {
    const L = sec.querySelector(".phone--l"), C = sec.querySelector(".phone--c"), R = sec.querySelector(".phone--r");
    let ticking = false;
    const update = () => {
      ticking = false;
      if (innerWidth <= 1024) { [L, C, R].forEach((p) => (p.style.transform = "")); return; }
      const r = sec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      const e = 1 - Math.pow(1 - p, 3);
      const spread = 30 + e * 42, rot = 10 + e * 22, tilt = 18 - e * 18;
      L.style.transform = `translateX(-${spread}%) rotateY(${rot}deg) rotateX(${tilt}deg) rotateZ(-${6 - e * 4}deg) translateZ(-80px)`;
      R.style.transform = `translateX(${spread}%) rotateY(-${rot}deg) rotateX(${tilt}deg) rotateZ(${6 - e * 4}deg) translateZ(-80px)`;
      C.style.transform = `translateY(${(1 - e) * 40}px) rotateX(${tilt * 0.6}deg) translateZ(${40 + e * 40}px)`;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // WebGL: flüssiges Gelb, rein rechnerisch (keine Texturen nötig)
  const canvas = sec?.querySelector(".v2social__gl");
  const gl = canvas && !reduce ? canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false }) : null;
  if (gl) {
    const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    const fs = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}
      void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv*vec2(r.x/r.y,1.)*1.6;
        float d=distance(uv,m);
        q+=vec2(fbm(q+t*.08),fbm(q-t*.06))*1.2+(m-uv)*.6*exp(-d*4.);
        float f=fbm(q+fbm(q+t*.05));
        float g=smoothstep(.45,.85,f+.25*exp(-d*5.));
        vec3 base=vec3(.055);vec3 sig=vec3(1.,.82,.12);
        vec3 col=mix(base,sig*.9,g*.85);col+=sig*.15*exp(-d*6.);
        gl_FragColor=vec4(col,1.);}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog);
    if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.useProgram(prog);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const uR = gl.getUniformLocation(prog, "r"), uT = gl.getUniformLocation(prog, "t"), uM = gl.getUniformLocation(prog, "m");
      const mouse = { x: 0.7, y: 0.4 }, sm = { x: 0.7, y: 0.4 };
      sec.addEventListener("pointermove", (e) => { const b = canvas.getBoundingClientRect(); mouse.x = (e.clientX - b.left) / b.width; mouse.y = 1 - (e.clientY - b.top) / b.height; });
      let visible = false;
      new IntersectionObserver((es) => (visible = es[0].isIntersecting)).observe(canvas);
      const resize = () => { const dpr = Math.min(1.5, devicePixelRatio || 1) * 0.5; canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr; gl.viewport(0, 0, canvas.width, canvas.height); };
      resize(); window.addEventListener("resize", resize);
      const t0 = performance.now();
      const frame = (now) => {
        if (visible) {
          sm.x += (mouse.x - sm.x) * 0.06; sm.y += (mouse.y - sm.y) * 0.06;
          gl.uniform2f(uR, canvas.width, canvas.height); gl.uniform1f(uT, (now - t0) / 1000); gl.uniform2f(uM, sm.x, sm.y);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }
  }

  // Projektbilder: kurze Verflüssigung beim Überfahren (SVG-Filter)
  const disp = document.querySelector("#liquid feDisplacementMap");
  if (disp && !reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let raf = null;
    document.querySelectorAll(".v2work__media").forEach((m) => {
      m.parentElement.addEventListener("pointerenter", () => {
        cancelAnimationFrame(raf);
        m.classList.add("is-liquid");
        const t0 = performance.now(), dur = 900;
        const step = (now) => {
          const t = Math.min(1, (now - t0) / dur);
          disp.setAttribute("scale", String(Math.sin(t * Math.PI) * 60));
          if (t < 1) raf = requestAnimationFrame(step); else m.classList.remove("is-liquid");
        };
        raf = requestAnimationFrame(step);
      });
    });
  }
})();
