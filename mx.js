/* B3DE – Klarheit von Helder, Haltung von Motto */
(() => {
  document.documentElement.classList.add("mx-js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Aufdecken beim Scrollen
  const els = document.querySelectorAll("[data-r]");
  if (reduce || !("IntersectionObserver" in window)) els.forEach((e) => e.classList.add("in"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });
    els.forEach((e) => io.observe(e));
  }

  // Kopfleiste ein-/ausblenden, schwebender Termin-Button
  const head = document.querySelector(".mx-hd") || document.querySelector(".mx-head-wrap");
  const float = document.querySelector(".mx-float");
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    if (head && !document.body.classList.contains("menu-open")) { head.classList.toggle("is-hidden", y > lastY && y > 300); head.classList.toggle("is-scrolled", y > 60); }
    if (float) float.classList.toggle("is-on", y > innerHeight * 0.8 && y < document.documentElement.scrollHeight - innerHeight * 1.6);
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menü mobil
  const burger = document.querySelector(".mx-burger");
  const menu = document.querySelector(".mx-menu");
  if (burger && menu) {
    const set = (open) => {
      document.body.classList.toggle("menu-open", open);
      menu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      menu.toggleAttribute("inert", !open);
    };
    set(false);
    burger.addEventListener("click", () => set(!menu.classList.contains("is-open")));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  // Seitennavigation: aktiven Abschnitt markieren
  const side = [...document.querySelectorAll(".mx-side a")];
  if (side.length && "IntersectionObserver" in window) {
    const map = new Map(side.map((a) => [document.querySelector(a.getAttribute("href")), a]));
    const so = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) side.forEach((a) => a.classList.toggle("is-on", a === map.get(e.target)));
    }), { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, sec) => sec && so.observe(sec));
  }

  // Projektliste: Vorschaubild folgt der Maus
  const list = document.querySelector(".mx-work");
  if (list && fine && !reduce) {
    const peek = document.createElement("div");
    peek.className = "mx-peek";
    peek.setAttribute("aria-hidden", "true");
    const items = [...list.querySelectorAll("a")].map((a) => {
      let el;
      if (a.dataset.img) { el = new Image(); el.src = a.dataset.img; el.alt = ""; el.decoding = "async"; }
      else { el = document.createElement("b"); el.textContent = a.dataset.name || ""; }
      peek.appendChild(el);
      return [a, el];
    });
    document.body.appendChild(peek);
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (x - cx) * 0.15; cy += (y - cy) * 0.15;
      peek.style.transform = `translate3d(${cx - 170}px, ${cy - 128}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    items.forEach(([a, el]) => a.addEventListener("pointerenter", () => {
      items.forEach(([, o]) => o.classList.toggle("is-on", o === el));
      peek.classList.add("is-on");
    }));
    list.addEventListener("pointerleave", () => peek.classList.remove("is-on"));
    addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
  }

  // Showreel: wächst beim Scrollen auf volle Breite (Motto)
  const reel = document.querySelector(".mx-reel__main");
  if (reel && !reduce) {
    let t = false;
    const grow = () => {
      t = false;
      const r = reel.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - r.top / innerHeight));
      reel.style.setProperty("--s", (0.92 + p * 0.08).toFixed(4));
    };
    addEventListener("scroll", () => { if (!t) { t = true; requestAnimationFrame(grow); } }, { passive: true });
    grow();
  }

  // Blog-Filter
  const filter = document.querySelector(".mx-filter");
  if (filter) {
    const posts = [...document.querySelectorAll(".mx-post[data-cat]")];
    filter.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      filter.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      posts.forEach((p) => { p.hidden = b.dataset.cat !== "alle" && p.dataset.cat !== b.dataset.cat; });
    });
  }

  // Inhaltsverzeichnis im Artikel
  const toc = [...document.querySelectorAll(".mx-toc a")];
  if (toc.length && "IntersectionObserver" in window) {
    const to = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) toc.forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-20% 0px -70% 0px" });
    toc.forEach((a) => { const h = document.getElementById(a.getAttribute("href").slice(1)); if (h) to.observe(h); });
  }

  // Showreel-Diashow im Einstieg
  const show = document.querySelector("[data-show]");
  if (show) {
    const imgs = [...show.querySelectorAll(".mx-show__slides img")];
    const n = show.querySelector("[data-show-n]"), nm = show.querySelector("[data-show-name]");
    let i = 0;
    if (imgs.length > 1 && !reduce) setInterval(() => {
      if (document.hidden) return;
      imgs[i].classList.remove("is-on");
      i = (i + 1) % imgs.length;
      imgs[i].classList.add("is-on");
      if (n) n.textContent = String(i + 1).padStart(2, "0");
      if (nm) nm.textContent = imgs[i].dataset.name || "";
    }, 3800);
  }

  // Statement hellt sich Wort für Wort auf
  const say = document.querySelector("[data-say]");
  if (say && !reduce) {
    const walk = (node) => [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w));
          else { const s = document.createElement("span"); s.className = "wd"; s.textContent = w; frag.appendChild(s); }
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== "SUP") walk(c);
    });
    walk(say);
    const wds = [...say.querySelectorAll(".wd")];
    let tk = false;
    const paint = () => {
      tk = false;
      const r = say.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const k = Math.round(p * wds.length);
      wds.forEach((w, j) => w.classList.toggle("on", j < k));
    };
    addEventListener("scroll", () => { if (!tk) { tk = true; requestAnimationFrame(paint); } }, { passive: true });
    paint();
  }

  // Workview: Raster oder Liste
  const views = document.querySelector(".mx-views");
  const box = document.querySelector("[data-viewbox]");
  if (views && box) views.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    views.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    box.dataset.viewbox = b.dataset.view;
    box.querySelectorAll("[data-r]").forEach((x) => x.classList.add("in"));
  });

  // Standort-Uhren
  const clocks = [...document.querySelectorAll("[data-clock]")];
  const opens = [...document.querySelectorAll("[data-open]")];
  if (clocks.length) {
    const tick = () => {
      clocks.forEach((c) => { c.textContent = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: c.dataset.clock }).format(new Date()); });
      opens.forEach((o) => {
        const p = new Intl.DateTimeFormat("de-DE", { hour: "numeric", weekday: "short", timeZone: o.dataset.open }).formatToParts(new Date());
        const h = +p.find((x) => x.type === "hour").value, d = p.find((x) => x.type === "weekday").value;
        const open = h >= 9 && h < 18 && !/Sa|So/.test(d);
        o.classList.toggle("is-open", open);
        o.textContent = open ? "Jetzt im Studio" : "Gerade geschlossen";
      });
    };
    tick(); setInterval(tick, 20000);
  }

  // Cursor
  if (fine && !reduce) {
    const cur = document.createElement("div");
    cur.className = "mx-cur"; cur.setAttribute("aria-hidden", "true"); cur.innerHTML = "<span>Ansehen</span>";
    document.body.appendChild(cur);
    let x = -50, y = -50, cx = -50, cy = -50;
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      const t = e.target.closest && e.target.closest(".mx-tile, .mx-reel__main, .mx-show, .mx-reel__more a");
      cur.classList.toggle("is-big", !!t);
    }, { passive: true });
    const loop = () => { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; requestAnimationFrame(loop); };
    loop();
  }

  // Seitenwechsel mit Vorhang
  if (!reduce) {
    const cu = document.createElement("div");
    cu.className = "mx-curtain"; cu.setAttribute("aria-hidden", "true");
    cu.innerHTML = '<span class="mx-curtain__w">' + "B3DE".split("").map((c, i) => `<span style="--i:${i}"><b>${c}</b></span>`).join("") + '</span><i class="mx-curtain__bar"></i><span class="mx-curtain__to"></span><span class="mx-curtain__star">✳</span>';
    const to = cu.querySelector(".mx-curtain__to");
    document.body.appendChild(cu);
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname || !/\.html$|\/$/.test(u.pathname)) return;
      e.preventDefault();
      to.textContent = ((a.getAttribute("aria-label") || a.textContent || "").replace(/[→←↗]/g, "").trim().split("\n")[0] || "").slice(0, 40);
      cu.className = "mx-curtain is-in";
      try { sessionStorage.setItem("b3-cur", "1"); } catch (err) {}
      setTimeout(() => { location.href = a.href; }, 760);
    });
    addEventListener("pageshow", (e) => { if (e.persisted) cu.className = "mx-curtain"; });
    // Ankunft: Vorhang liegt noch über der Seite und hebt sich
    let came = false; try { came = !!sessionStorage.getItem("b3-cur"); sessionStorage.removeItem("b3-cur"); } catch (err) {}
    if (came) {
      cu.className = "mx-curtain is-hold"; document.documentElement.classList.remove("mo-cur");
      requestAnimationFrame(() => requestAnimationFrame(() => { setTimeout(() => { cu.className = "mx-curtain is-out"; setTimeout(() => { cu.className = "mx-curtain"; }, 800); }, 120); }));
    }
  }

  // Wehende Fahne (Motto-Markenzeichen)
  const flags = [...document.querySelectorAll("[data-flag]")];
  const NS = "http://www.w3.org/2000/svg";
  const mkFlag = (el) => {
    const W = 100, H = 62, N = el.dataset.flag === "s" ? 10 : 28;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "-6 -4 " + (W + 14) + " 150");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("mx-flag__svg");
    const pole = document.createElementNS(NS, "rect");
    pole.setAttribute("x", "-4"); pole.setAttribute("y", "-2"); pole.setAttribute("width", "4"); pole.setAttribute("height", "150");
    pole.setAttribute("fill", "currentColor");
    svg.appendChild(pole);
    const base = document.createElementNS(NS, "polygon");
    base.setAttribute("fill", "currentColor");
    svg.appendChild(base);
    const strips = [];
    for (let i = 0; i < N; i++) {
      const p = document.createElementNS(NS, "polygon");
      p.setAttribute("fill", "#000");
      svg.appendChild(p); strips.push(p);
    }
    el.appendChild(svg);
    const amp = +(el.dataset.amp || 7), speed = +(el.dataset.speed || 1);
    let wind = 1;
    el.addEventListener("pointerenter", () => { wind = 2.2; });
    el.addEventListener("pointerleave", () => { wind = 1; });
    const draw = (t) => {
      const pts = [];
      for (let i = 0; i <= N; i++) {
        const x = (i / N) * W;
        const f = i / N;
        const ph = f * 6.2 - t * 0.0032 * speed * wind;
        const dy = Math.sin(ph) * amp * f * wind ** 0.6;
        const dx = -Math.abs(Math.sin(ph)) * 2.2 * f;
        pts.push([x + dx, dy, H + dy * 1.15 + f * 3, Math.cos(ph)]);
      }
      base.setAttribute("points", pts.map((q) => q[0].toFixed(2) + "," + q[1].toFixed(2)).join(" ") + " " + pts.slice().reverse().map((q) => q[0].toFixed(2) + "," + q[2].toFixed(2)).join(" "));
      for (let i = 0; i < N; i++) {
        const a = pts[i], b = pts[i + 1];
        strips[i].setAttribute("points", `${a[0].toFixed(2)},${a[1].toFixed(2)} ${b[0].toFixed(2)},${b[1].toFixed(2)} ${b[0].toFixed(2)},${b[2].toFixed(2)} ${a[0].toFixed(2)},${a[2].toFixed(2)}`);
        strips[i].setAttribute("fill-opacity", (0.16 * (1 - (a[3] + 1) / 2)).toFixed(3));
      }
    };
    return draw;
  };
  if (flags.length) {
    const draws = flags.map(mkFlag);
    if (reduce) draws.forEach((d) => d(0));
    else {
      const vis = new Set(flags);
      if ("IntersectionObserver" in window) {
        const fo = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting ? vis.add(e.target) : vis.delete(e.target)));
        flags.forEach((f) => fo.observe(f));
      }
      const loop = (t) => { flags.forEach((f, i) => { if (vis.has(f) || f.closest(".mx-curtain")) draws[i](t); }); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }

  // Menü-Bildvorschau
  const mimg = document.querySelector(".mx-menu__img img");
  document.querySelectorAll(".mx-menu__list a[data-img]").forEach((a) => a.addEventListener("pointerenter", () => {
    if (!mimg || mimg.getAttribute("src") === a.dataset.img) return;
    mimg.style.opacity = "0";
    setTimeout(() => { mimg.src = a.dataset.img; mimg.style.opacity = "1"; }, 180);
  }));

  // Wiki-Suche
  const search = document.querySelector("[data-search]");
  if (search) {
    const posts = [...document.querySelectorAll(".mx-post[data-cat]")];
    const empty = document.querySelector("[data-empty]");
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll(".mx-filter button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === "alle")));
      let n = 0;
      posts.forEach((p) => { const hit = !q || p.textContent.toLowerCase().includes(q); p.hidden = !hit; if (hit) n++; });
      if (empty) empty.hidden = n > 0;
      if (q.length === 1) document.getElementById("wiki").scrollIntoView({ block: "start" });
    });
  }

  // Link kopieren
  document.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(location.href); b.textContent = "Kopiert ✓"; } catch (e) { b.textContent = location.href; }
  }));

  document.querySelectorAll("[data-year]").forEach((e) => { e.textContent = new Date().getFullYear(); });
})();

/* Arbeiten: Branchen-Filter */
(() => {
  const pills = document.querySelectorAll(".mo-pills button");
  if (!pills.length) return;
  const tiles = document.querySelectorAll(".mo-work[data-cat], .hb-card[data-cat]");
  pills.forEach((b) => b.addEventListener("click", () => {
    const c = b.dataset.cat;
    pills.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    tiles.forEach((t) => t.classList.toggle("is-hidden", c !== "alle" && t.dataset.cat !== c));
  }));
})();

/* Ehemalige Unterseiten: Moodboard-Filter und Formulare */
(() => {
  const chips = document.querySelectorAll(".chips [data-filter]");
  chips.forEach((b) => b.addEventListener("click", () => {
    chips.forEach((x) => x.classList.toggle("is-active", x === b));
    const f = b.dataset.filter;
    document.querySelectorAll(".mood__item").forEach((it) => it.classList.toggle("is-hidden", f !== "*" && it.dataset.cat !== f));
  }));
  // Formulare: echter Versand (Endpoint) oder vorausgefüllte E-Mail
  const MAIL = "hallo@b3de.de";
  const valid = (el) => el.value.trim() && (el.type !== "email" || /^\S+@\S+\.\S+$/.test(el.value));
  document.querySelectorAll("form[data-form], form[data-newsletter]").forEach((form) => {
    const st = form.querySelector(".form__status");
    const steps = [...form.querySelectorAll(".step")], bar = [...form.querySelectorAll(".steps__bar li")];
    if (location.hash === "#kennenlernen") { const c = form.querySelector('input[value^="Kurzes Kennenlernen"]'); if (c) c.checked = true; setTimeout(() => form.scrollIntoView({ behavior: "smooth", block: "start" }), 300); }
    let cur = 0;
    const go = (i) => { cur = i; steps.forEach((s, k) => s.classList.toggle("is-on", k === i)); bar.forEach((b, k) => b.classList.toggle("on", k <= i)); const f = steps[i] && steps[i].querySelector("input, textarea, button"); if (f) f.focus({ preventScroll: true }); form.scrollIntoView({ behavior: "smooth", block: "start" }); };
    form.addEventListener("click", (e) => {
      if (e.target.closest("[data-next]")) {
        const bad = [...steps[cur].querySelectorAll("[required]")].find((el) => !valid(el));
        if (bad) { if (st) st.textContent = "Bitte füllt das Feld aus."; bad.focus(); return; }
        if (st) st.textContent = ""; go(Math.min(cur + 1, steps.length - 1));
      }
      if (e.target.closest("[data-prev]")) go(Math.max(cur - 1, 0));
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const bad = [...form.querySelectorAll("[required]")].find((el) => !valid(el));
      if (bad) { if (st) st.textContent = "Bitte füllt alle Pflichtfelder korrekt aus."; const s = bad.closest(".step"); if (s) go(steps.indexOf(s)); bad.focus(); return; }
      const fd = new FormData(form), lines = [];
      for (const [k, v] of fd.entries()) if (String(v).trim()) lines.push(`${k}: ${v}`);
      const nl = form.matches("[data-newsletter]");
      const ep = form.dataset.endpoint || "";
      if (ep) {
        try {
          const r = await fetch(ep, { method: "POST", body: fd, headers: { Accept: "application/json" } });
          if (!r.ok) throw new Error();
          if (st) st.textContent = nl ? "Danke! Ihr seid angemeldet." : "Danke! Wir melden uns so schnell wie möglich.";
          form.reset(); if (steps.length) go(0); return;
        } catch (err) { /* Fallback: E-Mail */ }
      }
      const subj = nl ? "Newsletter-Anmeldung" : "Projektanfrage über die Website";
      location.href = `mailto:${MAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(lines.join("\n"))}`;
      if (st) st.textContent = "Euer E-Mail-Programm öffnet sich mit allen Angaben – nur noch absenden.";
    });
  });
})();

/* Navigation: aktuelle Seite markieren */
(() => {
  const here = location.pathname.split("/").pop() || "index.html";
  const map = { "work.html": "work.html", "leistungen.html": "leistungen.html", "methode.html": "methode.html", "ueber-uns.html": "ueber-uns.html", "academy.html": "academy.html" };
  const key = here.startsWith("projekt-") ? "work.html" : here.startsWith("academy") || here === "buch.html" ? "academy.html" : here.startsWith("leistung-") ? "leistungen.html" : map[here];
  if (!key) return;
  document.querySelectorAll(".mx-hd__nav a, .mo-menu__list a").forEach((a) => { if (a.getAttribute("href") === key) a.setAttribute("aria-current", "page"); });
})();

/* Bewegung: Intro-Masken, Überschriften, Bildvorhänge, Scroll-Parallaxe */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 1 Seitenstart
  document.querySelectorAll(".mo-hero, .mo-lhero, .mo-book").forEach((h) => {
    let i = 0;
    h.querySelectorAll(".mo-w, .mo-lhero__t, .mo-book__t").forEach((w) => { w.classList.add("mo-anim-rise"); w.style.setProperty("--i", i++); });
    h.querySelectorAll(".mo-row").forEach((r, k) => r.style.setProperty("--r", k));
    let j = 0;
    h.querySelectorAll(".mo-hero__foot > *, .mo-meta > div, .mo-lhero__top .mo-label, .mo-row .mo-label, .mo-book__p, .mo-book__txt > p:last-child").forEach((x) => { x.classList.add("mo-anim-fade"); x.style.setProperty("--i", j++); });
  });
  if (reduce || !("IntersectionObserver" in window)) return;
  // 2 Überschriften + 3 Bilder
  const heads = document.querySelectorAll(".mo-lh2, .mo-h2, .mo-lcta__t, .mo-phase__t, .mo-prog__t, .mo-chap__t, .mx-h2, .mo-manifest__t, .mo-claim__t, .mo-next__t, .mo-think__h, .mo-foot__mark");
  heads.forEach((h) => h.classList.add("mo-up"));
  const imgs = document.querySelectorAll(".mo-work__img, .mo-fig, .mo-bird__p, .mo-reel--still, .mo-post__img, .mood__btn, .story-feature img, .mo-cover");
  imgs.forEach((m, k) => { m.classList.add("mo-img"); });
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  heads.forEach((h) => io.observe(h)); imgs.forEach((m) => io.observe(m));
  // 4 Scroll-gekoppelt
  const gi = document.querySelectorAll(".mo-giant > span");
  gi.forEach((s, k) => s.setAttribute("data-px", `x:${k % 2 ? 1 : -1}`));
  if (!matchMedia("(max-width: 760px)").matches) document.querySelectorAll(".mo-bird__p").forEach((p, k) => p.setAttribute("data-px", `y:${[-1, 0.6, -0.4][k] || 0}`));
  
  const px = [...document.querySelectorAll("[data-px]")].map((el) => { const [ax, f] = el.getAttribute("data-px").split(":"); return { el, ax, f: parseFloat(f) }; });
  const marqs = document.querySelectorAll(".mo-marq");
  let lastY = scrollY, vel = 0, tick = false;
  const run = () => {
    tick = false;
    const vh = innerHeight;
    px.forEach(({ el, ax, f }) => {
      const r = el.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)); // -1 oben … 1 unten
      el.style.transform = ax === "x" ? `translate3d(${(p * f * 9).toFixed(2)}vw,0,0)` : `translate3d(0,${(p * f * 60).toFixed(1)}px,0)`;
    });
    const y = scrollY; vel = vel * 0.8 + (y - lastY) * 0.2; lastY = y;
    const sk = Math.max(-8, Math.min(8, vel * 0.25));
    marqs.forEach((m) => { m.style.transform = `skewX(${(-sk).toFixed(2)}deg)`; });
    if (Math.abs(vel) > 0.1) { tick = true; requestAnimationFrame(run); }
  };
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
  run();
})();

/* Intro: B3DE steigt Buchstabe für Buchstabe, dann hebt sich der Vorhang */
(() => {
  const root = document.documentElement;
  if (!root.classList.contains("mo-pre")) return;
  try { sessionStorage.setItem("b3-intro", "1"); } catch (e) {}
  const ov = document.createElement("div");
  ov.className = "mo-ov"; ov.setAttribute("aria-hidden", "true");
  ov.innerHTML = '<div class="mo-ov__w">' + "B3DE".split("").map((c, i) => `<span style="--i:${i}">${c}</span>`).join("") + '</div><div class="mo-ov__c"><span>Marken, für die man einsteht</span><span>Studio in Sonneberg</span></div><i class="mo-ov__bar"></i>';
  document.body.appendChild(ov);
  root.classList.remove("mo-pre");
  ov.insertAdjacentHTML("beforeend", '<span class="mo-ov__skip">(Klicken zum Überspringen)</span>');
  let done = false;
  const out = () => { if (done) return; done = true; ov.classList.add("out"); setTimeout(() => ov.remove(), 1100); removeEventListener("keydown", out); };
  ov.addEventListener("click", out); addEventListener("keydown", out); addEventListener("wheel", out, { once: true, passive: true });
  setTimeout(out, 1500);
})();

/* Startseite: Showreel wächst beim Scrollen, Arbeiten fahren seitlich durch */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const reel = document.querySelector(".mo-reel[data-show]");
  const slides = reel && reel.querySelector(".mx-show__slides");
  if (reel) reel.classList.add("mo-grow");
  let hs = null;
  const sec = document.querySelector("#arbeiten");
  if (sec && sec.querySelector(".mo-works") && document.body.classList.contains("mx-home") && matchMedia("(min-width: 1000px)").matches) {
    const grid = sec.querySelector(".mo-works"), head = sec.querySelector(".mo-headrow");
    const n = grid.querySelectorAll(".mo-work").length;
    const wrap = document.createElement("div"); wrap.className = "mo-hs";
    const pin = document.createElement("div"); pin.className = "mo-hs__pin";
    const foot = document.createElement("div"); foot.className = "mo-hs__foot";
    foot.innerHTML = `<span class="mo-hs__count">(01 / ${String(n).padStart(2, "0")})</span><span class="mo-hs__bar"><i></i></span><span class="mo-hs__count">(Scroll)</span>`;
    grid.classList.add("mo-works--row");
    const all = document.createElement("a"); all.className = "mo-work mo-work--all"; all.href = "work.html";
    all.innerHTML = '<span class="mo-work__img"><span class="mo-all__t">Alle<br>Case<br>Studies</span><span class="mo-all__a" aria-hidden="true">→</span></span><span class="mo-work__cap"><span><b>Alle Projekte</b><span>Strategie, Design und Umsetzung</span></span><em>(07)</em></span>';
    grid.appendChild(all);
    sec.style.padding = "0";
    sec.insertBefore(wrap, head); pin.append(head, grid, foot); wrap.append(pin);
    const size = () => { const dist = Math.max(0, grid.scrollWidth - innerWidth); wrap.style.height = `${dist + innerHeight}px`; return dist; };
    hs = { wrap, grid, bar: foot.querySelector("i"), cnt: foot.querySelector(".mo-hs__count"), n, dist: size() };
    addEventListener("resize", () => { hs.dist = size(); });
  }
  let busy = false;
  const run = () => {
    busy = false;
    const vh = innerHeight;
    if (reel) {
      const r = reel.getBoundingClientRect();
      const p = clamp(1 - r.top / (vh * 0.85));
      const ix = (1 - p) * 7, iy = (1 - p) * 6;
      reel.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}%)`;
      if (slides) slides.style.transform = `scale(${(1 + (1 - p) * 0.14).toFixed(3)})`;
    }
    if (hs) {
      const r = hs.wrap.getBoundingClientRect();
      const p = hs.dist ? clamp(-r.top / hs.dist) : 0;
      hs.grid.style.transform = `translate3d(${(-p * hs.dist).toFixed(1)}px,0,0)`;
      hs.bar.style.transform = `scaleX(${p.toFixed(4)})`;
      hs.cnt.textContent = `(${String(Math.min(hs.n, Math.floor(p * hs.n) + 1)).padStart(2, "0")} / ${String(hs.n).padStart(2, "0")})`;
    }
  };
  addEventListener("scroll", () => { if (!busy) { busy = true; requestAnimationFrame(run); } }, { passive: true });
  run();
})();

