document.documentElement.classList.add("js");

// Folien einblenden, sobald sie ins Bild kommen
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-in");
    io.unobserve(e.target);
  });
}, { threshold: 0.08 });
document.querySelectorAll(".slide, .fullbleed").forEach((s) => io.observe(s));

// Kundenliste: Bildvorschau folgt der Maus (nur mit Maus)
const preview = document.querySelector(".cursor-img");
if (preview && window.matchMedia("(hover: hover) and (min-width: 901px)").matches) {
  const pImg = preview.querySelector("img");
  let x = 0, y = 0, cx = 0, cy = 0, raf = null;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loop = () => {
    cx += (x - cx) * 0.16; cy += (y - cy) * 0.16;
    preview.style.left = `${cx}px`; preview.style.top = `${cy}px`;
    raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(loop) : null;
  };
  document.querySelectorAll(".work__list li[data-img]").forEach((li) => {
    li.addEventListener("pointerenter", (e) => {
      pImg.src = li.dataset.img;
      if (!preview.classList.contains("is-on")) { cx = x = e.clientX; cy = y = e.clientY; preview.style.left = `${cx}px`; preview.style.top = `${cy}px`; }
      preview.classList.add("is-on");
    });
    li.addEventListener("pointerleave", () => preview.classList.remove("is-on"));
    li.addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      if (reduce) { preview.style.left = `${x}px`; preview.style.top = `${y}px`; return; }
      if (!raf) raf = requestAnimationFrame(loop);
    });
  });
}

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
