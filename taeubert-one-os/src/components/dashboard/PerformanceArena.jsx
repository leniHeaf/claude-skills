import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { format, startOfMonth } from "date-fns";
import {
  Shield, Award, Star, Trophy, Crown, Zap, Flame,
  CheckCircle2, Clock, AlertTriangle, Target
} from "lucide-react";

const LEVELS = [
  { name: "ROOKIE", min: 0,    icon: Shield,  color: "text-muted-foreground", bg: "bg-secondary",          border: "border-border",         tagline: "Du lernst die Grundlagen." },
  { name: "BRONZE", min: 100,  icon: Award,   color: "text-orange-400",       bg: "bg-orange-500/10",      border: "border-orange-500/30",  tagline: "Solide Basis. Weiter so." },
  { name: "SILBER", min: 300,  icon: Star,    color: "text-slate-300",        bg: "bg-slate-500/10",       border: "border-slate-400/30",   tagline: "Zuverlässig in Qualität." },
  { name: "GOLD",   min: 600,  icon: Trophy,  color: "text-yellow-400",       bg: "bg-yellow-500/10",      border: "border-yellow-400/30",  tagline: "Premium-Denken sichtbar." },
  { name: "ELITE",  min: 1000, icon: Crown,   color: "text-primary",          bg: "bg-primary/10",         border: "border-primary/30",     tagline: "Täubert-Standard gelebt." },
];

const BADGE_DEFS = [
  { id: "first_task",       label: "Erster Treffer",       icon: "🎯", desc: "Erste Aufgabe erledigt",              color: "text-success bg-success/10 border-success/20" },
  { id: "task_10",          label: "Zehner-Club",          icon: "🔟", desc: "10 Aufgaben erledigt",                color: "text-chart-2 bg-chart-2/10 border-chart-2/20" },
  { id: "task_50",          label: "Task-Meister",         icon: "💪", desc: "50 Aufgaben erledigt",                color: "text-warning bg-warning/10 border-warning/20" },
  { id: "streak_3",         label: "Hattrick",             icon: "🔥", desc: "3 Tage Streak",                       color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { id: "streak_7",         label: "Woche ohne Pause",     icon: "⚡", desc: "7 Tage Streak",                       color: "text-yellow-400 bg-yellow-500/10 border-yellow-400/20" },
  { id: "zero_errors",      label: "Makellos",             icon: "✨", desc: "Keine offenen Fehler",                color: "text-primary bg-primary/10 border-primary/20" },
  { id: "hours_100",        label: "Vollzeit-Held",        icon: "⏱️", desc: "100 Stunden erfasst",                color: "text-chart-4 bg-chart-4/10 border-chart-4/20" },
  { id: "hours_200",        label: "Zeit-Wächter",         icon: "🕰️", desc: "200 Stunden erfasst",                color: "text-chart-5 bg-chart-5/10 border-chart-5/20" },
  { id: "quality_3",        label: "Qualitäts-Streak",     icon: "🏅", desc: "3 Aufgaben ohne Nacharbeit",          color: "text-chart-1 bg-chart-1/10 border-chart-1/20" },
  { id: "employee_month",   label: "Mitarbeiter des Monats",icon: "🏆", desc: "Täubert-Standard des Monats",        color: "text-warning bg-warning/10 border-warning/20" },
];

function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return { level: LEVELS[i], index: i };
  }
  return { level: LEVELS[0], index: 0 };
}

function getNextLevel(index) {
  return LEVELS[index + 1] || null;
}

