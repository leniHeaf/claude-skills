// ==========================================================================
// Lade-Animation (erster Aufruf pro Sitzung): Löwe wird per Maske
// freigelegt, wird kurz lebendig (Kopf, Pfote, Brust, Schwanz), wächst mit
// leisem Licht dahinter – dann geht es durch die Löwen-Silhouette hindurch
// in die Seite, der Hero baut sich zeitversetzt auf. Danach aus dem DOM.
// ==========================================================================
(() => {
  const html = document.documentElement;
  let seen = false;
  try { seen = sessionStorage.getItem("lion-load") === "1"; sessionStorage.setItem("lion-load", "1"); } catch (e) {}
  if (seen) { html.classList.remove("ll-pre"); return; }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const D = {
    body: "M26 40 L40 32 L40 24 L56 16 C70 17 82 21 92 27 L102 22 L102 34 C108 41 112 50 113 58 L124 58 L114 68 L162 68 C172 68 180 76 180 86 L196 136 L168 136 C168 129 173 124 180 124 L172 104 C158 116 140 120 124 120 C118 120 112 119 106 117 L80 136 L54 136 C54 129 60 124 68 124 L86 106 C76 96 72 84 72 72 C72 64 76 58 82 56 L82 52 L60 52 L52 60 L38 60 L26 52 Z",
    hind: "M114 124 L146 124 C156 124 164 120 170 114 L180 132 L160 142 L114 142 C114 134 120 128 128 128 Z",
    paw: "M72 88 L58 76 L50 76 C46 72 40 72 34 75 L50 90 L60 106 L71 106 C67 100 67 94 72 88 Z",
    tail: "M160 68 L196 68 C206 68 212 60 212 50 C212 42 218 36 226 36 L226 46 C223 46 222 48 222 50 C222 66 210 78 196 78 L160 78 Z",
    tuft: "M220 22 C229 22 236 29 236 38 L220 38 Z",
    eye: "M46 38 L56 34 L56 40 L48 42 Z",
  };
  const BG = "#0a0a0a", INK = "#f2f2f2";
  const ov = document.createElementNS(NS, "svg");
  ov.setAttribute("class", "ll");
  ov.setAttribute("aria-hidden", "true");
  ov.innerHTML = `
    <defs>
      <clipPath id="ll-ch" clipPathUnits="userSpaceOnUse"><polygon points="0,0 125,0 125,62 100,66 82,64 76,68 0,68"/></clipPath>
      <clipPath id="ll-cb" clipPathUnits="userSpaceOnUse"><polygon points="0,64 74,64 80,58 98,58 125,50 125,0 300,0 300,200 0,200"/></clipPath>
      <linearGradient id="ll-lg" gradientUnits="userSpaceOnUse" x1="100" y1="150" x2="150" y2="4">
        <stop class="ll-s1" offset="0" stop-color="#fff"/><stop class="ll-s2" offset="0" stop-color="#000"/>
      </linearGradient>
      <mask id="ll-rev" maskUnits="userSpaceOnUse" x="-20" y="-20" width="300" height="200"><rect x="-20" y="-20" width="300" height="200" fill="url(#ll-lg)"/></mask>
      <radialGradient id="ll-gl"><stop offset="0" stop-color="#fff" stop-opacity=".085"/><stop offset=".45" stop-color="#fff" stop-opacity=".035"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <mask id="ll-veil" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
        <rect class="ll-vr" width="100%" height="100%" fill="#fff"/>
        <g class="ll-hole" fill="#000" style="display:none"><path d="${D.body}"/><path d="${D.hind}"/><path d="${D.paw}"/><path d="${D.tail}"/><path d="${D.tuft}"/></g>
      </mask>
    </defs>
    <rect class="ll-bg" width="100%" height="100%" fill="${BG}" mask="url(#ll-veil)"/>
    <ellipse class="ll-glow" fill="url(#ll-gl)" opacity="0"/>
    <g class="ll-lion" opacity="0"><g mask="url(#ll-rev)" fill="${INK}">
      <path d="${D.hind}"/>
      <g class="ll-tail"><path d="${D.tail}"/><path d="${D.tuft}"/></g>
      <g class="ll-fore">
        <path d="${D.body}" clip-path="url(#ll-cb)"/>
        <path class="ll-paw" d="${D.paw}"/>
        <g class="ll-head"><path d="${D.body}" clip-path="url(#ll-ch)"/><path d="${D.eye}" fill="${BG}"/></g>
      </g>
    </g></g>`;
  document.body.appendChild(ov);
  html.classList.remove("ll-pre");

  const q = (s) => ov.querySelector(s);
  const lion = q(".ll-lion"), hole = q(".ll-hole"), glow = q(".ll-glow"), bg = q(".ll-bg");
  const head = q(".ll-head"), paw = q(".ll-paw"), fore = q(".ll-fore"), tail = q(".ll-tail");
  const s1 = q(".ll-s1"), s2 = q(".ll-s2");
  const L0 = [125, 79], F = [130, 96];
  let W = 0, H = 0, u = 1;
  const size = () => {
    W = innerWidth; H = innerHeight;
    ov.setAttribute("viewBox", `0 0 ${W} ${H}`);
    u = Math.min(W * (W < 700 ? 0.62 : 0.42), 440, H * 0.46 * 230 / 150) / 230;
  };
  size(); addEventListener("resize", size);

  // cubic-bezier(0.16, 1, 0.3, 1)
  const bez = (x1, y1, x2, y2) => (x) => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const cx = 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3 - x;
      const d = 3 * x1 * (1 - t) ** 2 + 6 * (x2 - x1) * t * (1 - t) + 3 * (1 - x2) * t * t;
      if (Math.abs(d) < 1e-6) break; t -= cx / d;
    }
    t = Math.min(1, Math.max(0, t));
    return 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
  };
  const expo = bez(0.16, 1, 0.3, 1), io = bez(0.65, 0, 0.35, 1);
  const c01 = (v) => Math.min(1, Math.max(0, v));
  const seg = (t, a, b) => c01((t - a) / (b - a));
  const place = (s, dy) => `translate(${(W / 2 + (F[0] - L0[0]) * u).toFixed(2)} ${(H / 2 + (F[1] - L0[1]) * u + dy).toFixed(2)}) scale(${(u * s).toFixed(5)}) translate(${-F[0]} ${-F[1]})`;

  // Hero sanft aufbauen (bestehende Transforms bleiben erhalten: composite "add")
  const heroIn = (delay) => {
    const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
    const run = (el, from, dur, d) => {
      if (!el) return;
      try {
        el.animate([{ transform: from }, { transform: "none" }], { duration: dur, delay: d, easing: ease, fill: "backwards", composite: "add" });
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, delay: d, easing: ease, fill: "backwards" });
      } catch (e) {}
    };
    const main = document.querySelector("main");
    const media = main && [...main.querySelectorAll("img, video")].find((m) => { const r = m.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && r.width > 200; });
    if (media) try { media.animate([{ transform: "scale(1.04)" }, { transform: "none" }], { duration: 550, delay, easing: ease, fill: "backwards", composite: "add" }); } catch (e) {}
    run(document.querySelector(".header"), "translateY(-15px)", 500, delay);
    run(main && main.querySelector("h1"), "translateY(40px)", 450, delay + 100);
  };

  let ready = document.readyState === "complete";
  addEventListener("load", () => { ready = true; });
  const start = performance.now();
  let hold = 0, last = start, heroDone = false, done = false;
  const finish = () => { if (done) return; done = true; ov.remove(); removeEventListener("resize", size); };

  const frame = (now) => {
    if (done) return;
    // Auf das vollständige Laden warten (höchstens 2,5 s zusätzlich)
    if (now - start - hold >= 1800 && !ready && hold < 2500 && !heroDone) hold += now - last;
    last = now;
    const t = now - start - hold;

    if (reduce) {
      lion.setAttribute("transform", place(1, 0));
      lion.setAttribute("opacity", seg(t, 150, 600).toFixed(3));
      s1.setAttribute("offset", 1); s2.setAttribute("offset", 1);
      ov.style.opacity = (1 - seg(t, 1100, 1500)).toFixed(3);
      if (t > 1100) ov.style.pointerEvents = "none";
      if (t >= 1550) return finish();
      return requestAnimationFrame(frame);
    }

    // 2) Erscheinen: Maske legt frei, scale .92 → 1, leicht von unten
    const r = expo(seg(t, 150, 950));
    const m = seg(t, 150, 900);
    s1.setAttribute("offset", (-0.25 + 1.5 * expo(m)).toFixed(4));
    s2.setAttribute("offset", (-0.05 + 1.5 * expo(m)).toFixed(4));
    let s = 0.92 + 0.08 * r;
    const dy = 26 * (1 - r);

    // 3) Mikrobewegung: Kopf hebt sich, Pfote, Brust atmet, Schwanz
    const hd = 2.6 * io(seg(t, 1000, 1450));
    head.setAttribute("transform", `rotate(${hd.toFixed(3)} 100 60)`);
    const pw = 5 * Math.sin(Math.PI * io(seg(t, 1050, 1600)));
    paw.setAttribute("transform", `rotate(${pw.toFixed(3)} 70 96)`);
    const br = 0.014 * Math.sin(Math.PI * seg(t, 1000, 1750));
    fore.setAttribute("transform", `translate(0 136) scale(1 ${(1 + br).toFixed(5)}) translate(0 -136)`);
    const tl = 3.2 * Math.sin(2 * Math.PI * seg(t, 950, 1950)) * (1 - seg(t, 1500, 1950) * 0.6);
    tail.setAttribute("transform", `rotate(${tl.toFixed(3)} 162 73)`);

    // 4) Brand Impact: 1 → 1.08, leises Licht
    s *= 1 + 0.08 * expo(seg(t, 1500, 1800));
    let g = expo(seg(t, 1400, 1850));
    if (hold > 0 && t >= 1799) g *= 0.85 + 0.15 * Math.sin(now / 420);

    // 5) Durch den Löwen: Silhouette wird zum Fenster, zoomt nach vorn
    const z = seg(t, 1800, 2350);
    if (z > 0) {
      if (!heroDone) { heroDone = true; hole.style.display = ""; heroIn(250); }
      s *= Math.exp(Math.log(40 / 1.08) * z ** 3);
      ov.style.pointerEvents = "none";
    }
    const lo = Math.min(r, 1 - seg(t, 1800, 1980));
    lion.setAttribute("opacity", lo.toFixed(3));
    lion.setAttribute("transform", place(s, dy));
    hole.setAttribute("transform", place(s, dy));
    g *= 1 - seg(t, 1800, 2000);
    const gr = 230 * u * s;
    glow.setAttribute("cx", W / 2 + (F[0] - L0[0]) * u); glow.setAttribute("cy", H / 2 + (F[1] - L0[1]) * u);
    glow.setAttribute("rx", (gr * 0.95).toFixed(1)); glow.setAttribute("ry", (gr * 0.75).toFixed(1));
    glow.setAttribute("opacity", g.toFixed(3));
    bg.setAttribute("opacity", (1 - seg(t, 2050, 2350)).toFixed(3));

    if (t >= 2600) return finish();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  setTimeout(finish, 9000);
})();

