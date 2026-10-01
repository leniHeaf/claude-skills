# Claude Skills – Design & Motion

Sammlung von Design-Skills für [Claude Code](https://claude.com/claude-code), mit denen Claude
hochwertige Websites mit sauberem UI/UX und flüssigen Animationen (Framer Motion) baut.

Die Skills liegen fertig in `.claude/skills/` – wer dieses Repo in Claude Code öffnet, hat sie sofort.

## Installation (ein Befehl)

```bash
git clone https://github.com/leniHeaf/claude-skills && bash claude-skills/install-skills.sh
```

| Befehl | Wirkung |
| --- | --- |
| `bash install-skills.sh` | global für alle Projekte (`~/.claude/skills`) |
| `bash install-skills.sh ~/mein-projekt` | nur in ein Projekt |
| `bash install-skills.sh --update` | Skills im Repo auf neuesten Stand von GitHub bringen |
| `npx skills add <repo>` | Skills alternativ über die [skills-CLI](https://skills.sh) holen, z. B. `emilkowalski/skill`, `Leonxlnx/taste-skill` (`skills-lock.json`) |

Danach Claude Code neu starten. Mit `/skills` siehst du, ob sie geladen sind.

## Enthaltene Skills

| Skill | Quelle | Wofür |
| --- | --- | --- |
| `emil-design-eng` | [Emil Kowalski](https://github.com/emilkowalski/skill) | Design-Engineering-Philosophie, Polish, Details |
| `animate` | Emil Kowalski | Animationen nach seinem Motion-System bauen |
| `improve-animations` | Emil Kowalski | bestehende Animationen verbessern |
| `review-animations` | Emil Kowalski | Animationen prüfen (Easing, Timing, Springs) |
| `animate-expo` | Emil Kowalski | Animationen in React Native / Expo (Reanimated, Gestures, Haptics) |
| `animation-vocabulary` | Emil Kowalski | Glossar: vage Beschreibung → exakter Fachbegriff für einen Effekt |
| `apple-design` | Emil Kowalski | Apples Design- und Motion-Prinzipien fürs Web (Springs, Gesten, Tiefe) |
| `ask-sonner` | Emil Kowalski | Sonner-Toasts einrichten, stylen und Probleme lösen |
| `find-animation-opportunities` | Emil Kowalski | Stellen finden, die (nicht) animiert werden sollten |
| `mobile-native` | Emil Kowalski | Web-Apps auf dem Handy nativ wirken lassen (100vh, Notch, Taps …) |
| `pick-ui-library` | Emil Kowalski | passende Frontend-Bibliothek für eine Aufgabe wählen |
| `prototype` | Emil Kowalski | mehrere UI-Varianten bauen und live per Picker vergleichen |
| `write-swift` | Emil Kowalski | modernes Swift schreiben (Swift 6, Concurrency, Testing) |
| `impeccable` | [Paul Bakaus](https://github.com/pbakaus/impeccable) | Design-Audit, Typografie, Layout, Polish |
| `design-taste-frontend` | [Leonxlnx](https://github.com/Leonxlnx/taste-skill) | Anti-Slop-Frontend: kein generischer KI-Look (ehem. `taste-skill`) |
| `design-taste-frontend-v1` | Leonxlnx | Original-v1 des Taste-Skills (nur für exakte Kompatibilität) |
| `redesign-existing-projects` | Leonxlnx | bestehende Websites/Apps auf Premium-Niveau heben |
| `high-end-visual-design` | Leonxlnx | „teurer“ Agentur-Look: Fonts, Abstände, Schatten, Karten |
| `minimalist-ui` | Leonxlnx | ruhige Editorial-UIs, warme Monochrom-Palette |
| `industrial-brutalist-ui` | Leonxlnx | brutalistisch-technischer Swiss/Terminal-Stil |
| `gpt-taste` | Leonxlnx | Layout-Varianz, AIDA-Struktur, GSAP-ScrollTrigger |
| `stitch-design-taste` | Leonxlnx | DESIGN.md-Designsysteme für Google Stitch |
| `full-output-enforcement` | Leonxlnx | verhindert gekürzten Code und Platzhalter |
| `image-to-code` | Leonxlnx | erst Design-Bilder generieren, dann nachbauen |
| `imagegen-frontend-web` | Leonxlnx | Website-Designreferenzen als Bilder (pro Sektion) |
| `imagegen-frontend-mobile` | Leonxlnx | Mobile-App-Screens als Bilder generieren |
| `brandkit` | Leonxlnx | Brand-Kit-Boards: Logos, Identität, Guidelines |
| `ui-ux-pro-max` | [Next Level Builder](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Stile, Farbpaletten, Font-Paare, UX-Regeln |

Ergänzend nützlich: Komponenten von [21st.dev](https://21st.dev/community/components)
(per `npx shadcn@latest add "<URL>"`) und [Motion / Framer Motion](https://motion.dev) (`npm i motion`).

## Beispiel-Prompt

```text
Baue mir eine Landingpage für <Firma/Angebot> mit React, Tailwind und Framer Motion.
Nutze die Skills design-taste-frontend, emil-design-eng und ui-ux-pro-max. Prüfe danach mit /impeccable audit.
```

## Lizenzen

Alle Skills stammen von ihren jeweiligen Autor:innen (MIT bzw. Apache-2.0).
Die Original-Lizenz liegt jeweils als `LICENSE.upstream` im Skill-Ordner.
