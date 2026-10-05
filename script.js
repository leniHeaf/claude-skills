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
  if (cursor && fine && !reduce && document.body.classList.contains("fx") && !document.body.classList.contains("v3")) {
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
  const calm = document.body.classList.contains("v3");
  const reduce = calm || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  if (disp && !reduce && !document.body.classList.contains("v3") && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
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

// V5: Pfeile für die Bildreihe
(() => {
  const list = document.querySelector(".k-cards");
  if (!list) return;
  document.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => {
    const card = list.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 12 : 300;
    list.scrollBy({ left: Number(b.dataset.k) * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }));
})();

// Lagerfeld-Newsletter: Prüfung von E-Mail und Datenschutz-Häkchen
(() => {
  const f = document.querySelector(".k-news__form");
  if (!f) return;
  const st = f.querySelector(".form__status");
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const mail = f.querySelector("input[type=email]");
    const ok = f.querySelector("input[type=checkbox]");
    if (!(mail.checkValidity() && mail.value.trim())) { st.textContent = "Bitte eine gültige E-Mail-Adresse eingeben."; return; }
    if (!ok.checked) { st.textContent = "Bitte die Datenschutzerklärung bestätigen."; return; }
    st.textContent = "Danke! (Platzhalter – hier ist noch kein Versand angebunden.)";
    f.reset();
  });
})();

// ==========================================================================
// V7: Animation und 3D (Neigung, rotierendes X, Raum-Karussell, Aufdecken)
// ==========================================================================
(() => {
  if (!document.body.classList.contains("v7")) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  requestAnimationFrame(() => setTimeout(() => document.body.classList.add("is-loaded"), 60));

  // Bilder beim Scrollen aufdecken
  const reveal = document.querySelectorAll(".k-cards .k-card__img, .k-split__img, .k-tile img, .v2social__stage");
  reveal.forEach((el) => el.setAttribute("data-r", ""));
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    reveal.forEach((el) => io.observe(el));
  } else reveal.forEach((el) => el.classList.add("is-in"));
  if (reduce) return;

  const mouse = { x: 0, y: 0 }; // -1 … 1
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  const sm = { x: 0, y: 0 };
  const heroImgs = [...document.querySelectorAll(".k-hero__img")];
  const xSpin = document.querySelector(".k-x__spin");
  const cards = [...document.querySelectorAll(".k-cards li")];
  const list = document.querySelector(".k-cards");
  const phones = [...document.querySelectorAll(".v2social__stage .phone")];
  let angle = 0;

  const loop = () => {
    sm.x += (mouse.x - sm.x) * 0.06; sm.y += (mouse.y - sm.y) * 0.06;
    // Einstieg: leichte Raumneigung
    if (fine && scrollY < innerHeight) heroImgs.forEach((h, i) => {
      const dir = i === 0 ? 1 : -1;
      h.style.transform = `rotateY(${sm.x * 4 * dir}deg) rotateX(${-sm.y * 3}deg) translateZ(0)`;
    });
    // Rotierendes X
    if (xSpin) { angle += 0.35; xSpin.style.transform = `rotateY(${angle + sm.x * 30}deg) rotateX(${12 - sm.y * 20}deg)`; }
    // Karten drehen sich je nach Position im sichtbaren Bereich
    if (list && cards.length) {
      const lr = list.getBoundingClientRect(), mid = lr.left + lr.width / 2;
      cards.forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = Math.max(-1, Math.min(1, (r.left + r.width / 2 - mid) / lr.width));
        c.style.transform = `rotateY(${-d * 18}deg) translateZ(${-Math.abs(d) * 60}px)`;
      });
    }
    // Telefone neigen sich
    if (fine) phones.forEach((p, i) => {
      const off = (i - 1) * 6;
      p.style.transform = `rotateY(${sm.x * 14 + off * -1}deg) rotateX(${-sm.y * 8}deg) translateZ(${i === 1 ? 40 : 0}px)`;
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // Kacheln: Neigung zur Maus mit Lichtreflex
  if (fine) document.querySelectorAll(".k-tile").forEach((t) => {
    t.addEventListener("pointermove", (e) => {
      const r = t.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      t.classList.add("is-tilt");
      t.style.transform = `rotateY(${(px - 0.5) * 14}deg) rotateX(${(0.5 - py) * 12}deg) scale(1.02)`;
      t.style.setProperty("--mx", px * 100 + "%"); t.style.setProperty("--my", py * 100 + "%");
    });
    t.addEventListener("pointerleave", () => { t.classList.remove("is-tilt"); t.style.transform = ""; });
  });
})();

