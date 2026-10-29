import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  BookOpen, Award, Users, ChevronRight, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── INHALTE AUS DEM TÄUBERT BRANDBOOK ───────────────────────────────────────

const MODULES = [
  {
    id: "m1",
    level: 1,
    badge: "🎯",
    title: "Was ist Täubert?",
    color: "text-chart-2",
    bg: "bg-chart-2/10 border-chart-2/20",
    text: `
**Täubert Karosserie & Lack** steht für Premium-Qualität in der Fahrzeuginstandsetzung. Wir sind keine durchschnittliche Werkstatt — wir sind ein Premiumbetrieb, der Fahrzeuge mit Leidenschaft und handwerklicher Exzellenz wiederherstellt.

**Unsere Kernwerte:**
- **Qualität vor Geschwindigkeit** — Lieber ein Tag länger, dafür 100% makellos.
- **Ordnung ist Pflicht, nicht Option** — Jeder Arbeitsplatz wird sauber verlassen wie er vorgefunden wurde.
- **Kommunikation auf Augenhöhe** — Intern wie mit dem Kunden: klar, respektvoll, professionell.
- **Verantwortung übernehmen** — Fehler melden, nicht verstecken. Wir lösen Probleme gemeinsam.

**Premiumverhalten im Alltag:**
Jeder Mitarbeiter repräsentiert die Marke Täubert — im Umgang mit Fahrzeugen, mit Kollegen und mit Kunden. Premiumservice beginnt nicht an der Übernahme, sondern beim ersten Handgriff in der Werkstatt.

**Ordnung als Fundament:**
Ein unordentlicher Arbeitsplatz kostet Zeit, erhöht Fehlerrisiken und sendet das falsche Signal an alle. Bei Täubert gilt: Der Arbeitsplatz muss am Ende des Tages besser aussehen als zu Beginn.
    `,
    quiz: [
      {
        question: "Was ist bei Täubert wichtiger als Geschwindigkeit?",
        options: ["Menge der erledigten Aufträge", "Qualität des Ergebnisses", "Pünktlichkeit der Übergabe", "Teilebestellung"],
        correct: 1,
      },
      {
        question: "Was gilt bei Täubert für Fehler?",
        options: ["Fehler unter den Tisch kehren", "Fehler dem Kunden verrechnen", "Fehler melden und gemeinsam lösen", "Fehler ignorieren wenn klein"],
        correct: 2,
      },
      {
        question: "Wann beginnt Premiumservice laut Täubert-Standard?",
        options: ["Bei der Fahrzeugübergabe", "Beim ersten Handgriff in der Werkstatt", "Nach der Lackierung", "Beim Kundenkontakt"],
        correct: 1,
      },
    ],
  },
  {
    id: "m2",
    level: 1,
    badge: "🛡️",
    title: "Sicherheit & Schutzausrüstung",
    color: "text-chart-2",
    bg: "bg-chart-2/10 border-chart-2/20",
    text: `
**Persönliche Schutzausrüstung (PSA) ist keine Option — sie ist Pflicht.**

Bei Täubert arbeiten wir täglich mit chemischen Substanzen, Schleifwerkzeugen und Lacksystemen, die bei falscher Handhabung gefährlich sind.

**Pflicht-PSA je Arbeitsbereich:**
- **Schleifen/Karosserie:** Schutzbrille, Atemschutzmaske FFP2, Schutzhandschuhe
- **Lackierkabine:** Vollmaske mit A2P3-Kombikartuschen, Einwegschutzanzug, Handschuhe
- **Finish/Polieren:** Schutzbrille, Gehörschutz bei Exzentern, Handschuhe

**Gefahrstoffe richtig handhaben:**
Lösemittelhaltige Produkte (Verdünner, Reiniger, Grundierungen) müssen im Gefahrstofflager gelagert werden. Niemals in der Nähe offener Flammen verarbeiten. Lüftung immer einschalten. Reste nicht in den Ausguss, sondern in Gefahrstoffbehälter.

**Goldene Regel:**
Wenn du dir nicht sicher bist, ob du PSA benötigst — trag sie. Es ist immer besser, einmal zu viel geschützt zu sein.
    `,
    quiz: [
      {
        question: "Welche Maske ist in der Lackierkabine Pflicht?",
        options: ["Staubmaske FFP1", "Vollmaske mit A2P3-Kartuschen", "Einwegmaske FFP2", "Keine, die Kabine hat eigene Lüftung"],
        correct: 1,
      },
      {
        question: "Wohin gehören Reste lösemittelhaltiger Produkte?",
        options: ["In den Ausguss", "In den normalen Müll", "In Gefahrstoffbehälter", "Ins Freie kippen"],
        correct: 2,
      },
      {
        question: "Was gilt bei Unsicherheit über PSA-Bedarf?",
        options: ["Ohne PSA weiterarbeiten", "Kollegen fragen und warten", "PSA immer tragen wenn unsicher", "Aufhören zu arbeiten"],
        correct: 2,
      },
    ],
  },
  {
    id: "m3",
    level: 2,
    badge: "⚡",
    title: "Schleifen & Übergänge",
    color: "text-chart-3",
    bg: "bg-chart-3/10 border-chart-3/20",
    text: `
**Die Vorbereitung entscheidet über das Ergebnis. Immer.**

In der Karosserie- und Lackbranche gilt: 70% der Qualität eines Lackierergebnisses entsteht in der Vorbereitung. Wer hier spart, zahlt am Ende doppelt.

**Schleifkörnung im Überblick:**
- **P80–P120:** Grobschliff, Material abtragen, alte Schichten entfernen
- **P150–P220:** Zwischenschliff, Spachteloberfläche glätten
- **P320–P400:** Feinschliff vor dem Füllerauftrag
- **P800–P1500:** Nassschliff nach Füller oder vor Klarlack
- **P2000+:** Finishing, Hologramme entfernen

**Schleifbild prüfen — die Lichtkontrolle:**
Nach jedem Schleifgang: Streiflicht verwenden. Die Lampe seitlich halten und über die Fläche führen. Kratzer, Unebenheiten und Schleifspuren werden sofort sichtbar. Wer keine Zeit für die Lichtkontrolle hat, hat keine Zeit für Qualität.

**Übergänge perfekt auslaufen lassen:**
Übergangsbereiche werden mit P320–P400 trocken, dann mit P600–P800 nass ausgeschliffen und mit Scotch-Brite gebrochen. Kante nie abrupt enden lassen — immer weich auslaufen.
    `,
    quiz: [
      {
        question: "Welche Körnung wird für Nassschliff nach dem Füller verwendet?",
        options: ["P80–P120", "P150–P220", "P800–P1500", "P2000+"],
        correct: 2,
      },
      {
        question: "Wie viel Prozent der Lackqualität entsteht in der Vorbereitung?",
        options: ["30%", "50%", "70%", "90%"],
        correct: 2,
      },
      {
        question: "Womit wird das Schleifbild nach jedem Schleifgang geprüft?",
        options: ["Handlampe von oben", "Streiflicht seitlich", "Augenmaß ohne Licht", "Nur mit den Fingern ertasten"],
        correct: 1,
      },
    ],
  },
  {
    id: "m4",
    level: 2,
    badge: "⚡",
    title: "Füllern & Abkleben",
    color: "text-chart-3",
    bg: "bg-chart-3/10 border-chart-3/20",
    text: `
**Füllern: die unsichtbare Brücke zwischen Substrat und Decklack.**

Der Füller schließt feine Schleifriefen, verbessert die Haftung des Decklacks und gibt die letzte Chance, Unebenheiten zu korrigieren.

**Füllertechnik Grundlagen:**
- Viskosität nach Herstellerangabe einmischen (niemals schätzen)
- Grundiertem Untergrund mindestens 30 Min. bei 20°C ablüften lassen
- Auftrag: 2–3 nasse Deckende Kreuzgänge, Abstand ca. 20–25 cm
- Trocknungszeit: 40 Min. bei 60°C oder 24 h bei Raumtemperatur
- Anschließend Nassschliff P800 und Kontrolle mit Schleifmehl

**Staubfreiheit garantieren:**
Staub ist der Feind jeder Lackierung. Vor dem Auftrag: Fläche mit Antistatikwachs oder Silikonentferner reinigen, Staubabsaugung aktivieren, Druckluft durchblasen, Fahrzeug mit Haftgrund-Tuch abwischen.

**Professionelles Abkleben:**
- Masking-Krepp sauber anlegen — keine Wellen, keine Luftblasen
- Einsatz von Kabinenvlies für großflächige Abdeckungen
- Nach dem Auftrag Kreppband sofort, solange Lack noch feucht ist, sauber abziehen
- Kreppkante nie übergehen — immer sauber schneiden oder brechen
    `,
    quiz: [
      {
        question: "Wie wird die Viskosität beim Füllermischen bestimmt?",
        options: ["Nach Gefühl", "Nach Herstellerangabe mit Messbecher", "Nach Farbe des Produktes", "Immer 1:1 mit Wasser"],
        correct: 1,
      },
      {
        question: "Wann wird das Abklebeband nach dem Lackauftrag abgezogen?",
        options: ["Nach vollständiger Trocknung (24h)", "Sofort, solange der Lack noch feucht ist", "Nach dem Polieren", "Erst nach Kundengenehmigung"],
        correct: 1,
      },
      {
        question: "Mit was wird die Fläche direkt vor dem Lackauftrag abgewischt?",
        options: ["Feuchtem Lappen", "Haftgrund-Tuch (Tack-Cloth)", "Zeitungspapier", "Druckluft allein reicht"],
        correct: 1,
      },
    ],
  },
  {
    id: "m5",
    level: 3,
    badge: "🔧",
    title: "Karosserie & Richtarbeiten",
    color: "text-chart-4",
    bg: "bg-chart-4/10 border-chart-4/20",
    text: `
**Präzise Karosseriearbeit ist das Fundament jeder Premium-Instandsetzung.**

Eine unsauber gerichtete Karosserie, falsche Spaltmaße oder übersehene Rostschäden führen zu Reklamationen und Vertrauensverlust. Bei Täubert gilt: Genauigkeit geht vor Schnelligkeit.

**Schadensanalyse systematisch:**
Vor jedem Eingriff vollständige Schadensanalyse: Fotos aus allen Winkeln, Spaltmaße messen (Referenz: Fahrzeug-Reparaturleitfaden), unsichtbare Schäden mit Scanwerkzeug prüfen. Erst denken, dann handeln.

**Schadensfreie Demontage:**
Kunststoffhebel statt Schraubenzieher. Schrauben in beschrifteten Tüten sichern. Kabel und Stecker fotografieren vor dem Lösen. Jede Schraube, die nicht original wieder eingebaut wird, ist ein potenzielles Problem.

**Spaltmaße prüfen & einstellen:**
Spaltmaße sind das sichtbarste Qualitätsmerkmal nach der Instandsetzung. Toleranz: ±1,0 mm laut Täubert-Standard. Gemessen wird mit Spaltmaßlehre an Motorhaube, Türen, Kofferraum. Asymmetrie ist immer ein Fehler.

**Rostschutz:**
Jede blanke Metallfläche muss sofort mit Grundierung oder Korrosionsschutz behandelt werden. Rost, der später sichtbar wird, ist immer ein Fehler der Vorbereitung.
    `,
    quiz: [
      {
        question: "Was ist die Toleranz bei Spaltmaßen laut Täubert-Standard?",
        options: ["±0,5 mm", "±1,0 mm", "±2,0 mm", "±3,0 mm"],
        correct: 1,
      },
      {
        question: "Was wird mit demontierten Schrauben gemacht?",
        options: ["Auf dem Boden liegen lassen", "In beschrifteten Tüten sichern", "Wegwerfen und neue kaufen", "In eine Kiste schütten"],
        correct: 1,
      },
      {
        question: "Womit werden blanke Metallflächen sofort behandelt?",
        options: ["Mit Wasser abspülen", "Mit Grundierung oder Korrosionsschutz", "Mit Füller überstreichen", "Nichts, erst nach dem Schleifen"],
        correct: 1,
      },
    ],
  },
  {
    id: "m6",
    level: 4,
    badge: "🎨",
    title: "Lackiertechnik & Farbton",
    color: "text-chart-1",
    bg: "bg-chart-1/10 border-chart-1/20",
    text: `
**Lackierung ist Handwerk, Wissenschaft und Kunst zugleich.**

Farbtongenauigkeit ist bei Täubert nicht verhandelbar. Kein Kunde akzeptiert einen sichtbaren Farbunterschied — auch wenn der Lack frisch und glänzend ist.

**Lackaufbau verstehen:**
1. **Grundierung/Primer** — Haftung, Korrosionsschutz
2. **Füller** — Unebenheiten egalisieren, Haftbrücke
3. **Basislack** — Farbton, Effekt (Uni, Metallic, Perlmutt)
4. **Klarlack** — Glanz, UV-Schutz, mechanische Beständigkeit

**Farbton & Mischung:**
Farbcode immer vom Fahrzeug ablesen (Typenschild). Mischdatei aus dem Lackmischsystem abrufen. Ausspritzkarte erstellen und gegen das Fahrzeug im Tageslicht vergleichen — nicht im Kabinenlicht. Bei Metallic: Spritzabstand beeinflusst Helligkeit (näher = dunkler, weiter = heller).

**Spritzabstand & Druck:**
- Wasserverdünnbare Lacke: 20–25 cm, 2,0–2,5 bar
- Lösemittelhaltige Lacke: 18–22 cm, 1,8–2,2 bar
- Klarlack: 20–25 cm, gleichmäßige Kreuzgänge, kein Überschneiden

**Staubkontrolle in der Kabine:**
Kabine vor Lackierung mindestens 10 Minuten im Umluft-Betrieb laufen lassen. Fahrzeug vor Einfahrt vollständig entstauben. Kabinenboden anfeuchten.
    `,
    quiz: [
      {
        question: "In welcher Reihenfolge wird der Lackaufbau aufgetragen?",
        options: [
          "Klarlack → Basislack → Füller → Grundierung",
          "Grundierung → Füller → Basislack → Klarlack",
          "Basislack → Grundierung → Füller → Klarlack",
          "Füller → Grundierung → Klarlack → Basislack"
        ],
        correct: 1,
      },
      {
        question: "Wo wird die Ausspritzkarte mit dem Fahrzeug verglichen?",
        options: ["Im Kabinenlicht", "Im Tageslicht", "Unter UV-Licht", "Es spielt keine Rolle"],
        correct: 1,
      },
      {
        question: "Was beeinflusst bei Metalliclack die Helligkeit?",
        options: ["Mischverhältnis des Klarlacks", "Spritzabstand", "Temperatur in der Kabine", "Trocknungszeit"],
        correct: 1,
      },
    ],
  },
  {
    id: "m7",
    level: 5,
    badge: "✨",
    title: "Finish & Lichtkontrolle",
    color: "text-chart-2",
    bg: "bg-chart-2/10 border-chart-2/20",
    text: `
**Der letzte Eindruck ist der bleibende. Kein Kompromiss beim Finish.**

Das Finish ist das, was der Kunde sieht. Eine perfekte Lackierung kann durch schlechtes Polieren ruiniert werden. Bei Täubert gilt: Das Finish dauert so lange, bis es makellos ist.

**Poliermaschine & Scheiben:**
- **Rotationspolierer:** Schneller Materialabtrag, nur für erfahrene Polierer
- **Exzenterpolierer (DA):** Sicherer für Einsteiger, geringere Hologramm-Gefahr
- Polierscheiben immer dem Poliermittel anpassen: Schnittscheibe → Zwischenpolitur → Finishscheibe

**Hologramme erkennen und beseitigen:**
Hologramme entstehen durch Rotationspolierer bei falscher Technik oder zu wenig Poliermittel. Sichtbar nur im Streiflicht oder bei Sonnenlicht. Beseitigung: DA-Exzenter mit Zwischenpolitur, dann Finishpolitur. Nie mit zu viel Druck arbeiten.

**Durchpolierer vermeiden:**
Kanten, Sicken und Radläufe sind gefährdet. Immer weniger Druck an Kanten. Lack vorher mit Lackschichtdickenmessgerät prüfen. Täubert-Standard: Jede Fläche wird nach dem Polieren mit Streiflicht geprüft.

**Finish-Checkliste:**
☐ Hologramme überprüft (Streiflicht)
☐ Staubeinschlüsse beseitigt
☐ Kanten und Sicken überprüft
☐ Scheiben gereinigt
☐ Gummis und Zierleisten abgewischt
☐ Innenraum entstaubt und gereinigt
    `,
    quiz: [
      {
        question: "Welche Poliermaschine ist sicherer für Einsteiger?",
        options: ["Rotationspolierer", "Exzenterpolierer (DA)", "Winkelschleifer", "Bandschleifer"],
        correct: 1,
      },
      {
        question: "Wann sind Hologramme sichtbar?",
        options: ["Immer sofort", "Nur im Streiflicht oder Sonnenlicht", "Nur bei Kunstlicht", "Gar nicht, man spürt sie nur"],
        correct: 1,
      },
      {
        question: "Was wird nach dem Polieren laut Täubert-Standard gemacht?",
        options: ["Sofort übergeben", "Jede Fläche mit Streiflicht prüfen", "Kurze Pause einlegen", "Folie draufkleben"],
        correct: 1,
      },
    ],
  },
  {
    id: "m8",
    level: 6,
    badge: "👑",
    title: "Premiumstandard & Übergabe",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/20",
    text: `
**Die Übergabe ist das Täubert-Ritual. Sie macht den Unterschied.**

Ein Fahrzeug, das technisch perfekt instandgesetzt wurde, kann einen schlechten letzten Eindruck hinterlassen — durch eine schlechte Übergabe. Bei Täubert beginnt die Übergabe nicht an der Rampe, sondern bereits beim letzten Poliertuch.

**Das Übergabe-Ritual bei Täubert:**
1. Fahrzeug innen und außen makellos gereinigt
2. Alle Folien und Schutzmaterialien entfernt
3. Kontrollblatt abgezeichnet
4. Fahrzeug in Übergabeposition gestellt (vorne sauber, gut beleuchtet)
5. Kunden persönlich empfangen, nicht am Tresen abfertigen
6. Schäden, Besonderheiten und Pflegehinweise aktiv erklären

**Premiumsprache im Alltag:**
- Nie: „Das Auto ist fertig." → Stattdessen: „Ihr Fahrzeug ist für Sie vorbereitet."
- Nie: „Da ist ein kleines Problem." → Stattdessen: „Ich möchte Sie über etwas informieren."
- Täubert-Mitarbeiter sprechen ruhig, klar und auf Augenhöhe — immer.

**Bewertung aktiv einholen:**
Nach jeder Übergabe: Kunden aktiv nach Feedback fragen. Google-Bewertung ansprechen. Zufriedene Kunden bringen Empfehlungen. Täubert lebt von Empfehlungsmarketing.

**Verantwortung & Eigenanspruch:**
Premiumqualität ist kein Standard, der von außen auferlegt wird — sie muss von innen kommen. Jeder Mitarbeiter bei Täubert ist verantwortlich für das, was unter seinen Händen entsteht.
    `,
    quiz: [
      {
        question: "Wie lautet die Premiumformulierung statt 'Das Auto ist fertig'?",
        options: [
          "'Das Fahrzeug ist einsatzbereit'",
          "'Ihr Fahrzeug ist für Sie vorbereitet'",
          "'Sie können es holen'",
          "'Fertig, können Sie abholen'"
        ],
        correct: 1,
      },
      {
        question: "Was wird nach jeder Übergabe aktiv angesprochen?",
        options: ["Nächster Termin", "Bezahlung der Rechnung", "Google-Bewertung / Feedback", "Zustand der Bremsen"],
        correct: 2,
      },
      {
        question: "Von wo muss Premiumqualität laut Täubert-Standard kommen?",
        options: ["Von außen, durch Kontrolle", "Von innen, durch Eigenanspruch", "Nur vom Meister", "Nur bei VIP-Kunden"],
        correct: 1,
      },
    ],
  },
];

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