/* Hero: Projektbild folgt der Maus */
(() => {
  const hero = document.querySelector("body.mx-home .mo-hero");
  if (!hero || !matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const srcs = [...new Set([...document.querySelectorAll(".mx-show__slides img, .mo-work__img img, .mo-bird img")].map((i) => i.getAttribute("src")).filter(Boolean))];
  if (!srcs.length) return;
  const pk = document.createElement("div"); pk.className = "mo-peek"; pk.innerHTML = `<img alt="" src="${srcs[0]}">`;
  document.body.appendChild(pk);
  const img = pk.firstChild; let k = 0, x = 0, y = 0, tx = 0, ty = 0, on = false, timer = 0, raf = 0;
  const loop = () => { x += (tx - x) * 0.14; y += (ty - y) * 0.14; pk.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) rotate(${((tx - x) * 0.04).toFixed(2)}deg)`; raf = on || Math.abs(tx - x) > 0.5 ? requestAnimationFrame(loop) : 0; };
  hero.addEventListener("mouseenter", (e) => { if (!e.clientX && !e.clientY) return; on = true; x = tx = e.clientX; y = ty = e.clientY; pk.classList.add("on"); timer = setInterval(() => { k = (k + 1) % srcs.length; img.src = srcs[k]; }, 800); if (!raf) raf = requestAnimationFrame(loop); });
  hero.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
  hero.addEventListener("mouseleave", () => { on = false; pk.classList.remove("on"); clearInterval(timer); });
  addEventListener("scroll", () => { if (on) { on = false; pk.classList.remove("on"); clearInterval(timer); } }, { passive: true });
  hero.addEventListener("mousemove", () => { if (!on) { on = true; pk.classList.add("on"); clearInterval(timer); timer = setInterval(() => { k = (k + 1) % srcs.length; img.src = srcs[k]; }, 800); if (!raf) raf = requestAnimationFrame(loop); } });
})();

/* Globen: bei reduzierter Bewegung anhalten */
if (matchMedia("(prefers-reduced-motion: reduce)").matches) document.querySelectorAll("svg.mo-globe").forEach((s) => { try { s.pauseAnimations(); } catch (e) {} });

/* Grafik-Set: Lesefortschritt, Text-Kreis, Sticker, Kachel-Codes */
(() => {
  // Lesefortschritt (Verlauf violett → grün)
  const bar = document.createElement("i"); bar.className = "mo-progress"; bar.setAttribute("aria-hidden", "true"); document.body.appendChild(bar);
  let t = false;
  const upd = () => { t = false; const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h).toFixed(4) : 0})`; };
  addEventListener("scroll", () => { if (!t) { t = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  // Text-Kreis statt "(Scroll)"
  const target = document.querySelector("#arbeiten, .mo-sec, .mo-lsec, main > section:nth-of-type(2)");
  document.querySelectorAll(".mo-hero__foot .mo-label").forEach((l) => {
    if (!/scroll/i.test(l.textContent)) return;
    const a = document.createElement("a"); a.className = "mo-badge"; a.href = target && target.id ? "#" + target.id : "#main"; a.setAttribute("aria-label", "Weiter scrollen");
    a.innerHTML = '<svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="mo-c" d="M60 60m-48 0a48 48 0 1 1 96 0a48 48 0 1 1-96 0"/></defs><text><textPath href="#mo-c">Scroll ✳ B3DE ✳ Scroll ✳ B3DE ✳ </textPath></text></svg><svg class="mo-badge__c" viewBox="0 0 100 100" aria-hidden="true" style="position:static;animation:none"><path d="M46 8h8v74l22-22 6 6-32 32-32-32 6-6 22 22z"/></svg>';
    if (!a.getAttribute("href").startsWith("#main")) a.addEventListener("click", (e) => { const el = document.querySelector(a.getAttribute("href")); if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth" }); } });
    l.replaceWith(a);
  });
  // Hochkant-Codes auf Projektkacheln
  document.querySelectorAll(".mo-work:not(.mo-work--all) .mo-work__img").forEach((im, k) => {
    const c = document.createElement("span"); c.className = "mo-code"; c.setAttribute("aria-hidden", "true");
    c.innerHTML = `<b>${String(k + 1).padStart(3, "0")}</b>B3DE / 2026 / ${(im.closest(".mo-work").querySelector("em") || { textContent: "" }).textContent.replace(/[()]/g, "")}`;
    im.appendChild(c);
  });
})();

/* Drehende Weltkugel mit Standorten (lädt d3-geo erst bei Sichtbarkeit) */
(() => {
  const fig = document.querySelector("[data-globe]");
  if (!fig || !("IntersectionObserver" in window)) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = () => {
    const d3 = window.d3, topo = window.topojson, W = window.B3_WORLD;
    if (!d3 || !topo || !W) return;
    fig.classList.add("is-globe");
    const cv = fig.querySelector("canvas"), ctx = cv.getContext("2d");
    const land = topo.feature(W, W.objects.countries);
    const de = land.features.find((f) => f.properties.name === "Germany");
    // Österreich wird nicht mehr hervorgehoben (nur Studio Sonneberg)
    const borders = topo.mesh(W, W.objects.countries, (a, b) => a !== b);
    const pins = [["SONNEBERG", 11.17, 50.36]];
    const proj = d3.geoOrthographic().clipAngle(90);
    const path = d3.geoPath(proj, ctx);
    const grat = d3.geoGraticule10();
    let size = 0, dpr = 1;
    const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); size = fig.clientWidth; cv.width = size * dpr; cv.height = size * dpr; cv.style.height = size + "px"; proj.translate([size / 2, size / 2]).scale(size / 2 - 4); };
    resize(); addEventListener("resize", resize);
    const target = [-10.5, -49.5]; // Deutschland vorn
    let lam = 0, phi = -22, visible = true, dragging = false, last = 0, spin = 0, base = 1;
    const ink = "#0a0a0a", bg = "#f2f2f2", acc = "#00ff38";
    const ease = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const draw = (now) => {
      // Scroll-Fortschritt: 0 = ganze Kugel dreht sich, 1 = Zoom auf Deutschland
      const r = fig.getBoundingClientRect(), vh = innerHeight;
      const raw = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.95)));
      const e = ease(raw);
      if (!dragging && !reduce && !window.B3_STILL) spin += 0.12 * (1 - e) + 0.01;
      const sl = target[0] + 180 + spin;
      let dl = ((target[0] - sl) % 360 + 540) % 360 - 180;
      lam = sl + dl * e; phi = -22 + (target[1] + 22) * e;
      const z = ease(Math.max(0, Math.min(1, (raw - .45) / .55)));
      base = 1 + 3.4 * z;
      const s = size, R = s / 2 - 4;
      const off = R * 0.24 * (1 - z), Rm = R * (0.76 + 0.24 * z), cx = s / 2 + off;
      proj.scale(Rm * base);
      const lab = z > .8;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, s, s);
      const W2 = "#f2f2f2";
      // Zweite Kugel (läuft gegenläufig, blendet beim Zoom aus)
      const ghost = 1 - Math.min(1, z * 1.6);
      if (ghost > 0.01) {
        const p2 = d3.geoOrthographic().clipAngle(90).translate([s / 2 - off * 1.05, s / 2]).scale(R * 0.74).rotate([-lam * 1.3 + 120, -18]);
        const g2 = d3.geoPath(p2, ctx);
        ctx.globalAlpha = ghost;
        ctx.beginPath(); g2({ type: "Sphere" }); ctx.fillStyle = "#050505"; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = W2; ctx.stroke();
        ctx.beginPath(); g2(grat); ctx.lineWidth = .7; ctx.strokeStyle = "rgba(242,242,242,.55)"; ctx.stroke();
        ctx.beginPath(); g2(land); ctx.fillStyle = "rgba(242,242,242,.85)"; ctx.fill();
        ctx.globalAlpha = 1;
      }
      proj.rotate([lam, phi]).translate([cx, s / 2]);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, s / 2, Rm, 0, 7); ctx.clip();
      ctx.beginPath(); path({ type: "Sphere" }); ctx.fillStyle = "#050505"; ctx.fill();
      ctx.shadowColor = "rgba(255,255,255,.55)"; ctx.shadowBlur = 6;
      ctx.beginPath(); path(grat); ctx.lineWidth = .8; ctx.strokeStyle = "rgba(242,242,242,.6)"; ctx.stroke();
      ctx.beginPath(); path(land); ctx.fillStyle = "rgba(242,242,242,.88)"; ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath(); path(borders); ctx.lineWidth = .5; ctx.strokeStyle = "rgba(5,5,5,.55)"; ctx.stroke();

      ctx.beginPath(); path(de); ctx.fillStyle = "#8b6bf0"; ctx.fill();
      // Route
      ctx.beginPath(); path({ type: "LineString", coordinates: pins.map((p) => [p[1], p[2]]) }); ctx.lineWidth = 2; ctx.strokeStyle = acc; ctx.stroke();
      const pulse = (now / 1600) % 1;
      pins.forEach(([n, lo, la], i) => {
        const c = d3.geoDistance([lo, la], [-lam, -phi]); if (c > Math.PI / 2) return;
        const [x, y] = proj([lo, la]);
        ctx.beginPath(); ctx.arc(x, y, 4 + ((pulse + i / 3) % 1) * 14, 0, 7); ctx.strokeStyle = `rgba(0,255,56,${1 - (pulse + i / 3) % 1})`; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fillStyle = acc; ctx.fill();
        if (lab) { ctx.globalAlpha = Math.min(1, (z - .8) / .15); const fs = Math.max(11, s / 46); ctx.font = `600 ${fs}px Inter, sans-serif`; const tw = ctx.measureText(n).width; const lx = i === 1 ? x + 12 : x - tw - 20, ly = i === 2 ? y + 14 : y - fs - 14; ctx.fillStyle = ink; ctx.fillRect(lx, ly, tw + 12, fs + 10); ctx.fillStyle = "#f2f2f2"; ctx.fillText(n, lx + 6, ly + fs + 2); ctx.globalAlpha = 1; }
      });
      ctx.restore(); ctx.beginPath(); ctx.arc(cx, s / 2, Rm, 0, 7); ctx.shadowColor = "rgba(255,255,255,.7)"; ctx.shadowBlur = 10; ctx.lineWidth = 1.6; ctx.strokeStyle = "#f2f2f2"; ctx.stroke(); ctx.shadowBlur = 0;
      if (visible) requestAnimationFrame(draw);
    };
    new IntersectionObserver((es) => es.forEach((en) => { const was = visible; visible = en.isIntersecting; if (visible && !was) requestAnimationFrame(draw); })).observe(fig);
    // Ziehen zum Drehen
    cv.addEventListener("pointerdown", (ev) => { dragging = true; last = ev.clientX; cv.setPointerCapture(ev.pointerId); });
    cv.addEventListener("pointermove", (ev) => { if (!dragging) return; spin += (ev.clientX - last) * 0.4; last = ev.clientX; });
    cv.addEventListener("pointerup", () => { dragging = false; });
    requestAnimationFrame(draw);
  };
  const io = new IntersectionObserver((es) => { if (!es.some((e) => e.isIntersecting)) return; io.disconnect();
    if (window.d3 && window.d3.geoOrthographic) return start();
    const sc = document.createElement("script"); sc.src = "assets/globe/globe-lib.js"; sc.onload = start; document.head.appendChild(sc);
  }, { rootMargin: "400px 0px" });
  io.observe(fig);
})();

/* UX: Tastatur in der horizontalen Projektreihe, Kugel beschriften, externe Links */
(() => {
  const hs = document.querySelector(".mo-hs");
  if (hs) hs.addEventListener("focusin", (e) => {
    const tiles = [...hs.querySelectorAll(".mo-work")]; const i = tiles.indexOf(e.target.closest(".mo-work")); if (i < 0) return;
    const r = hs.getBoundingClientRect(); const dist = hs.offsetHeight - innerHeight;
    scrollTo({ top: scrollY + r.top + dist * (i / Math.max(1, tiles.length - 1)), behavior: "smooth" });
  });
  const g = document.querySelector("[data-globe]"); if (g) { g.setAttribute("role", "img"); g.setAttribute("aria-label", "Weltkugel mit dem Studio in Sonneberg"); }
  document.querySelectorAll('a[target="_blank"]').forEach((a) => { if (!/noopener/.test(a.rel)) a.rel = (a.rel + " noopener").trim(); if (!a.querySelector(".sr")) a.insertAdjacentHTML("beforeend", '<span class="sr"> (öffnet in neuem Tab)</span>'); });
})();

