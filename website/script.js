document.documentElement.classList.add("js");

// Plakat-Blätter einblenden, sobald sie ins Bild kommen
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-in");
    io.unobserve(e.target);
  });
}, { threshold: 0.08 });
document.querySelectorAll(".sheet").forEach((s) => io.observe(s));

// Live-Uhrzeit im Datenblock (wie der „Snapshot“ auf dem Plakat)
const clock = document.getElementById("clock");
const tick = () => {
  clock.textContent = new Date().toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin", hour12: false });
};
tick();
setInterval(tick, 1000);

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