// Typografie: Fließtext ruhiger (normale Stärke), Überschriften bleiben fett
(() => {
  if (!document.body.classList.contains("v5")) return;
  document.querySelectorAll("main p, main li, main dd, main blockquote, main figcaption, main td, footer p, footer li").forEach((el) => {
    const c = getComputedStyle(el);
    if (parseFloat(c.fontSize) <= 22 && c.textTransform !== "uppercase" && el.textContent.trim().length > 40 && !el.querySelector("h1, h2, h3")) el.classList.add("t-body");
  });
})();


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
    !h.closest(".phone, .k-x, [data-split], .v2social__stage, .cs2, .cs3, .cs4, .w4") && h.textContent.trim());
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
    !el.closest("[data-reveal], .phone, .v2social__stage, .k-cards, .m8-txt, nav, .hask, details, [hidden], .cs2, .cs3, .cs4, .w4") && !el.querySelector("img"));
  texts.forEach((el) => el.classList.add("m8-txt"));

  // Bilder: Vorhang von unten, darin leichte Parallaxe
  const imgs = [...main.querySelectorAll("img, .ph")].filter((el) =>
    !el.closest(".phone, .k-hero, .v2social__stage, [data-r], .rw__row, .cs2, .cs3, .cs4, .w4") && !el.hasAttribute("data-r"));
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
    if (p && !p.closest(".phone, .k-hero, .rw, .cs2, .cs3, .cs4, .w4") && img.getBoundingClientRect().width > 260) frames.add(p);
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
    l.textContent = String(++n).padStart(2, "0") + " — " + ((f.querySelector("img").alt || "").split(/[:\-–]/)[0].replace(/-$/, "").trim() || "Studio X");
    if (getComputedStyle(f).position === "static") f.style.position = "relative";
    f.appendChild(l);
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
    s.src = "assets/vendor/lenis.min.js";
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
    "projekt-runclub": ["#ffe100", "#000"], "projekt-taeubert": ["#f2f2f2", "#0a0a0a"],
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

