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
    cu.innerHTML = '<span class="mx-flag mx-curtain__flag" data-flag data-amp="9" data-speed="1.6"></span>';
    document.body.appendChild(cu);
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname || !/\.html$|\/$/.test(u.pathname)) return;
      e.preventDefault();
      cu.className = "mx-curtain is-in";
      setTimeout(() => { location.href = a.href; }, 520);
    });
    addEventListener("pageshow", () => { cu.className = "mx-curtain"; });
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
  const tiles = document.querySelectorAll(".mo-work[data-cat]");
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
  document.querySelectorAll("form[data-form], form[data-newsletter]").forEach((form) => form.addEventListener("submit", (e) => {
    e.preventDefault();
    const st = form.querySelector(".form__status");
    const bad = [...form.querySelectorAll("[required]")].find((el) => !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value)));
    if (bad) { if (st) st.textContent = "Bitte füllt alle Pflichtfelder korrekt aus."; bad.focus(); return; }
    if (st) st.textContent = form.matches("[data-newsletter]") ? "Danke! Wir melden uns, sobald es losgeht." : "Danke! Wir melden uns innerhalb von zwei Werktagen.";
    form.reset();
  }));
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
  document.querySelectorAll(".mo-bird__p").forEach((p, k) => p.setAttribute("data-px", `y:${[-1, 0.6, -0.4][k] || 0}`));
  
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
  ov.innerHTML = '<div class="mo-ov__w">' + "B3DE".split("").map((c, i) => `<span style="--i:${i}">${c}</span>`).join("") + '</div><div class="mo-ov__c"><span>Marken, für die man einsteht</span><span>Köln · Saalbach · Sonneberg</span></div><i class="mo-ov__bar"></i>';
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
  if (sec && document.body.classList.contains("mx-home") && matchMedia("(min-width: 1000px)").matches) {
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
  const srcs = [...document.querySelectorAll(".mx-show__slides img")].map((i) => i.currentSrc || i.src).filter(Boolean);
  if (!srcs.length) return;
  const pk = document.createElement("div"); pk.className = "mo-peek"; pk.innerHTML = `<img alt="" src="${srcs[0]}">`;
  document.body.appendChild(pk);
  const img = pk.firstChild; let k = 0, x = 0, y = 0, tx = 0, ty = 0, on = false, timer = 0, raf = 0;
  const loop = () => { x += (tx - x) * 0.14; y += (ty - y) * 0.14; pk.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) rotate(${((tx - x) * 0.04).toFixed(2)}deg)`; raf = on || Math.abs(tx - x) > 0.5 ? requestAnimationFrame(loop) : 0; };
  hero.addEventListener("mouseenter", (e) => { on = true; x = tx = e.clientX; y = ty = e.clientY; pk.classList.add("on"); timer = setInterval(() => { k = (k + 1) % srcs.length; img.src = srcs[k]; }, 800); if (!raf) raf = requestAnimationFrame(loop); });
  hero.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
  hero.addEventListener("mouseleave", () => { on = false; pk.classList.remove("on"); clearInterval(timer); });
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
    const at = land.features.find((f) => f.properties.name === "Austria");
    const borders = topo.mesh(W, W.objects.countries, (a, b) => a !== b);
    const pins = [["KÖLN", 6.96, 50.94], ["SONNEBERG", 11.17, 50.36], ["SAALBACH", 12.64, 47.39]];
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
      if (!dragging && !reduce) spin += 0.12 * (1 - e) + 0.01;
      const sl = target[0] + 180 + spin;
      let dl = ((target[0] - sl) % 360 + 540) % 360 - 180;
      lam = sl + dl * e; phi = -22 + (target[1] + 22) * e;
      const z = ease(Math.max(0, Math.min(1, (raw - .45) / .55)));
      base = 1 + 3.4 * z;
      proj.scale((size / 2 - 4) * base);
      const lab = z > .8;
      proj.rotate([lam, phi]);
      const s = size;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, s, s); ctx.save(); ctx.beginPath(); ctx.arc(s / 2, s / 2, s / 2 - 3, 0, 7); ctx.clip();
      ctx.beginPath(); path({ type: "Sphere" }); ctx.fillStyle = bg; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = ink; ctx.stroke();
      ctx.beginPath(); path(grat); ctx.lineWidth = .6; ctx.strokeStyle = "rgba(10,10,10,.22)"; ctx.stroke();
      ctx.beginPath(); path(land); ctx.fillStyle = "rgba(10,10,10,.12)"; ctx.fill();
      ctx.beginPath(); path(borders); ctx.lineWidth = .5; ctx.strokeStyle = "rgba(10,10,10,.35)"; ctx.stroke();
      ctx.beginPath(); path(at); ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.strokeStyle = ink; ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); path(de); ctx.fillStyle = ink; ctx.fill();
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
      ctx.restore(); ctx.beginPath(); ctx.arc(s / 2, s / 2, s / 2 - 3, 0, 7); ctx.lineWidth = 1.5; ctx.strokeStyle = ink; ctx.stroke();
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
  const g = document.querySelector("[data-globe]"); if (g) { g.setAttribute("role", "img"); g.setAttribute("aria-label", "Weltkugel mit den Standorten Köln, Sonneberg und Saalbach-Hinterglemm"); }
  document.querySelectorAll('a[target="_blank"]').forEach((a) => { if (!/noopener/.test(a.rel)) a.rel = (a.rel + " noopener").trim(); if (!a.querySelector(".sr")) a.insertAdjacentHTML("beforeend", '<span class="sr"> (öffnet in neuem Tab)</span>'); });
})();
