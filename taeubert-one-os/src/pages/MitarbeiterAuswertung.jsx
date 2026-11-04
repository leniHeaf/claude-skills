import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Clock, CheckCircle, AlertTriangle, Download, Presentation } from "lucide-react";
import { format, subMonths, isSameMonth } from "date-fns";
import { de } from "date-fns/locale";
import TeamComparison from "@/components/auswertung/TeamComparison";
import EmployeeDetail from "@/components/auswertung/EmployeeDetail";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena", "Selina", "Fabian"];

function formatHours(minutes) {
  if (!minutes) return "0h";
  return (minutes / 60).toFixed(1) + "h";
}

export default function MitarbeiterAuswertung() {
  const [selected, setSelected] = useState(TEAM[0]);
  const [monthsBack, setMonthsBack] = useState(3); // last 3 months by default to catch recent data
  const [presentation, setPresentation] = useState(false);

  const { data: timeEntries = [], isLoading: loadingTime } = useQuery({
    queryKey: ["timeEntries-auswertung"],
    queryFn: () => base44.entities.TimeEntry.list("-created_date", 1000),
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ["tasks-auswertung"],
    queryFn: () => base44.entities.Task.list("-created_date", 500),
  });

  const { data: errors = [], isLoading: loadingErrors } = useQuery({
    queryKey: ["errors-auswertung"],
    queryFn: () => base44.entities.ErrorReport.list("-created_date", 200),
  });

  const { data: scores = [], isLoading: loadingScores } = useQuery({
    queryKey: ["scores-auswertung"],
    queryFn: () => base44.entities.PerformanceScore.list("-month", 200),
  });

  // Filter by selected time range: all entries within the last N months
  const rangeDate = subMonths(new Date(), monthsBack - 1);
  const rangeStartMonth = new Date(rangeDate.getFullYear(), rangeDate.getMonth(), 1);
  const rangeMonthStr = format(rangeDate, "yyyy-MM");

  const filteredEntries = useMemo(() => {
    const now = new Date();
    return timeEntries.filter(e => {
      if (!e.start_time) return false;
      const entryDate = new Date(e.start_time);
      return entryDate >= rangeStartMonth && entryDate <= now;
    });
  }, [timeEntries, rangeStartMonth]);

  // Build per-employee data
  const teamData = useMemo(() => {
    return TEAM.map(emp => {
      const empEntries = filteredEntries.filter(e => e.employee === emp && e.status === "beendet" && e.duration_minutes);
      const totalMins = empEntries.reduce((s, e) => s + e.duration_minutes, 0);
      const productiveMins = empEntries
        .filter(e => e.activity !== "nacharbeit" && e.activity !== "sonstiges")
        .reduce((s, e) => s + e.duration_minutes, 0);
      const nacharbeitMins = empEntries
        .filter(e => e.activity === "nacharbeit")
        .reduce((s, e) => s + e.duration_minutes, 0);

      // Activities breakdown
      const activities = {};
      empEntries.forEach(e => {
        activities[e.activity] = (activities[e.activity] || 0) + e.duration_minutes;
      });

      // Tasks
      const empTasks = tasks.filter(t => t.assigned_to === emp);
      const tasksDone = empTasks.filter(t => t.status === "erledigt").length;
      const tasksOpen = empTasks.filter(t => t.status !== "erledigt").length;

      // Errors
      const errorCount = errors.filter(e => e.responsible === emp).length;

      // Score
      const score = scores.find(s => s.employee === emp && s.month === rangeMonthStr);

      return {
        emp,
        totalMins,
        productiveMins,
        nacharbeitMins,
        activities,
        tasksDone,
        tasksOpen,
        errorCount,
        score,
      };
    }).filter(d => d.totalMins > 0 || d.tasksDone > 0 || d.errorCount > 0)
      .sort((a, b) => b.totalMins - a.totalMins);
  }, [filteredEntries, tasks, errors, scores, rangeMonthStr]);

  // Totals
  const totals = useMemo(() => {
    const totalMins = teamData.reduce((s, d) => s + d.totalMins, 0);
    const productiveMins = teamData.reduce((s, d) => s + d.productiveMins, 0);
    const nacharbeitMins = teamData.reduce((s, d) => s + d.nacharbeitMins, 0);
    const tasksDone = teamData.reduce((s, d) => s + d.tasksDone, 0);
    const errorCount = teamData.reduce((s, d) => s + d.errorCount, 0);
    return { totalMins, productiveMins, nacharbeitMins, tasksDone, errorCount };
  }, [teamData]);

  const selectedData = teamData.find(d => d.emp === selected);
  const isLoading = loadingTime || loadingTasks || loadingErrors || loadingScores;

  const handleDownloadCSV = () => {
    const headers = [
      "Mitarbeiter",
      "Gesamt (Min)",
      "Produktiv (Min)",
      "Nacharbeit (Min)",
      "Produktivitaet (%)",
      "Aufgaben erledigt",
      "Aufgaben offen",
      "Fehler",
      "Qualitaet",
      "Produktivitaet Score",
      "Verantwortung Score",
      "Ordnung Score",
      "Team Score",
      "Gesamt Score",
    ];

    const rows = teamData.map(d => {
      const prodPct = d.totalMins > 0 ? Math.round((d.productiveMins / d.totalMins) * 100) : 0;
      const s = d.score;
      return [
        d.emp,
        d.totalMins,
        d.productiveMins,
        d.nacharbeitMins,
        prodPct,
        d.tasksDone,
        d.tasksOpen,
        d.errorCount,
        s?.quality_score ?? "",
        s?.productivity_score ?? "",
        s?.responsibility_score ?? "",
        s?.order_score ?? "",
        s?.team_score ?? "",
        s?.total_score ?? "",
      ].join(",");
    });

    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Mitarbeiter-Auswertung_${rangeMonthStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const KPI_CARDS = [
    { label: "Team gesamt", value: formatHours(totals.totalMins), icon: Clock, color: "text-foreground" },
    { label: "Produktiv", value: formatHours(totals.productiveMins), icon: CheckCircle, color: "text-success" },
    { label: "Nacharbeit", value: formatHours(totals.nacharbeitMins), icon: AlertTriangle, color: "text-destructive" },
    { label: "Aufgaben erledigt", value: totals.tasksDone, icon: Users, color: "text-primary" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">MITARBEITER-AUSWERTUNG</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {format(rangeDate, "MMMM yyyy", { locale: de })} · {teamData.length} Mitarbeiter mit Daten
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={monthsBack}
              onChange={e => setMonthsBack(Number(e.target.value))}
              className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground h-9"
            >
              {[1, 2, 3, 6].map(m => (
                <option key={m} value={m}>
                  {m === 1 ? "Aktueller Monat" : `Letzte ${m} Monate`}
                </option>
              ))}
            </select>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg px-4 h-9 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">CSV</span>
            </button>
            <button
              onClick={() => setPresentation(true)}
              className="flex items-center gap-2 bg-secondary border border-border hover:bg-accent hover:text-accent-foreground rounded-lg px-4 h-9 text-sm font-medium transition-colors"
            >
              <Presentation className="w-4 h-4" />
              <span className="hidden md:inline">Präsentation</span>
            </button>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : teamData.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Keine Daten für diesen Zeitraum</p>
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {KPI_CARDS.map((k, i) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <k.icon className={`w-3.5 h-3.5 ${k.color}`} />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
                </div>
                <p className={`font-heading text-xl ${k.color}`}>{k.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Team Comparison */}
          <div className="mb-6">
            <TeamComparison data={teamData} />
          </div>

          {/* Employee Detail */}
          <div className="mb-4">
            {/* Selector */}
            <div className="flex gap-2 flex-wrap mb-4">
              {teamData.map(d => (
                <button
                  key={d.emp}
                  onClick={() => setSelected(d.emp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                    ${selected === d.emp
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30"}`}
                >
                  {d.emp}
                </button>
              ))}
            </div>

            <EmployeeDetail
              employee={selected}
              data={selectedData}
              score={selectedData?.score}
            />
          </div>
        </>
      )}
      {/* Presentation Overlay */}
      {presentation && (
        <PresentationView
          teamData={teamData}
          totals={totals}
          rangeDate={rangeDate}
          scores={scores}
          onClose={() => setPresentation(false)}
        />
      )}
    </div>
  );
}

function PresentationView({ teamData, totals, rangeDate, scores, onClose }) {
  const [slide, setSlide] = useState(0);

  const totalSlides = 2 + teamData.length; // Title + Summary + per-employee

  const next = () => setSlide(s => Math.min(s + 1, totalSlides - 1));
  const prev = () => setSlide(s => Math.max(s - 1, 0));

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <p className="text-xs tracking-wider text-muted-foreground uppercase">
          {format(rangeDate, "MMMM yyyy", { locale: de })} · Folie {slide + 1} / {totalSlides}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={prev} disabled={slide === 0}
            className="px-3 py-1.5 rounded-lg text-sm border border-border disabled:opacity-30 hover:bg-secondary transition-colors">
            Zurück
          </button>
          <button onClick={next} disabled={slide === totalSlides - 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-border disabled:opacity-30 hover:bg-secondary transition-colors">
            Weiter
          </button>
          <button onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-sm bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-colors">
            Schließen
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-8 md:p-16">
        {/* Slide 0: Title */}
        {slide === 0 && (
          <motion.div key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="text-xs tracking-[0.4em] text-muted-foreground uppercase mb-4">Täubert One</p>
            <h1 className="font-heading text-4xl md:text-6xl text-foreground tracking-wide mb-4">
              MITARBEITER<br />AUSWERTUNG
            </h1>
            <p className="text-lg text-muted-foreground mt-6">
              {format(rangeDate, "MMMM yyyy", { locale: de })}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{teamData.length} Mitarbeiter · {formatHours(totals.totalMins)} Gesamt</p>
          </motion.div>
        )}

        {/* Slide 1: Summary */}
        {slide === 1 && (
          <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl">
            <h2 className="font-heading text-3xl text-foreground mb-8 text-center">Team-Übersicht</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Gesamt", value: formatHours(totals.totalMins), icon: Clock, color: "text-foreground" },
                { label: "Produktiv", value: formatHours(totals.productiveMins), icon: CheckCircle, color: "text-success" },
                { label: "Nacharbeit", value: formatHours(totals.nacharbeitMins), icon: AlertTriangle, color: "text-destructive" },
                { label: "Aufgaben ✓", value: totals.tasksDone, icon: Users, color: "text-primary" },
              ].map(k => (
                <div key={k.label} className="bg-card border border-border rounded-xl p-6 text-center">
                  <k.icon className={`w-6 h-6 ${k.color} mx-auto mb-3`} />
                  <p className={`font-heading text-3xl ${k.color}`}>{k.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{k.label}</p>
                </div>
              ))}
            </div>
            {/* Ranking list */}
            <div className="space-y-2">
              {teamData.map((d, i) => {
                const prodPct = d.totalMins > 0 ? Math.round((d.productiveMins / d.totalMins) * 100) : 0;
                return (
                  <div key={d.emp} className="flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-heading
                      ${i === 0 ? "bg-warning/20 text-warning" : "bg-secondary text-muted-foreground"}`}>{i + 1}</span>
                    <span className="flex-1 text-lg font-medium text-foreground">{d.emp}</span>
                    <span className="text-success text-sm">{formatHours(d.productiveMins)}</span>
                    <span className="text-muted-foreground text-sm">·</span>
                    <span className={`text-sm ${prodPct >= 80 ? "text-success" : prodPct >= 60 ? "text-warning" : "text-destructive"}`}>{prodPct}%</span>
                    {d.errorCount > 0 && <span className="text-destructive text-sm">{d.errorCount} ⚠</span>}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Slides 2+: per employee */}
        {slide >= 2 && slide - 2 < teamData.length && (
          (() => {
            const d = teamData[slide - 2];
            const prodPct = d.totalMins > 0 ? Math.round((d.productiveMins / d.totalMins) * 100) : 0;
            const nachPct = d.totalMins > 0 ? Math.round((d.nacharbeitMins / d.totalMins) * 100) : 0;
            return (
              <motion.div key={d.emp} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-3xl">
                <p className="text-xs tracking-wider text-muted-foreground uppercase mb-2">Mitarbeiter</p>
                <h2 className="font-heading text-4xl text-foreground mb-8">{d.emp}</h2>

                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="font-heading text-2xl text-foreground">{formatHours(d.totalMins)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">Gesamt</p>
                  </div>
                  <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center">
                    <p className="font-heading text-2xl text-success">{formatHours(d.productiveMins)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">Produktiv</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="font-heading text-2xl text-primary">{d.tasksDone}</p>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">Aufgaben ✓</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className={`font-heading text-2xl ${d.errorCount > 0 ? "text-destructive" : "text-foreground"}`}>{d.errorCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">Fehler</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Produktivität</span>
                      <span className="text-success font-medium">{prodPct}%</span>
                    </div>
                    <div className="h-4 bg-secondary rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${prodPct}%` }} transition={{ duration: 0.6 }}
                        className="h-full bg-success" />
                    </div>
                  </div>
                  {d.nacharbeitMins > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Nacharbeit</span>
                        <span className="text-destructive font-medium">{nachPct}%</span>
                      </div>
                      <div className="h-4 bg-secondary rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${nachPct}%` }} transition={{ duration: 0.6 }}
                          className="h-full bg-destructive" />
                        </div>
                    </div>
                  )}
                </div>

                {d.score && (
                  <div className="mt-8 bg-card border border-border rounded-xl p-4">
                    <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-3">Manager-Bewertung</p>
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { label: "Qualität", val: d.score.quality_score },
                        { label: "Produkt.", val: d.score.productivity_score },
                        { label: "Verantw.", val: d.score.responsibility_score },
                        { label: "Ordnung", val: d.score.order_score },
                        { label: "Team", val: d.score.team_score },
                      ].map(s => (
                        <div key={s.label} className="text-center">
                          <p className="font-heading text-xl text-foreground">{s.val || 0}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    {d.score.strengths && (
                      <p className="text-xs text-success mt-3">✓ {d.score.strengths}</p>
                    )}
                    {d.score.development_areas && (
                      <p className="text-xs text-warning mt-1">→ {d.score.development_areas}</p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })()
        )}
      </div>

      {/* Bottom hint */}
      <div className="px-6 py-2 border-t border-border bg-card text-center">
        <p className="text-[10px] text-muted-foreground tracking-wider">
          ← → zum Navigieren · ESC zum Schließen
        </p>
      </div>
    </div>
  );
}