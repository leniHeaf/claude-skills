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

Danach Claude Code neu starten. Mit `/skills` siehst du, ob sie geladen sind.

## Enthaltene Skills

| Skill | Quelle | Wofür |
| --- | --- | --- |
| `emil-design-eng` | [Emil Kowalski](https://github.com/emilkowalski/skill) | Design-Engineering-Philosophie, Polish, Details |
| `animate` | Emil Kowalski | Animationen nach seinem Motion-System bauen |
| `improve-animations` | Emil Kowalski | bestehende Animationen verbessern |
| `review-animations` | Emil Kowalski | Animationen prüfen (Easing, Timing, Springs) |
| `impeccable` | [Paul Bakaus](https://github.com/pbakaus/impeccable) | Design-Audit, Typografie, Layout, Polish |
| `taste-skill` | [Leonxlnx](https://github.com/Leonxlnx/taste-skill) | „Anti-Slop“: kein generischer KI-Look |
| `ui-ux-pro-max` | [Next Level Builder](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Stile, Farbpaletten, Font-Paare, UX-Regeln |

Ergänzend nützlich: Komponenten von [21st.dev](https://21st.dev/community/components)
(per `npx shadcn@latest add "<URL>"`) und [Motion / Framer Motion](https://motion.dev) (`npm i motion`).

## Beispiel-Prompt

```text
Baue mir eine Landingpage für <Firma/Angebot> mit React, Tailwind und Framer Motion.
Nutze die Skills taste-skill, emil-design-eng und ui-ux-pro-max. Prüfe danach mit /impeccable audit.
```

## Lizenzen

Alle Skills stammen von ihren jeweiligen Autor:innen (MIT bzw. Apache-2.0).
Die Original-Lizenz liegt jeweils als `LICENSE.upstream` im Skill-Ordner.