// ==========================================================================
// 3D-Seitenübergänge
// – Projekt anklicken: das Bild löst sich aus der Seite, kippt in 3D und
//   wächst auf den ganzen Bildschirm, die Seite dahinter fällt nach hinten
//   weg; auf der Projektseite geht es nahtlos mit dem Titelbild weiter
// – Alle anderen Links: die Seite klappt in 3D nach hinten weg, die neue
//   Seite klappt nach vorn herein
// ==========================================================================
(() => {
  if (!document.body.classList.contains("v5")) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let from = null;
  try { from = JSON.parse(sessionStorage.getItem("bx3-from") || "null"); sessionStorage.removeItem("bx3-from"); } catch (e) {}

  // Ankunft
  if (!reduce) {
    if (from && document.querySelector(".cs3, .cs4")) {
      document.body.classList.add("bx-arrived");
      document.querySelector(".m8-curtain")?.remove();
      const ov = document.createElement("div");
      ov.className = "bx4 is-load is-arrive";
      ov.innerHTML = `<div class="bx4__load"><p class="bx4__logo">STUDIO.X</p><p class="bx4__sub bx-serif">Experience</p><p class="bx4__count">100</p></div>`;
      document.body.appendChild(ov);
      setTimeout(() => ov.classList.add("is-out"), 250);
      setTimeout(() => ov.remove(), 1500);
    }
  }
  if (reduce) return;

  // Abflug in ein Projekt (nach Art von Auge XP): Markenfarbe füllt den
  // Bildschirm, das Bild schrumpft in die Mitte, der Projektname mischt
  // sich aus zwei Schriften zusammen, danach Ladebildschirm mit Zähler
  const BRAND = { "crea-response": ["#7c3aed", "#fff"], taeubert: ["#f2f2f2", "#0a0a0a"], runclub: ["#ffe100", "#000"], medaesthetic: ["#e8ddd2", "#1c1c1c"], kuehlkraft: ["#cfe8f1", "#0f2a33"], mybaumarkt: ["#2f8a5f", "#fff"], dogstar: ["#fff1b8", "#10101a"] };
  const NAMES = { "crea-response": "Crea Response", taeubert: "Täubert", runclub: "Run Club", medaesthetic: "med.aesthetic", kuehlkraft: "kühlkraft", mybaumarkt: "Baumarkt Gnoien", dogstar: "Dogstar" };
  const scramble = (el, text, dur) => {
    const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      el.innerHTML = [...text].map((c, i) => {
        if (c === " ") return " ";
        const done = i / text.length < k * 1.15 - 0.15;
        const ch = done ? c : pool[Math.random() * pool.length | 0];
        return `<span class="${(done ? i % 3 === 0 : Math.random() < 0.5) ? "bx-serif" : "bx-sans"}">${ch}</span>`;
      }).join("");
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="projekt-"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const slug = a.getAttribute("href").replace("projekt-", "").replace(".html", "").split("#")[0];
    const [bg, fg] = BRAND[slug] || ["#111", "#fff"];
    const img = a.querySelector("img");
    const r = img ? img.getBoundingClientRect() : { left: e.clientX - 60, top: e.clientY - 40, width: 120, height: 80 };
    const ov = document.createElement("div");
    ov.className = "bx4";
    ov.style.setProperty("--bg", bg); ov.style.setProperty("--fg", fg);
    ov.style.setProperty("--cx", e.clientX + "px"); ov.style.setProperty("--cy", e.clientY + "px");
    ov.innerHTML = `<div class="bx4__fill"></div>${img ? `<div class="bx4__thumb" style="background-image:url('${img.currentSrc || img.src}')"></div>` : ""}<p class="bx4__name"></p><div class="bx4__load"><p class="bx4__logo">STUDIO.X</p><p class="bx4__sub bx-serif"></p><p class="bx4__count">000</p></div>`;
    document.body.appendChild(ov);
    const th = ov.querySelector(".bx4__thumb");
    const tw = Math.min(260, innerWidth * 0.36), thh = tw * 0.62;
    if (th) th.animate([
      { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" },
      { left: (innerWidth - tw) / 2 + "px", top: innerHeight / 2 - thh - 30 + "px", width: tw + "px", height: thh + "px" },
    ], { duration: 900, easing: "cubic-bezier(0.77, 0, 0.175, 1)", fill: "forwards" });
    requestAnimationFrame(() => ov.classList.add("is-in"));
    setTimeout(() => scramble(ov.querySelector(".bx4__name"), (NAMES[slug] || slug).toUpperCase(), 900), 450);
    setTimeout(() => {
      ov.classList.add("is-load");
      scramble(ov.querySelector(".bx4__sub"), "Experience", 700);
      const c = ov.querySelector(".bx4__count"), t0 = performance.now();
      const tick = (now) => { const k = Math.min(1, (now - t0) / 700); c.textContent = String(Math.round(k * 100)).padStart(3, "0"); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, 1550);
    try { sessionStorage.setItem("bx3-from", JSON.stringify({ src: img ? (img.currentSrc || img.src) : "", slug })); } catch (err) {}
    setTimeout(() => { location.href = a.href; }, 2350);
  }, true);

  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    document.body.classList.remove("bx-diving", "bx-leaving");
    document.querySelectorAll(".bx3-ov").forEach((o) => o.remove());
    document.querySelectorAll('a[href^="projekt-"] img').forEach((i) => { i.style.visibility = ""; });
  });
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

// Case Studies v3: noch mehr Bewegung – Wortband, horizontale Bildstrecke,
// Fortschritt im Projekt-Kopf, Labels Buchstabe für Buchstabe, Bild-Neigung
(() => {
  const root = document.querySelector(".cs3");
  if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Fortschrittslinie im Projekt-Kopf
  const bar = document.querySelector(".c3-bar");
  const prog = document.createElement("i");
  prog.className = "c3-prog";
  bar?.appendChild(prog);

  // Wortband aus den Leistungen, läuft je nach Scrollrichtung
  const tags = (document.querySelector(".c2-bar__t span")?.textContent || "").split("·").map((t) => t.trim()).filter(Boolean);
  const name = document.querySelector(".c2-bar__t b")?.textContent || "";
  const words = [name, ...tags];
  const band = document.createElement("div");
  band.className = "c3-band"; band.setAttribute("aria-hidden", "true");
  const set = words.map((w) => `<span>${w}</span><em>✦</em>`).join("");
  band.innerHTML = `<div class="c3-band__t">${set + set + set + set}</div>`;
  const firstSec = root.querySelector(".c3-sec");
  firstSec?.after(band);
  const track = band.firstElementChild;

  // Horizontale Bildstrecke aus allen Bildern der Seite (klebt beim Scrollen)
  const srcs = [...new Set([...root.querySelectorAll(".c3-m img, .c3-hero img")].map((i) => i.getAttribute("src")))];
  let hs = null;
  if (srcs.length >= 3) {
    hs = document.createElement("section");
    hs.className = "c3-hs";
    hs.innerHTML = `<div class="c3-hs__pin"><p class="c3-label c3-in">Einblicke <b class="c3-hs__n">01</b> / ${String(srcs.length).padStart(2, "0")}</p><div class="c3-hs__row">${srcs.map((s) => `<figure><img src="${s}" alt="" loading="lazy" decoding="async"></figure>`).join("")}</div></div>`;
    (root.querySelector(".c3-ext") || root.querySelector(".c3-next")).before(hs);
  }
  const row = hs?.querySelector(".c3-hs__row");
  const num = hs?.querySelector(".c3-hs__n");

  // Labels: Buchstabe für Buchstabe
  root.querySelectorAll(".c3-sec .c3-label").forEach((l) => {
    l.innerHTML = [...l.textContent].map((c, i) => `<span style="transition-delay:${i * 25}ms">${c === " " ? "&nbsp;" : c}</span>`).join("");
    l.classList.add("c3-chars");
  });

  let x = 0, lastY = scrollY;
  const tick = () => {
    const h = innerHeight, max = document.documentElement.scrollHeight - h;
    prog.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    const dy = scrollY - lastY; lastY = scrollY;
    x -= 0.5 + Math.min(Math.abs(dy) * 0.4, 18) * (dy < 0 ? -1 : 1);
    const w = track.scrollWidth / 4; let p = x % w; if (p > 0) p -= w;
    track.style.transform = `translate3d(${p}px,0,0)`;
    if (hs) {
      const r = hs.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, -r.top / (hs.offsetHeight - h)));
      const dist = row.scrollWidth - innerWidth + 48;
      row.style.transform = `translate3d(${-t * dist}px,0,0)`;
      num.textContent = String(Math.min(srcs.length, 1 + Math.floor(t * srcs.length))).padStart(2, "0");
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  if (hs) { const setH = () => { hs.style.height = (row.scrollWidth - innerWidth + innerHeight + 200) + "px"; }; addEventListener("load", setH); addEventListener("resize", setH); setTimeout(setH, 400); }

  // Bilder neigen sich zur Maus
  if (fine) root.querySelectorAll(".c3-m, .c3-hs figure").forEach((f) => {
    f.addEventListener("pointermove", (e) => {
      const r = f.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      
      f.classList.add("is-hov");
    });
    f.addEventListener("pointerleave", () => { f.style.transform = ""; f.classList.remove("is-hov"); });
  });
})();

// ==========================================================================
// Case Studies als Markenerlebnis: Markenwelt pro Projekt
// – Hero-Canvas mit markeneigener Bewegung (Crea: Würfelgitter, Täubert:
//   Lackglanz + Funken, Run Club: Tempo-Streifen), Licht folgt der Maus
// – Gepinnte Wortbühne: Markenbegriffe wechseln beim Scrollen
// – Farbwelt: Farbflächen wachsen auf, Werte zählen ein
// – Seite taucht beim Scrollen in die Markenfarbe ein
// ==========================================================================
(() => {
  const root = document.querySelector(".cs3");
  if (!root) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slug = (location.pathname.split("/").pop() || "").replace("projekt-", "").replace(".html", "");
  const B = {
    "crea-response": { fx: "cubes", dark: "#0b0b0f", accent: "#7c3aed", ink: "#ebebeb",
      words: ["Strategie", "Technologie", "Daten", "Menschen", "Wachstum"],
      colors: [["Purple", "#7C3AED"], ["Black", "#0B0B0F"], ["Graphite", "#1F1F27"], ["Light", "#EBEBEB"]] },
    taeubert: { fx: "gloss", dark: "#0a0a0a", accent: "#f2f2f2", ink: "#f2f2f2",
      words: ["Unfallinstandsetzung", "Lackierung", "Smart Repair", "Aufbereitung"],
      colors: [["Schwarz", "#0A0A0A"], ["Weiß", "#F2F2F2"]] },
    runclub: { fx: "speed", dark: "#0d0d0d", accent: "#ffe100", ink: "#ffe100",
      words: ["Community", "Movement", "Better Days"],
      colors: [["Signalgelb", "#FFE100"], ["Schwarz", "#0D0D0D"]] },
  }[slug] || { fx: "dust", dark: "#222a36", accent: "#f4f4f2", ink: "#f4f4f2", words: [], colors: [] };
  document.body.style.setProperty("--b-dark", B.dark);
  document.body.style.setProperty("--b-acc", B.accent);
  document.body.style.setProperty("--b-ink", B.ink);

  // ---------- Wortbühne ----------
  let stage = null, stageWords = [];
  if (B.words.length) {
    stage = document.createElement("section");
    stage.className = "bx-stage"; stage.dataset.dark = "";
    stage.style.height = (B.words.length * 70 + 60) + "vh";
    stage.innerHTML = `<div class="bx-stage__pin"><p class="bx-stage__k">Wofür die Marke steht</p><div class="bx-stage__w">${B.words.map((w, i) => `<span data-i="${i}" style="font-size:min(11vw, ${(128 / Math.max(6, w.length)).toFixed(2)}vw, 190px) !important">${w}</span>`).join("")}</div><p class="bx-stage__n"><b>01</b> / ${String(B.words.length).padStart(2, "0")}</p><i class="bx-stage__line"></i></div>`;
    const anchor = root.querySelector(".c3-band") || root.querySelector(".c3-sec");
    anchor.after(stage);
    stageWords = [...stage.querySelectorAll(".bx-stage__w span")];
  }

  // ---------- Farbwelt ----------
  let swatch = null;
  if (B.colors.length) {
    swatch = document.createElement("section");
    swatch.className = "bx-colors";
    swatch.innerHTML = `<p class="c3-label c3-in">Farbwelt</p><div class="bx-colors__row">${B.colors.map(([n, h]) => `<div class="bx-sw" style="--c:${h}"><span class="bx-sw__n">${n}</span><span class="bx-sw__h" data-hex="${h}">#······</span></div>`).join("")}</div>`;
    const before = root.querySelectorAll(".c3-sec")[3] || root.querySelector(".c3-hs") || root.querySelector(".c3-next");
    before.before(swatch);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      swatch.classList.add("is-in"); io.disconnect();
      swatch.querySelectorAll(".bx-sw__h").forEach((el, k) => {
        const hex = el.dataset.hex, chars = "0123456789ABCDEF";
        let n = 0; const t = setInterval(() => {
          n++; el.textContent = "#" + [...hex.slice(1)].map((c, i) => i < n / 3 ? c : chars[Math.random() * 16 | 0]).join("");
          if (n > 20) { clearInterval(t); el.textContent = hex; }
        }, 45 + k * 10);
      });
    }, { threshold: 0.3 });
    io.observe(swatch);
  }

  // Dunkle Bereiche: ganze Seite taucht in die Markenfarbe ein
  root.querySelector(".c3-hs")?.setAttribute("data-dark", "");
  const darks = [...root.querySelectorAll("[data-dark]")];

  if (reduce) { stageWords[0]?.classList.add("is-on"); return; }

  // ---------- Hero-Canvas ----------
  const hero = root.querySelector(".c3-hero");
  const cv = document.createElement("canvas");
  cv.className = "bx-fx"; cv.setAttribute("aria-hidden", "true");
  hero.appendChild(cv);
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = Math.min(2, devicePixelRatio || 1);
  const size = () => { W = hero.clientWidth; H = hero.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener("resize", size);
  const m = { x: -999, y: -999, vx: 0, vy: 0, px: 0, py: 0 };
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    m.x = e.clientX - r.left; m.y = e.clientY - r.top;
    hero.style.setProperty("--mx", m.x + "px"); hero.style.setProperty("--my", m.y + "px");
    hero.classList.add("is-lit");
  });
  hero.addEventListener("pointerleave", () => { hero.classList.remove("is-lit"); m.x = m.y = -999; });
  const sparks = [];
  const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  let t0 = performance.now();
  const streaks = Array.from({ length: 60 }, () => ({ y: Math.random(), x: Math.random(), l: 0.05 + Math.random() * 0.25, s: 0.002 + Math.random() * 0.006 }));
  const dust = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.3, s: Math.random() * 0.0004 + 0.0001 }));

  const draw = (now) => {
    const t = (now - t0) / 1000;
    m.vx = m.x - m.px; m.vy = m.y - m.py; m.px = m.x; m.py = m.y;
    const energy = Math.min(1, Math.hypot(m.vx, m.vy) / 40);
    ctx.clearRect(0, 0, W, H);
    if (scrollY < H * 1.2) {
      if (B.fx === "cubes") {
        // isometrisches Würfelgitter, leuchtet um die Maus
        const s = 46, hgt = s * Math.sqrt(3) / 2;
        ctx.lineWidth = 1;
        for (let row = -1; row < H / hgt + 2; row++) {
          for (let col = -1; col < W / s + 2; col++) {
            const x = col * s + (row % 2) * s / 2 + Math.sin(t * 0.4 + row * 0.3) * 6, y = row * hgt;
            const d = Math.hypot(x - m.x, y - m.y);
            const a = 0.05 + Math.max(0, 1 - d / 260) * 0.85 + Math.max(0, Math.sin(t * 1.2 - (x + y) * 0.006)) * 0.08;
            ctx.strokeStyle = hexA(B.accent, a);
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s / 2, y + hgt); ctx.lineTo(x - s / 2, y + hgt); ctx.closePath(); ctx.stroke();
          }
        }
      } else if (B.fx === "gloss") {
        // Lackglanz zieht diagonal über das Bild, Funken folgen der Maus
        const p = ((t * 0.18) % 1.6) - 0.3;
        const gx = p * (W + H);
        const g = ctx.createLinearGradient(gx - 260, 0, gx + 260, H);
        g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(255,255,255,0.22)"); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        if (m.x > -900) for (let i = 0; i < 2 + energy * 8; i++) sparks.push({ x: m.x, y: m.y, vx: (Math.random() - 0.5) * 6 + m.vx * 0.2, vy: (Math.random() - 1) * 5, l: 1 });
      } else if (B.fx === "speed") {
        // Tempo-Streifen, schneller wenn die Maus sich bewegt
        streaks.forEach((k) => {
          k.x -= k.s * (1 + energy * 6);
          if (k.x + k.l < 0) { k.x = 1; k.y = Math.random(); }
          const y = k.y * H + (m.y > -900 ? (m.y - H / 2) * 0.05 : 0);
          const g = ctx.createLinearGradient(k.x * W, 0, (k.x + k.l) * W, 0);
          g.addColorStop(0, hexA(B.accent, 0.9)); g.addColorStop(1, hexA(B.accent, 0));
          ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(k.x * W, y); ctx.lineTo((k.x + k.l) * W, y); ctx.stroke();
        });
      } else if (B.fx === "dust" && !["kuehlkraft", "dogstar", "medaesthetic"].includes(slug)) {
        dust.forEach((p) => { p.y -= p.s; if (p.y < 0) p.y = 1; ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, 7); ctx.fill(); });
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vy += 0.25; s.l -= 0.025;
        if (s.l <= 0) { sparks.splice(i, 1); continue; }
        ctx.strokeStyle = hexA(B.accent, s.l); ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2); ctx.stroke();
      }
    }

    // Wortbühne
    if (stage) {
      const r = stage.getBoundingClientRect();
      const p = Math.min(0.9999, Math.max(0, -r.top / (stage.offsetHeight - innerHeight)));
      const idx = Math.floor(p * stageWords.length);
      stageWords.forEach((w, i) => { w.classList.toggle("is-on", i === idx); w.classList.toggle("is-past", i < idx); });
      const n = stage.querySelector(".bx-stage__n b"); const nv = String(idx + 1).padStart(2, "0");
      if (n.textContent !== nv) { n.textContent = nv; if (navigator.vibrate && !fineHover) try { navigator.vibrate(8); } catch (e) {} }
      stage.style.setProperty("--p", p.toFixed(4));
    }
    // Eintauchen in die Markenfarbe
    const mid = innerHeight / 2;
    const dark = [...root.querySelectorAll("[data-dark]")].some((d) => { const r = d.getBoundingClientRect(); return r.top < mid && r.bottom > mid; });
    document.body.classList.toggle("bx-dark", dark);
    requestAnimationFrame(draw);
  };
  const fineHover = window.matchMedia("(hover: hover)").matches;
  requestAnimationFrame(draw);
})();