export default function PerformanceArena({ userName, tasks: propTasks, timeEntries: propTime }) {
  const currentMonth = format(new Date(), "yyyy-MM");
  const monthStart = startOfMonth(new Date()).toISOString();

  const { data: errors = [] } = useQuery({
    queryKey: ["arena-errors", userName],
    queryFn: () => base44.entities.ErrorReport.filter({ responsible: userName }, "-created_date", 100),
  });

  const { data: scores = [] } = useQuery({
    queryKey: ["arena-scores", userName],
    queryFn: () => base44.entities.PerformanceScore.filter({ employee: userName }, "-month", 50),
  });

  const tasks = propTasks || [];
  const timeEntries = propTime || [];

  const stats = useMemo(() => {
    const doneTasks = tasks.filter(t => t.status === "erledigt");
    const doneCount = doneTasks.length;

    const finishedEntries = timeEntries.filter(e => e.status === "beendet" && e.duration_minutes);
    const totalMinutes = finishedEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
    const totalHours = totalMinutes / 60;

    const monthEntries = finishedEntries.filter(e => e.start_time && new Date(e.start_time) >= new Date(monthStart));
    const monthMinutes = monthEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
    const monthHours = monthMinutes / 60;

    const nacharbeitMins = finishedEntries.filter(e => e.activity === "nacharbeit").reduce((s, e) => s + e.duration_minutes, 0);
    const nacharbeitPct = totalMinutes > 0 ? Math.round((nacharbeitMins / totalMinutes) * 100) : 0;

    const openErrors = errors.filter(e => !e.resolved).length;
    const resolvedErrors = errors.filter(e => e.resolved).length;

    // --- XP Calculation ---
    // 10 XP per completed task, 1 XP per logged hour, -15 XP per open error, bonuses
    let xp = 0;
    xp += doneCount * 10;
    xp += Math.floor(totalHours);
    xp += resolvedErrors * 5;
    xp -= openErrors * 15;
    if (nacharbeitPct === 0 && doneCount > 0) xp += 20;
    if (nacharbeitPct > 0 && nacharbeitPct <= 5) xp += 10;
    xp = Math.max(0, xp);

    // --- Streak ---
    const doneDates = doneTasks
      .map(t => t.updated_date ? format(new Date(t.updated_date), "yyyy-MM-dd") : null)
      .filter(Boolean)
      .sort();
    const uniqueDates = [...new Set(doneDates)].reverse();

    let streak = 0;
    if (uniqueDates.length > 0) {
      let checkDate = new Date();
      for (let i = 0; i < 30; i++) {
        const dateStr = format(checkDate, "yyyy-MM-dd");
        if (uniqueDates.includes(dateStr)) {
          streak++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else if (i === 0) {
          // today not yet completed — check yesterday
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
          break;
        }
      }
    }

    // --- Badges ---
    const earned = [];
    if (doneCount >= 1) earned.push("first_task");
    if (doneCount >= 10) earned.push("task_10");
    if (doneCount >= 50) earned.push("task_50");
    if (streak >= 3) earned.push("streak_3");
    if (streak >= 7) earned.push("streak_7");
    if (openErrors === 0 && doneCount > 0) earned.push("zero_errors");
    if (totalHours >= 100) earned.push("hours_100");
    if (totalHours >= 200) earned.push("hours_200");
    if (nacharbeitPct === 0 && doneCount >= 3) earned.push("quality_3");

    const monthScore = scores.find(s => s.month === currentMonth);
    if (monthScore?.employee_of_month) earned.push("employee_month");

    // Manager badges from score record
    if (monthScore?.badges) {
      monthScore.badges.forEach(b => { if (!earned.includes(b)) earned.push(b); });
    }

    // Rank among team (approximate from scores)
    const allMonthScores = scores.filter(s => s.month === currentMonth);
    const teamMembers = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];
    const myScore = monthScore?.total_score || 0;

    return {
      doneCount, totalHours, monthHours, nacharbeitPct,
      openErrors, resolvedErrors, xp, streak, earned,
      myScore, monthScore,
    };
  }, [tasks, timeEntries, errors, scores, currentMonth, monthStart]);

  const { level, index } = getLevel(stats.xp);
  const nextLevel = getNextLevel(index);
  const LevelIcon = level.icon;

  const levelProgress = nextLevel
    ? Math.min(100, ((stats.xp - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  const xpToNext = nextLevel ? nextLevel.min - stats.xp : 0;

  const kpiCards = [
    { label: "Erledigt", value: stats.doneCount, icon: CheckCircle2, color: "text-success", sub: "Aufgaben gesamt" },
    { label: "Stunden", value: stats.totalHours.toFixed(0), icon: Clock, color: "text-chart-2", sub: `${stats.monthHours.toFixed(0)}h diesen Monat` },
    { label: "Streak", value: stats.streak, icon: Flame, color: "text-orange-400", sub: stats.streak > 0 ? "Tage in Folge" : "heute starten" },
    { label: "Fehler", value: stats.openErrors, icon: AlertTriangle, color: stats.openErrors > 0 ? "text-destructive" : "text-success", sub: stats.openErrors > 0 ? "offen" : "makellos" },
  ];

  return (
    <div className="space-y-4">
      {/* Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border p-5 ${level.bg} ${level.border}`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${level.bg} ${level.border}`}>
            <LevelIcon className={`w-7 h-7 ${level.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Dein Level</p>
            <p className={`font-heading text-2xl ${level.color}`}>{level.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{level.tagline}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Zap className={`w-4 h-4 ${level.color}`} />
              <p className={`font-heading text-3xl ${level.color}`}>{stats.xp}</p>
            </div>
            <p className="text-[10px] text-muted-foreground">XP</p>
          </div>
        </div>

        {/* Progress to next level */}
        {nextLevel ? (
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
              <span className="font-heading tracking-wider">{level.name}</span>
              <span className="flex items-center gap-1">
                Noch <span className={`font-heading ${level.color}`}>{xpToNext} XP</span> bis {nextLevel.name}
              </span>
            </div>
            <div className="h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${level.color.replace("text-", "bg-")}`}
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2">
            <Crown className={`w-4 h-4 ${level.color}`} />
            <p className="text-xs text-muted-foreground">Maximum erreicht — Täubert-Standard verkörpert.</p>
          </div>
        )}
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{k.label}</p>
              <k.icon className={`w-3.5 h-3.5 ${k.color}`} />
            </div>
            <p className={`font-heading text-2xl ${k.color}`}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Quality Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-card border border-border rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-3.5 h-3.5 text-primary" />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Qualitätsvorgaben</p>
        </div>
        <div className="space-y-3">
          <QualityBar label="Nacharbeit" value={stats.nacharbeitPct} max={100} invert good={stats.nacharbeitPct <= 5} />
          <QualityBar label="Offene Fehler" value={stats.openErrors} max={5} invert good={stats.openErrors === 0} />
          <QualityBar label="Gelöste Fehler" value={stats.resolvedErrors} max={Math.max(10, stats.resolvedErrors)} good={stats.resolvedErrors > 0} />
        </div>
        {stats.monthScore && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Manager-Score</span>
            <span className="font-heading text-sm text-foreground">
              {stats.monthScore.total_score?.toFixed(1)} / 10
            </span>
          </div>
        )}
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-warning" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Errungenschaften</p>
          </div>
          <span className="text-[10px] text-muted-foreground">{stats.earned.length} / {BADGE_DEFS.length}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {BADGE_DEFS.map(b => {
            const has = stats.earned.includes(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-xl border p-2.5 flex items-center gap-2 transition-all ${
                  has ? `${b.color}` : "bg-secondary/50 border-border opacity-40"
                }`}
              >
                <span className="text-lg">{b.icon}</span>
                <div className="min-w-0">
                  <p className={`text-[11px] font-semibold truncate ${has ? "" : "text-muted-foreground"}`}>{b.label}</p>
                  <p className="text-[9px] text-muted-foreground truncate">{has ? "Erreicht!" : b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function QualityBar({ label, value, max, invert = false, good = false }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const barColor = good
    ? "bg-success"
    : invert
    ? pct > 80 ? "bg-destructive" : pct > 50 ? "bg-warning" : "bg-success"
    : pct > 50 ? "bg-success" : pct > 20 ? "bg-warning" : "bg-destructive";

  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${good ? "text-success" : "text-foreground"}`}>{value}{invert ? "%" : ""}</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </div>
  );
}