/* eBook-Cover: Sticker lassen sich verschieben */
(() => {
  const box = document.querySelector("[data-stickers]"); if (!box) return;
  box.querySelectorAll(".mo-st").forEach((st) => {
    let sx = 0, sy = 0, ox = 0, oy = 0, on = false;
    st.addEventListener("pointerdown", (e) => { on = true; st.setPointerCapture(e.pointerId); st.classList.add("is-drag"); sx = e.clientX; sy = e.clientY; ox = st.offsetLeft; oy = st.offsetTop; st.style.animation = "none"; });
    st.addEventListener("pointermove", (e) => { if (!on) return; const W = box.clientWidth, H = box.clientHeight; st.style.left = Math.max(-5, Math.min(95, (ox + e.clientX - sx) / W * 100)) + "%"; st.style.top = Math.max(0, Math.min(95, (oy + e.clientY - sy) / H * 100)) + "%"; });
    const up = () => { on = false; st.classList.remove("is-drag"); };
    st.addEventListener("pointerup", up); st.addEventListener("pointercancel", up);
  });
})();

/* Markenworkshop: Tagesablauf läuft mit, Kompass füllt sich */
(() => {
  const mw = document.querySelector(".mw"); if (!mw) return;
  const steps = [...mw.querySelectorAll(".mw-step")], fields = [...mw.querySelectorAll(".mw-f")], line = mw.querySelector(".mw__line i");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const set = (p) => {
    const n = Math.round(p * (steps.length - 1));
    steps.forEach((s, i) => s.classList.toggle("on", i <= n));
    fields.forEach((f) => f.classList.toggle("on", n >= +f.dataset.at));
    if (line) line.style.setProperty("--p", p.toFixed(3));
    mw.classList.toggle("done", n >= steps.length - 1);
  };
  if (reduce) return set(1);
  let t = false;
  const run = () => { t = false; const r = mw.querySelector(".mw__day").getBoundingClientRect(); const p = Math.max(0, Math.min(1, (innerHeight * 0.62 - r.top) / r.height)); set(p); };
  addEventListener("scroll", () => { if (!t) { t = true; requestAnimationFrame(run); } }, { passive: true }); run();
})();

/* Unterseiten: hochkant gesetzte Abschnittsnamen + Kicker */
(() => {
  if (!document.body.classList.contains("mx-legacy")) return;
  const rail = (t) => { const r = document.createElement("span"); r.className = "hb-rail"; r.setAttribute("aria-hidden", "true"); r.innerHTML = `<span></span><i></i>`; r.firstChild.textContent = t; return r; };
  document.querySelectorAll("main .mo-lsec, main .mo-sec.mo-manifest, main .mo-sec.mo-think").forEach((s) => {
    if (s.querySelector(":scope > .hb-rail")) return;
    const h = s.querySelector(".mo-lh2") || s.querySelector(".mo-think__l") || s.querySelector(".mo-label");
    const t = h ? h.textContent.replace(/[()]/g, "").replace(/\.$/, "").trim() : "";
    if (t) s.prepend(rail(t.length > 22 ? t.slice(0, 22) + "…" : t));
    const lab = s.querySelector(".mo-lhead > .mo-label");
    if (lab) { const k = document.createElement("span"); k.className = "hb-kick"; const pg = (document.querySelector(".mo-hero .mo-label, .mo-lhero__top .mo-label") || { textContent: "" }).textContent.replace(/[()]/g, "").trim(); k.textContent = "/ " + lab.textContent.replace(/[()]/g, "").trim() + (pg ? " — " + pg : ""); s.querySelector(".mo-lhead > div, .mo-lhead > .mo-lh2")?.before?.(k); }
  });
})();

/* Hochformat-Felder: Laufband, Buchstaben, Schreibmaschine */
(() => {
  const bird = document.querySelector(".mo-bird"); if (!bird) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Feld 1: Buchstaben einzeln
  const v = bird.querySelector(".mo-bird__v--s");
  if (v) v.innerHTML = [...v.textContent].map((c, k) => `<span style="--k:${k}">${c}</span>`).join("");
  // Feld 2: senkrechtes Endlos-Laufband
  const w = bird.querySelector(".mo-bird__p--white");
  const lock = w && w.querySelector(".mo-lock");
  if (w && lock) { lock.remove(); const m = document.createElement("div"); m.className = "mo-vmarq"; m.setAttribute("aria-hidden", "true"); m.innerHTML = `<div class="mo-vmarq__t">${"<span>B3DE</span>".repeat(8)}</div>`; w.prepend(m); }
  // Feld 3: Schreibmaschine
  const t = bird.querySelector(".mo-bird__v--txt");
  let typed = false;
  const full = t ? t.innerText.replace(/\r/g, "") : "";
  const type = () => {
    if (!t || typed) return; typed = true;
    if (reduce) return;
    t.setAttribute("aria-label", full.replace(/\n/g, " "));
    t.innerHTML = '<span class="mo-ty"></span><i class="mo-cur"></i>';
    const out = t.firstChild; let i = 0;
    const step = () => { out.textContent = full.slice(0, ++i); if (i < full.length) setTimeout(step, full[i - 1] === "\n" ? 260 : 55); };
    setTimeout(step, 900);
  };
  if (!("IntersectionObserver" in window)) { bird.classList.add("in-view"); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { bird.classList.add("in-view"); type(); io.disconnect(); } }), { threshold: 0.3 });
  io.observe(bird);
})();

/* Showreel: Projekte im Foto-Feld, wechselnde Claims */
(() => {
  const bird = document.querySelector(".mo-bird"); if (!bird) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fig = bird.querySelector(".mo-bird__p--img");
  const items = [...document.querySelectorAll(".mo-works .mo-work[href^='projekt-'], .hb-grid .hb-card")].map((a) => {
    const img = a.querySelector("img"); if (!img) return null;
    return { src: img.getAttribute("src"), href: a.getAttribute("href"), name: (a.querySelector(".mo-work__cap b, .hb-card__cap b") || {}).textContent || "", cat: ((a.querySelector("em") || {}).textContent || "").replace(/[()]/g, "") };
  }).filter(Boolean);
  const extra = [["assets/runclub/merch.webp", "projekt-runclub.html", "Run Club"], ["assets/taeubert/visitenkarten.webp", "projekt-taeubert.html", "Täubert"], ["assets/crea-response/brandbook.webp", "projekt-crea-response.html", "Crea Response"], ["assets/runclub/haltestelle.webp", "projekt-runclub.html", "Run Club"], ["assets/taeubert/flyer-boxenstopp.webp", "projekt-taeubert.html", "Täubert"], ["assets/crea-response/recruiting.webp", "projekt-crea-response.html", "Crea Response"]].map(([src, href, name]) => ({ src, href, name }));
  const seen = new Set(); const list = items.concat(extra).filter((x) => !seen.has(x.src) && seen.add(x.src)).slice(0, 8);
  let paused = false; bird.addEventListener("mouseenter", () => paused = true); bird.addEventListener("mouseleave", () => paused = false);
  if (fig && list.length > 1) {
    const old = fig.querySelector("img"); if (old) old.remove();
    const DUR = 3800;
    const a = document.createElement("a"); a.className = "mo-reel3"; a.href = list[0].href;
    a.innerHTML = list.map((x, i) => `<img src="${x.src}" alt="${x.name}" loading="lazy" decoding="async"${i === 0 ? ' class="on"' : ""}>`).join("") +
      `<span class="mo-reel3__cap"><span data-n>01 / ${String(list.length).padStart(2, "0")}</span><span data-name>${list[0].name}</span></span>` +
      `<span class="mo-reel3__bar" style="--dur:${DUR}ms">${list.map(() => "<i><b></b></i>").join("")}</span><span class="mo-reel3__go">Zum Projekt →</span>`;
    fig.prepend(a);
    const imgs = a.querySelectorAll("img"), bars = a.querySelectorAll(".mo-reel3__bar i"), n = a.querySelector("[data-n]"), nm = a.querySelector("[data-name]");
    let k = 0, t0 = performance.now(), acc = 0;
    const show = (i) => {
      imgs.forEach((im, j) => im.classList.toggle("on", j === i));
      bars.forEach((b, j) => { b.classList.toggle("done", j < i); b.classList.remove("run"); });
      void bars[i].offsetWidth; if (!reduce) bars[i].classList.add("run"); else bars[i].classList.add("done");
      n.textContent = `${String(i + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`; nm.textContent = list[i].name; a.href = list[i].href;
    };
    show(0);
    let last = performance.now();
    const tick = (now) => { const dt = now - last; last = now; if (!paused && !document.hidden) acc += dt; if (acc >= DUR) { acc = 0; k = (k + 1) % list.length; show(k); } requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  // Wechselnde Claims im schwarzen Feld
  const t = bird.querySelector(".mo-bird__v--txt");
  if (t && !reduce) {
    const claims = ["Finde die Stimme\ndeiner Marke", "Mutig. Klar.\nEigen.", "Klarheit statt\nLautstärke", "Strategie, die\nman versteht"];
    t.setAttribute("aria-label", claims.map((c) => c.replace("\n", " ")).join(" · "));
    const run = () => {
      const out = t.querySelector(".mo-ty"); if (!out) return setTimeout(run, 400);
      let ci = 0, i = claims[0].length, dir = -1;
      const step = () => {
        if (paused) return setTimeout(step, 200);
        const c = claims[ci];
        if (dir < 0) { i--; out.textContent = c.slice(0, Math.max(0, i)); if (i <= 0) { dir = 1; ci = (ci + 1) % claims.length; return setTimeout(step, 350); } return setTimeout(step, 28); }
        const n2 = claims[ci]; i++; out.textContent = n2.slice(0, i); if (i >= n2.length) { dir = -1; return setTimeout(step, 2600); } setTimeout(step, n2[i - 1] === "\n" ? 220 : 55);
      };
      setTimeout(step, 4200);
    };
    run();
  }
})();

/* Showreel mobil: Punkte unter der Wischreihe */
(() => {
  const bird = document.querySelector(".mo-bird"); if (!bird) return;
  const ps = [...bird.querySelectorAll(".mo-bird__p")];
  const dots = document.createElement("div"); dots.className = "mo-bird__dots"; dots.setAttribute("aria-hidden", "true");
  dots.innerHTML = ps.map((_, i) => `<i${i ? "" : ' class="on"'}></i>`).join(""); bird.after(dots);
  const ds = dots.querySelectorAll("i");
  bird.addEventListener("scroll", () => { const c = bird.scrollLeft + bird.clientWidth / 2; let best = 0, bd = 1e9; ps.forEach((p, i) => { const d = Math.abs(p.offsetLeft + p.offsetWidth / 2 - c); if (d < bd) { bd = d; best = i; } }); ds.forEach((d, i) => d.classList.toggle("on", i === best)); }, { passive: true });
  if (matchMedia("(max-width: 760px)").matches) ps.forEach((p) => p.removeAttribute("data-px"));
})();

/* Showreel (Hochburg-Aufbau): Feld mit Kreis-Cursor, Play startet animierte Szenen */
(() => {
  const box = document.querySelector(".hr-reel__box"); if (!box) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = box.querySelector(".hr-reel__stage"), cur = box.querySelector(".hr-reel__cur"), lbl = box.querySelector("[data-lbl]"), curLbl = cur.querySelector("span");
  const tc = box.querySelector("[data-tc]"), nm = box.querySelector("[data-nm]"), bar = box.querySelector(".hr-reel__bar b");
  const L = (w) => [...w].map((c, i) => `<span style="--k:${i}"><b>${c}</b></span>`).join("");
  const notes = [["Haltung", 18, 28, -6, "y"], ["Warum?", 44, 22, 4, "w"], ["Zielgruppe", 72, 30, -3, "g"], ["Werte", 26, 56, 5, "w"], ["Stimme", 52, 50, -4, "y"], ["Mut", 76, 60, 7, "w"], ["Klarheit", 40, 78, -2, "g"]];
  const dots = [[24, 66], [34, 58], [30, 74], [62, 70], [70, 62], [18, 40], [40, 30]];
  const scenes = [
    { c: "logo", n: "Logoanimation", d: 2600, h: `<div class="s-logo">${L("B3DE")}</div><i class="s-logo__bar"></i>` },
    { c: "claim", n: "B3DE — Haltung", d: 3200, h: `<p class="s-claim"><span>Marken bauen</span><span>mit Haltung</span><span>und Leidenschaft.</span></p><b class="s-claim__v">B3DE</b><i class="s-claim__st"></i>` },
    { c: "mono", l: 1, n: "Logoanimation — Signet", d: 2600, h: `<svg class="s-mono__ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="62" pathLength="1"/></svg><svg class="s-mono__txt" viewBox="0 0 200 200"><defs><path id="hr-c" d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0"/></defs><text><textPath href="#hr-c">B3DE ✳ BRANDING ✳ STRATEGIE ✳ DESIGN ✳ HALTUNG ✳</textPath></text></svg><b class="s-mono__b">B3</b>` },
    { c: "match", n: "Mockups — Signet", d: 3960, cut: 360, cuts: [
      ["wall", "#8e8e8e", 1], ["pill", "#fff"], ["cards", "#fff", 1], ["tote", "#0a0a0a", 1], ["wall s-m--d", "#d0d0d0"], ["icons", "#fff"],
      ["tote s-m--d", "#f2f2f2"], ["book", "#fff", 1], ["cards s-m--p", "#fff", 1], ["book s-m--p", "#fff", 1], ["pill s-m--p", "#0a0a0a", 1]] },
    { c: "brands", n: "Mockups — med.aesthetic · Täubert", d: 4800, cut: 400, imgs: [
      ["assets/medaesthetic/mockup-schild.webp", 1], ["assets/medaesthetic/mockup-pill.webp", 1], ["assets/medaesthetic/mockup-karten.webp", 1], ["assets/medaesthetic/mockup-tasche.webp", 1], ["assets/medaesthetic/mockup-broschuere.webp", 1], ["assets/medaesthetic/mockup-box.webp", 1],
      ["assets/taeubert/mockup-fassade.webp", 1], ["assets/taeubert/mockup-pill.webp"], ["assets/taeubert/mockup-karten.webp"], ["assets/taeubert/mockup-tasche.webp"], ["assets/taeubert/mockup-tor.webp"], ["assets/taeubert/mockup-flyer.webp", 1]] },
    { c: "notes", n: "Markenworkshop — Ideenwand", d: 2800, h: notes.map(([w, x, y, r, col], k) => `<span class="s-note s-note--${col}" style="--x:${x};--y:${y};--r:${r}deg;--k:${k}">${w}</span>`).join("") + `<svg class="s-notes__ring" viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse cx="18" cy="28" rx="13" ry="9" pathLength="1"/></svg>` },
    { c: "phone", n: "Mockup — App", d: 2600, h: `<div class="s-phone"><div class="s-phone__scr"><div class="s-phone__in"><b class="s-phone__logo">B3DE</b><p>Marken, für die man einsteht.</p>${["Strategie", "Identität", "Workshop", "Kampagne", "Wissen", "Kontakt"].map((x, i) => `<span class="s-phone__card${i % 3 === 1 ? " s-phone__card--g" : ""}"><b>0${i + 1}</b>${x}</span>`).join("")}</div></div></div>` },
    { c: "words", l: 1, n: "B3DE — Haltung", d: 1900, h: `<p class="s-words"><span>Mutig.</span><span>Klar.</span><span>Eigen.</span></p>` },
    { c: "compass", l: 1, n: "Markenworkshop — Positionierung", d: 2800, h: `<div class="s-comp"><i class="s-comp__x"></i><i class="s-comp__y"></i><em class="t">mutig</em><em class="b">vorsichtig</em><em class="l">klassisch</em><em class="r">modern</em>${dots.map(([x, y], k) => `<span class="s-comp__d" style="--x:${x};--y:${y};--k:${k}"></span>`).join("")}<span class="s-comp__me"><b>B3DE</b></span></div>` },
    { c: "poster", l: 1, n: "Mockup — Plakate", d: 2600, h: `<div class="s-posters"><div class="s-poster s-poster--b"><b>B3DE</b><span>b3de.de</span></div><div class="s-poster s-poster--g"><b>Mutig.<br>Klar.<br>Eigen.</b></div><div class="s-poster s-poster--w"><i>✳</i><span>Marken, für die man einsteht</span></div></div>` },
    { c: "day", n: "Markenworkshop — Ablauf", d: 3000, h: `<p class="s-day__t">Markenworkshop <span>· 1 Tag</span></p><div class="s-day"><i class="s-day__line"><b></b></i>${[["09:00", "Kick-off"], ["11:00", "Werte"], ["14:00", "Positionierung"], ["16:30", "Stimme"]].map(([a, b], k) => `<span class="s-day__s" style="--k:${k}"><em>${a}</em><b>${b}</b></span>`).join("")}</div>` },
    { c: "guide", l: 1, n: "Mockup — Brand Guidelines", d: 2700, h: `<div class="s-guide"><div class="s-guide__type"><b>Aa</b><span>Helvetica Bold<br>Inter Regular</span></div><div class="s-guide__sw">${[["#0a0a0a", "Schwarz"], ["#f2f2f2", "Papier"], ["#00ff38", "Signal"], ["var(--grad)", "Verlauf"]].map(([c, n], k) => `<span style="--c:${c};--k:${k}"><em>${n}</em></span>`).join("")}</div></div>` },
    { c: "grid", n: "Logoanimation — Varianten", d: 2400, h: `<div class="s-grid">${["s-t--b", "s-t--w", "s-t--g", "s-t--o"].map((m, k) => `<span class="s-t ${m}" style="--k:${k}"><b>${k === 3 ? "B3" : "B3DE"}</b></span>`).join("")}</div>` },
    { c: "end", n: "B3DE — Showreel 26", d: 3000, h: `<div class="s-end"><b>B3DE</b><span>Showreel 26 — b3de.de</span></div>` },
  ];
  const MK = {
    wall: '<i class="w-pil"></i><span class="w-plate"></span>',
    pill: '<span class="p-pill"></span>',
    cards: '<div class="c-iso">' + ["a", "k", "a", "w", "m", "w", "k", "a", "k"].map((x) => `<span class="c-c c-c--${x}">${x === "w" ? "<b>Lena Muster</b><i>Strategie &amp; Branding</i>" : x === "k" ? "<b>Lena Muster</b><i>b3de.de</i>" : ""}</span>`).join("") + "</div>",
    tote: '<span class="t-bag"><em>Marken, für die man einsteht</em><em>b3de.de →</em></span>',
    icons: '<div class="i-row"><span></span><span></span><span class="i-me"></span><span></span><span></span></div>',
    book: '<span class="b-book"><i class="b-chev"></i><em>b3de.de</em></span>',
  };
  scenes.forEach((s) => { if (s.imgs) { s.cuts = s.imgs.map(([src, l]) => ["img", "", l]); s.h = s.imgs.map(([src]) => `<div class="s-m s-m--img"><img alt="" decoding="async" data-src="${src}"></div>`).join(""); } });
  const loadImgs = () => stage.querySelectorAll("img[data-src]").forEach((im) => { im.src = im.dataset.src; im.removeAttribute("data-src"); });
  scenes.forEach((s) => { if (s.cuts && !s.imgs) s.h = s.cuts.map(([k]) => `<div class="s-m s-m--${k}">${MK[k.split(" ")[0]]}</div>`).join("") + '<b class="s-mc__logo">B3DE</b>'; });
  const els = scenes.map((s) => { const el = document.createElement("div"); el.className = `hr-s hr-s--${s.c}`; el.innerHTML = s.h; stage.appendChild(el); return el; });
  const total = scenes.reduce((a, s) => a + s.d, 0);
  let on = false, t = 0, idx = -1, last = 0, raf = 0;
  const fmt = (ms) => { const s = Math.floor(ms / 1000), f = Math.floor((ms % 1000) / 40); return `00:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`; };
  const show = (i) => { if (i === idx) return; els.forEach((e) => { e.classList.remove("on"); e._k = -1; }); void stage.offsetWidth; els[i].classList.add("on"); box.classList.toggle("is-light", !!scenes[i].l); idx = i; nm.textContent = scenes[i].n; };
  const frame = (now) => {
    if (!on) return; t += Math.min(now - last, 100); last = now;
    if (t >= total) { stop(); return; }
    let acc = 0, i = 0; while (i < scenes.length - 1 && t >= acc + scenes[i].d) acc += scenes[i++].d;
    show(i);
    const sc = scenes[i];
    if (sc.cuts) {
      const k = Math.min(sc.cuts.length - 1, Math.floor((t - acc) / sc.cut)), el = els[i];
      if (el._k !== k) { el._k = k; el.querySelectorAll(".s-m").forEach((m, j) => m.classList.toggle("on", j === k)); const lg = el.querySelector(".s-mc__logo"); if (lg) lg.style.color = sc.cuts[k][1]; box.classList.toggle("is-light", !!sc.cuts[k][2]); }
    }
    tc.textContent = fmt(t); bar.style.transform = `scaleX(${(t / total).toFixed(4)})`;
    raf = requestAnimationFrame(frame);
  };
  const setLbl = () => { lbl.textContent = on ? "Pause" : (t > 0 ? "Weiter abspielen" : "Play Showreel"); curLbl.textContent = on ? "Pause" : "Play"; box.setAttribute("aria-label", on ? "Showreel pausieren" : "Showreel abspielen"); box.classList.toggle("is-paused", !on && t > 0); };
  const play = () => { loadImgs(); on = true; box.classList.add("is-on"); last = performance.now(); setLbl(); raf = requestAnimationFrame(frame); };
  const pause = () => { on = false; cancelAnimationFrame(raf); setLbl(); };
  function stop() { on = false; cancelAnimationFrame(raf); t = 0; idx = -1; els.forEach((e) => e.classList.remove("on")); box.classList.remove("is-on", "is-light"); bar.style.transform = "scaleX(0)"; tc.textContent = fmt(0); setLbl(); }
  const toggle = () => (on ? pause() : play());
  box.addEventListener("click", toggle);
  box.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } if (e.key === "Escape") stop(); });
  new IntersectionObserver(([e]) => { if (!e.isIntersecting && on) pause(); }, { threshold: 0.15 }).observe(box);
  // Kreis-Cursor mit Nachlauf
  let cx = 0, cy = 0, tx = 0, ty = 0, moving = false;
  const rest = () => { const r = box.getBoundingClientRect(); tx = r.width * 0.846; ty = r.height * 0.264; };
  rest(); cx = tx; cy = ty; cur.style.setProperty("--cx", cx + "px"); cur.style.setProperty("--cy", cy + "px");
  const follow = () => { cx += (tx - cx) * (reduce ? 1 : 0.18); cy += (ty - cy) * (reduce ? 1 : 0.18); cur.style.setProperty("--cx", cx.toFixed(1) + "px"); cur.style.setProperty("--cy", cy.toFixed(1) + "px"); if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3) requestAnimationFrame(follow); else moving = false; };
  const kick = () => { if (!moving) { moving = true; requestAnimationFrame(follow); } };
  box.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; const r = box.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; box.classList.add("is-in"); kick(); });
  box.addEventListener("pointerleave", () => { box.classList.remove("is-in"); rest(); kick(); });
  addEventListener("resize", () => { if (!box.classList.contains("is-in")) { rest(); kick(); } });
  // Logo im Ruhezustand: Buchstaben steigen beim Hereinscrollen auf
  const mark = box.querySelector(".hr-reel__mark");
  if (mark && !reduce) { mark.innerHTML = L(mark.textContent.trim()); new IntersectionObserver(([e], o) => { if (e.isIntersecting) { mark.classList.add("in"); o.disconnect(); } }, { threshold: 0.4 }).observe(box); } else if (mark) mark.classList.add("in");
  // Beim Hereinscrollen aufziehen
  if (!reduce) {
    let tk = false;
    const upd = () => { tk = false; const r = box.getBoundingClientRect(), vh = innerHeight; const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75))); box.style.setProperty("--p", p.toFixed(3)); };
    addEventListener("scroll", () => { if (!tk) { tk = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  }
})();