// ==========================================================================
// 3D-Erlebnis auf den Case Studies (three.js, lädt nach):
// 1) Markenobjekt im Einstieg – schwebt, folgt der Maus, dreht beim Scrollen
// 2) 3D-Flug: gepinnter Raum, die Kamera fliegt beim Scrollen durch einen
//    Gang aus Projektbildern und Markenbegriffen
// ==========================================================================
(() => {
  const root = document.querySelector(".cs3");
  if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const slug = (location.pathname.split("/").pop() || "").replace("projekt-", "").replace(".html", "");
  const cfg = {
    "crea-response": { shape: "hex", color: 0x7c3aed, fog: 0x0b0b0f, words: ["Strategie", "Technologie", "Daten", "Menschen", "Wachstum"] },
    taeubert: { shape: "gloss", color: 0xe1251b, fog: 0x0a0a0a, words: ["Präzision", "Lack", "Glanz", "Handwerk"] },
    runclub: { shape: "ring", color: 0xffe100, fog: 0x0d0d0d, words: ["Community", "Movement", "Better Days"] },
    medaesthetic: { shape: "pearl", color: 0xe8d9cc, fog: 0x1c1a19, words: [] },
    kuehlkraft: { shape: "ice", color: 0x9fd8ee, fog: 0x0f2a33, words: [] },
    mybaumarkt: { shape: "bricks", color: 0x2f8a5f, fog: 0x14231c, words: [] },
    dogstar: { shape: "star", color: 0xfff1b8, fog: 0x10101a, words: [] },
  }[slug] || { shape: "ico", color: 0xf4f4f2, fog: 0x222a36, words: [] };
  const imgs = [...new Set([...root.querySelectorAll(".c3-m img, .c3-hero img")].map((i) => i.getAttribute("src")))];

  // Bühne für den 3D-Flug vorbereiten (auch ohne WebGL als dunkle Fläche)
  let fly = null;
  if (imgs.length >= 2) {
    fly = document.createElement("section");
    fly.className = "bx3-fly"; fly.dataset.dark = "";
    fly.style.height = Math.max(300, (imgs.length + cfg.words.length) * 60) + "vh";
    fly.innerHTML = `<div class="bx3-fly__pin"><canvas class="bx3-fly__cv" aria-hidden="true"></canvas><p class="bx3-fly__k">Durch die Marke</p><p class="bx3-fly__hint">Scrollen</p></div>`;
    (root.querySelector(".c3-hs") || root.querySelector(".c3-next")).before(fly);
  }

  const load = (cb) => {
    if (window.THREE) return cb();
    const s = document.createElement("script");
    s.src = "assets/vendor/three.min.js";
    s.onload = cb; document.head.appendChild(s);
  };
  load(() => {
    const T = window.THREE;
    const test = document.createElement("canvas");
    if (!(test.getContext("webgl") || test.getContext("experimental-webgl"))) return;
    const mouse = { x: 0, y: 0 };
    addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });
    const dpr = Math.min(1.75, devicePixelRatio || 1);
    const col = new T.Color(cfg.color);

    // ---------- 1) Markenobjekt im Einstieg ----------
    const hero = document.createElement("div");
    const hc = document.createElement("canvas");
    hc.className = "bx3-hero"; hc.setAttribute("aria-hidden", "true");
    hero.appendChild(hc);
    const hr = new T.WebGLRenderer({ canvas: hc, alpha: true, antialias: true });
    hr.setPixelRatio(dpr);
    const hs = new T.Scene();
    const hcam = new T.PerspectiveCamera(35, 1, 0.1, 100); hcam.position.z = 9;
    hs.add(new T.AmbientLight(0xffffff, 0.35));
    const key = new T.PointLight(0xffffff, 1.4); key.position.set(4, 5, 6); hs.add(key);
    const rim = new T.PointLight(cfg.color, 3, 20); rim.position.set(-5, -2, 3); hs.add(rim);
    const obj = new T.Group(); hs.add(obj);
    if (cfg.shape === "hex") {
      // Zeichen aus sechs Balken mit Lücke, wie das gebrochene C
      const mat = new T.MeshStandardMaterial({ color: cfg.color, emissive: cfg.color, emissiveIntensity: 0.55, metalness: 0.4, roughness: 0.3 });
      for (let i = 0; i < 6; i++) {
        if (i === 0) continue;
        const a = i / 6 * Math.PI * 2 + Math.PI / 6;
        const beam = new T.Mesh(new T.BoxGeometry(1.55, 0.32, 0.45), mat);
        beam.position.set(Math.cos(a) * 1.35, Math.sin(a) * 1.35, 0);
        beam.rotation.z = a + Math.PI / 2;
        obj.add(beam);
        const inner = beam.clone(); inner.scale.set(0.55, 0.8, 0.8);
        inner.position.set(Math.cos(a) * 0.78, Math.sin(a) * 0.78, 0.15); obj.add(inner);
      }
    } else if (cfg.shape === "gloss") {
      const m = new T.MeshPhysicalMaterial ? new T.MeshPhysicalMaterial({ color: cfg.color, metalness: 0.6, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }) : new T.MeshStandardMaterial({ color: cfg.color, metalness: 0.6, roughness: 0.15 });
      const blob = new T.Mesh(new T.TorusKnotGeometry(1.05, 0.38, 220, 32), m); obj.add(blob);
      const wl = new T.PointLight(0xffffff, 2.2, 30); wl.position.set(0, 6, 3); hs.add(wl);
    } else if (cfg.shape === "ring") {
      const m = new T.MeshStandardMaterial({ color: cfg.color, emissive: cfg.color, emissiveIntensity: 0.35, metalness: 0.2, roughness: 0.4 });
      for (let i = 0; i < 3; i++) { const r = new T.Mesh(new T.TorusGeometry(1.1 + i * 0.42, 0.07, 16, 120), m); r.rotation.x = 1.1 + i * 0.25; r.rotation.y = i * 0.5; obj.add(r); }
    } else if (cfg.shape === "pearl") {
      obj.add(new T.Mesh(new T.SphereGeometry(1.2, 64, 64), new T.MeshStandardMaterial({ color: cfg.color, metalness: 0.15, roughness: 0.18 })));
    } else if (cfg.shape === "ice") {
      const m = new T.MeshPhysicalMaterial({ color: cfg.color, metalness: 0, roughness: 0.05, transmission: 0.6, transparent: true, opacity: 0.85 });
      obj.add(new T.Mesh(new T.OctahedronGeometry(1.4, 0), m));
      obj.add(new T.LineSegments(new T.EdgesGeometry(new T.OctahedronGeometry(1.42, 0)), new T.LineBasicMaterial({ color: 0xffffff })));
    } else if (cfg.shape === "bricks") {
      const m = new T.MeshStandardMaterial({ color: cfg.color, roughness: 0.6 });
      for (let i = 0; i < 9; i++) { const b = new T.Mesh(new T.BoxGeometry(0.9, 0.42, 0.45), m); b.position.set((i % 3 - 1) * 0.95 + (Math.floor(i / 3) % 2) * 0.45 - 0.2, Math.floor(i / 3) * 0.45 - 0.5, 0); b.userData.y = b.position.y; b.userData.k = i; obj.add(b); }
      obj.userData.bricks = true;
    } else {
      obj.add(new T.Mesh(new T.IcosahedronGeometry(1.4, 0), new T.MeshStandardMaterial({ color: cfg.color, emissive: cfg.color, emissiveIntensity: 0.4, flatShading: true })));
    }
    // Partikel um das Objekt
    const pg = new T.BufferGeometry(); const N = 380; const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const r = 2.2 + Math.random() * 3.2, a = Math.random() * 6.28, b = (Math.random() - 0.5) * 3; pos.set([Math.cos(a) * r, b, Math.sin(a) * r], i * 3); }
    pg.setAttribute("position", new T.BufferAttribute(pos, 3));
    const pts = new T.Points(pg, new T.PointsMaterial({ color: cfg.color, size: 0.035, transparent: true, opacity: 0.8 }));
    hs.add(pts);
    const hsize = () => { const w = hero.clientWidth, h = hero.clientHeight; hr.setSize(w, h, false); hcam.aspect = w / h; hcam.updateProjectionMatrix(); obj.position.x = w > 800 ? 2.4 : 0; obj.position.y = w > 800 ? 0.4 : 1.1; pts.position.x = obj.position.x; };
    hsize(); addEventListener("resize", hsize);
    let spin = 0, intro = 0;

    // ---------- 2) 3D-Flug ----------
    let fr, fs, fcam, items = [], depth = 0;
    if (fly) {
      const cv = fly.querySelector("canvas");
      fr = new T.WebGLRenderer({ canvas: cv, antialias: true }); fr.setPixelRatio(dpr);
      fs = new T.Scene(); fs.background = new T.Color(cfg.fog); fs.fog = new T.Fog(cfg.fog, 4, 26);
      fcam = new T.PerspectiveCamera(60, 1, 0.1, 80);
      const loader = new T.TextureLoader();
      const seq = [];
      imgs.forEach((s, i) => { seq.push({ img: s }); if (cfg.words[i]) seq.push({ word: cfg.words[i] }); });
      cfg.words.slice(imgs.length).forEach((w) => seq.push({ word: w }));
      const gap = 6;
      const MODE = { taeubert: "carousel", runclub: "sprint" }[slug] || "corridor";
      fly.dataset.mode = MODE;
      seq.forEach((it, i) => {
        const z = -i * gap - 6;
        let mesh;
        if (it.img) {
          const tex = loader.load(it.img); tex.anisotropy = 4;
          mesh = new T.Mesh(new T.PlaneGeometry(4.8, 3.2), new T.MeshBasicMaterial({ map: tex, side: T.DoubleSide }));
          const side = (Math.floor(i / 2) % 2) ? 1 : -1;
          mesh.position.set(side * 3.4, (i % 3 - 1) * 0.5, z);
          mesh.rotation.y = -side * 0.5;
          if (MODE === "sprint") { mesh.position.set(i * 6.5, (i % 2 ? 0.7 : -0.7), -4); mesh.rotation.set(0, 0, 0); }
        } else {
          const c = document.createElement("canvas"); c.width = 2048; c.height = 512;
          const g = c.getContext("2d"); g.fillStyle = "#" + col.getHexString();
          g.font = "700 300px Archivo, Helvetica, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
          const txt = it.word.toUpperCase(); let fsz = 300; while (g.measureText(txt).width > 1900 && fsz > 80) { fsz -= 10; g.font = `700 ${fsz}px Archivo, Helvetica, Arial, sans-serif`; }
          g.fillText(txt, 1024, 256);
          const tex = new T.CanvasTexture(c);
          mesh = new T.Mesh(new T.PlaneGeometry(5.2, 1.3), new T.MeshBasicMaterial({ map: tex, transparent: true }));
          mesh.position.set(0, 0, z);
          if (MODE === "sprint") mesh.position.set(i * 6.5, 0, -2);
        }
        fs.add(mesh); items.push(mesh);
      });
      const carousel = new T.Group();
      if (MODE === "carousel") {
        const R = 7.5;
        items.forEach((m, i) => { const a = i / items.length * Math.PI * 2; m.position.set(Math.sin(a) * R, 0, Math.cos(a) * R); m.rotation.set(0, a, 0); fs.remove(m); carousel.add(m); });
        carousel.position.z = -R - 6; fs.add(carousel);
      }
      fly._carousel = carousel; fly._mode = MODE;
      // Gitterlinien als Gang
      const lineMat = new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06 });
      depth = seq.length * gap + 10;
      if (MODE === "sprint") {
        for (let i = 0; i < 160; i++) { const y = (Math.random() - 0.5) * 6, z = -3 - Math.random() * 8, x = Math.random() * depth * 1.2 - 10, l = 1 + Math.random() * 6;
          fs.add(new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(x, y, z), new T.Vector3(x + l, y, z)]), lineMat)); }
      } else if (MODE === "carousel") {
        const ring = new T.Mesh(new T.TorusGeometry(7.5, 0.02, 8, 200), new T.MeshBasicMaterial({ color: cfg.color }));
        ring.rotation.x = Math.PI / 2; ring.position.y = -1.9; carousel.add(ring);
        const ring2 = ring.clone(); ring2.position.y = 1.9; carousel.add(ring2);
      } else
      for (let z = 0; z > -depth; z -= 3) {
        const g = new T.BufferGeometry().setFromPoints([new T.Vector3(-5, -2.6, z), new T.Vector3(5, -2.6, z), new T.Vector3(5, 2.6, z), new T.Vector3(-5, 2.6, z), new T.Vector3(-5, -2.6, z)]);
        fs.add(new T.Line(g, lineMat));
      }
      const fsize = () => { const w = innerWidth, h = innerHeight; fr.setSize(w, h, false); fcam.aspect = w / h; fcam.updateProjectionMatrix(); };
      fsize(); addEventListener("resize", fsize);
    }

    const sm = { x: 0, y: 0 }; let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      sm.x += (mouse.x - sm.x) * 0.06; sm.y += (mouse.y - sm.y) * 0.06;
      const H = innerHeight;
      if (scrollY < H * 1.2) {
        intro = Math.min(1, intro + dt * 0.8);
        const e = 1 - Math.pow(1 - intro, 3);
        spin += dt * 0.35;
        obj.scale.setScalar(0.2 + e * 0.8);
        obj.rotation.y = spin + sm.x * 0.9 + scrollY * 0.004;
        obj.rotation.x = sm.y * 0.6 + Math.sin(spin) * 0.15 + scrollY * 0.002;
        obj.position.z = scrollY / H * 3;
        if (obj.userData.bricks) obj.children.forEach((b) => { const k = Math.min(1, Math.max(0, intro * 9 - b.userData.k * 0.6)); b.position.y = b.userData.y + (1 - k) * 4; b.rotation.z = (1 - k) * 0.8; });
        pts.rotation.y = spin * 0.3; pts.rotation.x = sm.y * 0.2;
        hcam.position.x = sm.x * 0.6; hcam.position.y = -sm.y * 0.4; hcam.lookAt(0, 0, 0);
        hr.render(hs, hcam);
      }
      if (fly) {
        const r = fly.getBoundingClientRect();
        if (r.bottom > 0 && r.top < H) {
          const p = Math.min(1, Math.max(0, -r.top / (fly.offsetHeight - H)));
          if (fly._mode === "carousel") {
            fcam.position.set(sm.x * 0.8, 0.4 - sm.y * 0.6, 4); fcam.rotation.set(-0.05 - sm.y * 0.06, -sm.x * 0.1, 0);
            const target = -p * Math.PI * 2 * (1 - 1 / items.length) + Math.PI;
            fly._carousel.rotation.y += (target - fly._carousel.rotation.y) * 0.1;
          } else if (fly._mode === "sprint") {
            const tx = p * (items.length - 1) * 6.5;
            const prev = fcam.position.x; fcam.position.x += (tx - fcam.position.x) * 0.1;
            const v = fcam.position.x - prev;
            fcam.position.y = -sm.y * 0.5; fcam.position.z = 4.2 + Math.min(2, Math.abs(v) * 3);
            fcam.rotation.set(-sm.y * 0.05, -sm.x * 0.12, -v * 0.08);
            items.forEach((m) => { m.rotation.y = Math.max(-0.6, Math.min(0.6, -v * 0.4)); });
          } else {
          const tz = -p * (depth - 12);
          fcam.position.z += (tz - fcam.position.z) * 0.12;
          fcam.position.x = sm.x * 1.2; fcam.position.y = -sm.y * 0.7;
          fcam.rotation.y = -sm.x * 0.18; fcam.rotation.x = -sm.y * 0.1;
          }
          items.forEach((m, i) => { const d = m.position.z - fcam.position.z; m.material.opacity = 1; if (fly._mode === "corridor" && m.geometry.parameters.width === 5.2) m.rotation.y = Math.sin(now / 1500 + i) * 0.08; });
          fr.render(fs, fcam);
          fly.classList.toggle("is-moving", p > 0.02 && p < 0.98);
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
})();

