document.documentElement.classList.add("js");

// Navigation: Rand beim Scrollen, Mobilmenü
const nav = document.querySelector(".nav");
const sentinel = document.createElement("div");
sentinel.style.cssText = "position:absolute;top:0;height:1px;width:1px";
document.body.prepend(sentinel);
new IntersectionObserver(([entry]) => {
  nav.classList.toggle("is-scrolled", !entry.isIntersecting);
}).observe(sentinel);

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

// Einblenden beim Scrollen, gestaffelt innerhalb einer Sektion
const reveals = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-in");
    io.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll("section").forEach((section) => {
  section.querySelectorAll(".reveal").forEach((el, i) => el.style.setProperty("--d", `${Math.min(i, 5) * 70}ms`));
});
reveals.forEach((el) => io.observe(el));

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