/* Projektseite: Mockup-Film */
(() => {
  const box = document.querySelector("[data-film]"); if (!box) return;
  const imgs = [...box.querySelectorAll("img")], n = box.querySelector(".hb-film__n"); if (imgs.length < 2) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let k = 0, vis = false, t = 0;
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) imgs.forEach((i) => i.loading = "eager"); }, { threshold: .25 }).observe(box);
  const step = (now) => {
    if (vis && !document.hidden && now - t > 420) { t = now; imgs[k].classList.remove("on"); k = (k + 1) % imgs.length; imgs[k].classList.add("on"); if (n) n.textContent = `${String(k + 1).padStart(2, "0")} / ${String(imgs.length).padStart(2, "0")}`; }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
})();

/* Handy: fester Anfrage-Knopf nach dem Einstieg */
(() => {
  if (/kontakt\.html$/.test(location.pathname)) return;
  const a = document.createElement("a"); a.className = "mx-sticky"; a.href = "kontakt.html"; a.innerHTML = "Kostenloses Erstgespräch <span aria-hidden=\"true\">→</span>";
  document.body.appendChild(a);
  const foot = document.querySelector(".mo-foot, footer"); let footIn = false;
  if (foot) new IntersectionObserver(([e]) => { footIn = e.isIntersecting; upd(); }).observe(foot);
  let tk = false;
  function upd() { tk = false; a.classList.toggle("on", scrollY > innerHeight * 0.9 && !footIn); }
  addEventListener("scroll", () => { if (!tk) { tk = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
})();

/* Animationen pausieren (WCAG 2.2.2) */
(() => {
  const root = document.documentElement;
  let still = false; try { still = localStorage.getItem("b3-still") === "1"; } catch (e) {}
  const b = document.createElement("button"); b.type = "button"; b.className = "mx-still";
  const set = (v) => { still = v; root.classList.toggle("is-still", v); window.B3_STILL = v; b.setAttribute("aria-pressed", String(v)); b.textContent = v ? "▶ Bewegung an" : "❚❚ Bewegung aus"; try { localStorage.setItem("b3-still", v ? "1" : "0"); } catch (e) {} };
  b.addEventListener("click", () => set(!still));
  const bar = document.querySelector(".mo-foot__bar") || document.body; bar.appendChild(b);
  set(still);
})();

/* Academy: Marken-Check, Lernpfade, Lesefortschritt */
(() => {
  const el = document.getElementById("b3-academy"); if (!el) return;
  let D; try { D = JSON.parse(el.textContent); } catch (e) { return; }
  const KEY = "b3-read";
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } };
  const put = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} };
  const here = location.pathname.split("/").pop();
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // Artikel als gelesen markieren (60 % gescrollt oder 25 s)
  const isArticle = here.startsWith("academy-") && D.paths.some((p) => p.items.some((i) => i.f === here)) || (here.startsWith("academy-") && document.querySelector(".mx-blk"));
  if (isArticle) {
    let done = get().includes(here);
    const mark = () => { if (done) return; done = true; const a = get(); if (!a.includes(here)) { a.push(here); put(a); } paint(); document.dispatchEvent(new CustomEvent("b3:read", { detail: here })); };
    setTimeout(mark, 25000);
    addEventListener("scroll", () => { const h = document.documentElement; if ((scrollY + innerHeight) / h.scrollHeight > 0.6) mark(); }, { passive: true });
    // Lernpfad-Box am Artikelende
    const path = D.paths.find((p) => p.items.some((i) => i.f === here));
    const anchor = document.querySelector('section[aria-label="Weiterlesen"]');
    let box;
    const paint = () => {
      if (!path || !anchor) return;
      const read = get(), idx = path.items.findIndex((i) => i.f === here);
      const n = path.items.filter((i) => read.includes(i.f)).length;
      const next = path.items.slice(idx + 1).concat(path.items.slice(0, idx)).find((i) => !read.includes(i.f));
      if (!box) { box = document.createElement("section"); box.className = "ac-next"; box.setAttribute("aria-label", "Lernpfad"); anchor.before(box); }
      box.innerHTML = `<div class="ac-next__in"><p class="mo-label">(Lernpfad · ${esc(path.name)})</p>
        <p class="ac-next__dots" aria-label="${n} von ${path.items.length} gelesen">${path.items.map((i) => `<a href="${i.f}" title="${esc(i.t)}" class="${read.includes(i.f) ? "on" : ""}${i.f === here ? " cur" : ""}"></a>`).join("")}</p>
        <p class="ac-next__n">${n} von ${path.items.length} Artikeln gelesen</p>
        ${next ? `<a class="ac-next__go" href="${next.f}"><span>Als Nächstes</span><b>${esc(next.t)}</b><em>→</em></a>` : `<p class="ac-next__done">✓ Lernpfad abgeschlossen. Stark! <a href="academy.html#lernpfade">Nächsten Pfad wählen →</a></p>`}</div>`;
    };
    paint();
    function toast() {
      const t = document.createElement("div"); t.className = "ac-toast"; t.setAttribute("role", "status");
      t.textContent = `✓ Gelesen · ${get().length} von ${D.total} Artikeln`; document.body.appendChild(t);
      requestAnimationFrame(() => t.classList.add("on")); setTimeout(() => { t.classList.remove("on"); setTimeout(() => t.remove(), 500); }, 3200);
    }
  }
  // Übersicht: Fortschritt, gelesene Artikel, Pfade
  const read = get();
  document.querySelectorAll(".mx-post[href]").forEach((a) => { if (read.includes(a.getAttribute("href"))) a.classList.add("is-read"); });
  const me = document.querySelector("[data-me]");
  if (me && read.length) { me.hidden = false; me.innerHTML = `<b>${read.length}</b> von ${D.total} Artikeln gelesen <i style="--p:${(read.length / D.total * 100).toFixed(1)}%"></i>`; }
  document.querySelectorAll("[data-path]").forEach((card) => {
    const p = D.paths.find((x) => x.id === card.dataset.path); if (!p) return;
    const n = p.items.filter((i) => read.includes(i.f)).length, next = p.items.find((i) => !read.includes(i.f));
    card.querySelectorAll(".ac-path__dots i").forEach((d, k) => d.classList.toggle("on", read.includes(p.items[k].f)));
    card.querySelector("[data-count]").textContent = `${n} / ${p.items.length} gelesen`;
    card.querySelector("[data-cta]").textContent = n === p.items.length ? "✓ Abgeschlossen" : n ? "Weiterlernen →" : "Pfad starten →";
    card.classList.toggle("is-done", n === p.items.length);
    if (next) card.href = next.f;
  });
  // Marken-Check
  const qz = document.querySelector("[data-quiz]"); if (!qz) return;
  const Q = D.quiz, ans = []; let k = 0;
  const qn = qz.querySelector("[data-qn]"), qq = qz.querySelector("[data-q]"), bar = qz.querySelector(".ac-quiz__bar b"), res = qz.querySelector("[data-res]"), btns = qz.querySelector(".ac-quiz__a");
  const show = () => { qn.textContent = `Frage ${k + 1} von ${Q.length}`; qq.textContent = Q[k].q; bar.style.transform = `scaleX(${k / Q.length})`; qq.classList.remove("in"); void qq.offsetWidth; qq.classList.add("in"); };
  btns.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]"); if (!b) return;
    ans[k] = +b.dataset.v; k++;
    if (k < Q.length) return show();
    bar.style.transform = "scaleX(1)";
    const score = ans.reduce((a, b) => a + b, 0), max = Q.length * 2;
    const lvl = score <= 3 ? ["Fundament legen", "Eure Marke hat Potenzial, aber noch kein festes Fundament. Startet mit den Grundlagen – oder legt es an einem Tag im Markenworkshop."]
      : score <= 7 ? ["Schärfen", "Die Basis steht, an einigen Stellen ist eure Marke noch unscharf. Mit den Artikeln unten schließt ihr die Lücken gezielt."]
      : ["Ausbauen", "Stark! Eure Marke ist klar und konsistent. Jetzt geht es darum, sie sichtbarer zu machen und im Team zu verankern."];
    const recs = []; Q.forEach((q, i) => { if (ans[i] < 2) q.rec.forEach((r) => { if (!recs.some((x) => x.f === r.f)) recs.push(r); }); });
    const weakest = Q[ans.indexOf(Math.min(...ans))].path, wp = D.paths.find((p) => p.id === weakest);
    qn.hidden = true; qq.hidden = true; btns.hidden = true; res.hidden = false;
    res.innerHTML = `<div class="ac-res__score" style="--p:${score / max}"><b>${score}</b><span>/ ${max}</span></div>
      <p class="mo-label">(Ergebnis)</p><h3>${lvl[0]}</h3><p>${lvl[1]}</p>
      ${recs.length ? `<p class="ac-res__l">Für euch empfohlen:</p><ul>${recs.slice(0, 5).map((r) => `<li><a href="${r.f}">${esc(r.t)} →</a></li>`).join("")}</ul>` : ""}
      <div class="ac-res__cta"><a class="mx-btn" href="${wp.items[0].f}">Lernpfad „${esc(wp.name)}“ starten</a><a class="mo-link" href="leistung-markenworkshop.html">Lieber gemeinsam: Markenworkshop →</a><button type="button" class="ac-res__again">Nochmal</button></div>`;
    try { localStorage.setItem("b3-check", String(score)); } catch (e) {}
    document.dispatchEvent(new CustomEvent("b3:check", { detail: score }));
    res.querySelector(".ac-res__again").addEventListener("click", () => { ans.length = 0; k = 0; qn.hidden = false; qq.hidden = false; btns.hidden = false; res.hidden = true; show(); });
  });
})();

/* Heute / In 6 Monaten */
(() => {
  const sw = document.querySelector(".mo-vs__sw"); if (!sw) return;
  const list = document.querySelector(".mo-vs__list");
  const set = (v) => { list.dataset.vsl = v; sw.dataset.on = v; sw.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.vs === v))); };
  sw.addEventListener("click", (e) => { const b = e.target.closest("button[data-vs]"); if (b) set(b.dataset.vs); });
  // Beim ersten Sichtkontakt automatisch einmal umschalten (Kontrast erleben)
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); setTimeout(() => { if (list.dataset.vsl === "a") set("b"); }, 2600); } }, { threshold: 0.55 }).observe(list);
  }
})();

/* Wert-Rechner */
(() => {
  const box = document.querySelector("[data-val]"); if (!box) return;
  const nf = new Intl.NumberFormat("de-DE");
  const i = (k) => +box.querySelector(`[data-i="${k}"]`).value, o = (k) => box.querySelector(`[data-o="${k}"]`);
  const res = box.querySelector("[data-res]"); let shown = 0, raf = 0;
  const calc = () => {
    const req = i("req"), val = i("val"), rate = i("rate") / 100, up = i("up") / 100;
    o("req").textContent = req; o("val").textContent = nf.format(val) + " €"; o("rate").textContent = Math.round(rate * 100) + " %"; o("up").textContent = "+" + Math.round(up * 100) + " %";
    box.querySelector('[data-i="up"]').closest("label").querySelector("span").textContent = `Wenn nur ${Math.round(up * 100)} % mehr passende Anfragen kommen …`;
    const target = Math.round(req * up * rate * val * 12);
    cancelAnimationFrame(raf); const from = shown, t0 = performance.now();
    const step = (now) => { const k = Math.min(1, (now - t0) / 500); shown = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3))); res.textContent = nf.format(shown) + " €"; if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  };
  box.addEventListener("input", calc); calc();
})();

/* Sanfter Hinweis beim Verlassen (einmal pro Besuch, nur Desktop) */
(() => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (/kontakt\.html$/.test(location.pathname)) return;
  let seen = false; try { seen = sessionStorage.getItem("b3-exit") === "1"; } catch (e) {}
  if (seen) return;
  const t0 = Date.now();
  const show = () => {
    if (seen || Date.now() - t0 < 12000) return; seen = true; try { sessionStorage.setItem("b3-exit", "1"); } catch (e) {}
    const d = document.createElement("div"); d.className = "ex"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", "Bevor ihr geht");
    d.innerHTML = `<div class="ex__card"><button type="button" class="ex__x" aria-label="Schließen">×</button><p class="mo-label">(Bevor ihr geht)</p><h2>Wie stark ist eure Marke wirklich?</h2><p>Fünf Fragen, 60 Sekunden, sofort ein ehrliches Ergebnis – kostenlos und ohne Anmeldung.</p><div class="ex__a"><a class="mx-btn" href="academy.html#marken-check">Marken-Check starten</a><button type="button" class="ex__no">Nein danke</button></div></div>`;
    document.body.appendChild(d); requestAnimationFrame(() => d.classList.add("on"));
    const close = () => { d.classList.remove("on"); setTimeout(() => d.remove(), 400); removeEventListener("keydown", esc); };
    const esc = (e) => { if (e.key === "Escape") close(); };
    d.addEventListener("click", (e) => { if (e.target === d || e.target.closest(".ex__x, .ex__no")) close(); });
    addEventListener("keydown", esc); d.querySelector(".mx-btn").focus();
  };
  document.addEventListener("mouseout", (e) => { if (!e.relatedTarget && e.clientY <= 0) show(); });
})();