// ==========================================================================
// Jede Marke bewegt sich anders: eigene Bild-Aufdeckung, Textbewegung,
// Namens-Animation und Atmosphäre im Einstieg
// ==========================================================================
(() => {
  const root = document.querySelector(".cs3");
  if (!root) return;
  const slug = (location.pathname.split("/").pop() || "").replace("projekt-", "").replace(".html", "");
  document.body.dataset.anim = slug;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Kachel-Aufdeckung (Crea: Daten-Pixel, Baumarkt: Steine von unten)
  if (slug === "crea-response" || slug === "mybaumarkt") {
    const cols = slug === "crea-response" ? 10 : 6, rows = slug === "crea-response" ? 7 : 5;
    root.querySelectorAll(".c3-m .c3-m__in").forEach((box) => {
      const g = document.createElement("div"); g.className = "bx-tiles";
      g.style.gridTemplateColumns = `repeat(${cols},1fr)`;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const t = document.createElement("i");
        const d = slug === "crea-response" ? Math.random() * 900 : ((rows - 1 - r) * 140 + Math.abs(c - cols / 2) * 40);
        t.style.transitionDelay = d + "ms"; g.appendChild(t);
      }
      box.appendChild(g);
    });
  }

  // Crea: Titel und Labels „entschlüsseln“ sich
  const decode = (el) => {
    const final = el.textContent, chars = "01ABCDEF#/<>_";
    let f = 0; const id = setInterval(() => {
      f++; el.textContent = [...final].map((c, i) => (c === " " || i < f * 1.5) ? c : chars[Math.random() * chars.length | 0]).join("");
      if (f * 1.5 >= final.length) { clearInterval(id); el.textContent = final; }
    }, 40);
  };
  if (slug === "crea-response") {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); decode(e.target); } }));
    root.querySelectorAll(".c3-facts span, .c3-ext a").forEach((el) => io.observe(el));
  }

  // Atmosphäre im Einstieg für Marken ohne eigene Hero-Animation
  const hero = root.querySelector(".c3-hero");
  const fx = { kuehlkraft: "frost", dogstar: "stars", medaesthetic: "iris" }[slug];
  if (hero && fx) {
    const cv = document.createElement("canvas"); cv.className = "bx-fx bx-fx--" + fx; cv.setAttribute("aria-hidden", "true"); hero.appendChild(cv);
    const ctx = cv.getContext("2d"); let W, H; const dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => { W = hero.clientWidth; H = hero.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }; size(); addEventListener("resize", size);
    const P = Array.from({ length: fx === "stars" ? 260 : 140 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * (fx === "stars" ? 1.8 : 2.6) + 0.4, s: Math.random() * 0.0012 + 0.0003, ph: Math.random() * 6.28, dx: (Math.random() - 0.5) * 0.0006 }));
    const m = { x: 0.5, y: 0.5 }; hero.addEventListener("pointermove", (e) => { const r = hero.getBoundingClientRect(); m.x = (e.clientX - r.left) / r.width; m.y = (e.clientY - r.top) / r.height; });
    const loop = (now) => {
      if (scrollY < innerHeight * 1.2) {
        ctx.clearRect(0, 0, W, H); const t = now / 1000;
        if (fx === "iris") {
          // weiche Lichtringe wie bei einer Linse
          for (let i = 0; i < 5; i++) { const r = ((t * 60 + i * 140) % 700); ctx.strokeStyle = `rgba(255,240,230,${0.25 * (1 - r / 700)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(m.x * W, m.y * H, r, 0, 7); ctx.stroke(); }
        } else P.forEach((p) => {
          if (fx === "frost") { p.y += p.s; p.x += p.dx + (m.x - 0.5) * 0.0008; if (p.y > 1) { p.y = 0; p.x = Math.random(); } ctx.fillStyle = "rgba(225,245,255,.85)"; }
          else { const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + p.ph)); ctx.fillStyle = `rgba(255,246,210,${a})`; p.x += (m.x - 0.5) * 0.0004 * p.r; }
          ctx.beginPath(); ctx.arc(((p.x % 1) + 1) % 1 * W, p.y * H, p.r, 0, 7); ctx.fill();
        });
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
})();

document.querySelectorAll(".c3-giant").forEach((g) => { const n = g.textContent.trim().length; g.style.setProperty("font-size", `min(17vw, ${(135 / Math.max(5, n)).toFixed(2)}vw, 300px)`, "important"); });

// ==========================================================================
// Mitmach-Erlebnisse pro Marke
// – Täubert: „Lackier selbst“ – mit der Maus/dem Finger Lack auf ein
//   verkratztes Fahrzeug sprühen, Fortschritt in Prozent, bei 70 % Glanz
// – Run Club: „Lauf mit“ – Scrollen ist Laufen: Kilometer, Uhrzeit, Pace,
//   Läufer auf der Strecke, im Ziel gelbes Konfetti
// – Crea + alle anderen: Datenpartikel formen beim Scrollen das Zeichen bzw.
//   den Namen, die Maus wirbelt sie auseinander
// ==========================================================================
(() => {
  const root = document.querySelector(".cs3");
  if (!root) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slug = (location.pathname.split("/").pop() || "").replace("projekt-", "").replace(".html", "");
  const acc = { "crea-response": "#7c3aed", taeubert: "#f2f2f2", runclub: "#ffe100", medaesthetic: "#c9a98f", kuehlkraft: "#7fd0ec", mybaumarkt: "#2f8a5f", dogstar: "#ffe9a0" }[slug] || "#fff";
  const name = (document.querySelector(".c2-bar__t b")?.textContent || "").trim();
  const anchor = root.querySelector(".c3-sec");
  const sec = document.createElement("section");
  sec.className = "xp xp--" + slug; sec.dataset.dark = "";
  anchor.after(sec);
  const dpr = Math.min(2, devicePixelRatio || 1);

  // ---------------- Täubert: Lackier selbst ----------------
  if (slug === "taeubert") {
    sec.innerHTML = `<div class="xp__pin xp__pin--static"><p class="xp__k">Mitmachen</p><h2 class="xp__h">Lackier selbst.</h2><p class="xp__s">Fahr mit der Maus oder dem Finger über das Fahrzeug.</p><div class="xp-spray"><canvas></canvas><p class="xp-spray__p"><b>0</b> % lackiert</p><p class="xp-spray__done">Wie neu.</p></div></div>`;
    const box = sec.querySelector(".xp-spray"), cv = box.querySelector("canvas"), ctx = cv.getContext("2d");
    const mask = document.createElement("canvas"), mctx = mask.getContext("2d");
    const top = document.createElement("canvas"), tctx = top.getContext("2d");
    const img = new Image(); img.src = "assets/taeubert/website-laptop.webp";
    let W, H, scratches = [], drops = [];
    const size = () => {
      W = box.clientWidth; H = Math.round(W * 0.6);
      [cv, mask, top].forEach((c) => { c.width = W * dpr; c.height = H * dpr; });
      cv.style.height = H + "px";
      [ctx, mctx, tctx].forEach((c) => c.setTransform(dpr, 0, 0, dpr, 0, 0));
      scratches = Array.from({ length: 26 }, () => { const x = Math.random() * W, y = Math.random() * H, a = Math.random() * 6.28, l = 40 + Math.random() * 160; return [x, y, x + Math.cos(a) * l, y + Math.sin(a) * l * 0.4]; });
    };
    size(); addEventListener("resize", size);
    let pct = 0, done = false;
    const spray = (x, y) => {
      for (let i = 0; i < 26; i++) {
        const a = Math.random() * 6.28, r = Math.random() ** 0.6 * 46;
        mctx.fillStyle = "rgba(0,0,0,.8)"; mctx.beginPath(); mctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 2 + Math.random() * 7, 0, 7); mctx.fill();
      }
      for (let i = 0; i < 4; i++) drops.push({ x: x + (Math.random() - 0.5) * 50, y: y + (Math.random() - 0.5) * 50, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, l: 1 });
    };
    let down = false;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener("pointerdown", (e) => { down = true; spray(...pos(e)); });
    cv.addEventListener("pointermove", (e) => { if (down || e.pointerType === "mouse") spray(...pos(e)); });
    addEventListener("pointerup", () => { down = false; });
    cv.style.touchAction = "none";
    let frame = 0;
    const draw = () => {
      if (img.complete && img.naturalWidth) {
        const s = Math.max(W / img.naturalWidth, H / img.naturalHeight), iw = img.naturalWidth * s, ih = img.naturalHeight * s, ix = (W - iw) / 2, iy = (H - ih) / 2;
        ctx.filter = "grayscale(1) brightness(.45) contrast(.9)"; ctx.drawImage(img, ix, iy, iw, ih); ctx.filter = "none";
        ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1.2;
        scratches.forEach(([a, b, c, d]) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c) / 2 + 8, (b + d) / 2 - 6, c, d); ctx.stroke(); });
        tctx.globalCompositeOperation = "source-over"; tctx.clearRect(0, 0, W, H);
        tctx.filter = "saturate(1.35) contrast(1.1) brightness(1.05)"; tctx.drawImage(img, ix, iy, iw, ih); tctx.filter = "none";
        const g = tctx.createLinearGradient(0, 0, W, H); const t = (performance.now() / 2600) % 1.6 - 0.3;
        const cl = (v) => Math.min(1, Math.max(0, v));
        g.addColorStop(cl(t - 0.08), "rgba(255,255,255,0)"); g.addColorStop(cl(t), "rgba(255,255,255,.28)"); g.addColorStop(cl(t + 0.08), "rgba(255,255,255,0)");
        tctx.fillStyle = g; tctx.fillRect(0, 0, W, H);
        tctx.globalCompositeOperation = "soft-light"; tctx.fillStyle = "rgba(242,242,242,.55)"; tctx.fillRect(0, 0, W, H);
        tctx.globalCompositeOperation = "destination-in"; tctx.drawImage(mask, 0, 0, W, H);
        ctx.drawImage(top, 0, 0, W, H);
      }
      drops = drops.filter((d) => (d.l -= 0.04) > 0);
      drops.forEach((d) => { d.x += d.vx; d.y += d.vy; ctx.fillStyle = `rgba(242,242,242,${d.l * 0.8})`; ctx.beginPath(); ctx.arc(d.x, d.y, 1.6, 0, 7); ctx.fill(); });
      if (++frame % 20 === 0) {
        const data = mctx.getImageData(0, 0, mask.width, mask.height).data; let n = 0, c = 0;
        for (let i = 3; i < data.length; i += 4 * 97) { c++; if (data[i] > 120) n++; }
        pct = Math.min(100, Math.round(n / c * 100 / 0.92));
        sec.querySelector(".xp-spray__p b").textContent = pct;
        if (pct >= 70 && !done) { done = true; box.classList.add("is-done"); }
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    return;
  }

  // ---------------- Run Club: Lauf mit ----------------
  if (slug === "runclub") {
    sec.style.height = "420vh";
    sec.innerHTML = `<div class="xp__pin"><p class="xp__k">Mitlaufen</p><h2 class="xp__h">Scrollen ist Laufen.</h2>
      <div class="xp-run"><div class="xp-run__stats"><p><span>Distanz</span><b class="xp-km">0,00</b><i>km</i></p><p><span>Uhrzeit</span><b class="xp-time">07:15</b><i>Hyde Park</i></p><p><span>Pace</span><b class="xp-pace">–</b><i>min/km</i></p></div>
      <div class="xp-run__track"><i class="xp-run__line"></i><i class="xp-run__dot"></i>${[1, 2, 3, 4, 5].map((k) => `<span style="left:${k * 20}%">${k} km</span>`).join("")}</div>
      <p class="xp-run__goal">Better Days.</p></div><canvas class="xp-confetti"></canvas></div>`;
    const km = sec.querySelector(".xp-km"), tm = sec.querySelector(".xp-time"), pc = sec.querySelector(".xp-pace"), dot = sec.querySelector(".xp-run__dot"), line = sec.querySelector(".xp-run__line");
    const cv = sec.querySelector(".xp-confetti"), ctx = cv.getContext("2d"); let conf = [], fired = false, lastP = 0, lastT = performance.now(), pace = 0;
    const size = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }; size(); addEventListener("resize", size);
    const loop = (now) => {
      const r = sec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (sec.offsetHeight - innerHeight)));
      const d = p * 5, mins = 15 + p * 27;
      km.textContent = d.toFixed(2).replace(".", ",");
      tm.textContent = `07:${String(Math.floor(mins)).padStart(2, "0")}`;
      const dt = (now - lastT) / 1000; lastT = now;
      const v = Math.abs(p - lastP) * 5 / Math.max(dt, 0.001); lastP = p;
      pace += (v - pace) * 0.05;
      const ps = Math.round(Math.min(480, Math.max(170, 480 - pace * 900)));
      pc.textContent = pace > 0.005 ? `${Math.floor(ps / 60)}:${String(ps % 60).padStart(2, "0")}` : "–";
      dot.style.left = p * 100 + "%"; line.style.transform = `scaleX(${p})`;
      sec.classList.toggle("is-finish", p > 0.97);
      if (p > 0.97 && !fired) { fired = true; for (let i = 0; i < 260; i++) conf.push({ x: innerWidth / 2, y: innerHeight * 0.6, vx: (Math.random() - 0.5) * 18, vy: -Math.random() * 18 - 4, r: Math.random() * 6.28, s: 4 + Math.random() * 8, c: Math.random() < 0.7 ? "#ffe100" : "#ffffff" }); }
      if (p < 0.9) fired = false;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      conf = conf.filter((c) => c.y < innerHeight + 20);
      conf.forEach((c) => { c.vy += 0.45; c.vx *= 0.99; c.x += c.vx; c.y += c.vy; c.r += 0.15; ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r); ctx.fillStyle = c.c; ctx.fillRect(-c.s / 2, -c.s / 4, c.s, c.s / 2); ctx.restore(); });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return;
  }

  // ---------------- Partikel formen Zeichen / Namen ----------------
  sec.style.height = "300vh";
  const lines = slug === "crea-response" ? ["Daten.", "Ideen.", "Wirkung."] : [name, "", ""];
  sec.innerHTML = `<div class="xp__pin"><p class="xp__k">${slug === "crea-response" ? "Aus Daten wird Wirkung" : "Die Marke entsteht"}</p><canvas class="xp-part"></canvas><p class="xp-part__cap">${lines[0]}</p></div>`;
  const cv = sec.querySelector("canvas"), ctx = cv.getContext("2d"), cap = sec.querySelector(".xp-part__cap");
  let W, H, P = [];
  const build = () => {
    W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const o = document.createElement("canvas"); o.width = W; o.height = H; const g = o.getContext("2d");
    g.fillStyle = "#fff"; g.strokeStyle = "#fff";
    if (slug === "crea-response") {
      const R = Math.min(W, H) * 0.26, cx = W / 2, cy = H * 0.46; g.lineWidth = R * 0.24; g.lineJoin = "miter";
      g.beginPath(); for (let i = 1; i <= 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      g.lineWidth = R * 0.14; g.beginPath(); for (let i = 1; i <= 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; const x = cx + Math.cos(a) * R * 0.55, y = cy + Math.sin(a) * R * 0.55; i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
    } else {
      let fs = Math.min(W * 0.9 / Math.max(4, name.length) * 1.6, H * 0.3);
      g.font = `900 ${fs}px Montserrat, Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
      while (g.measureText(name.toUpperCase()).width > W * 0.88) { fs -= 4; g.font = `900 ${fs}px Montserrat, Arial, sans-serif`; }
      g.fillText(name.toUpperCase(), W / 2, H * 0.46);
    }
    const data = g.getImageData(0, 0, W, H).data, step = Math.max(5, Math.round(Math.sqrt(W * H / 15000)));
    const tg = []; for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 128) tg.push([x, y]);
    P = tg.map(([tx, ty]) => ({ tx, ty, sx: Math.random() * W, sy: Math.random() * H, x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, ph: Math.random() * 6.28 }));
  };
  build(); let rb; addEventListener("resize", () => { clearTimeout(rb); rb = setTimeout(build, 300); });
  const m = { x: -999, y: -999 };
  cv.addEventListener("pointermove", (e) => { const r = cv.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; });
  cv.addEventListener("pointerleave", () => { m.x = m.y = -999; });
  const loop = (now) => {
    const r = sec.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) {
      const p = Math.min(1, Math.max(0, -r.top / (sec.offsetHeight - innerHeight)));
      const k = reduce ? 1 : Math.min(1, p / 0.6);
      const ease = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const li = lines[Math.min(lines.length - 1, Math.floor(p * lines.length))] || lines[0];
      if (cap.textContent !== li) { cap.classList.remove("is-in"); void cap.offsetWidth; cap.textContent = li; cap.classList.add("is-in"); }
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = acc;
      const t = now / 1000;
      P.forEach((q) => {
        const gx = q.sx + (q.tx - q.sx) * ease + Math.sin(t + q.ph) * (1 - ease) * 30, gy = q.sy + (q.ty - q.sy) * ease + Math.cos(t * 0.8 + q.ph) * (1 - ease) * 30;
        q.vx += (gx - q.x) * 0.08; q.vy += (gy - q.y) * 0.08;
        const dx = q.x - m.x, dy = q.y - m.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { const f = (14000 - d2) / 14000 * 6; const d = Math.sqrt(d2) || 1; q.vx += dx / d * f; q.vy += dy / d * f; }
        q.vx *= 0.78; q.vy *= 0.78; q.x += q.vx; q.y += q.vy;
        ctx.fillRect(q.x, q.y, 3, 3);
      });
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();

// Case Studies: ruhiger, hochwertiger Einstieg – Name in Serif, Meta-Zeile, keine Effekte über dem Bild
(() => {
  const hero = document.querySelector(".cs3 .c3-hero");
  if (!hero) return;
  const tags = (document.querySelector(".c2-bar__t span")?.textContent || "").split("·").map((t) => t.trim()).filter(Boolean);
  const meta = document.createElement("div");
  meta.className = "c3-meta"; meta.setAttribute("aria-hidden", "true");
  meta.innerHTML = `<span>Case Study — 2026</span><span>${tags.join(" / ")}</span><span class="c3-meta__s">Scrollen ↓</span>`;
  hero.appendChild(meta);
  const g = document.querySelector(".c3-giant");
  if (g) { g.style.removeProperty("font-size"); const n = g.textContent.trim().length; g.style.setProperty("--gs", Math.min(19, 150 / Math.max(4, n)).toFixed(2) + "vw"); }
})();

const LION = {"vb": [10.0, 4.0, 230.0, 150.0], "t": [0, 0], "parts": [{"p": "body", "d": "M26 40 L40 32 L40 24 L56 16 C70 17 82 21 92 27 L102 22 L102 34 C108 41 112 50 113 58 L124 58 L114 68 L162 68 C172 68 180 76 180 86 L196 136 L168 136 C168 129 173 124 180 124 L172 104 C158 116 140 120 124 120 C118 120 112 119 106 117 L80 136 L54 136 C54 129 60 124 68 124 L86 106 C76 96 72 84 72 72 C72 64 76 58 82 56 L82 52 L60 52 L52 60 L38 60 L26 52 Z"}, {"p": "body2", "d": "M114 124 L146 124 C156 124 164 120 170 114 L180 132 L160 142 L114 142 C114 134 120 128 128 128 Z"}, {"p": "body2", "d": "M72 88 L58 76 L50 76 C46 72 40 72 34 75 L50 90 L60 106 L71 106 C67 100 67 94 72 88 Z"}, {"p": "tail", "d": "M160 68 L196 68 C206 68 212 60 212 50 C212 42 218 36 226 36 L226 46 C223 46 222 48 222 50 C222 66 210 78 196 78 L160 78 Z"}, {"p": "tail", "d": "M220 22 C229 22 236 29 236 38 L220 38 Z"}, {"p": "cut", "d": "M46 38 L56 34 L56 40 L48 42 Z"}]};
// ==========================================================================
// Studio-Logo: Löwe. 3D-Chrom-Intro (Startseite, einmal pro Besuch) +
// Löwe im Header und im Ladebildschirm
// ==========================================================================
(() => {
  if (!document.body.classList.contains("v5")) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svg = (cls) => {
    const [x, y, w, h] = LION.vb;
    return `<svg class="${cls}" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true"><g transform="translate(${LION.t[0]} ${LION.t[1]})">${LION.parts.map((p) => p.p === "line" ? `<path d="${p.d}" fill="none" stroke="var(--lion-cut,#fff)" stroke-width="2.5" stroke-linecap="round"/>` : `<path d="${p.d}" fill="${p.p === "cut" ? "var(--lion-cut,#fff)" : "currentColor"}"${p.p === "mane2" || p.p === "relief" || p.p === "body2" ? ' opacity=".55"' : ""}/>`).join("")}</g></svg>`;
  };
  // Header-Logo
  document.querySelectorAll(".header .logo").forEach((l) => { if (!l.querySelector(".lion-mark")) l.insertAdjacentHTML("afterbegin", svg("lion-mark")); });
  // Ladebildschirm im Projekt-Übergang
  new MutationObserver(() => document.querySelectorAll(".bx4__load:not(.has-lion)").forEach((d) => { d.classList.add("has-lion"); d.insertAdjacentHTML("afterbegin", svg("lion-load")); })).observe(document.body, { childList: true });

})();

// Academy: Siegel je Thema statt Buchstaben, Nummer vor jeder Zeile
(() => {
  if (!document.body.classList.contains("page-ac2")) return;
  const seal = {
    identitaet: `<svg viewBox="0 0 100 100"><path d="M50 8 L58 38 L90 38 L64 56 L74 88 L50 68 L26 88 L36 56 L10 38 L42 38 Z"/></svg>`,
    strategie: `<svg viewBox="0 0 100 100"><path d="M14 72 L10 30 L32 48 L50 18 L68 48 L90 30 L86 72 Z M14 78 H86 V88 H14 Z"/></svg>`,
    design: `<svg viewBox="0 0 100 100"><path d="M6 50 C26 22 74 22 94 50 C74 78 26 78 6 50 Z"/><circle cx="50" cy="50" r="15" fill="#111"/><circle cx="50" cy="50" r="7"/></svg>`,
  };
  document.querySelectorAll(".ac2-card").forEach((c) => {
    const k = (c.className.match(/ac2-card--(\w+)/) || [])[1];
    const cov = c.querySelector(".ac2-card__cover");
    const num = cov.querySelector("em")?.textContent || "";
    cov.innerHTML = seal[k] || "";
    c.querySelector("a").insertAdjacentHTML("afterbegin", `<span class="bx-num">${num}</span>`);
  });
})();

// Arbeiten-Übersicht: Zeilen fahren ein, Vorschau folgt der Maus
(() => {
  const root = document.querySelector(".w4");
  if (!root) return;
  const rows = [...root.querySelectorAll(".w4-row")];
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) { rows.forEach((r) => r.classList.add("in")); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
  rows.forEach((r) => io.observe(r));
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const fl = root.querySelector(".w4-float");
  let lx = 0, cur = null;
  rows.forEach((r) => {
    const a = r.querySelector("a");
    a.addEventListener("pointerenter", () => {
      if (cur !== r) { fl.innerHTML = r.querySelector(".w4-thumb").innerHTML; fl.querySelector("img")?.removeAttribute("loading"); cur = r; }
      fl.classList.add("on");
    });
    a.addEventListener("pointerleave", () => fl.classList.remove("on"));
  });
  root.addEventListener("pointermove", (e) => {
    fl.style.setProperty("--x", e.clientX + 24 + "px");
    fl.style.setProperty("--y", e.clientY + "px");
    fl.style.setProperty("--rot", Math.max(-10, Math.min(10, (e.clientX - lx) * 0.5)).toFixed(1) + "deg");
    lx = e.clientX;
  });
})();
