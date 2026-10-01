# Claude Skills – die „10.000-Euro-Website“

Eine professionelle Landingpage, gebaut mit Claude Code, Framer Motion (`motion`) und den Design-Skills aus dem Video.

## 1. Skills mit einem Befehl installieren

```bash
bash install-skills.sh            # nur für dieses Projekt (.claude/skills)
bash install-skills.sh --global   # für alle Projekte (~/.claude/skills)
```

Installiert werden:

| Skill | Quelle | Wofür |
| --- | --- | --- |
| `emil-design-eng`, `animate`, `improve-animations`, `review-animations` | [emilkowalski/skill](https://github.com/emilkowalski/skill) | Motion-System: Easing, Timing, Springs |
| `impeccable` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Design-Audit, Polish, Typografie |
| `taste-skill` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | Kein KI-Einheitslook („Anti-Slop“) |
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Paletten, Font-Paare, UX-Regeln |

Danach Claude Code neu starten. Komponenten von [21st.dev](https://21st.dev/community/components) lassen sich zusätzlich per `npx shadcn@latest add "<URL>"` einfügen.

## 2. Die Website

`website/` enthält die fertige Landingpage für das fiktive Digitalstudio **Werkraum**:
Hero mit 3D-Mockup (Spring-Tilt), Logo-Laufband, Bento-Leistungen, Projekte, animierte Kennzahlen,
scrollgesteuerter Prozess, Preise, FAQ-Akkordeon und Kontaktformular.

Stack: Vite · React 19 · TypeScript · Tailwind CSS v4 · Motion · Phosphor Icons · Geist.

```bash
cd website
npm install
npm run dev     # http://localhost:5173
npm run build   # statischer Build in website/dist
```

Die Animationen folgen den Skill-Regeln: kräftiges `ease-out`, UI-Animationen unter 300 ms,
`scale(0.97)` beim Drücken und `prefers-reduced-motion` wird respektiert.

## Der „eine Prompt“ für eigene Seiten

```text
Baue mir eine Landingpage für <Firma/Angebot> mit React, Tailwind und Framer Motion.
Nutze die Skills taste-skill, emil-design-eng und ui-ux-pro-max. Danach prüfe mit /impeccable audit.
```