/* Academy-Spiel: XP, Level, Abzeichen, Schnelltests, Profi-Tipps, Serie */
(() => {
  const el = document.getElementById("b3-academy"); if (!el) return;
  let D; try { D = JSON.parse(el.textContent); } catch (e) { return; }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const L = { get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const here = location.pathname.split("/").pop() || "index.html";
  const isAcad = here.startsWith("academy");
  const art = D.arts.find((a) => a.f === here);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const LEVELS = [[0, "Neugierig"], [50, "Entdecker:in"], [150, "Markendenker:in"], [300, "Strateg:in"], [500, "Markenprofi"], [800, "Markenmeister:in"]];
  const lvl = (xp) => { let i = 0; LEVELS.forEach((l, k) => { if (xp >= l[0]) i = k; }); const n = LEVELS[i + 1]; return { i, name: LEVELS[i][1], from: LEVELS[i][0], to: n ? n[0] : LEVELS[i][0] + 1, next: n ? n[1] : null }; };
  const TIPS = ["Sprecht euren Claim laut aus. Wenn ihr dabei Luft holen müsst, ist er zu lang.", "Testet euer Logo winzig klein – als Favicon zeigt sich, ob es wirklich trägt.", "Fragt fünf Kund:innen, warum sie euch gewählt haben. Die Antworten sind eure Positionierung.", "Eine Schriftfamilie mit zwei Schnitten reicht für fast alles.", "Schreibt Werte als Verhalten: nicht ‚ehrlich‘, sondern ‚Wir sagen Nein, wenn es nicht passt.‘", "Eine Akzentfarbe, sparsam eingesetzt, wird zum Signal.", "Prüft jede Überschrift: Würde ein Kunde das genau so sagen?", "Echte Teamfotos schlagen jedes Stockfoto. Vertrauen beginnt bei Gesichtern.", "Ein Moodboard mit drei klaren Richtungen spart zehn Korrekturschleifen.", "Euer Markenkern passt auf einen Bierdeckel – oder er ist noch nicht fertig.", "Wiederholt euch. Was euch langweilt, haben andere gerade erst bemerkt.", "Bevor ihr Neues gestaltet: Räumt erst auf, was schon da ist."];
  const PATHS = D.paths;
  const st = () => {
    const read = L.get("b3-read", []), quiz = L.get("b3-quiz", {}), tips = L.get("b3-tips", []), streak = L.get("b3-streak", { n: 0, last: "" });
    const good = Object.values(quiz).filter(Boolean).length;
    return { xp: L.get("b3-xp", 0), read, quiz, good, tips, streak, check: L.get("b3-check", null) !== null, golden: L.get("b3-golden", []).length > 0, kompass: L.get("b3-kompass", null) !== null, arch: L.get("b3-arch", null) !== null, cert: L.get("b3-cert", null) !== null, paths: PATHS.map((p) => p.items.every((i) => read.includes(i.f))) };
  };
  const BADGES = [
    ["b1", "Erster Artikel", "Den ersten Artikel gelesen", (s) => s.read.length >= 1],
    ["b5", "Fünf gelesen", "Fünf Artikel gelesen", (s) => s.read.length >= 5],
    ["b10", "Zehn gelesen", "Zehn Artikel gelesen", (s) => s.read.length >= 10],
    ["b25", "Halbzeit", "25 Artikel gelesen", (s) => s.read.length >= 25],
    ["b50", "Alles gelesen", "Alle Artikel gelesen", (s) => s.read.length >= D.total],
    ...PATHS.map((p, k) => ["p" + k, p.name, "Lernpfad abgeschlossen", (s) => s.paths[k]]),
    ["q1", "Erster Treffer", "Einen Schnelltest richtig gelöst", (s) => s.good >= 1],
    ["q10", "Quiz-Ass", "Zehn Schnelltests richtig gelöst", (s) => s.good >= 10],
    ["mc", "Selbsttest", "Den Marken-Check gemacht", (s) => s.check],
    ["s3", "Drei-Tage-Serie", "Drei Tage in Folge gelernt", (s) => s.streak.n >= 3],
    ["t6", "Tipp-Sammler:in", "Sechs Profi-Tipps gesammelt", (s) => s.tips.length >= 6],
    ["kk", "Kompass-Bauer:in", "Den eigenen Marken-Kompass erstellt", (s) => s.kompass],
    ["ar", "Archetyp entdeckt", "Den Archetypen-Test gemacht", (s) => s.arch],
    ["fs", "Marken-Führerschein", "Einen Lernnachweis erstellt", (s) => s.cert],
    ["gt", "Goldenes Ticket", "Ein goldenes Ticket gefunden", (s) => s.golden],
  ];
  // Konfetti
  const confetti = (n = 90, x = innerWidth / 2, y = innerHeight / 3) => {
    if (reduce) return;
    const c = document.createElement("canvas"); c.className = "gx-cf"; c.width = innerWidth; c.height = innerHeight; document.body.appendChild(c);
    const g = c.getContext("2d"), cols = ["#00ff38", "#6a1bff", "#0a0a0a", "#ffe94d", "#ff3fa4", "#ffffff"];
    const P = Array.from({ length: n }, () => ({ x, y, vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 4, r: Math.random() * 6 + 4, a: Math.random() * 6, va: (Math.random() - .5) * .4, c: cols[(Math.random() * cols.length) | 0] }));
    const t0 = performance.now();
    const f = (now) => { const k = now - t0; g.clearRect(0, 0, c.width, c.height);
      P.forEach((p) => { p.vy += .38; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - k / 1800); g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore(); });
      if (k < 1800) requestAnimationFrame(f); else c.remove(); };
    requestAnimationFrame(f);
  };
  // HUD
  let hud;
  const paintHud = () => {
    const s = st(), l = lvl(s.xp), pr = Math.min(1, (s.xp - l.from) / (l.to - l.from));
    if (!hud) { hud = document.createElement("a"); hud.className = "gx-hud"; hud.href = "academy.html#sammlung"; document.body.appendChild(hud); }
    hud.innerHTML = `<span class="gx-ring" style="--p:${pr}"><b>${l.i + 1}</b></span><span class="gx-hud__t"><b>${esc(l.name)}</b><i>${s.xp} XP${l.next ? ` · noch ${l.to - s.xp} bis ${esc(l.next)}` : ""}</i></span>${s.streak.n > 1 ? `<em title="Tage in Folge">✦ ${s.streak.n}</em>` : ""}`;
    hud.setAttribute("aria-label", `Level ${l.i + 1}, ${l.name}, ${s.xp} XP`);
  };
  const float = (txt) => { const f = document.createElement("span"); f.className = "gx-float"; f.textContent = txt; document.body.appendChild(f); setTimeout(() => f.remove(), 1600); };
  const pop = (cls, html, ms = 4200) => { const d = document.createElement("div"); d.className = cls; d.setAttribute("role", "status"); d.innerHTML = html; document.body.appendChild(d); requestAnimationFrame(() => d.classList.add("on")); const x = d.querySelector("[data-x]"); const cl = () => { d.classList.remove("on"); setTimeout(() => d.remove(), 500); }; if (x) x.addEventListener("click", cl); setTimeout(cl, ms); return d; };
  const checkBadges = () => {
    const s = st(), have = L.get("b3-badges", []); let fresh = [];
    BADGES.forEach(([id, t, d, ok]) => { if (!have.includes(id) && ok(s)) { have.push(id); fresh.push(t); } });
    if (fresh.length) { L.set("b3-badges", have); setTimeout(() => { confetti(120); pop("gx-badge", `<span class="gx-badge__i">★</span><span><small>Abzeichen freigeschaltet</small><b>${esc(fresh.join(" · "))}</b></span>`); }, 900); }
    paintColl();
  };
  const award = (xp, why) => {
    const before = lvl(L.get("b3-xp", 0)).i, nx = L.get("b3-xp", 0) + xp; L.set("b3-xp", nx);
    float(`+${xp} XP · ${why}`); paintHud();
    const after = lvl(nx);
    if (after.i > before) setTimeout(() => { confetti(160); pop("gx-lvl", `<button type="button" class="gx-x" data-x aria-label="Schließen">×</button><small>Level ${after.i + 1} erreicht</small><b>${esc(after.name)}</b><p>${after.next ? `Nächstes Ziel: ${esc(after.next)} bei ${after.to} XP.` : "Höchstes Level. Respekt!"}</p>`, 5000); }, 500);
    checkBadges();
  };
  window.B3G = { award, confetti, st, L, PATHS, esc, checkBadges };
  // Serie (einmal pro Tag)
  if (isAcad) {
    const d = new Date(), today = d.toISOString().slice(0, 10), y = new Date(d - 864e5).toISOString().slice(0, 10);
    const s = L.get("b3-streak", { n: 0, last: "" });
    if (s.last !== today) { const n = s.last === y ? s.n + 1 : 1; L.set("b3-streak", { n, last: today }); if (n > 1) setTimeout(() => award(5, `${n}-Tage-Serie`), 1500); }
    paintHud();
  }
  // Artikel: zuletzt gelesen merken, Tipp & XP beim Lesen
  if (art) {
    L.set("b3-last", here);
    document.addEventListener("b3:read", () => {
      award(10, "Artikel gelesen");
      const s = st(), left = TIPS.map((_, i) => i).filter((i) => !s.tips.includes(i));
      if (left.length) {
        const i = left[(Math.random() * left.length) | 0]; s.tips.push(i); L.set("b3-tips", s.tips);
        setTimeout(() => pop("gx-tip", `<button type="button" class="gx-x" data-x aria-label="Schließen">×</button><div class="gx-tip__card"><div class="gx-tip__back">?</div><div class="gx-tip__front"><small>Profi-Tipp ${s.tips.length} / ${TIPS.length} freigeschaltet</small><p>${esc(TIPS[i])}</p></div></div>`, 9000), 1400);
        checkBadges();
      }
      const p = PATHS.find((p) => p.items.some((it) => it.f === here));
      if (p && p.items.every((it) => s.read.includes(it.f))) setTimeout(() => { confetti(200); award(50, "Lernpfad geschafft"); }, 2600);
    });
    // Schnelltest
    const anchor = document.querySelector('section[aria-label="Weiterlesen"]');
    if (anchor) {
      const others = D.arts.filter((a) => a.f !== here && a.d !== art.d).sort(() => Math.random() - .5).slice(0, 2);
      const opts = [{ d: art.d, ok: true }, ...others.map((o) => ({ d: o.d, ok: false }))].sort(() => Math.random() - .5);
      const q = /\?$/.test(art.t) ? art.t : `Worum geht es bei „${art.t}“?`;
      const box = document.createElement("section"); box.className = "gx-quiz"; box.setAttribute("aria-label", "Schnelltest");
      const prev = L.get("b3-quiz", {})[here];
      box.innerHTML = `<div class="gx-quiz__in"><p class="mo-label">(Schnelltest · +5 XP)</p><h2>${esc(q)}</h2><div class="gx-quiz__o">${opts.map((o, k) => `<button type="button" data-ok="${o.ok ? 1 : 0}"><span>${"ABC"[k]}</span>${esc(o.d)}</button>`).join("")}</div><p class="gx-quiz__fb" aria-live="polite">${prev === undefined ? "" : prev ? "✓ Schon gelöst – stark." : "Beim letzten Mal knapp daneben. Neuer Versuch?"}</p></div>`;
      anchor.before(box);
      box.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-ok]"); if (!b || box.classList.contains("done")) return;
        const ok = b.dataset.ok === "1", fb = box.querySelector(".gx-quiz__fb"), quiz = L.get("b3-quiz", {});
        box.querySelectorAll("button").forEach((x) => x.classList.toggle("is-ok", x.dataset.ok === "1"));
        b.classList.add(ok ? "is-hit" : "is-miss"); box.classList.add("done");
        if (ok) { const first = !quiz[here]; quiz[here] = true; L.set("b3-quiz", quiz); fb.textContent = first ? "Richtig! +5 XP" : "Richtig!"; const r = b.getBoundingClientRect(); confetti(50, r.left + r.width / 2, r.top); if (first) award(5, "Schnelltest"); }
        else { if (quiz[here] === undefined) { quiz[here] = false; L.set("b3-quiz", quiz); } fb.innerHTML = 'Fast. Die richtige Antwort ist markiert – <button type="button" class="gx-again">nochmal</button>'; }
      });
      box.addEventListener("click", (e) => { if (e.target.closest(".gx-again")) { box.classList.remove("done"); box.querySelectorAll("button[data-ok]").forEach((x) => x.classList.remove("is-ok", "is-hit", "is-miss")); box.querySelector(".gx-quiz__fb").textContent = ""; } });
    }
  }
  document.addEventListener("b3:check", () => { if (!L.get("b3-check-xp", false)) { L.set("b3-check-xp", true); award(20, "Marken-Check"); } else checkBadges(); });
  // Übersicht: Sammlung, Statistik, Weiterlesen
  function paintColl() {
    const bx = document.querySelector("[data-badges]"); if (!bx) return;
    const s = st(), have = L.get("b3-badges", []), l = lvl(s.xp);
    bx.innerHTML = BADGES.map(([id, t, d]) => `<div class="gx-b ${have.includes(id) ? "on" : ""}"><span class="gx-b__i" aria-hidden="true">${have.includes(id) ? "★" : "?"}</span><b>${esc(t)}</b><small>${esc(d)}</small></div>`).join("");
    document.querySelector("[data-gstats]").innerHTML = `<div><b>${s.xp}</b><span>XP · Level ${l.i + 1} ${esc(l.name)}</span></div><div><b>${s.read.length}/${D.total}</b><span>Artikel gelesen</span></div><div><b>${s.good}</b><span>Schnelltests gelöst</span></div><div><b>${s.streak.n || 0}</b><span>Tage in Folge</span></div><div><b>${have.length}/${BADGES.length}</b><span>Abzeichen</span></div>`;
    document.querySelector("[data-tipcount]").textContent = `${s.tips.length} / ${TIPS.length}`;
    document.querySelector("[data-tips]").innerHTML = TIPS.map((t, i) => s.tips.includes(i) ? `<p class="gx-t on">${esc(t)}</p>` : `<p class="gx-t"><span>?</span>Lies einen Artikel, um diesen Tipp freizuschalten.</p>`).join("");
  }
  paintColl();
  const rs = document.querySelector("[data-resume]"), last = L.get("b3-last", null), la = last && D.arts.find((a) => a.f === last);
  if (rs && la) { rs.hidden = false; rs.innerHTML = `<a href="${la.f}"><small>Weiter, wo du aufgehört hast</small><b>${esc(la.t)}</b><em>→</em></a>`; }
  if (isAcad) setTimeout(checkBadges, 600);
})();
/* Mega-Menü Leistungen */
(function () {
  var t = document.querySelector('.mx-mega-t'), m = document.getElementById('mx-mega');
  if (!t || !m) return;
  var timer;
  function open() {
    clearTimeout(timer);
    if (!m.hidden) return;
    m.hidden = false; t.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { m.classList.add('is-open'); });
  }
  function close(now) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      m.classList.remove('is-open'); t.setAttribute('aria-expanded', 'false');
      setTimeout(function () { if (!m.classList.contains('is-open')) m.hidden = true; }, 220);
    }, now ? 0 : 220);
  }
  var wide = matchMedia('(min-width: 1101px) and (hover: hover)');
  t.addEventListener('mouseenter', function () { if (wide.matches) open(); });
  t.addEventListener('mouseleave', function () { close(); });
  m.addEventListener('mouseenter', function () { clearTimeout(timer); });
  m.addEventListener('mouseleave', function () { close(); });
  t.addEventListener('focus', function () { if (matchMedia('(min-width: 1101px)').matches) open(); });
  [t, m].forEach(function (el) {
    el.addEventListener('focusout', function (e) { if (!e.relatedTarget || (!m.contains(e.relatedTarget) && e.relatedTarget !== t)) close(true); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !m.hidden) { close(true); t.focus(); } });
  window.addEventListener('scroll', function () { if (!m.hidden && !m.matches(':hover')) close(true); }, { passive: true });
})();
/* Leistungs-Finder */
(function () {
  var G = {
    anfragen: [['leistung-webdesign.html', 'Website'], ['leistung-landingpages.html', 'Landingpages'], ['leistung-performance-marketing.html', 'Google & Meta Ads']],
    lokal: [['leistung-google-profil.html', 'Google-Profil & Bewertungen'], ['leistung-seo.html', 'Local SEO'], ['leistung-print.html', 'Print & Beschriftung']],
    shop: [['leistung-online-shop.html', 'Online-Shop'], ['leistung-email-marketing.html', 'Newsletter & E-Mail'], ['leistung-ki-content.html', 'KI-Content']],
    preise: [['leistung-markenstrategie.html', 'Markenstrategie'], ['leistung-brand-design.html', 'Brand Design'], ['leistung-art-direction.html', 'Foto & Art Direction']],
    team: [['leistung-employer-branding.html', 'Employer Branding'], ['leistung-landingpages.html', 'Karriere-Landingpage'], ['leistung-social-media.html', 'Social Media']],
    zeit: [['leistung-automatisierung.html', 'Termine & Automatisierung'], ['leistung-ki-assistent.html', 'KI-Assistent'], ['leistung-marketing-abo.html', 'Marketing-Abo']],
    ki: [['leistung-ki-workshop.html', 'KI-Workshop'], ['leistung-ki-assistent.html', 'KI-Assistent'], ['leistung-ki-sichtbarkeit.html', 'Sichtbar in ChatGPT']]
  };
  var PRE = { neu: ['leistung-markenworkshop.html', 'Markenworkshop'], alt: ['leistung-rebranding.html', 'Rebranding'] };
  var TXT = {
    Start: 'Ihr legt das Fundament: Positionierung, Design und erste Sichtbarkeit – in wenigen Wochen.',
    Auftritt: 'Euer Auftritt wird neu aufgestellt: Strategie, Design und Website aus einem Guss.',
    Wachstum: 'Ein Team, das jeden Monat dranbleibt – mit Plan, Umsetzung und Zahlen.',
    lernen: 'Ein Workshop bringt in kurzer Zeit Klarheit. Danach entscheidet ihr, was ihr selbst macht und was wir übernehmen.',
    gezielt: 'Eure Marke steht. Jetzt lohnen sich gezielte Leistungen für genau euer Ziel – ohne Paket.'
  };
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  document.querySelectorAll('[data-finder]').forEach(function (root) {
    var steps = root.querySelectorAll('.fd-step'), res = root.querySelector('.fd-res'), bar = root.querySelector('.fd-bar i'), a = {}, cur = 0;
    steps.forEach(function (st, i) {
      if (i > 0) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'fd-back'; b.textContent = '← Zurück';
        b.addEventListener('click', function () { show(i - 1); });
        st.appendChild(b);
      }
    });
    function show(i) {
      cur = i;
      steps.forEach(function (st, k) { st.hidden = k !== i; });
      res.hidden = i < steps.length;
      bar.style.transform = 'scaleX(' + Math.min(i, steps.length) / steps.length + ')';
      var f = i < steps.length ? steps[i].querySelector('.fd-opt') : res.querySelector('h3');
      if (f && root.dataset.touched) { f.setAttribute('tabindex', f.tabIndex < 0 ? '-1' : f.tabIndex); f.focus({ preventScroll: true }); }
    }
    root.addEventListener('click', function (e) {
      var o = e.target.closest('.fd-opt'); if (!o) return;
      root.dataset.touched = '1';
      a[o.dataset.k] = o.dataset.v;
      o.parentNode.querySelectorAll('.fd-opt').forEach(function (x) { x.setAttribute('aria-pressed', x === o ? 'true' : 'false'); });
      if (cur + 1 < steps.length) show(cur + 1); else { render(); show(steps.length); }
    });
    function render() {
      var pkg = null, key;
      if (a.mode === 'laufend') pkg = 'Wachstum';
      else if (a.mode === 'projekt') pkg = a.stage === 'neu' ? 'Start' : a.stage === 'alt' ? 'Auftritt' : null;
      var list = [];
      if (a.mode === 'lernen') list.push(a.goal === 'ki' ? ['leistung-ki-workshop.html', 'KI-Workshop'] : ['leistung-markenworkshop.html', 'Markenworkshop']);
      if (PRE[a.stage]) list.push(PRE[a.stage]);
      (G[a.goal] || []).forEach(function (x) { list.push(x); });
      var seen = {}; list = list.filter(function (x) { return seen[x[0]] ? false : (seen[x[0]] = 1); }).slice(0, 4);
      key = pkg || (a.mode === 'lernen' ? 'lernen' : 'gezielt');
      var head = pkg ? 'Paket ' + pkg : (a.mode === 'lernen' ? list[0][1] + ' als Einstieg' : 'Gezielte Leistungen');
      var sum = 'Empfehlung aus dem Leistungs-Finder: ' + head + ' – ' + list.map(function (x) { return x[1]; }).join(', ') + '.';
      res.innerHTML = '<p class="mo-label">(Eure Empfehlung)</p><h3>' + esc(head) + '</h3><p>' + TXT[key] + '</p>' +
        '<ul class="fd-list">' + list.map(function (x) { return '<li><a href="' + x[0] + '">' + esc(x[1]) + ' <span aria-hidden="true">→</span></a></li>'; }).join('') + '</ul>' +
        '<div class="fd-cta"><a class="mx-btn" href="kontakt.html?empfehlung=' + encodeURIComponent(sum) + '">Erstgespräch mit dieser Empfehlung</a>' +
        (pkg ? '<a class="mo-link" href="pakete.html#pakete">Paket ' + pkg + ' ansehen</a>' : '') +
        '<button type="button" class="fd-again">Neu starten</button></div>';
      res.querySelector('h3').setAttribute('tabindex', '-1');
      res.querySelector('.fd-again').addEventListener('click', function () { a = {}; root.querySelectorAll('.fd-opt').forEach(function (x) { x.removeAttribute('aria-pressed'); }); show(0); });
    }
  });
})();
/* Kontakt: Paket oder Finder-Empfehlung vorausfüllen */
(function () {
  var msg = document.querySelector('form textarea[name="message"]'); if (!msg || msg.value) return;
  try {
    var q = new URLSearchParams(location.search), p = q.get('paket'), e = q.get('empfehlung');
    if (p && /^(Start|Auftritt|Wachstum)$/.test(p)) msg.value = 'Wir interessieren uns für das Paket ' + p + '. ';
    else if (e) msg.value = e.slice(0, 400) + ' ';
  } catch (err) {}
})();
/* Fakten-Seite: Kurzbeschreibungen kopieren */
(function () {
  document.querySelectorAll('[data-copytext]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.parentNode.querySelector('blockquote').innerText.trim();
      var done = function () { b.textContent = 'Kopiert ✓'; b.classList.add('is-done'); setTimeout(function () { b.textContent = 'Kopieren'; b.classList.remove('is-done'); }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () {}); else { var r = document.createRange(); r.selectNodeContents(b.parentNode.querySelector('blockquote')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    });
  });
})();
/* Academy-Werkzeuge: gemeinsame Helfer */
const B3T = (() => {
  const F = '"Inter", "Helvetica Neue", Arial, sans-serif';
  const wrap = (g, text, x, y, maxW, lh, maxLines = 6) => {
    const words = String(text).split(/\s+/); let line = "", n = 0;
    for (let i = 0; i < words.length; i++) {
      const t = line ? line + " " + words[i] : words[i];
      if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); y += lh; line = words[i]; if (++n >= maxLines - 1) { line = words.slice(i).join(" "); while (g.measureText(line + "…").width > maxW && line.length) line = line.slice(0, -1); g.fillText(line + (i < words.length ? "…" : ""), x, y); return y + lh; } }
      else line = t;
    }
    if (line) { g.fillText(line, x, y); y += lh; }
    return y;
  };
  const save = (canvas, name) => { const a = document.createElement("a"); a.download = name; a.href = canvas.toDataURL("image/png"); document.body.appendChild(a); a.click(); a.remove(); };
  const ready = () => (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve());
  const L = { get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const award = (k, xp, why) => { if (L.get(k + "-xp", false)) return; L.set(k + "-xp", true); if (window.B3G) window.B3G.award(xp, why); };
  const brand = (g, W, H) => { g.fillStyle = "#00ff38"; g.fillRect(0, 0, 14, H); g.fillStyle = "#0a0a0a"; g.font = `600 30px ${F}`; g.fillText("B3DE", W - 140, H - 50); };
  return { F, wrap, save, ready, L, esc, award, brand };
})();

