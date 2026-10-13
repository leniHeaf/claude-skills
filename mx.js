/* STUDIO X – Klarheit von Helder, Haltung von Motto */
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
