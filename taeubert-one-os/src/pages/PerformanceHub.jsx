import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Star, Shield, Award, Crown, ChevronRight
} from "lucide-react";
import { format } from "date-fns";

const TEAM = ["Toni", "Pascal", "Fanny", "Maik", "Marco", "Adrian", "Lena"];

const LEVEL_CONFIG = [
  { name: "ROOKIE", min: 0,  max: 30,  color: "text-muted-foreground", bg: "bg-secondary",           border: "border-border",        icon: Shield, tagline: "Du lernst die Grundlagen." },
  { name: "BRONZE", min: 30, max: 50,  color: "text-orange-400",       bg: "bg-orange-500/10",       border: "border-orange-500/30", icon: Award,  tagline: "Solide Basis. Weitermachen." },
  { name: "SILBER", min: 50, max: 70,  color: "text-slate-300",        bg: "bg-slate-500/10",        border: "border-slate-400/30",  icon: Star,   tagline: "Zuverlässige Qualitätsarbeit." },
  { name: "GOLD",   min: 70, max: 85,  color: "text-yellow-400",       bg: "bg-yellow-500/10",       border: "border-yellow-400/30", icon: Trophy, tagline: "Premium-Denken erkennbar." },
  { name: "ELITE",  min: 85, max: 101, color: "text-chart-1",          bg: "bg-chart-1/10",          border: "border-chart-1/30",    icon: Crown,  tagline: "Täubert-Standard gelebt." },
];

const BADGE_DEFS = [
  { id: "finish_profi",    label: "Finish-Profi",       icon: "✨", desc: "Finish ohne Nacharbeit",      color: "text-chart-1 bg-chart-1/10 border-chart-1/20" },
  { id: "qualitaet_gold",  label: "Qualitäts-Gold",     icon: "🥇", desc: "3× Qualitätsfreigabe bestanden",color: "text-yellow-400 bg-yellow-500/10 border-yellow-400/20" },
  { id: "ordnung_champ",   label: "Ordnungs-Champ",     icon: "🏅", desc: "Woche ohne Ordnungshinweis",   color: "text-chart-2 bg-chart-2/10 border-chart-2/20" },
  { id: "problemloeser",   label: "Problemlöser",       icon: "🔧", desc: "Nachtrag selbst gelöst",        color: "text-chart-4 bg-chart-4/10 border-chart-4/20" },
  { id: "premium_denker",  label: "Premium-Denker",     icon: "⭐", desc: "5× Premium-Fahrzeug bearbeitet",color: "text-warning bg-warning/10 border-warning/20" },
  { id: "mitarbeiter_monat",label:"Mitarbeiter des Monats",icon:"🏆", desc: "Täubert-Standard des Monats",  color: "text-primary bg-primary/10 border-primary/20" },
  { id: "keine_nacharbeit",label: "Zero-Rework",         icon: "🎯", desc: "Monat ohne Nacharbeit",        color: "text-success bg-success/10 border-success/20" },
  { id: "zeitwächter",     label: "Zeitwächter",         icon: "⏱️", desc: "10× Zeitvorgabe eingehalten",  color: "text-chart-5 bg-chart-5/10 border-chart-5/20" },
];

const MOTIVATION_QUOTES = [
  { quote: "Qualität beginnt im Detail.", sub: "Täubert-Standard" },
  { quote: "Nicht schnell. Sondern sauber.", sub: "Das ist der Unterschied" },
  { quote: "Premium entsteht, wenn niemand hinsieht.", sub: "Disziplin ist alles" },
  { quote: "Du arbeitest in einem Premiumbetrieb, nicht in einer Werkstatt.", sub: "Denk premium" },
  { quote: "Jede Aufgabe, die du erledigst, ist eine Visitenkarte.", sub: "Für dich und Täubert" },
  { quote: "Verbesserungspotenzial ist keine Schwäche — es ist Wachstum.", sub: "Entwicklung" },
];

function getLevel(score) {
  return LEVEL_CONFIG.find(l => score >= l.min && score < l.max) || LEVEL_CONFIG[0];
}

function calcScore(scores, timeEntries, errors, employee) {
  const myScores = scores.filter(s => s.employee === employee);
  if (myScores.length === 0) return 0;
  const latest = myScores.sort((a, b) => b.month?.localeCompare(a.month))[0];
  return Math.round(latest.total_score * 10) || 0;
}