/* Marken-Kompass Generator */
(() => {
  const form = document.getElementById("kg-form"); if (!form) return;
  const { F, wrap, save, ready, L, award } = B3T;
  const sheet = document.getElementById("kg-sheet"), meter = document.querySelector("[data-kg-meter]"), bar = document.querySelector(".kg-meter i"), next = document.querySelector(".kg-next");
  const fields = [...form.querySelectorAll("[data-k]")];
  const EX = { name: "Tischlerei Berger", haltung: "Wir bauen Möbel, die Generationen überdauern.", zielgruppe: "Familien, die lieber einmal gut kaufen als dreimal billig.", versprechen: "Maßanfertigung in vier Wochen – mit Festpreis.", werte: "Sorgfalt · Ehrlichkeit · Nähe", ton: "ruhig · warm · direkt" };
  const LABEL = { haltung: "Haltung", zielgruppe: "Zielgruppe", versprechen: "Versprechen", werte: "Werte", ton: "Tonalität" };
  const data = () => Object.fromEntries(fields.map((f) => [f.dataset.k, f.value.trim()]));
  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  document.querySelector("[data-kg-date]").textContent = today;
  const paint = () => {
    const d = data(), n = Object.values(d).filter(Boolean).length;
    sheet.querySelector("[data-pv-name]").textContent = d.name || "Eure Marke";
    sheet.querySelectorAll("[data-pv]").forEach((x) => { const b = x.querySelector("b"), v = d[x.dataset.pv]; b.textContent = v || b.dataset.ph; x.classList.toggle("is-set", !!v); });
    meter.textContent = `${n} von 6 Feldern`; bar.style.setProperty("--p", n / 6);
    L.set("b3-kompass-draft", d);
    if (n === 6) { next.hidden = false; if (!L.get("b3-kompass", null)) { L.set("b3-kompass", d); award("b3-kompass", 30, "Marken-Kompass erstellt"); if (window.B3G) window.B3G.confetti(140); } else L.set("b3-kompass", d);
      const c = next.querySelector("[data-kg-contact]"); c.href = "kontakt.html?empfehlung=" + encodeURIComponent(`Mein Marken-Kompass (${d.name}): ${d.haltung} Zielgruppe: ${d.zielgruppe} Versprechen: ${d.versprechen}`.slice(0, 380)); }
  };
  const draft = L.get("b3-kompass-draft", null); if (draft) fields.forEach((f) => { if (draft[f.dataset.k]) f.value = draft[f.dataset.k]; });
  form.addEventListener("input", paint);
  form.addEventListener("click", (e) => {
    const b = e.target.closest("[data-kg]"); if (!b) return;
    if (b.dataset.kg === "example") fields.forEach((f) => (f.value = EX[f.dataset.k]));
    if (b.dataset.kg === "clear") { fields.forEach((f) => (f.value = "")); fields[0].focus(); }
    paint();
  });
  document.querySelector('[data-kg="print"]').addEventListener("click", () => window.print());
  document.querySelector('[data-kg="png"]').addEventListener("click", async () => {
    await ready(); const d = data(), W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    g.fillStyle = "#f4f4f2"; g.fillRect(0, 0, W, H); B3T.brand(g, W, H);
    g.fillStyle = "#0a0a0a"; g.font = `500 26px ${F}`; g.fillText("MARKEN-KOMPASS", 80, 110);
    g.font = `600 72px ${F}`; wrap(g, d.name || "Eure Marke", 80, 200, W - 160, 80, 2);
    let y = 330;
    Object.keys(LABEL).forEach((k) => {
      g.fillStyle = "#0a0a0a"; g.fillRect(80, y - 40, W - 160, 2);
      g.font = `500 22px ${F}`; g.fillStyle = "#6a6a6a"; g.fillText(LABEL[k].toUpperCase(), 80, y);
      g.font = `400 34px ${F}`; g.fillStyle = "#0a0a0a"; y = wrap(g, d[k] || "–", 80, y + 50, W - 160, 44, 3) + 40;
    });
    g.fillStyle = "#00ff38"; g.fillRect(80, H - 92, 260, 44); g.fillStyle = "#0a0a0a"; g.font = `500 20px ${F}`; g.fillText("Erstellt am " + today, 96, H - 63);
    save(c, "marken-kompass.png");
  });
  paint();
})();

/* Archetypen-Test */
(() => {
  const box = document.querySelector("[data-arch]"), src = document.getElementById("b3-arch"); if (!box || !src) return;
  const { F, wrap, save, ready, L, esc, award } = B3T; const D = JSON.parse(src.textContent);
  const qEl = box.querySelector(".at-q"), res = box.querySelector(".at-res"), bar = box.querySelector(".fd-bar i");
  let i = 0, score = {}, picks = [];
  const show = () => {
    bar.style.transform = `scaleX(${i / D.q.length})`;
    if (i >= D.q.length) return result();
    const [q, opts] = D.q[i];
    qEl.innerHTML = `<fieldset class="fd-step"><legend><span class="mo-label">(Frage ${i + 1} von ${D.q.length})</span>${esc(q)}</legend><div class="fd-opts">${opts.map((o, k) => `<button type="button" class="fd-opt" data-o="${k}"><b>${esc(o[0])}</b></button>`).join("")}</div>${i ? '<button type="button" class="fd-back">← Zurück</button>' : ""}</fieldset>`;
    qEl.hidden = false; res.hidden = true;
    if (box.dataset.touched) qEl.querySelector(".fd-opt").focus({ preventScroll: true });
  };
  qEl.addEventListener("click", (e) => {
    if (e.target.closest(".fd-back")) { const last = picks.pop(); last.forEach((a) => (score[a] -= 1)); i--; return show(); }
    const o = e.target.closest(".fd-opt"); if (!o) return; box.dataset.touched = "1";
    const ws = D.q[i][1][+o.dataset.o][1]; ws.forEach((a) => (score[a] = (score[a] || 0) + 1)); picks.push(ws); i++; show();
  });
  const top2 = () => { const order = Object.keys(D.a); return order.slice().sort((a, b) => (score[b] || 0) - (score[a] || 0) || order.indexOf(a) - order.indexOf(b)).slice(0, 2); };
  const result = (pre) => {
    const [a, b] = pre || top2(), A = D.a[a], B = D.a[b];
    qEl.hidden = true; res.hidden = false; bar.style.transform = "scaleX(1)";
    res.innerHTML = `<p class="mo-label">(${pre ? "Geteiltes Ergebnis" : "Euer Archetyp"})</p><h3>${esc(A[0])}</h3><p class="at-motto">„${esc(A[1])}“</p><p>${esc(A[2])}</p>
      <dl class="at-dl"><div><dt>Stärke</dt><dd>${esc(A[3])}</dd></div><div><dt>Achtung</dt><dd>${esc(A[4])}</dd></div><div><dt>Tonalität</dt><dd>${esc(A[5])}</dd></div><div><dt>Bildwelt</dt><dd>${esc(A[6])}</dd></div></dl>
      <p class="at-second">Zweiter Einfluss: <b>${esc(B[0])}</b> – ${esc(B[1])}</p>
      <div class="fd-cta">${pre ? '<button type="button" class="mx-btn" data-at="again">Test selbst machen</button>' : '<button type="button" class="mx-btn" data-at="png">Ergebnis-Karte laden</button><button type="button" class="mo-link" data-at="share">Teilen</button>'}<a class="mo-link" href="leistung-markenworkshop.html">Archetyp im Workshop schärfen</a>${pre ? "" : '<button type="button" class="fd-again" data-at="again">Neu starten</button>'}</div>`;
    res.querySelector("h3").setAttribute("tabindex", "-1"); if (box.dataset.touched) res.querySelector("h3").focus({ preventScroll: true });
    if (!pre) { L.set("b3-arch", [a, b]); award("b3-arch", 20, "Archetyp entdeckt"); if (window.B3G) window.B3G.confetti(120); }
    const url = location.origin + location.pathname + `?a=${a}&b=${b}`;
    res.onclick = async (e) => {
      const t = e.target.closest("[data-at]"); if (!t) return;
      if (t.dataset.at === "again") { i = 0; score = {}; picks = []; history.replaceState(null, "", location.pathname); return show(); }
      if (t.dataset.at === "share") { const txt = `Unsere Marke ist „${A[0]}“ – ${A[1]} Welcher Archetyp ist eure?`; try { if (navigator.share) await navigator.share({ title: "Markenarchetypen-Test", text: txt, url }); else { await navigator.clipboard.writeText(txt + " " + url); t.textContent = "Link kopiert ✓"; } } catch (err) {} return; }
      if (t.dataset.at === "png") {
        await ready(); const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
        g.fillStyle = "#0a0a0a"; g.fillRect(0, 0, W, H); g.fillStyle = "#00ff38"; g.fillRect(0, 0, 14, H);
        g.font = `500 26px ${F}`; g.fillText("UNSER MARKEN-ARCHETYP", 80, 120);
        g.font = `600 104px ${F}`; let y = wrap(g, A[0], 80, 250, W - 160, 108, 2);
        g.fillStyle = "#f2f2f2"; g.font = `400 44px ${F}`; y = wrap(g, `„${A[1]}“`, 80, y + 30, W - 160, 56, 3);
        g.fillStyle = "#bdbdbd"; g.font = `400 32px ${F}`; y = wrap(g, A[2], 80, y + 40, W - 160, 44, 5);
        [["STÄRKE", A[3]], ["TONALITÄT", A[5]]].forEach(([k, v]) => { y += 40; g.fillStyle = "#00ff38"; g.font = `500 22px ${F}`; g.fillText(k, 80, y); g.fillStyle = "#f2f2f2"; g.font = `400 34px ${F}`; y = wrap(g, v, 80, y + 46, W - 160, 44, 2); });
        g.fillStyle = "#00ff38"; g.font = `500 24px ${F}`; g.fillText("Welcher Archetyp seid ihr? · B3DE Academy", 80, H - 70);
        save(c, "marken-archetyp.png");
      }
    };
  };
  const q = new URLSearchParams(location.search), pa = q.get("a"), pb = q.get("b");
  if (pa && D.a[pa] && pb && D.a[pb]) result([pa, pb]); else show();
})();

