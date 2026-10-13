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
  const head = document.querySelector(".mx-head-wrap");
  const float = document.querySelector(".mx-float");
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    if (head && !document.body.classList.contains("menu-open")) head.classList.toggle("is-hidden", y > lastY && y > 300);
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

  document.querySelectorAll("[data-year]").forEach((e) => { e.textContent = new Date().getFullYear(); });
})();