// ==========================================================================
// V8 Motion: Seitenvorhang, Wortmasken, Bild-Aufdeckung, Parallaxe,
// Scroll-Neigung, 3D-Karten, Cursor, Fortschrittslinie
// ==========================================================================
(() => {
  const body = document.body;
  if (!body.classList.contains("v5")) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduce) return;
  document.documentElement.classList.add("m8");
  const main = document.querySelector("main") || body;

  // Seitenvorhang: deckt beim Laden auf, schließt beim Seitenwechsel
  const curtain = document.createElement("div");
  curtain.className = "m8-curtain";
  curtain.setAttribute("aria-hidden", "true");
  curtain.innerHTML = '<span class="m8-curtain__mark">STUDIO.X</span>';
  body.appendChild(curtain);
  requestAnimationFrame(() => requestAnimationFrame(() => curtain.classList.add("is-up")));
  window.addEventListener("pageshow", (e) => { if (e.persisted) { curtain.classList.remove("is-down"); curtain.classList.add("is-up"); } });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== "_self") return;
    if (a.hasAttribute("download")) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    curtain.classList.remove("is-up");
    curtain.classList.add("is-down");
    setTimeout(() => { location.href = a.href; }, 650);
  });

  // Fortschrittslinie
  const bar = document.createElement("div");
  bar.className = "m8-progress";
  bar.setAttribute("aria-hidden", "true");
  body.appendChild(bar);

  // Überschriften in Wortmasken teilen (Auszeichnungen bleiben erhalten)
  const heads = [...main.querySelectorAll("h1, h2")].filter((h) =>
    !h.closest(".phone, .k-x, [data-split], .v2social__stage, .cs2, .cs3") && h.textContent.trim());
  const splitText = (root, counter) => {
    [...root.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
          const o = document.createElement("span"); o.className = "m8w";
          const i = document.createElement("span"); i.textContent = p;
          i.style.transitionDelay = (counter.n++ * 55) + "ms";
          o.appendChild(i); frag.appendChild(o);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== "BR") splitText(n, counter);
    });
  };
  heads.forEach((h) => { splitText(h, { n: 0 }); h.classList.add("m8-split"); });

  // Fließtext und Listen gleiten nach
  const texts = [...main.querySelectorAll("p, li, dt, dd, blockquote, .btn, .k-links, form")].filter((el) =>
    !el.closest("[data-reveal], .phone, .v2social__stage, .k-cards, .m8-txt, nav, .hask, details, [hidden], .cs2, .cs3") && !el.querySelector("img"));
  texts.forEach((el) => el.classList.add("m8-txt"));

  // Bilder: Vorhang von unten, darin leichte Parallaxe
  const imgs = [...main.querySelectorAll("img, .ph")].filter((el) =>
    !el.closest(".phone, .k-hero, .v2social__stage, [data-r], .rw__row, .cs2, .cs3") && !el.hasAttribute("data-r"));
  imgs.forEach((el) => el.classList.add("m8-img"));

  const all = [...heads, ...texts, ...imgs];
  // Footer-Wortmarke Buchstabe für Buchstabe
  const marks = [...document.querySelectorAll(".logo--big, .k-foot__mark")];
  marks.forEach((m) => {
    m.innerHTML = [...m.textContent].map((c, i) => `<span class="m8c" style="transition-delay:${i * 45}ms">${c === " " ? "&nbsp;" : c}</span>`).join("");
    m.classList.add("m8-mark"); all.push(m);
  });

  if ("IntersectionObserver" in window) {
    // Abgeschnittene Bilder melden keine Schnittmenge, daher den Rahmen beobachten
    const map = new Map();
    all.forEach((el) => {
      const t = el.classList.contains("m8-img") && el.parentElement ? el.parentElement : el;
      if (!map.has(t)) map.set(t, []);
      map.get(t).push(el);
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { map.get(e.target).forEach((el) => el.classList.add("m8-in")); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    map.forEach((_, t) => io.observe(t));
  } else all.forEach((el) => el.classList.add("m8-in"));

  // Parallaxe in Bildrahmen
  const para = imgs.filter((el) => {
    const p = el.parentElement;
    return p && getComputedStyle(p).overflow === "hidden" && el.getBoundingClientRect().height > 180;
  });
  para.forEach((el) => el.classList.add("m8-para"));
    const tick = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    para.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const d = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1 … 1
      el.style.setProperty("--py", (d * -6).toFixed(2) + "%");
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  if (!fine) return;

  // 3D-Neigung für Karten mit Bild
  const cards = [...main.querySelectorAll("a, article")].filter((c) =>
    c.querySelector("img, .ph") && !c.closest(".k-cards, .phone, .v2social__stage, .k-tiles, .k-hero, .cs2, .cs3") && c.offsetWidth > 160);
  cards.forEach((c) => {
    c.classList.add("m8-tilt");
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateZ(0)`;
    });
    c.addEventListener("pointerleave", () => { c.style.transform = ""; });
  });

  // Cursor: Punkt, wird über Bildern zur Linse „Ansehen“
  const cur = document.createElement("div");
  cur.className = "m8-cursor";
  cur.setAttribute("aria-hidden", "true");
  cur.innerHTML = "<span>Ansehen</span>";
  body.appendChild(cur);
  const pos = { x: -100, y: -100 }, cp = { x: -100, y: -100 };
  window.addEventListener("pointermove", (e) => { pos.x = e.clientX; pos.y = e.clientY; }, { passive: true });
  document.addEventListener("pointerover", (e) => {
    const t = e.target;
    cur.classList.toggle("is-view", !!t.closest(".m8-tilt, .k-cards a, .k-tile, .k-hero a"));
    cur.classList.toggle("is-link", !!t.closest("a, button, input, select, textarea, label, summary"));
  });
  document.addEventListener("pointerleave", () => cur.classList.add("is-off"));
  document.addEventListener("pointerenter", () => cur.classList.remove("is-off"));
  const follow = () => {
    cp.x += (pos.x - cp.x) * 0.2; cp.y += (pos.y - cp.y) * 0.2;
    cur.style.transform = `translate3d(${cp.x}px, ${cp.y}px, 0)`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
})();

// ==========================================================================
// Reel-Wand (Spalten mit eigenem Tempo) + Story-Slider mit Fortschrittsbalken
// ==========================================================================
(() => {
  const rw = document.querySelector(".rw");
  if (!rw) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stories = [...rw.querySelectorAll("[data-story]")];
  const DUR = 4200;

  const setup = (s, offset) => {
    const imgs = [...s.querySelectorAll(".rw__media img, .rw__media video")];
    const bars = [...s.querySelectorAll(".rw__bars i")];
    let i = 0, timer = 0, left = DUR + offset, started = 0;
    const show = (n) => {
      i = (n + imgs.length) % imgs.length;
      imgs.forEach((m, k) => m.classList.toggle("is-on", k === i));
      bars.forEach((b, k) => {
        b.classList.toggle("is-done", k < i);
        b.classList.remove("is-on");
        if (k === i) { void b.offsetWidth; b.classList.add("is-on"); }
      });
    };
    const run = () => { clearTimeout(timer); started = performance.now(); timer = setTimeout(() => { left = DUR; show(i + 1); run(); }, left); };
    const pause = () => { clearTimeout(timer); left = Math.max(200, left - (performance.now() - started)); };
    s.style.setProperty("--dur", DUR + "ms");
    s.addEventListener("click", (e) => {
      const r = s.getBoundingClientRect();
      left = DUR; show(e.clientX - r.left < r.width / 3 ? i - 1 : i + 1);
      if (rw.classList.contains("is-play")) run();
    });
    show(+s.dataset.start || 0);
    if (offset) bars[i].firstElementChild.style.animationDelay = -(DUR - left) + "ms";
    return { run, pause };
  };
  const ctrls = stories.map((s, k) => setup(s, k * -1300));

  const io = new IntersectionObserver(([e]) => {
    rw.classList.toggle("is-play", e.isIntersecting && !reduce);
    if (reduce) return;
    ctrls.forEach((c) => (e.isIntersecting ? c.run() : c.pause()));
  }, { threshold: 0.05 });
  io.observe(rw);

  if (reduce) return;

  // Reel-Reihe läuft endlos durch; Scrollen beschleunigt, Ziehen und Hover bremsen
  const row = rw.querySelector("[data-row]");
  if (row) {
    const track = row.querySelector(".rw__track");
    track.innerHTML += track.innerHTML;
    track.querySelectorAll("li").forEach((li, k) => { if (k >= track.children.length / 2) li.setAttribute("aria-hidden", "true"); });
    let x = 0, speed = 0.7, target = 0.7, lastY = scrollY, drag = null;
    row.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") target = 0.15; });
    row.addEventListener("pointerleave", () => { target = 0.7; });
    row.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, start: x }; row.classList.add("is-drag"); row.setPointerCapture(e.pointerId); });
    row.addEventListener("pointermove", (e) => { if (drag) x = drag.start + (e.clientX - drag.x); });
    const end = () => { drag = null; row.classList.remove("is-drag"); };
    row.addEventListener("pointerup", end); row.addEventListener("pointercancel", end);
    const run = () => {
      const dy = Math.abs(scrollY - lastY); lastY = scrollY;
      speed += (target + Math.min(dy * 0.25, 10) - speed) * 0.08;
      if (!drag && rw.classList.contains("is-play")) x -= speed;
      const half = track.scrollWidth / 2;
      if (half > 0) { x %= half; if (x > 0) x -= half; }
      track.style.transform = `translate3d(${x}px, 0, 0)`;
      requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }

  // Spalten bewegen sich unterschiedlich schnell
  const cols = [...rw.querySelectorAll(".rw__col")];
  const speeds = (innerWidth < 860 ? [-40, 40] : [-90, 70, -50, 110]);
  const wall = rw.querySelector(".rw__wall");
  const tick = () => {
    const r = wall.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) {
      const p = (innerHeight - r.top) / (innerHeight + r.height) - 0.5; // -0.5 … 0.5
      cols.forEach((c, k) => { c.style.transform = `translate3d(0, ${(p * speeds[k % speeds.length] * 2).toFixed(1)}px, 0)`; });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

// Filmkorn + Katalog-Beschriftung auf großen Bildern
(() => {
  if (!document.body.classList.contains("v5")) return;
  const frames = new Set();
  document.querySelectorAll(".k-hero__img, .k-split__img, .k-card__img, .k-tile, .rw__clip, .rw__story").forEach((f) => frames.add(f));
  document.querySelectorAll("main img").forEach((img) => {
    const p = img.parentElement;
    if (p && !p.closest(".phone, .k-hero, .rw, .cs2, .cs3") && img.getBoundingClientRect().width > 260) frames.add(p);
  });
  frames.forEach((f) => {
    if (getComputedStyle(f).position === "static") f.style.position = "relative";
    if (getComputedStyle(f).overflow === "visible") f.style.overflow = "hidden";
    f.classList.add("m8-grain");
  });
  // Nummerierte Beschriftung im Katalogstil
  let n = 0;
  document.querySelectorAll(".k-hero__img, .k-split__img").forEach((f) => {
    if (f.querySelector(".m8-label") || !f.querySelector("img")) return;
    const l = document.createElement("span");
    l.className = "m8-label"; l.setAttribute("aria-hidden", "true");
    l.textContent = String(++n).padStart(2, "0") + " — Run Club";
    if (getComputedStyle(f).position === "static") f.style.position = "relative";
    f.appendChild(l);
  });
})();

// ==========================================================================
// V9: Laufbänder mit Scrolltempo, magnetische Links
// ==========================================================================
(() => {
  if (!document.body.classList.contains("v5")) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const make = (words, dark) => {
    const m = document.createElement("div");
    m.className = "m9-marq" + (dark ? " m9-marq--dark" : "");
    m.setAttribute("aria-hidden", "true");
    const t = document.createElement("div");
    t.className = "m9-marq__track";
    const set = words.map((w) => `<span>${w}<i>✕</i></span>`).join("");
    t.innerHTML = set + set + set + set;
    m.appendChild(t);
    return m;
  };
  const bands = [];
  const footer = document.querySelector("footer");
  if (footer) { const m = make(["Strategie", "Design", "Roll-out", "Social"], false); footer.before(m); bands.push(m); }
  const rw = document.querySelector(".rw");
  if (rw) { const m = make(["Für den Feed", "Reels", "Stories", "Kampagnen"], true); rw.before(m); bands.push(m); }
  if (reduce || !bands.length) return;

  let x = 0, lastY = scrollY, vel = 0, dir = 1;
  const tracks = bands.map((b) => b.querySelector(".m9-marq__track"));
  const loop = () => {
    const dy = scrollY - lastY; lastY = scrollY;
    vel += (dy - vel) * 0.1;
    if (Math.abs(dy) > 0.5) dir = dy > 0 ? 1 : -1;
    x -= (0.6 + Math.min(Math.abs(vel) * 0.35, 14)) * dir;
    tracks.forEach((t, k) => {
      const w = t.scrollWidth / 4;
      let p = (k % 2 ? -x : x) % w; if (p > 0) p -= w;
      t.style.transform = `translate3d(${p}px, 0, 0)`;
      t.style.setProperty("--rot", (x * 0.6) % 360 + "deg");
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  if (!fine) return;
  document.querySelectorAll(".k-links a, .header__contact, .rw__more a, .footer__cta, main button[type=submit], .btn").forEach((el) => {
    el.classList.add("m9-mag");
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.classList.add("is-mag");
      el.style.translate = `${dx * 0.25}px ${dy * 0.35}px`;
    });
    el.addEventListener("pointerleave", () => { el.classList.remove("is-mag"); el.style.translate = ""; });
  });
})();

// Navigation: Icons rechts, Bilder im Mega-Menü, Abdunklung
(() => {
  const header = document.querySelector("body.v5 .header");
  if (!header) return;
  const ico = {
    search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14"/><path d="m3 6 9 7 9-7"/></svg>',
  };
  const icons = document.createElement("div");
  icons.className = "kl-icons";
  icons.innerHTML =
    `<a href="academy.html#wiki" aria-label="Academy durchsuchen">${ico.search}</a>` +
    `<a class="kl-cta" href="kontakt.html">Projekt anfragen</a>`;
  const burger = header.querySelector(".burger");
  header.insertBefore(icons, burger || null);

  const promos = {
    Arbeiten: [["plakatwand", "Run Club", "projekt-runclub.html"], ["../taeubert/website-laptop", "Täubert", "projekt-taeubert.html"], ["../crea-response/wandlogo", "Crea Response", "projekt-crea-response.html"]],
    Leistungen: [["touchpoints", "So arbeiten wir", "prozess.html"], ["haltestelle", "Social Media", "index.html#social"]],
    Studio: [["flasche", "Jobs", "jobs.html"]],
    Arbeiten2: [],
    Academy: [["plakatwand", "Marken-Wiki", "academy.html#wiki"], ["flasche", "Workshop-Toolkit", "academy-toolkit.html"]],
  };
  // Aktiven Bereich markieren
  const file = location.pathname.split("/").pop() || "index.html";
  const sec = /^projekt-|^work|^stories/.test(file) ? "work" : /^leistung-/.test(file) ? "leistung"
    : /^(jobs|openspace|moodboard|prozess)/.test(file) ? "studio" : /^academy/.test(file) ? "academy" : "";
  if (sec) header.querySelector(`[data-sec="${sec}"]`)?.classList.add("is-current");
  header.querySelectorAll(".sub a").forEach((a) => { if (a.getAttribute("href") === file) a.setAttribute("aria-current", "page"); });
  header.querySelectorAll(".has-sub").forEach((li) => {
    const sub = li.querySelector(".sub");
    const key = li.querySelector(".nav__toggle").textContent.trim();
    sub.querySelectorAll("a").forEach((a, i) => a.style.setProperty("--i", i));
    if (!promos[key]) return;
    const p = document.createElement("div");
    p.className = "kl-promo";
    p.innerHTML = promos[key].map(([img, t, href]) =>
      `<a href="${href}"><figure><img src="assets/runclub/${img}.webp" alt="" loading="lazy" decoding="async"></figure><span>${t}</span></a>`).join("");
    sub.appendChild(p);
  });
  const dim = document.createElement("div");
  dim.className = "kl-dim";
  dim.setAttribute("aria-hidden", "true");
  document.body.appendChild(dim);
})();

// Reels: Doppeltipp/Klick setzt ein Herz
document.querySelectorAll(".rw__reel").forEach((r) => r.addEventListener("dblclick", () => r.classList.toggle("is-liked")));
document.querySelectorAll("body.v5 .menu .mnav > li").forEach((li, i) => li.style.setProperty("--i", i));
// Mobiles Menü: immer nur ein Bereich offen
document.querySelectorAll(".mnav details").forEach((d, _, all) => d.addEventListener("toggle", () => { if (d.open) all.forEach((o) => { if (o !== d) o.open = false; }); }));

// Case Studies: Zähler der Bildreihe folgt dem sichtbaren Bild, Ziehen mit der Maus
document.querySelectorAll("[data-cs-slider]").forEach((sl) => {
  const track = sl.querySelector(".cs-slider__track");
  const nums = [...sl.querySelectorAll(".cs-counter span")];
  const slides = [...track.children];
  const upd = () => {
    const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
    let best = 0, bd = Infinity;
    slides.forEach((s, i) => { const r = s.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = i; } });
    nums.forEach((n, i) => n.classList.toggle("is-on", i === best));
  };
  track.addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true });
  upd();
  let drag = null;
  track.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; drag = { x: e.clientX, s: track.scrollLeft }; track.style.scrollSnapType = "none"; });
  window.addEventListener("pointermove", (e) => { if (drag) track.scrollLeft = drag.s - (e.clientX - drag.x); });
  window.addEventListener("pointerup", () => { if (!drag) return; drag = null; track.style.scrollSnapType = ""; });
  track.addEventListener("dragstart", (e) => e.preventDefault());
});

// ==========================================================================
// V10 Motion: weiches Scrollen, Buchstaben-Animation, Text hellt beim
// Scrollen auf, Bilder ziehen sich auf, Projekt-Intro, fester Projekt-Kopf,
// Text-Rollover auf Links
// ==========================================================================
(() => {
  const body = document.body;
  if (!body.classList.contains("v5")) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduce) return;
  const isCase = body.classList.contains("page-case");

  // Weiches Scrollen (nur Maus/Trackpad, lädt still nach; ohne Netz bleibt normales Scrollen)
  if (fine) {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js";
    s.async = true;
    s.onload = () => {
      if (!window.Lenis) return;
      const lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      document.documentElement.classList.add("has-lenis");
    };
    document.head.appendChild(s);
  }

  // Große Titel: Buchstabe für Buchstabe (baut auf den Wortmasken auf)
  document.querySelectorAll("main h1.m8-split").forEach((h) => {
    let n = 0;
    h.querySelectorAll(".m8w > span").forEach((w) => {
      const txt = w.textContent;
      w.innerHTML = [...txt].map((c) => `<span class="m10c" style="transition-delay:${(n++) * 22}ms">${c}</span>`).join("");
    });
    h.classList.add("m10-chars");
    if (!h.classList.contains("m8-split")) {
      // Titel ohne Wortmasken (z. B. Link-Text): selbst beobachten
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { h.classList.add("m8-in"); io.disconnect(); } });
      io.observe(h);
    }
  });

  // Text hellt beim Scrollen Wort für Wort auf
  const fades = [...document.querySelectorAll(".cs-statement, .cs-quote__t, .ac2-hero__intro, .cs-info .cs-cols p, .k-split__text p, .rw__sub")];
  const fadeWords = fades.map((el) => {
    if (!el.querySelector(".m8w")) {
      el.innerHTML = el.innerHTML.split(/(\s+|<[^>]+>)/).map((t) => (!t || /^\s+$/.test(t) || t.startsWith("<")) ? t : `<span class="m10w">${t}</span>`).join("");
    }
    el.classList.add("m10-fade");
    return { el, words: [...el.querySelectorAll(".m10w, .m8w")] };
  });

  // Bilder ziehen sich beim Scrollen auf
  const expand = [...document.querySelectorAll(".cs-media--hero, .cs-media--wide, .cs-media--full, .ac2-feat--big figure, .project-media--wide")];
  expand.forEach((f) => f.classList.add("m10-expand"));
  // Bildpaare laufen unterschiedlich schnell
  const pairs = [...document.querySelectorAll(".cs-pair .cs-media:nth-child(2)")];

  const vh = () => innerHeight;
  const tick = () => {
    const h = vh();
    fadeWords.forEach(({ el, words }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h) return;
      const p = Math.min(1, Math.max(0, (h * 0.9 - r.top) / (h * 0.55 + r.height * 0.6)));
      const k = Math.floor(p * words.length * 1.05);
      words.forEach((w, i) => w.classList.toggle("is-lit", i < k));
    });
    expand.forEach((f) => {
      const r = f.getBoundingClientRect();
      if (r.bottom < -50 || r.top > h + 50) return;
      const p = Math.min(1, Math.max(0, (h - r.top) / (h * 0.75)));
      const inset = (1 - p) * 9;
      f.style.clipPath = `inset(${inset}% ${inset}% ${inset}% ${inset}%)`;
    });
    pairs.forEach((f) => {
      const r = f.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h) return;
      f.style.transform = `translate3d(0, ${((r.top + r.height / 2 - h / 2) * -0.12).toFixed(1)}px, 0)`;
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // Text-Rollover: Wort rollt beim Überfahren nach oben weg
  if (fine) document.querySelectorAll(".header .nav__toggle, .kl-cta, .cs-back, .ac2-chips button, .rw__more a, .mnav__cta, .ac2-news__btn").forEach((el) => {
    const label = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!label) return;
    const t = label.textContent.trim();
    const wrap = document.createElement("span");
    wrap.className = "m10-roll";
    wrap.innerHTML = `<span>${t}</span><span aria-hidden="true">${t}</span>`;
    label.replaceWith(wrap);
  });

  if (!isCase) return;

  // Projekt-Intro: Farbfläche mit Projektname, zieht dann nach oben weg
  const file = (location.pathname.split("/").pop() || "").replace(".html", "");
  const theme = {
    "projekt-runclub": ["#ffe100", "#000"], "projekt-taeubert": ["#c8102e", "#fff"],
    "projekt-medaesthetic": ["#e8e0d6", "#1c1c1c"], "projekt-kuehlkraft": ["#cfe3ea", "#0f2a33"],
    "projekt-mybaumarkt": ["#1f4e3d", "#fff"],
  }[file] || ["#1c1c1c", "#fff"];
  const name = (document.querySelector(".cs-kicker")?.firstChild?.textContent || "").split("—")[0].trim();
  const intro = document.createElement("div");
  intro.className = "m10-intro";
  intro.setAttribute("aria-hidden", "true");
  intro.style.setProperty("--bg", theme[0]); intro.style.setProperty("--fg", theme[1]);
  intro.innerHTML = `<p>${[...name].map((c, i) => `<span style="animation-delay:${200 + i * 45}ms">${c === " " ? "&nbsp;" : c}</span>`).join("")}</p>`;
  body.appendChild(intro);
  setTimeout(() => intro.classList.add("is-out"), 1350 + name.length * 45);
  setTimeout(() => intro.remove(), 2600 + name.length * 45);

  // Fester Projekt-Kopf: Name + Leistungen, Schließen-Kreuz, rundes Monogramm
  const leist = [...document.querySelectorAll(".cs-facts div")].find((d) => d.querySelector("dt")?.textContent === "Leistungen");
  const sub = leist ? leist.querySelector("dd").innerHTML.split("<br>").slice(0, 3).join(" · ") : "";
  const bar = document.createElement("div");
  bar.className = "m10-bar";
  bar.innerHTML = `<p><b>${name}</b><span>${sub}</span></p><a class="m10-close" href="work.html" aria-label="Projekt schließen">×</a>`;
  body.appendChild(bar);
  const mono = document.createElement("a");
  mono.className = "m10-mono"; mono.href = "index.html"; mono.setAttribute("aria-label", "Startseite");
  mono.innerHTML = "<span>S</span><span>X</span>";
  body.appendChild(mono);
  const hero = document.querySelector(".cs-hero");
  const showBar = () => {
    const past = hero ? hero.getBoundingClientRect().bottom < 0 : scrollY > 400;
    const hdr = document.querySelector(".header");
    bar.classList.toggle("is-on", past && (!hdr || hdr.classList.contains("is-hidden") || hdr.getBoundingClientRect().bottom <= 0));
    mono.classList.toggle("is-on", past);
  };
  addEventListener("scroll", showBar, { passive: true }); showBar();
})();

// Case Studies (ruhig): Bilder und Texte gleiten beim Scrollen sanft herein
(() => {
  const root = document.querySelector(".cs2");
  if (!root) return;
  const els = [...root.querySelectorAll(".c2-title, .c2-label, .c2-facts, .c2-text, .c2-img, .c2-ext, .c2-next a")];
  els.forEach((el) => el.classList.add("c2-rv"));
  document.querySelectorAll(".c2-pair").forEach((p) => [...p.children].forEach((c, i) => c.style.transitionDelay = i * 120 + "ms"));
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach((el) => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
  els.forEach((el) => io.observe(el));
})();

// Case Studies v3: Zeilen-Masken, Bilder skalieren beim Scrollen von 120 % auf 100 %, Titelbild-Parallaxe
(() => {
  const root = document.querySelector(".cs3");
  if (!root) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Text in echte Zeilen teilen
  const splitLines = (el) => {
    const html = el.innerHTML.replace(/<br\s*\/?>/g, "   ");
    const words = html.split(/\s+/).filter(Boolean);
    el.innerHTML = words.map((w) => w === " " ? '<br class="c3-br">' : `<span class="c3-wd">${w}</span>`).join(" ");
    const lines = []; let top = null;
    el.querySelectorAll(".c3-wd, .c3-br").forEach((w) => {
      if (w.classList.contains("c3-br")) { top = null; return; }
      const t = w.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; }
      lines[lines.length - 1].push(w.innerHTML);
    });
    el.innerHTML = lines.map((l, i) => `<span class="c3-line"><span style="transition-delay:${i * 70}ms">${l.join(" ")}</span></span>`).join("");
  };
  const texts = [...root.querySelectorAll("[data-lines]")];
  const run = () => texts.forEach(splitLines);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run); else run();
  let rw; addEventListener("resize", () => { clearTimeout(rw); rw = setTimeout(() => texts.forEach((t) => { t.innerHTML = t.dataset.src || t.innerHTML; }), 300); });
  texts.forEach((t) => { t.dataset.src = t.innerHTML; });

  const fades = [...root.querySelectorAll("[data-lines], .c3-label, .c3-facts, .c3-ext, .c3-next__n, .c3-m")];
  if (reduce || !("IntersectionObserver" in window)) { fades.forEach((e) => e.classList.add("c3-in")); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("c3-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  setTimeout(() => fades.forEach((e) => io.observe(e)), 150);

  const imgs = [...root.querySelectorAll(".c3-m")];
  const hero = root.querySelector(".c3-hero img, .c3-hero__ph");
  const pairs = [...root.querySelectorAll(".c3-pair .c3-m:nth-child(2)")];
  const giant = root.querySelector(".c3-giant");
  const tick = () => {
    const h = innerHeight;
    if (giant && scrollY < h * 1.2) { giant.style.transform = `translate3d(0, ${scrollY * -0.55}px, 0)`; giant.style.opacity = Math.max(0, 1 - scrollY / (h * 0.7)); }
    root.querySelectorAll(".c3-text .c3-line > span").forEach((l) => {
      const r = l.getBoundingClientRect();
      if (r.top > h || r.bottom < 0) return;
      const o = Math.min(1, Math.max(0.18, (h * 0.85 - r.top) / (h * 0.25)));
      l.style.setProperty("--o", o.toFixed(3));
    });
    if (hero && scrollY < h * 1.2) hero.style.transform = `translate3d(0, ${scrollY * -0.25}px, 0)`;
    imgs.forEach((f) => {
      const r = f.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h) return;
      const p = Math.min(1, Math.max(0, (h - r.top) / (h + r.height * 0.4)));
      f.style.setProperty("--s", (1.2 - 0.2 * p).toFixed(4));
    });
    pairs.forEach((f) => {
      const r = f.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h) return;
      f.style.setProperty("--py", ((r.top + r.height / 2 - h / 2) * -0.08).toFixed(1) + "px");
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
