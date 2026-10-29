import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, GraduationCap,
  User, Shield, Wrench, BookOpen, Award
} from "lucide-react";
import { Link } from "react-router-dom";

// Onboarding-Phasen verknüpft mit Academy-Modulen
const PHASES = [
  {
    id: "tag1",
    label: "Tag 1 – Ankommen",
    icon: User,
    color: "text-chart-2",
    bg: "bg-chart-2/10 border-chart-2/20",
    tasks: [
      { id: "t1_1", text: "Betrieb, Team und Bereiche kennenlernen (Führung)" },
      { id: "t1_2", text: "Täubert-DNA vorstellen: Werte, Qualitätsanspruch, Premiumstandard" },
      { id: "t1_3", text: "Arbeitsplatz, Schrank, Umkleide einrichten" },
      { id: "t1_4", text: "App-Zugang einrichten (Login, Passwort)" },
      { id: "t1_5", text: "Arbeitszeiten, Pausenregeln, Stempeln erklären" },
      { id: "t1_6", text: "Persönliche Schutzausrüstung ausgeben" },
      { id: "t1_7", text: "Notausgänge, Feuerlöscher, Verbandkasten zeigen" },
    ],
    academy: { moduleId: "m1", label: "Academy: Was ist Täubert?" },
  },
  {
    id: "woche1",
    label: "Woche 1 – Sicherheit & Grundlagen",
    icon: Shield,
    color: "text-chart-3",
    bg: "bg-chart-3/10 border-chart-3/20",
    tasks: [
      { id: "w1_1", text: "Sicherheitsunterweisung abgeschlossen (Unterschrift)" },
      { id: "w1_2", text: "Gefahrstofflager & Entsorgung erklärt" },
      { id: "w1_3", text: "PSA für alle Bereiche korrekt anwenden" },
      { id: "w1_4", text: "Erste eigene Aufgaben unter Begleitung erledigt" },
      { id: "w1_5", text: "Ordnung am Arbeitsplatz: Standard erklärt und überprüft" },
      { id: "w1_6", text: "App-Funktionen gezeigt: Aufgaben, Zeiterfassung, Tagesstart" },
    ],
    academy: { moduleId: "m2", label: "Academy: Sicherheit & PSA" },
  },
  {
    id: "woche2",
    label: "Woche 2 – Handwerk Einstieg",
    icon: Wrench,
    color: "text-chart-4",
    bg: "bg-chart-4/10 border-chart-4/20",
    tasks: [
      { id: "w2_1", text: "Schleifkörnung und Einsatzgebiete erklären" },
      { id: "w2_2", text: "Lichtkontrolle nach Schleifarbeiten durchführen" },
      { id: "w2_3", text: "Erste Flächen eigenständig geschliffen (Mentor bewertet)" },
      { id: "w2_4", text: "Abkleben korrekt demonstriert" },
      { id: "w2_5", text: "Maschineneinweisung (Exzenter, Schleifmaschinen)" },
    ],
    academy: { moduleId: "m3", label: "Academy: Schleifen & Übergänge" },
  },
  {
    id: "monat1",
    label: "Monat 1 – Selbstständigkeit",
    icon: BookOpen,
    color: "text-chart-1",
    bg: "bg-chart-1/10 border-chart-1/20",
    tasks: [
      { id: "m1_1", text: "Fahrzeuge eigenständig annehmen und dokumentieren" },
      { id: "m1_2", text: "Aufgaben in der App selbst stempeln und abschließen" },
      { id: "m1_3", text: "Füllern & Vorbereitung unter Aufsicht durchgeführt" },
      { id: "m1_4", text: "Ersten Qualitätscheck eigenständig ausgefüllt" },
      { id: "m1_5", text: "Feedback-Gespräch mit dem Chef (Stärken & Entwicklung)" },
      { id: "m1_6", text: "Academy-Quiz Modul 1–4 bestanden" },
    ],
    academy: { moduleId: "m4", label: "Academy: Füllern & Abkleben" },
  },
  {
    id: "abschluss",
    label: "Abschluss – Vollständig integriert",
    icon: Award,
    color: "text-warning",
    bg: "bg-warning/10 border-warning/20",
    tasks: [
      { id: "a_1", text: "Alle Academy-Pflichtmodule abgeschlossen" },
      { id: "a_2", text: "Eigenständiger Bereich zugewiesen" },
      { id: "a_3", text: "Erste Übergabe selbst begleitet" },
      { id: "a_4", text: "Täubert-Premiumstandard verinnerlicht (Chef-Bestätigung)" },
      { id: "a_5", text: "Probezeitgespräch durchgeführt" },
    ],
    academy: { moduleId: "m8", label: "Academy: Premiumstandard & Übergabe" },
  },
];