/* Marken-Führerschein */
(() => {
  const wrapEl = document.querySelector("[data-fs-paths]"), src = document.getElementById("b3-academy"); if (!wrapEl || !src) return;
  const { F, wrap, save, ready, L, esc, award } = B3T; const D = JSON.parse(src.textContent);
  const read = L.get("b3-read", []), cert = document.querySelector("[data-fs-cert]"), cv = cert.querySelector("canvas"), nameIn = document.getElementById("fs-name");
  const done = D.paths.map((p) => p.items.filter((it) => read.includes(it.f)).length);
  let sel = done.findIndex((n, k) => n === D.paths[k].items.length);
  wrapEl.innerHTML = D.paths.map((p, k) => {
    const n = done[k], all = p.items.length, ok = n === all, nextIt = p.items.find((it) => !read.includes(it.f));
    return `<div class="fs-path${ok ? " is-done" : ""}"><p class="mo-label">(Klasse ${String.fromCharCode(65 + k)})</p><b>${esc(p.name)}</b><span class="fs-bar"><i style="--p:${n / all}"></i></span><span class="fs-n">${n} / ${all} Artikel</span>${ok ? `<button type="button" class="mx-btn" data-fs-pick="${k}">Nachweis erstellen</button>` : `<a class="mo-link" href="${nextIt.f}">${n ? "Weiterlesen" : "Starten"}: ${esc(nextIt.t)}</a>`}<ul>${p.items.map((it) => `<li class="${read.includes(it.f) ? "on" : ""}"><a href="${it.f}">${esc(it.t)}</a></li>`).join("")}</ul></div>`;
  }).join("");
  const draw = async () => {
    await ready(); const g = cv.getContext("2d"), W = cv.width, H = cv.height, p = D.paths[sel], nm = nameIn.value.trim() || "Euer Name";
    const date = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
    g.fillStyle = "#f4f4f2"; g.fillRect(0, 0, W, H); g.strokeStyle = "#0a0a0a"; g.lineWidth = 3; g.strokeRect(50, 50, W - 100, H - 100);
    g.fillStyle = "#00ff38"; g.fillRect(50, 50, W - 100, 20);
    g.fillStyle = "#0a0a0a"; g.textAlign = "center";
    g.font = `500 28px ${F}`; g.fillText("B3DE ACADEMY · LERNNACHWEIS", W / 2, 190);
    g.font = `600 110px ${F}`; g.fillText("Marken-Führerschein", W / 2, 330);
    g.font = `400 34px ${F}`; g.fillStyle = "#555"; g.fillText(`Klasse ${String.fromCharCode(65 + sel)} · ${p.name}`, W / 2, 400);
    g.fillStyle = "#0a0a0a"; g.font = `400 30px ${F}`; g.fillText("ausgestellt für", W / 2, 510);
    g.font = `600 84px ${F}`; g.fillText(nm, W / 2, 610, W - 300); g.fillRect(W / 2 - 360, 640, 720, 3);
    g.font = `400 28px ${F}`; g.fillStyle = "#333"; wrap(g, `hat alle ${p.items.length} Artikel des Lernpfads „${p.name}“ in der B3DE Academy gelesen und die Grundlagen dieses Themas kennengelernt.`, W / 2, 720, W - 420, 40, 3);
    g.textAlign = "left"; g.fillStyle = "#0a0a0a"; g.font = `500 24px ${F}`; g.fillText(date, 160, H - 150); g.fillRect(160, H - 135, 300, 2); g.font = `400 20px ${F}`; g.fillStyle = "#666"; g.fillText("Datum", 160, H - 105);
    g.textAlign = "right"; g.fillStyle = "#0a0a0a"; g.font = `italic 400 40px ${F}`; g.fillText("Leni Heaf", W - 160, H - 150); g.fillRect(W - 460, H - 135, 300, 2); g.font = `400 20px ${F}`; g.fillStyle = "#666"; g.fillText("Leni Heaf, B3DE", W - 160, H - 105);
    g.textAlign = "center"; g.fillStyle = "#00ff38"; g.beginPath(); g.arc(W / 2, H - 150, 62, 0, Math.PI * 2); g.fill(); g.fillStyle = "#0a0a0a"; g.font = `600 30px ${F}`; g.fillText("B3DE", W / 2, H - 140); g.textAlign = "left";
  };
  const open = (k) => { sel = k; cert.hidden = false; nameIn.value = L.get("b3-cert-name", ""); draw(); };
  wrapEl.addEventListener("click", (e) => { const b = e.target.closest("[data-fs-pick]"); if (b) { open(+b.dataset.fsPick); cert.scrollIntoView({ behavior: "smooth", block: "start" }); } });
  nameIn.addEventListener("input", () => { L.set("b3-cert-name", nameIn.value.trim()); draw(); });
  cert.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-fs]"); if (!b) return;
    if (b.dataset.fs === "png") { await draw(); save(cv, "marken-fuehrerschein.png"); if (!L.get("b3-cert", null)) { L.set("b3-cert", { path: sel, at: Date.now() }); award("b3-cert", 40, "Marken-Führerschein"); if (window.B3G) window.B3G.confetti(180); } }
    if (b.dataset.fs === "share") { const url = location.origin + location.pathname.replace(/[^/]*$/, "academy-fuehrerschein.html"); const txt = `Ich habe den Marken-Führerschein der B3DE Academy gemacht (Klasse ${String.fromCharCode(65 + sel)} · ${D.paths[sel].name}).`; try { if (navigator.share) await navigator.share({ title: "Marken-Führerschein", text: txt, url }); else { await navigator.clipboard.writeText(txt + " " + url); b.textContent = "Text kopiert ✓"; } } catch (err) {} }
  });
  if (sel >= 0) open(sel);
})();
/* Projekt-Bühne: Karussell, Bilder-Daumenkino, Cursor-Blase */
(() => {
  const root = document.querySelector(".ps"); if (!root) return;
  const track = root.querySelector("[data-ps-track]"), cards = [...track.querySelectorAll("[data-ps]")], cur = root.querySelector("[data-ps-cur]"), bar = root.querySelector("[data-ps-bar]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
  const go = (d) => track.scrollBy({ left: d * step(), behavior: reduce ? "auto" : "smooth" });
  root.querySelector("[data-ps-prev]").addEventListener("click", () => go(-1));
  root.querySelector("[data-ps-next]").addEventListener("click", () => go(1));
  track.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { e.preventDefault(); go(1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); } });
  const upd = () => { const max = track.scrollWidth - track.clientWidth, p = max > 0 ? track.scrollLeft / max : 0; bar.style.transform = `scaleX(${Math.max(0.08, p)})`; const i = Math.round(track.scrollLeft / step()); cur.textContent = String(Math.min(cards.length, i + 1)).padStart(2, "0"); };
  track.addEventListener("scroll", upd, { passive: true }); upd();
  // Ziehen mit der Maus
  let down = false, sx = 0, sl = 0, moved = false;
  track.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add("is-drag"); });
  addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = sl - dx; });
  addEventListener("pointerup", () => { if (!down) return; down = false; track.classList.remove("is-drag"); });
  track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
  // Daumenkino
  const flip = (c) => { const ims = c.querySelectorAll(".ps-media img"), dots = c.querySelectorAll(".ps-dots i"); if (ims.length < 2) return null; let i = 0; dots[0] && dots[0].classList.add("on");
    return { next() { ims[i].classList.remove("is-on"); dots[i] && dots[i].classList.remove("on"); i = (i + 1) % ims.length; ims[i].classList.add("is-on"); dots[i] && dots[i].classList.add("on"); } }; };
  if (!reduce) cards.forEach((c) => {
    const f = flip(c); if (!f) return; let t;
    if (fine) { c.addEventListener("mouseenter", () => { f.next(); t = setInterval(f.next, 700); }); c.addEventListener("mouseleave", () => clearInterval(t)); }
    else new IntersectionObserver(([en]) => { clearInterval(t); if (en.isIntersecting && en.intersectionRatio > .6) t = setInterval(f.next, 1600); }, { threshold: [0, .6, 1] }).observe(c);
  });
  // Cursor-Blase
  if (fine && !reduce) {
    const bub = document.createElement("span"); bub.className = "ps-cursor"; bub.textContent = "Ansehen"; bub.setAttribute("aria-hidden", "true"); document.body.appendChild(bub);
    let x = 0, y = 0, tx = 0, ty = 0, raf;
    const loop = () => { x += (tx - x) * .22; y += (ty - y) * .22; bub.style.transform = `translate(${x}px, ${y}px)`; raf = requestAnimationFrame(loop); };
    track.addEventListener("mouseenter", () => { bub.classList.add("on"); raf = requestAnimationFrame(loop); });
    track.addEventListener("mouseleave", () => { bub.classList.remove("on"); cancelAnimationFrame(raf); });
    track.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; bub.textContent = track.classList.contains("is-drag") ? "Ziehen" : "Ansehen"; });
  }
})();
/* Social-Media-Schaufenster: Stories laufen, Herzen fliegen */
(() => {
  const phones = document.querySelectorAll("[data-sm]"); if (!phones.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, DUR = 3200;
  phones.forEach((ph) => {
    const ims = ph.querySelectorAll(".sm-slides img"), bars = ph.querySelectorAll(".sm-bars i"); let i = 0, t0 = 0, raf, on = false, paused = false, el = 0;
    const show = (n) => { ims[i].classList.remove("is-on"); bars.forEach((b, k) => b.style.setProperty("--p", k < n ? 1 : 0)); i = (n + ims.length) % ims.length; if (i === 0) bars.forEach((b) => b.style.setProperty("--p", 0)); ims[i].classList.add("is-on"); el = 0; t0 = performance.now(); };
    const tick = (now) => { if (!paused) { el = now - t0; bars[i] && bars[i].style.setProperty("--p", Math.min(1, el / DUR)); if (el >= DUR) show(i + 1); } else t0 = now - el; raf = requestAnimationFrame(tick); };
    const start = () => { if (on || reduce) return; on = true; t0 = performance.now() - el; raf = requestAnimationFrame(tick); };
    const stop = () => { on = false; cancelAnimationFrame(raf); };
    new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop()), { threshold: .4 }).observe(ph);
    const scr = ph.querySelector(".sm-slides");
    scr.addEventListener("click", (e) => { const r = scr.getBoundingClientRect(); show(e.clientX - r.left < r.width / 3 ? i - 1 : i + 1); });
    ph.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") paused = true; });
    ph.addEventListener("pointerleave", () => (paused = false));
    const like = ph.querySelector(".sm-like");
    like.addEventListener("click", () => {
      const onp = like.getAttribute("aria-pressed") !== "true"; like.setAttribute("aria-pressed", String(onp));
      if (!onp || reduce) return;
      const r = like.getBoundingClientRect();
      for (let k = 0; k < 14; k++) { const h = document.createElement("span"); h.className = "sm-heart"; h.textContent = "♥"; h.style.left = r.left + r.width / 2 + "px"; h.style.top = r.top + "px"; h.style.setProperty("--dx", (Math.random() - .5) * 160 + "px"); h.style.setProperty("--dy", -(Math.random() * 180 + 80) + "px"); h.style.setProperty("--r", (Math.random() - .5) * 80 + "deg"); h.style.animationDelay = k * 25 + "ms"; document.body.appendChild(h); setTimeout(() => h.remove(), 1400); }
    });
  });
})();

