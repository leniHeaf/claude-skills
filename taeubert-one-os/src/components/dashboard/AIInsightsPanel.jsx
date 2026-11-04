import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, TrendingUp, Zap, ChevronDown, ChevronUp, Brain } from "lucide-react";

const SEVERITY = {
  kritisch: { color: "border-destructive/40 bg-destructive/5", dot: "bg-destructive", text: "text-destructive", label: "Kritisch" },
  warnung: { color: "border-warning/40 bg-warning/5", dot: "bg-warning", text: "text-warning", label: "Warnung" },
  info: { color: "border-chart-1/30 bg-chart-1/5", dot: "bg-chart-1", text: "text-chart-1", label: "Hinweis" },
};

function generateInsights({ vehicles, tasks, errors, timeEntries, performanceScores }) {
  const insights = [];

  // 1. Nacharbeit-Quote
  const reworkErrors = errors.filter(e => !e.resolved);
  if (reworkErrors.length >= 3) {
    const topCat = reworkErrors.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {});
    const worst = Object.entries(topCat).sort((a, b) => b[1] - a[1])[0];
    insights.push({
      id: "rework",
      severity: reworkErrors.length >= 6 ? "kritisch" : "warnung",
      icon: AlertTriangle,
      title: `Nacharbeit erhöht: ${reworkErrors.length} offene Fehler`,
      detail: worst ? `Häufigste Ursache: "${worst[0]}" (${worst[1]}×). Sofortmaßnahme erforderlich.` : "Fehlermuster analysieren.",
    });
  }

  // 2. Überlastete Fahrzeugphasen
  const inVorbereitung = vehicles.filter(v => v.status === "vorbereitung").length;
  const inLackierung = vehicles.filter(v => v.status === "lackierung").length;
  if (inVorbereitung >= 3) {
    insights.push({
      id: "vorbereitung-stau",
      severity: "warnung",
      icon: AlertTriangle,
      title: `Vorbereitung: ${inVorbereitung} Fahrzeuge gleichzeitig`,
      detail: "Engpass droht. Ressourcen auf Vorbereitung konzentrieren oder Annahme drosseln.",
    });
  }

  // 3. Fehlende Qualitätsprüfung (Fahrzeuge in Übergabe ohne approved)
  const notApproved = vehicles.filter(v => v.status === "endkontrolle" && !v.quality_approved);
  if (notApproved.length > 0) {
    insights.push({
      id: "quality-missing",
      severity: "kritisch",
      icon: AlertTriangle,
      title: `${notApproved.length} Fahrzeug(e) ohne Qualitätsfreigabe`,
      detail: `Endkontrolle: ${notApproved.map(v => v.license_plate).join(", ")}. Keine Übergabe möglich!`,
    });
  }

  // 4. Überfällige Aufgaben
  const today = new Date().toISOString().split("T")[0];
  const overdue = tasks.filter(t => t.deadline && t.deadline < today && t.status !== "erledigt");
  if (overdue.length >= 2) {
    insights.push({
      id: "overdue-tasks",
      severity: "warnung",
      icon: AlertTriangle,
      title: `${overdue.length} überfällige Aufgaben`,
      detail: `Fälligkeiten überschritten: ${overdue.slice(0, 3).map(t => t.title).join(", ")}${overdue.length > 3 ? " u.m." : ""}.`,
    });
  }

  // 5. Aktive Zeiterfassung ohne Fahrzeug-Fortschritt
  const activeEntries = timeEntries.filter(e => e.status === "aktiv");
  if (activeEntries.length >= 4) {
    insights.push({
      id: "many-active",
      severity: "info",
      icon: Zap,
      title: `${activeEntries.length} Mitarbeiter gleichzeitig aktiv`,
      detail: "Volle Kapazität. Darauf achten, dass keine Überschneidungen entstehen.",
    });
  }

  // 6. Problemfahrzeuge
  const problems = vehicles.filter(v => v.condition === "problem");
  if (problems.length > 0) {
    insights.push({
      id: "problem-cars",
      severity: problems.length >= 2 ? "kritisch" : "warnung",
      icon: AlertTriangle,
      title: `${problems.length} Fahrzeug(e) mit Problemstatus`,
      detail: problems.map(v => `${v.make} ${v.model} (${v.license_plate})`).join(", "),
    });
  }

  // 7. Positive Insights
  const finishedToday = vehicles.filter(v => {
    if (v.status !== "uebergabe") return false;
    return new Date(v.updated_date).toDateString() === new Date().toDateString();
  });
  if (finishedToday.length > 0) {
    insights.push({
      id: "finished-today",
      severity: "info",
      icon: TrendingUp,
      title: `${finishedToday.length} Fahrzeug(e) heute fertiggestellt`,
      detail: `${finishedToday.map(v => `${v.make} ${v.model}`).join(", ")}. Gute Performance!`,
    });
  }

  // 8. Kapazitätsprognose nächste Woche
  const nextWeekVehicles = vehicles.filter(v => {
    if (!v.estimated_completion) return false;
    const d = new Date(v.estimated_completion);
    const now = new Date();
    const nw = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return d >= now && d <= nw;
  });
  if (nextWeekVehicles.length >= 3) {
    insights.push({
      id: "capacity-warning",
      severity: nextWeekVehicles.length >= 5 ? "warnung" : "info",
      icon: TrendingUp,
      title: `${nextWeekVehicles.length} Fahrzeuge in der nächsten Woche fällig`,
      detail: "Kapazitätsengpass möglich. Lackierungskalender prüfen.",
    });
  }

  // Default: alles gut
  if (insights.length === 0) {
    insights.push({
      id: "allgood",
      severity: "info",
      icon: TrendingUp,
      title: "Alles im grünen Bereich",
      detail: "Keine kritischen Auffälligkeiten. Weiter so!",
    });
  }

  return insights;
}

export default function AIInsightsPanel({ vehicles = [], tasks = [], errors = [], timeEntries = [], performanceScores = [] }) {
  const [expanded, setExpanded] = useState(false);
  const insights = generateInsights({ vehicles, tasks, errors, timeEntries, performanceScores });
  const critical = insights.filter(i => i.severity === "kritisch").length;
  const warnings = insights.filter(i => i.severity === "warnung").length;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className={`bg-card rounded-xl border overflow-hidden ${critical > 0 ? "border-destructive/30" : warnings > 0 ? "border-warning/30" : "border-border"}`}>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-all text-left">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
          ${critical > 0 ? "bg-destructive/10" : warnings > 0 ? "bg-warning/10" : "bg-chart-1/10"}`}>
          <Brain className={`w-4 h-4 ${critical > 0 ? "text-destructive" : warnings > 0 ? "text-warning" : "text-chart-1"}`} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground flex items-center gap-2">
            INTELLIGENTE ANALYSE
            {critical > 0 && <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full border border-destructive/20">{critical} kritisch</span>}
            {warnings > 0 && <span className="text-[9px] bg-warning/10 text-warning px-1.5 py-0.5 rounded-full border border-warning/20">{warnings} Warnungen</span>}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{insights.length} Erkenntnisse · automatisch generiert</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="border-t border-border p-3 space-y-2">
              {insights.map(insight => {
                const cfg = SEVERITY[insight.severity];
                const Icon = insight.icon;
                return (
                  <div key={insight.id} className={`flex items-start gap-2.5 p-3 rounded-lg border ${cfg.color}`}>
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${cfg.text}`}>{insight.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{insight.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}