export default function PerformanceHub() {
  const [selected, setSelected] = useState(TEAM[0]);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: scores = [] } = useQuery({ queryKey: ["scores"], queryFn: () => base44.entities.PerformanceScore.list("-month", 100) });
  const { data: timeEntries = [] } = useQuery({ queryKey: ["timeEntries"], queryFn: () => base44.entities.TimeEntry.list("-created_date", 300) });
  const { data: errors = [] } = useQuery({ queryKey: ["errors"], queryFn: () => base44.entities.ErrorReport.list("-created_date", 100) });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => base44.entities.Task.list("-created_date", 300) });

  const todayQuote = MOTIVATION_QUOTES[new Date().getDay() % MOTIVATION_QUOTES.length];
  const currentMonth = format(new Date(), "yyyy-MM");

  // Team overview
  const teamData = TEAM.map(emp => {
    const score = calcScore(scores, timeEntries, errors, emp);
    const level = getLevel(score);
    const myTasks = tasks.filter(t => t.assigned_to === emp);
    const done = myTasks.filter(t => t.status === "erledigt").length;
    const myErrors = errors.filter(e => e.responsible === emp && !e.resolved).length;
    const myScore = scores.find(s => s.employee === emp && s.month === currentMonth);
    const badges = myScore?.badges || [];
    const isEotm = scores.some(s => s.employee === emp && s.employee_of_month);
    return { emp, score, level, done, myErrors, badges, isEotm };
  }).sort((a, b) => b.score - a.score);

  const selectedData = teamData.find(d => d.emp === selected);
  const selectedScore = scores.find(s => s.employee === selected && s.month === currentMonth);

  const ScoreBar = ({ label, value, max = 10 }) => (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">{value}/{max}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${value >= 8 ? "bg-success" : value >= 6 ? "bg-primary" : value >= 4 ? "bg-warning" : "bg-destructive"}`}
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">PERFORMANCE HUB</h1>
        <p className="text-sm text-muted-foreground mt-1">Entwicklung · Badges · Team-Level · Anerkennung</p>
      </motion.div>

      {/* Daily Quote */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-xl px-5 py-4 mb-6">
        <p className="text-sm font-semibold text-foreground">„{todayQuote.quote}"</p>
        <p className="text-[10px] text-muted-foreground mt-1 tracking-wider uppercase">{todayQuote.sub}</p>
      </motion.div>

      {/* Mitarbeiter des Monats Banner */}
      {teamData.some(d => d.isEotm) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="text-3xl">🏆</div>
          <div>
            <p className="text-[10px] tracking-wider text-warning uppercase font-semibold">Mitarbeiter des Monats</p>
            <p className="font-heading text-xl text-foreground mt-0.5">
              {teamData.find(d => d.isEotm)?.emp}
            </p>
            <p className="text-xs text-muted-foreground">Täubert-Standard des Monats gelebt.</p>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-5 w-fit">
        {[{ key: "overview", label: "Team-Übersicht" }, { key: "detail", label: "Mitarbeiter-Detail" }, { key: "badges", label: "Badges" }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all
              ${activeTab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Team Overview */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {teamData.map((d, i) => {
              const LevelIcon = d.level.icon;
              return (
                <motion.div key={d.emp} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => { setSelected(d.emp); setActiveTab("detail"); }}
                  className="bg-card border border-border hover:border-primary/30 rounded-xl p-4 cursor-pointer transition-all flex items-center gap-4">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading flex-shrink-0
                    ${i === 0 ? "bg-yellow-500/20 text-yellow-400" : i === 1 ? "bg-slate-500/20 text-slate-300" : i === 2 ? "bg-orange-500/20 text-orange-400" : "bg-secondary text-muted-foreground"}`}>
                    {i + 1}
                  </div>

                  {/* Name + Level */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground">{d.emp}</p>
                      {d.isEotm && <span className="text-[9px] px-1.5 py-0.5 bg-warning/20 text-warning rounded">🏆 MONAT</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <LevelIcon className={`w-3 h-3 ${d.level.color}`} />
                      <span className={`text-[10px] font-heading tracking-wider ${d.level.color}`}>{d.level.name}</span>
                      {d.badges.length > 0 && <span className="text-[10px] text-muted-foreground">· {d.badges.length} Badges</span>}
                    </div>
                  </div>

                  {/* Score Bar */}
                  <div className="w-28 hidden sm:block">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${d.score}%` }} transition={{ duration: 0.6 }}
                        className={`h-full rounded-full ${d.level.color.replace("text-", "bg-")}`} />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-right mt-0.5">{d.score}/100</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-shrink-0">
                    <span className="text-success">{d.done} ✓</span>
                    {d.myErrors > 0 && <span className="text-destructive">{d.myErrors} ⚠</span>}
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Detail View */}
        {activeTab === "detail" && (
          <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Employee Selector */}
            <div className="flex gap-2 flex-wrap">
              {TEAM.map(e => (
                <button key={e} onClick={() => setSelected(e)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                    ${selected === e ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
                  {e}
                </button>
              ))}
            </div>

            {selectedData && (
              <>
                {/* Level Card */}
                <div className={`rounded-xl p-5 border ${selectedData.level.bg} ${selectedData.level.border}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${selectedData.level.bg} border ${selectedData.level.border}`}>
                      {React.createElement(selectedData.level.icon, { className: `w-6 h-6 ${selectedData.level.color}` })}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Performance Level</p>
                      <p className={`font-heading text-2xl ${selectedData.level.color}`}>{selectedData.level.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedData.level.tagline}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-heading text-3xl ${selectedData.level.color}`}>{selectedData.score}</p>
                      <p className="text-[10px] text-muted-foreground">/ 100</p>
                    </div>
                  </div>
                  {/* Level progress */}
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>{selectedData.level.name}</span>
                      <span>{LEVEL_CONFIG[LEVEL_CONFIG.indexOf(selectedData.level) + 1]?.name || "MAXIMUM"}</span>
                    </div>
                    <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((selectedData.score - selectedData.level.min) / (selectedData.level.max - selectedData.level.min)) * 100}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full rounded-full ${selectedData.level.bg.replace("bg-", "bg-").replace("/10", "")}`}
                        style={{ background: "currentColor" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                {selectedScore && (
                  <div className="bg-card border border-border rounded-xl p-5">
                    <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-4">BEWERTUNG DETAILS</p>
                    <div className="space-y-3">
                      <ScoreBar label="Qualität" value={selectedScore.quality_score || 0} />
                      <ScoreBar label="Produktivität" value={selectedScore.productivity_score || 0} />
                      <ScoreBar label="Verantwortung" value={selectedScore.responsibility_score || 0} />
                      <ScoreBar label="Ordnung" value={selectedScore.order_score || 0} />
                      <ScoreBar label="Team" value={selectedScore.team_score || 0} />
                    </div>
                    {selectedScore.strengths && (
                      <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-xl">
                        <p className="text-[10px] text-success uppercase tracking-wider mb-1">Stärken</p>
                        <p className="text-xs text-foreground">{selectedScore.strengths}</p>
                      </div>
                    )}
                    {selectedScore.development_areas && (
                      <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                        <p className="text-[10px] text-primary uppercase tracking-wider mb-1">Entwicklungspotenzial</p>
                        <p className="text-xs text-foreground">{selectedScore.development_areas}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Badges */}
                {selectedData.badges.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-5">
                    <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-3">ERRUNGENSCHAFTEN</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedData.badges.map(b => {
                        const def = BADGE_DEFS.find(d => d.id === b) || { label: b, icon: "🎖️", color: "text-muted-foreground bg-secondary border-border" };
                        return (
                          <div key={b} className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${def.color} flex items-center gap-1.5`}>
                            <span>{def.icon}</span> {def.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-card border border-border rounded-xl p-3 text-center">
                    <p className="font-heading text-xl text-success">{selectedData.done}</p>
                    <p className="text-[10px] text-muted-foreground">Aufgaben ✓</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center border ${selectedData.myErrors > 0 ? "bg-destructive/10 border-destructive/20" : "bg-card border-border"}`}>
                    <p className={`font-heading text-xl ${selectedData.myErrors > 0 ? "text-destructive" : "text-foreground"}`}>{selectedData.myErrors}</p>
                    <p className="text-[10px] text-muted-foreground">Offene Punkte</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-3 text-center">
                    <p className="font-heading text-xl text-primary">{selectedData.score}</p>
                    <p className="text-[10px] text-muted-foreground">Score</p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Badges Catalogue */}
        {activeTab === "badges" && (
          <motion.div key="badges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="text-xs text-muted-foreground mb-2">Alle erreichbaren Täubert-Badges</p>
            {BADGE_DEFS.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <div className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center border ${b.color}`}>
                  {b.icon}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${b.color.split(" ")[0]}`}>{b.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
                </div>
                {/* Who has it */}
                <div className="flex gap-1 flex-wrap justify-end max-w-[120px]">
                  {teamData.filter(d => d.badges.includes(b.id)).map(d => (
                    <span key={d.emp} className="text-[9px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">{d.emp}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}