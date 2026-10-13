/* STUDIO X – Noir Edition */
(() => {
  const doc = document.documentElement;
  doc.classList.add("nx-js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Aufdecken beim Scrollen
  const els = document.querySelectorAll("[data-r], [data-mask]");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach((e) => e.classList.add("in"));
  } else {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  // Kopfleiste: beim Runterscrollen weg, beim Hochscrollen da
  const head = document.querySelector(".nx-head");
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (head && !document.body.classList.contains("menu-open")) head.classList.toggle("is-hidden", y > lastY && y > 200);
    lastY = y;
  }, { passive: true });

  // Menü (mobil)
  const burger = document.querySelector(".nx-burger");
  const menu = document.querySelector(".nx-menu");
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

  // Leistungen: Bild folgt der Maus
  const list = document.querySelector(".nx-svc");
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (list && fine && !reduce) {
    const fl = document.createElement("div");
    fl.className = "nx-float";
    fl.setAttribute("aria-hidden", "true");
    const imgs = [...list.querySelectorAll("a[data-img]")].map((a) => {
      const i = new Image();
      i.src = a.dataset.img; i.alt = ""; i.decoding = "async";
      fl.appendChild(i);
      return [a, i];
    });
    document.body.appendChild(fl);
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (x - cx) * 0.14; cy += (y - cy) * 0.14;
      fl.style.transform = `translate3d(${cx + 30}px, ${cy - 160}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    imgs.forEach(([a, i]) => {
      a.addEventListener("pointerenter", () => { imgs.forEach(([, j]) => j.classList.toggle("is-on", j === i)); fl.classList.add("is-on"); });
    });
    list.addEventListener("pointerleave", () => fl.classList.remove("is-on"));
    addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
  }

  // Jahr
  document.querySelectorAll("[data-year]").forEach((e) => { e.textContent = new Date().getFullYear(); });
})();