const EMPLOYEE_LEVELS = {
  "Toni": [1, 2, 3, 4, 5, 6, 7, 8],
  "Maik": [3, 4, 5, 6, 7],
  "Marco": [3, 4, 5, 6, 7],
  "Fanny": [1, 2, 6, 8],
  "Pascal": [3, 4, 5, 6, 7],
  "Adrian": [1, 2],
  "Lena": [1, 2],
};

function QuizView({ quiz, onBack }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);

  const q = quiz[currentQ];
  const isLast = currentQ === quiz.length - 1;
  const score = answers.filter(Boolean).length;

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const handleNext = () => {
    const correct = selected === q.correct;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);
    if (isLast) {
      setDone(true);
    } else {
      setCurrentQ(i => i + 1);
      setSelected(null);
    }
  };

  const handleReset = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setDone(false);
  };

  if (done) {
    const passed = score >= Math.ceil(quiz.length * 0.7);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <div className="text-5xl mb-4">{passed ? "🏆" : "📚"}</div>
        <p className="font-heading text-xl text-foreground mb-2">{passed ? "BESTANDEN!" : "NICHT BESTANDEN"}</p>
        <p className="text-sm text-muted-foreground mb-1">{score} von {quiz.length} Fragen richtig</p>
        <p className="text-xs text-muted-foreground mb-6">{passed ? "Sehr gut! Du hast dieses Modul erfolgreich abgeschlossen." : "Mindestens 70% erforderlich. Lies den Text nochmal durch."}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleReset} className="gap-2 border-border">
            <RotateCcw className="w-3.5 h-3.5" /> Nochmal
          </Button>
          <Button onClick={onBack} className="bg-primary">Zurück zum Modul</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={currentQ}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Frage {currentQ + 1} / {quiz.length}</p>
        <div className="flex gap-1">
          {quiz.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${i < currentQ ? "bg-success" : i === currentQ ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>
      </div>
      <p className="text-sm font-semibold text-foreground mb-4">{q.question}</p>
      <div className="space-y-2 mb-6">
        {q.options.map((opt, idx) => {
          let cls = "border border-border bg-secondary text-foreground";
          if (selected !== null) {
            if (idx === q.correct) cls = "border border-success bg-success/10 text-foreground";
            else if (idx === selected && selected !== q.correct) cls = "border border-destructive bg-destructive/10 text-foreground";
            else cls = "border border-border bg-secondary/50 text-muted-foreground";
          } else if (selected === null) {
            cls = "border border-border bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer";
          }
          return (
            <button key={idx} onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all ${cls}`}>
              {selected !== null && idx === q.correct && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
              {selected !== null && idx === selected && selected !== q.correct && <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />}
              {(selected === null || (idx !== q.correct && idx !== selected)) && (
                <span className="w-4 h-4 rounded-full border border-border flex-shrink-0 text-[9px] flex items-center justify-center text-muted-foreground">{String.fromCharCode(65 + idx)}</span>
              )}
              {opt}
            </button>
          );
        })}
      </div>
      <Button onClick={handleNext} disabled={selected === null} className="w-full bg-primary">
        {isLast ? "Auswerten" : "Nächste Frage"} <ChevronRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}

function ModuleCard({ mod, allowed }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("text"); // "text" | "quiz"

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-card border rounded-xl overflow-hidden transition-all ${allowed ? "border-border" : "border-border opacity-40"}`}>
      <button onClick={() => allowed && setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-all text-left">
        <span className="text-xl flex-shrink-0">{mod.badge}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${mod.bg} ${mod.color}`}>LEVEL {mod.level}</span>
            <p className="text-sm font-heading text-foreground">{mod.title}</p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{mod.quiz.length} Quizfragen</p>
        </div>
        {allowed
          ? (open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />)
          : <span className="text-[10px] text-muted-foreground flex-shrink-0">🔒</span>
        }
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/50">
            <div className="p-4">
              {/* Mode switcher */}
              <div className="flex gap-1 p-1 bg-secondary rounded-lg mb-4 w-fit">
                <button onClick={() => setMode("text")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === "text" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                  <BookOpen className="w-3 h-3" /> Lesen
                </button>
                <button onClick={() => setMode("quiz")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === "quiz" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                  <Award className="w-3 h-3" /> Quiz
                </button>
              </div>

              {mode === "text" && (
                <div className="prose prose-sm max-w-none text-foreground">
                  {mod.text.trim().split("\n").map((line, i) => {
                    if (!line.trim()) return <br key={i} />;
                    if (line.startsWith("**") && line.endsWith("**") && !line.slice(2, -2).includes("**")) {
                      return <p key={i} className="font-semibold text-foreground text-sm mb-1">{line.slice(2, -2)}</p>;
                    }
                    // Bold inline
                    const parts = line.split(/\*\*(.*?)\*\*/g);
                    return (
                      <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-1">
                        {parts.map((p, pi) => pi % 2 === 1 ? <strong key={pi} className="text-foreground">{p}</strong> : p)}
                      </p>
                    );
                  })}
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button onClick={() => setMode("quiz")} className="w-full bg-primary gap-2">
                      Quiz starten <Award className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {mode === "quiz" && (
                <QuizView quiz={mod.quiz} onBack={() => setMode("text")} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Academy() {
  const [selectedEmployee, setSelectedEmployee] = useState("Toni");
  const [tab, setTab] = useState("academy");

  const allowedLevels = EMPLOYEE_LEVELS[selectedEmployee] || [];

  const TABS = [
    { key: "academy", label: "Academy", icon: GraduationCap },
    { key: "team", label: "Team", icon: Users },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">TÄUBERT ACADEMY</h1>
        <p className="text-sm text-muted-foreground mt-1">Lerntexte aus dem Brandbook · Quiz zur Wissenskontrolle</p>
      </motion.div>

      {/* Mission Banner */}
      <div className="bg-card border border-warning/20 rounded-xl p-4 mb-6">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground font-semibold">Täubert-DNA:</span>{" "}
          Jede Lektion enthält einen <span className="text-foreground font-medium">Lerntext</span> aus dem Brandbook und ein{" "}
          <span className="text-foreground font-medium">Quiz</span> zur Wissenskontrolle. Mindestens 70% zum Bestehen.
        </p>
      </div>

      {/* Mitarbeiter */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-2">Mitarbeiter</p>
        <div className="flex flex-wrap gap-2">
          {TEAM.map(emp => (
            <button key={emp} onClick={() => setSelectedEmployee(emp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                ${selectedEmployee === emp
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-muted-foreground border-border hover:text-foreground"}`}>
              {emp}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Freigeschaltet</p>
          <p className="font-heading text-2xl text-warning">{MODULES.filter(m => allowedLevels.includes(m.level)).length}</p>
          <p className="text-[10px] text-muted-foreground">von {MODULES.length} Modulen</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Quizfragen</p>
          <p className="font-heading text-2xl text-chart-1">{MODULES.filter(m => allowedLevels.includes(m.level)).reduce((s, m) => s + m.quiz.length, 0)}</p>
          <p className="text-[10px] text-muted-foreground">verfügbar</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* ACADEMY TAB */}
      {tab === "academy" && (
        <div className="space-y-3">
          {MODULES.map(mod => (
            <ModuleCard key={mod.id} mod={mod} allowed={allowedLevels.includes(mod.level)} />
          ))}
        </div>
      )}

      {/* TEAM TAB */}
      {tab === "team" && (
        <div className="space-y-3">
          {TEAM.map((emp, i) => {
            const levels = EMPLOYEE_LEVELS[emp] || [];
            const isAzubi = ["Adrian", "Lena"].includes(emp);
            return (
              <motion.div key={emp} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-heading text-sm text-foreground">
                      {emp[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {emp}
                        {isAzubi && <span className="text-[9px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded border border-border">Azubi</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{levels.length} Module freigeschaltet</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {MODULES.map(m => (
                      <div key={m.id} className={`w-2 h-6 rounded-full ${levels.includes(m.level) ? "bg-primary" : "bg-secondary"}`} />
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}