/* Wissen: kompakte Artikelliste, Unternavigation, Sammlung */
(() => {
  const short = document.querySelector("[data-short]"); if (!short) return;
  const more = document.querySelector("[data-more]");
  const all = () => { short.classList.remove("ac-short"); if (more) more.parentNode.hidden = true; };
  if (more) more.addEventListener("click", all);
  document.querySelectorAll(".mx-filter button").forEach((b) => b.addEventListener("click", all));
  const q = document.querySelector("[data-search]"); if (q) q.addEventListener("input", () => { if (q.value.trim()) all(); });
  const coll = document.querySelector("[data-coll]");
  const openColl = () => { if (coll && location.hash === "#sammlung") coll.open = true; };
  openColl(); addEventListener("hashchange", openColl);
  document.querySelectorAll('a[href="#sammlung"]').forEach((a) => a.addEventListener("click", () => { if (coll) coll.open = true; }));
  const links = [...document.querySelectorAll(".ac-sub a")];
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-35% 0px -60% 0px" });
    links.forEach((a) => { const t = document.getElementById(a.getAttribute("href").slice(1)); if (t) io.observe(t); });
  }
})();
/* Marken-Festival: Bändchen, Stempel, Timetable */
(() => {
  const pass = document.querySelector("[data-pass]"), src = document.getElementById("b3-academy"); if (!pass || !src) return;
  const D = JSON.parse(src.textContent);
  const L = { get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const LV = [[0, "Neugierig"], [50, "Entdecker:in"], [150, "Markendenker:in"], [300, "Strateg:in"], [500, "Markenprofi"], [800, "Markenmeister:in"]];
  const paint = () => {
    const read = L.get("b3-read", []), xp = L.get("b3-xp", 0), band = L.get("b3-band", false);
    let li = 0; LV.forEach((l, k) => { if (xp >= l[0]) li = k; });
    pass.classList.toggle("is-on", band);
    pass.querySelector("[data-pass-lvl]").textContent = band ? `Level ${li + 1} · ${LV[li][1]}` : "Gast";
    pass.querySelector("[data-pass-xp]").textContent = band ? `${xp} XP · ${read.length} von ${D.total} Acts gesehen` : "Holt euch euer Bändchen und sammelt Stempel.";
    pass.querySelectorAll("[data-stamp]").forEach((s) => { const p = D.paths.find((x) => x.id === s.dataset.stamp); const n = p ? p.items.filter((i) => read.includes(i.f)).length : 0; s.classList.toggle("on", band && n > 0); s.classList.toggle("full", band && p && n === p.items.length); });
    document.querySelectorAll("[data-slot]").forEach((a) => a.classList.toggle("is-seen", read.includes(a.dataset.slot)));
    const b = document.querySelector("[data-band]"); if (b) b.textContent = band ? "Mein Bändchen ↓" : "Bändchen holen";
  };
  const btn = document.querySelector("[data-band]");
  if (btn) btn.addEventListener("click", () => {
    if (!L.get("b3-band", false)) { L.set("b3-band", true); if (window.B3G) { window.B3G.award(10, "Willkommen auf dem Festival"); window.B3G.confetti(160); } }
    paint(); pass.classList.add("is-new"); setTimeout(() => pass.classList.remove("is-new"), 1200);
    document.getElementById("pass").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  });
  paint();
})();

/* ===== Festival-Erlebnis: Sound, Einlass, Lichtshow, Bühnen-Banner, Stempel-Moment, goldenes Ticket ===== */
const B3S = (() => {
  let ctx; const on = () => { try { return localStorage.getItem("b3-sound") === "1"; } catch (e) { return false; } };
  const tone = (f, t, d, type = "sine", g = .12, when = 0) => { const o = ctx.createOscillator(), v = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, ctx.currentTime + when); if (t) o.frequency.exponentialRampToValueAtTime(t, ctx.currentTime + when + d); v.gain.setValueAtTime(g, ctx.currentTime + when); v.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + when + d); o.connect(v).connect(ctx.destination); o.start(ctx.currentTime + when); o.stop(ctx.currentTime + when + d + .02); };
  const noise = (d, g = .2) => { const b = ctx.createBuffer(1, ctx.sampleRate * d, ctx.sampleRate), x = b.getChannelData(0); for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / x.length, 2); const s = ctx.createBufferSource(), v = ctx.createGain(), f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1200; v.gain.value = g; s.buffer = b; s.connect(f).connect(v).connect(ctx.destination); s.start(); };
  const P = { beep: () => { tone(1320, 0, .09, "square", .05); tone(1760, 0, .12, "square", .05, .1); }, stamp: () => { tone(140, 50, .25, "sine", .5); noise(.12, .25); }, chime: () => { [660, 880, 1320].forEach((f, i) => tone(f, 0, .5, "triangle", .08, i * .09)); }, crowd: () => { noise(1.4, .12); tone(520, 700, .6, "sawtooth", .015); } };
  return { on, set(v) { try { localStorage.setItem("b3-sound", v ? "1" : "0"); } catch (e) {} if (v) this.play("chime"); }, play(n) { if (!on()) return; try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === "suspended") ctx.resume(); P[n] && P[n](); } catch (e) {} } };
})();
(() => {
  const src = document.getElementById("b3-academy"); if (!src) return;
  const D = JSON.parse(src.textContent), here = location.pathname.split("/").pop() || "index.html";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STG = { marke: ["Main Stage", "#00ff38"], identitaet: ["Neon Tent", "#6a1bff"], sichtbar: ["Loud Stage", "#0a0a0a"], team: ["Campfire", "#f2f2f2"] };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const G = () => window.B3G;
  // Sound-Schalter (Festival-Seite und Artikel)
  const sub = document.querySelector(".fx-subnav > div");
  const mkSound = (host) => { const b = document.createElement("button"); b.type = "button"; b.className = "fx-sound"; const paint = () => { b.textContent = B3S.on() ? "Sound an" : "Sound aus"; b.setAttribute("aria-pressed", String(B3S.on())); }; paint(); b.addEventListener("click", () => { B3S.set(!B3S.on()); paint(); }); host.appendChild(b); };
  if (sub) mkSound(sub);
  // Einlass mit Ticket-Scan (einmal pro Sitzung)
  if (document.body.classList.contains("mx-fest") && !reduce) {
    let seen = false; try { seen = sessionStorage.getItem("b3-gate") === "1"; sessionStorage.setItem("b3-gate", "1"); } catch (e) {}
    if (!seen) {
      const g = document.createElement("div"); g.className = "fx-gate-ov"; g.setAttribute("role", "dialog"); g.setAttribute("aria-label", "Einlass");
      g.innerHTML = `<div class="fx-ticket"><span class="fx-ticket__l">ADMIT ONE</span><b>B3DE ACADEMY</b><span>Das Marken-Festival · 4 Bühnen · ${D.total} Acts</span><i class="fx-ticket__scan"></i><em data-gs>Ticket wird gescannt …</em></div><button type="button" class="fx-gate-skip">Überspringen</button>`;
      document.body.appendChild(g); document.documentElement.classList.add("fx-lock");
      const close = () => { if (!g.isConnected) return; g.classList.add("open"); document.documentElement.classList.remove("fx-lock"); setTimeout(() => g.remove(), 900); };
      setTimeout(() => { const s = g.querySelector("[data-gs]"); if (s) { s.textContent = "✓ Willkommen auf dem Festival!"; g.classList.add("ok"); B3S.play("beep"); } }, 1300);
      setTimeout(close, 2300);
      g.addEventListener("click", close); addEventListener("keydown", (e) => { if (e.key === "Escape") close(); }, { once: true });
    }
  }
  // Lichtshow: Strahler folgen der Maus
  const hero = document.querySelector(".fx-hero");
  if (hero && !reduce && matchMedia("(pointer: fine)").matches) hero.addEventListener("mousemove", (e) => { const r = hero.getBoundingClientRect(); hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width - .5).toFixed(3)); });
  // Artikel = Act auf einer Bühne
  const art = D.arts.find((a) => a.f === here);
  if (art) {
    const pi = D.paths.findIndex((p) => p.items.some((i) => i.f === here)), p = D.paths[pi];
    const st = p ? STG[p.id] : ["Line-up", "#f2f2f2"], k = p ? p.items.findIndex((i) => i.f === here) : -1, nx = p && p.items[k + 1];
    const bar = document.createElement("div"); bar.className = "fx-actbar"; bar.style.setProperty("--c", st[1]);
    bar.innerHTML = `<span class="fx-actbar__live"><i></i>Live</span><b>${esc(st[0])}</b><span>${p ? `Act ${k + 1} von ${p.items.length} · ${esc(p.name)}` : "Act aus dem Programm"}</span>${nx ? `<a href="${nx.f}">Nächster Act: ${esc(nx.t)} →</a>` : `<a href="academy.html#lernpfade">Zum Timetable →</a>`}`;
    const main = document.getElementById("main"); if (main) main.prepend(bar);
    mkSound(bar);
    document.addEventListener("b3:read", () => {
      const sw = document.createElement("div"); sw.className = "fx-stampov"; sw.style.setProperty("--c", st[1]);
      sw.innerHTML = `<div class="fx-bigstamp"><small>B3DE Academy</small><b>Gesehen</b><span>${esc(st[0])}</span></div>`;
      document.body.appendChild(sw); B3S.play("stamp"); setTimeout(() => B3S.play("crowd"), 250);
      setTimeout(() => sw.classList.add("out"), 1500); setTimeout(() => sw.remove(), 2100);
    });
  }
  // Goldenes Ticket: pro Tag in einem anderen Artikel versteckt
  if (art) {
    const day = new Date().toISOString().slice(0, 10); let h = 0; for (const c of day) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const pick = D.arts[h % D.arts.length].f; let got = []; try { got = JSON.parse(localStorage.getItem("b3-golden") || "[]"); } catch (e) {}
    if (pick === here && !got.includes(day)) {
      const t = document.createElement("button"); t.type = "button"; t.className = "fx-golden"; t.setAttribute("aria-label", "Goldenes Ticket einsammeln"); t.innerHTML = "<b>Golden</b><span>Ticket</span>";
      let shown = false;
      addEventListener("scroll", () => { if (!shown && scrollY > (document.body.scrollHeight - innerHeight) * .55) { shown = true; document.body.appendChild(t); requestAnimationFrame(() => t.classList.add("on")); } }, { passive: true });
      t.addEventListener("click", () => { got.push(day); try { localStorage.setItem("b3-golden", JSON.stringify(got)); } catch (e) {} t.classList.add("got"); B3S.play("chime"); if (G()) { G().confetti(220); G().award(25, "Goldenes Ticket gefunden"); } setTimeout(() => t.remove(), 900); });
    }
  }
})();
/* Festival-Stories: Player zum Tippen, Wischen und Halten */
(() => {
  const row = document.querySelector("[data-stories]"), src = document.getElementById("b3-academy"); if (!row || !src) return;
  const D = JSON.parse(src.textContent), A = Object.fromEntries(D.arts.map((a) => [a.f, a]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const L = { get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const STG = { marke: ["Main Stage", "#00ff38", "Die großen Fragen zuerst."], identitaet: ["Neon Tent", "#6a1bff", "Wo Marken Gesicht bekommen."], sichtbar: ["Loud Stage", "#0a0a0a", "Damit euch alle hören."], team: ["Campfire", "#f2f2f2", "Wo Marken von innen leuchten."] };
  const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);
  const build = (id) => {
    if (STG[id]) {
      const p = D.paths.find((x) => x.id === id), [name, c, tag] = STG[id];
      const cards = [{ k: "intro", c, kicker: name, title: p.name, text: tag + " " + p.desc, foot: `${p.items.length} Acts · tippen zum Starten` }];
      p.items.forEach((it, n) => { const a = A[it.f] || { d: "" }; cards.push({ k: "act", c, kicker: `Act ${String(n + 1).padStart(2, "0")} · ${name}`, title: it.t, text: a.d, href: it.f }); });
      const right = p.items[(Math.random() * p.items.length) | 0], opts = shuffle([right, ...shuffle(p.items.filter((x) => x !== right)).slice(0, 2)]);
      cards.push({ k: "quiz", c, kicker: "Kurzer Check", title: "Welcher Act war das?", text: (A[right.f] || {}).d || "", opts: opts.map((o) => [o.t, o === right]) });
      cards.push({ k: "end", c, kicker: name, title: "Bühne gesehen!", text: "Stempel aufs Bändchen. Lust auf mehr? Die nächste Bühne wartet.", id });
      return { id, name, c, cards };
    }
    if (id === "tools") return { id, name: "Workshops", c: "#00ff38", cards: [
      { k: "intro", c: "#00ff38", kicker: "Workshop-Zelt", title: "Mitmachen statt zuhören.", text: "Drei Werkzeuge, mit denen ihr eure Marke sofort greifbar macht.", foot: "3 Workshops" },
      { k: "act", c: "#00ff38", kicker: "Workshop 01", title: "Marken-Kompass Generator", text: "Fünf Fragen, eine Seite – euer Kompass zum Herunterladen.", href: "academy-kompass.html", cta: "Kompass bauen" },
      { k: "act", c: "#00ff38", kicker: "Workshop 02", title: "Welcher Archetyp seid ihr?", text: "Zehn Fragen, zwölf Archetypen, eine Ergebnis-Karte zum Teilen.", href: "academy-archetypen-test.html", cta: "Test starten" },
      { k: "act", c: "#00ff38", kicker: "Workshop 03", title: "Marken-Führerschein", text: "Bühne komplett gesehen? Holt euch euren Lernnachweis.", href: "academy-fuehrerschein.html", cta: "Führerschein holen" },
      { k: "end", c: "#00ff38", kicker: "Workshop-Zelt", title: "Bis gleich im Zelt!", text: "Alle Werkzeuge sind kostenlos.", id }] };
    return { id, name: "Einlass", c: "#f2f2f2", cards: [
      { k: "intro", c: "#f2f2f2", kicker: "Einlass-Check", title: "Wie stark ist eure Marke?", text: "Fünf ehrliche Fragen, 60 Sekunden – und ihr wisst, welche Bühne ihr zuerst besuchen solltet.", foot: "60 Sekunden" },
      { k: "act", c: "#f2f2f2", kicker: "Los geht’s", title: "Marken-Check starten", text: "Ihr bekommt sofort ein Ergebnis und passende Acts.", href: "#marken-check", cta: "Zum Check" },
      { k: "end", c: "#f2f2f2", kicker: "Einlass", title: "Ihr seid drin!", text: "Viel Spaß auf dem Festival.", id }] };
  };
  const ids = [...row.querySelectorAll("[data-story]")].map((b) => b.dataset.story);
  const paintSeen = () => { const seen = L.get("b3-stories", {}); row.querySelectorAll("[data-story]").forEach((b) => b.classList.toggle("is-seen", !!seen[b.dataset.story])); };
  paintSeen();
  let ov, S, si = 0, ci = 0, t0 = 0, el = 0, raf, paused = false, holdT;
  const DUR = 7000;
  const close = () => { if (!ov) return; cancelAnimationFrame(raf); ov.classList.add("out"); document.documentElement.classList.remove("fx-lock"); const o = ov; ov = null; setTimeout(() => o.remove(), 300); paintSeen(); };
  const done = (id) => { const seen = L.get("b3-stories", {}); if (seen[id]) return; seen[id] = true; L.set("b3-stories", seen); if (window.B3G) { window.B3G.award(15, "Story gesehen"); window.B3G.confetti(160); } if (window.B3S) B3S.play("stamp"); };
  const card = () => {
    const c = S.cards[ci], dark = c.c === "#0a0a0a" || c.c === "#6a1bff";
    const bars = S.cards.map((_, k) => `<i style="--p:${k < ci ? 1 : 0}"></i>`).join("");
    let body = "";
    if (c.k === "quiz") body = `<p class="st-q">„${esc(c.text)}“</p><div class="st-opts">${c.opts.map(([t, ok], k) => `<button type="button" data-opt="${ok ? 1 : 0}">${esc(t)}</button>`).join("")}</div>`;
    else body = `<p class="st-text">${esc(c.text)}</p>`;
    const cta = c.href ? `<a class="st-cta" href="${c.href}">${esc(c.cta || "Ganzen Act lesen")} →</a>` : "";
    const end = c.k === "end" ? `<div class="st-stamp">Gesehen<small>${esc(S.name)}</small></div>` : "";
    const nextS = c.k === "end" && si < ids.length - 1 ? `<button type="button" class="st-cta st-next">Nächste Story →</button>` : "";
    const react = c.k === "act" ? `<div class="st-react">${["🔥", "💡", "❤️", "🤘"].map((e) => `<button type="button" data-react="${e}" aria-label="Reagieren ${e}">${e}</button>`).join("")}</div>` : "";
    ov.querySelector(".st-card").innerHTML = `<div class="st-bars">${bars}</div>
      <div class="st-top"><span class="st-av" style="--c:${S.c}">${esc(S.name.slice(0, 1))}</span><b>${esc(S.name)}</b><span>B3DE Academy</span><button type="button" class="st-x" aria-label="Story schließen">×</button></div>
      <div class="st-body st-body--${c.k}${dark ? " st-dark" : ""}" style="--c:${c.c}"><span class="st-kick">${esc(c.kicker)}</span><h3>${esc(c.title)}</h3>${body}${c.foot ? `<p class="st-foot">${esc(c.foot)}</p>` : ""}${end}<div class="st-actions">${cta}${nextS}</div>${react}</div>
      <button type="button" class="st-nav st-nav--l" aria-label="Zurück"></button><button type="button" class="st-nav st-nav--r" aria-label="Weiter"></button>`;
    el = 0; t0 = performance.now(); paused = c.k === "quiz" || c.k === "end";
    if (c.k === "end") done(S.id);
    ov.querySelector(".st-card").setAttribute("aria-label", `${S.name}: ${c.title}`);
  };
  const go = (d) => { const n = ci + d; if (n < 0) { if (si > 0) open(si - 1, true); return; } if (n >= S.cards.length) { if (si < ids.length - 1) open(si + 1); else close(); return; } ci = n; card(); };
  const tick = (now) => { if (!ov) return; if (!paused && !reduce) { el = now - t0; const b = ov.querySelectorAll(".st-bars i")[ci]; if (b) b.style.setProperty("--p", Math.min(1, el / DUR)); if (el >= DUR) go(1); } else t0 = now - el; raf = requestAnimationFrame(tick); };
  const open = (i, last) => {
    si = i; S = build(ids[i]); ci = last ? S.cards.length - 1 : 0;
    if (!ov) {
      ov = document.createElement("div"); ov.className = "st-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.innerHTML = '<div class="st-card" tabindex="-1"></div>';
      document.body.appendChild(ov); document.documentElement.classList.add("fx-lock");
      let sx = 0, sy = 0, st = 0;
      ov.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; st = Date.now(); holdT = setTimeout(() => { paused = true; ov.classList.add("hold"); }, 220); });
      ov.addEventListener("pointerup", (e) => {
        clearTimeout(holdT); const wasHold = ov.classList.contains("hold"); ov.classList.remove("hold");
        const c = S.cards[ci]; if (wasHold) { paused = c.k === "quiz" || c.k === "end"; return; }
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0 && si < ids.length - 1) open(si + 1); else if (dx > 0 && si > 0) open(si - 1); return; }
        if (dy > 90) { close(); return; }
      });
      ov.addEventListener("click", (e) => {
        if (e.target === ov || e.target.closest(".st-x")) return close();
        const o = e.target.closest("[data-opt]");
        if (o) { const ok = o.dataset.opt === "1"; o.classList.add(ok ? "ok" : "no"); ov.querySelectorAll("[data-opt]").forEach((b) => { b.disabled = true; if (b.dataset.opt === "1") b.classList.add("ok"); }); if (ok) { if (window.B3G) { window.B3G.award(5, "Story-Quiz richtig"); window.B3G.confetti(90); } if (window.B3S) B3S.play("chime"); } setTimeout(() => go(1), 1300); return; }
        const r = e.target.closest("[data-react]");
        if (r) { for (let k = 0; k < 8; k++) { const f = document.createElement("span"); f.className = "st-fly"; f.textContent = r.dataset.react; const b = r.getBoundingClientRect(); f.style.left = b.left + b.width / 2 + "px"; f.style.top = b.top + "px"; f.style.setProperty("--dx", (Math.random() - .5) * 120 + "px"); f.style.animationDelay = k * 40 + "ms"; document.body.appendChild(f); setTimeout(() => f.remove(), 1300); } return; }
        if (e.target.closest(".st-next")) return open(si + 1);
        if (e.target.closest(".st-cta")) { if (e.target.closest('a[href^="#"]')) close(); return; }
        if (e.target.closest(".st-nav--l")) return go(-1);
        if (e.target.closest(".st-nav--r")) return go(1);
      });
      addEventListener("keydown", function k(e) { if (!ov) return removeEventListener("keydown", k); if (e.key === "Escape") close(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); });
      raf = requestAnimationFrame(tick);
    }
    ov.style.setProperty("--c", S.c);
    card(); ov.querySelector(".st-card").focus({ preventScroll: true });
  };
  row.addEventListener("click", (e) => { const b = e.target.closest("[data-story]"); if (b) open(ids.indexOf(b.dataset.story)); });
})();
/* Academy-Reels: Vollbild-Feed, Feiern, Merken, Teilen */
(() => {
  const sec = document.querySelector(".rl-sec"); if (!sec) return;
  const tr = sec.querySelector("[data-reels]"), L = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }, S = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const G = () => window.B3G, snd = (n) => { if (window.B3S) B3S.play(n); };
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-on", e.isIntersecting)), { threshold: .55 }) : null;
  tr.querySelectorAll(".rl").forEach((r) => { if (io) io.observe(r); else r.classList.add("is-on");
    const f = r.dataset.reel, likes = L("b3-likes", []), saved = L("b3-saved", []);
    r.querySelector("[data-like]").setAttribute("aria-pressed", String(likes.includes(f))); r.querySelector("[data-save]").setAttribute("aria-pressed", String(saved.includes(f))); });
  const toggle = (key, f, btn, xp, why) => { const a = L(key, []), on = !a.includes(f); S(key, on ? [...a, f] : a.filter((x) => x !== f)); btn.setAttribute("aria-pressed", String(on));
    if (on) { const done = L(key + "-xp", []); if (!done.includes(f)) { S(key + "-xp", [...done, f]); if (G()) G().award(xp, why); } const b = btn.getBoundingClientRect(); if (G()) G().confetti(30, b.left + b.width / 2, b.top); snd(key === "b3-likes" ? "beep" : "stamp"); } return on; };
  const burst = (r) => { const h = document.createElement("span"); h.className = "rl-burst"; h.textContent = "Gefeiert"; r.appendChild(h); setTimeout(() => h.remove(), 850); };
  const open = (r) => { sec.classList.add("is-full"); document.documentElement.classList.add("rl-lock"); r.scrollIntoView({ block: "start" }); snd("crowd"); sec.querySelector("[data-reels-close]").focus({ preventScroll: true }); };
  const close = () => { const r = [...tr.querySelectorAll(".rl")].find((x) => x.classList.contains("is-on")); sec.classList.remove("is-full"); document.documentElement.classList.remove("rl-lock"); if (r) r.scrollIntoView({ block: "nearest", inline: "start" }); };
  let tap = 0;
  tr.addEventListener("click", (e) => { const r = e.target.closest(".rl"); if (!r) return; const f = r.dataset.reel;
    const lk = e.target.closest("[data-like]"), sv = e.target.closest("[data-save]"), sh = e.target.closest("[data-share]");
    if (lk) { if (toggle("b3-likes", f, lk, 2, "Act gefeiert")) burst(r); return; }
    if (sv) { toggle("b3-saved", f, sv, 2, "Act gemerkt"); return; }
    if (sh) { const u = new URL(f, location.href).href, t = r.querySelector(".rl-hook").textContent; if (navigator.share) navigator.share({ title: t, url: u }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(u).then(() => { sh.querySelector("span").textContent = "Kopiert"; setTimeout(() => sh.querySelector("span").textContent = "Teilen", 1500); }); return; }
    if (e.target.closest("a")) return;
    if (!sec.classList.contains("is-full")) { open(r); return; }
    const now = Date.now(); if (now - tap < 320) { const b = r.querySelector("[data-like]"); if (b.getAttribute("aria-pressed") !== "true") toggle("b3-likes", f, b, 2, "Act gefeiert"); burst(r); tap = 0; } else tap = now; });
  sec.querySelector("[data-reels-close]").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (!sec.classList.contains("is-full")) return; if (e.key === "Escape") close(); if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); tr.scrollBy({ top: (e.key === "ArrowDown" ? 1 : -1) * innerHeight, behavior: "smooth" }); } });
})();
/* Academy-Feed: Feiern, Merken, Teilen, Mehr laden, Tabs */
(() => {
  const feed = document.querySelector(".sm-feed"); if (!feed) return;
  const L = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }, S = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const G = () => window.B3G, snd = (n) => { if (window.B3S) B3S.play(n); };
  const read = L("b3-read", []);
  feed.querySelectorAll(".sm-post").forEach((p) => { const f = p.dataset.post; p.classList.toggle("is-seen", read.includes(f));
    p.querySelector("[data-like]").setAttribute("aria-pressed", String(L("b3-likes", []).includes(f))); p.querySelector("[data-save]").setAttribute("aria-pressed", String(L("b3-saved", []).includes(f))); });
  const toggle = (key, f, btn, xp, why) => { const a = L(key, []), on = !a.includes(f); S(key, on ? [...a, f] : a.filter((x) => x !== f)); btn.setAttribute("aria-pressed", String(on));
    if (on) { const done = L(key + "-xp", []); if (!done.includes(f)) { S(key + "-xp", [...done, f]); if (G()) G().award(xp, why); } const b = btn.getBoundingClientRect(); if (G()) G().confetti(26, b.left + b.width / 2, b.top); snd(key === "b3-likes" ? "beep" : "stamp"); } };
  feed.addEventListener("click", (e) => { const p = e.target.closest(".sm-post"); if (!p) return; const f = p.dataset.post;
    const lk = e.target.closest("[data-like]"), sv = e.target.closest("[data-save]"), sh = e.target.closest("[data-share]");
    if (lk) toggle("b3-likes", f, lk, 2, "Act gefeiert");
    else if (sv) toggle("b3-saved", f, sv, 2, "Act gemerkt");
    else if (sh) { const u = new URL(f, location.href).href, t = p.querySelector(".sm-post__media b").textContent; if (navigator.share) navigator.share({ title: t, url: u }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(u).then(() => { sh.textContent = "Link kopiert"; setTimeout(() => sh.textContent = "Teilen", 1500); }); } });
  const more = feed.querySelector("[data-more]"); if (more) more.addEventListener("click", () => { feed.classList.add("is-all"); snd("chime"); });
  const tabs = [...document.querySelectorAll(".sm-tabs a")];
  if ("IntersectionObserver" in window && tabs.length) { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) tabs.forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-40% 0px -55% 0px" });
    tabs.forEach((a) => { const t = document.getElementById(a.getAttribute("href").slice(1)); if (t) io.observe(t); }); }
})();
/* Academy (Social-Layout): keine Icon-Glyphen im Text */
(() => {
  if (!document.body.classList.contains("mx-social")) return;
  const RX = /\s?[→←↗↓✓♥♫🔊🔈✚▶]️?/g;
  const strip = (root) => { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (RX.test(n.nodeValue)) { RX.lastIndex = 0; n.nodeValue = n.nodeValue.replace(RX, ""); } RX.lastIndex = 0; };
  strip(document.body);
  let t; new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => strip(document.body), 30); }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
/* Academy-Feed: Posts beim Scrollen einblenden */
(() => {
  const ps = document.querySelectorAll(".sm-post"); if (!ps.length) return;
  if (!("IntersectionObserver" in window)) { ps.forEach((p) => p.classList.add("is-in")); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: .15 });
  ps.forEach((p) => io.observe(p));
  document.addEventListener("click", (e) => { if (e.target.closest("[data-more]")) setTimeout(() => document.querySelectorAll(".sm-post.is-x").forEach((p) => io.observe(p)), 50); });
})();
