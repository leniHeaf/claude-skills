document.documentElement.classList.add("js");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Mobilmenü
const toggle = document.querySelector(".nav__toggle");
const menu = document.getElementById("menu");
const setMenu = (open) => {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  menu.classList.toggle("is-open", open);
};
toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// Statement: Text in Wörter teilen
const words = document.querySelector("[data-words]");
if (words) {
  words.innerHTML = words.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
}

// Arbeiten: Bildvorschau folgt dem Cursor (nur mit Maus)
const preview = document.querySelector(".cursor-img");
const previewImg = preview.querySelector("img");
const canHover = window.matchMedia("(hover: hover) and (min-width: 801px)").matches;
if (canHover) {
  let x = 0, y = 0, cx = 0, cy = 0, raf = null;
  const loop = () => {
    cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
    preview.style.left = `${cx}px`; preview.style.top = `${cy}px`;
    raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(loop) : null;
  };
  document.querySelectorAll(".work__row").forEach((row) => {
    row.addEventListener("pointerenter", (e) => {
      previewImg.src = row.dataset.img;
      if (!preview.style.left) { cx = e.clientX; cy = e.clientY; }
      preview.style.opacity = "1"; preview.style.scale = "1.18";
    });
    row.addEventListener("pointerleave", () => { preview.style.opacity = "0"; preview.style.scale = "1"; });
    row.addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      if (reduce) { cx = x; cy = y; preview.style.left = `${x}px`; preview.style.top = `${y}px`; return; }
      if (!raf) raf = requestAnimationFrame(loop);
    });
  });
}

// Animationen mit GSAP (falls geladen und Bewegung erlaubt)
window.addEventListener("load", () => {
  const ws = words ? words.querySelectorAll(".w") : [];
  if (reduce || !window.gsap) { ws.forEach((w) => w.classList.add("on")); return; }
  gsap.registerPlugin(ScrollTrigger);

  // Hero: Zeilen fahren von unten ein
  gsap.from(".line__in", { yPercent: 110, duration: 1.2, ease: "power4.out", stagger: 0.1, delay: 0.1 });
  gsap.from("[data-anim='fade']", { opacity: 0, y: 16, duration: 1, ease: "power3.out", delay: 0.6, stagger: 0.1 });

  // Hero: wechselnde Leistung
  const items = gsap.utils.toArray(".hero__rotator span");
  gsap.set(items, { yPercent: 100, opacity: 1 });
  gsap.set(items[0], { yPercent: 0 });
  const tl = gsap.timeline({ repeat: -1 });
  items.forEach((el, i) => {
    const next = items[(i + 1) % items.length];
    tl.to(el, { yPercent: -100, duration: 0.6, ease: "power3.inOut" }, "+=1.6")
      .fromTo(next, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: "power3.inOut" }, "<");
  });

  // Statement: Wörter leuchten beim Scrollen auf
  ScrollTrigger.create({
    trigger: words, start: "top 80%", end: "bottom 45%", scrub: true,
    onUpdate: (self) => {
      const n = Math.round(self.progress * ws.length);
      ws.forEach((w, i) => w.classList.toggle("on", i < n));
    },
  });

  // Elemente fahren beim Scrollen ein
  gsap.utils.toArray("[data-anim='up']").forEach((el) => {
    gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });
  gsap.utils.toArray(".work__row").forEach((el, i) => {
    gsap.from(el, { y: 30, opacity: 0, duration: 0.9, ease: "power3.out", delay: i * 0.04, scrollTrigger: { trigger: el, start: "top 92%", once: true } });
  });

  // Zahlen zählen hoch
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 1.4, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
      onUpdate: () => { el.textContent = Math.round(obj.v); },
    });
  });
});

// Kontaktformular: Prüfung und Versand per E-Mail-Programm
// Für echten Versand ohne E-Mail-Programm z. B. Formspree oder Netlify Forms anbinden.
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const rules = {
  name: (v) => (v.trim() ? "" : "Bitte gib deinen Namen an."),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Bitte gib eine gültige E-Mail-Adresse an."),
  message: (v) => (v.trim().length >= 10 ? "" : "Bitte schreib mindestens einen kurzen Satz."),
};
const showError = (id, msg) => {
  const input = form.elements[id];
  const err = document.getElementById(`${id}-error`);
  err.textContent = msg;
  input.setAttribute("aria-invalid", msg ? "true" : "false");
  if (msg) input.setAttribute("aria-describedby", `${id}-error`);
  else input.removeAttribute("aria-describedby");
};
Object.keys(rules).forEach((id) => {
  form.elements[id].addEventListener("blur", (e) => showError(id, rules[id](e.target.value)));
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let firstInvalid = null;
  Object.entries(rules).forEach(([id, check]) => {
    const msg = check(form.elements[id].value);
    showError(id, msg);
    if (msg && !firstInvalid) firstInvalid = form.elements[id];
  });
  const privacyOk = form.elements.privacy.checked;
  showError("privacy", privacyOk ? "" : "Bitte bestätige die Datenschutzerklärung.");
  if (!privacyOk && !firstInvalid) firstInvalid = form.elements.privacy;
  if (firstInvalid) { firstInvalid.focus(); return; }

  const d = Object.fromEntries(new FormData(form));
  const body = `Name: ${d.name}\nE-Mail: ${d.email}\nThema: ${d.service}\n\n${d.message}`;
  window.location.href = `mailto:hallo@leniheaf.de?subject=${encodeURIComponent(`Projektanfrage: ${d.service}`)}&body=${encodeURIComponent(body)}`;
  statusEl.textContent = "Dein E-Mail-Programm öffnet sich mit deiner Anfrage. Falls nicht, schreib direkt an hallo@leniheaf.de.";
});

document.getElementById("year").textContent = new Date().getFullYear();