const TEAM_NEW = ["Adrian", "Lena"];

function phaseProgress(phase, checked) {
  const done = phase.tasks.filter(t => checked[t.id]).length;
  return { done, total: phase.tasks.length, pct: Math.round((done / phase.tasks.length) * 100) };
}

export default function Onboarding() {
  const [employee, setEmployee] = useState(TEAM_NEW[0]);
  const [checked, setChecked] = useState({});
  const [open, setOpen] = useState("tag1");

  const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));

  const totalDone = PHASES.flatMap(p => p.tasks).filter(t => checked[t.id]).length;
  const totalAll = PHASES.flatMap(p => p.tasks).length;
  const totalPct = Math.round((totalDone / totalAll) * 100);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">ONBOARDING</h1>
        <p className="text-sm text-muted-foreground mt-1">Einarbeitungsplan für neue Mitarbeiter · verknüpft mit der Academy</p>
      </motion.div>

      {/* Mitarbeiter wählen */}
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-2">Neuer Mitarbeiter</p>
        <div className="flex gap-2 flex-wrap">
          {TEAM_NEW.map(emp => (
            <button key={emp} onClick={() => setEmployee(emp)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                ${employee === emp ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground"}`}>
              {emp}
            </button>
          ))}
        </div>
      </div>

      {/* Fortschrittsbalken */}
      <div className="bg-card border border-border rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-foreground">{employee} · Gesamtfortschritt</p>
          <span className="font-heading text-lg text-foreground">{totalPct}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">{totalDone} von {totalAll} Punkten abgehakt</p>
      </div>

      {/* Phasen */}
      <div className="space-y-3">
        {PHASES.map(phase => {
          const { done, total, pct } = phaseProgress(phase, checked);
          const isOpen = open === phase.id;
          const allDone = done === total;

          return (
            <motion.div key={phase.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={`bg-card border rounded-xl overflow-hidden ${allDone ? "border-success/30" : "border-border"}`}>
              <button onClick={() => setOpen(isOpen ? null : phase.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-secondary/20 transition-all text-left">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${allDone ? "bg-success text-white" : phase.bg + " " + phase.color}`}>
                  {allDone ? <CheckCircle2 className="w-4 h-4" /> : <phase.icon className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{phase.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{done}/{total}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border/50">
                    <div className="p-4 space-y-2">
                      {phase.tasks.map(task => (
                        <label key={task.id} className="flex items-start gap-3 cursor-pointer group">
                          <button onClick={() => toggle(task.id)} className="mt-0.5 flex-shrink-0">
                            {checked[task.id]
                              ? <CheckCircle2 className="w-4 h-4 text-success" />
                              : <Circle className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
                          </button>
                          <span className={`text-sm transition-all ${checked[task.id] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {task.text}
                          </span>
                        </label>
                      ))}

                      {/* Academy Link */}
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <Link to="/academy" className="flex items-center gap-2 text-xs text-primary hover:underline">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {phase.academy.label} → Academy öffnen
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Abschluss-Banner */}
      {totalPct === 100 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="mt-6 bg-card border border-success/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🏆</div>
          <p className="font-heading text-lg text-foreground mb-1">ONBOARDING ABGESCHLOSSEN</p>
          <p className="text-sm text-muted-foreground">{employee} ist vollständig im Team integriert.</p>
        </motion.div>
      )}
    </div>
  );
}