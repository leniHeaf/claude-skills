import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Car, AlertTriangle, CheckCircle2, Target, Trophy, Zap, Activity, Crown,
} from "lucide-react";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

const STAGES = [
  { key: "annahme", label: "Annahme", color: "bg-chart-5" },
  { key: "demontage", label: "Demontage", color: "bg-warning" },
  { key: "karosserie", label: "Karosserie", color: "bg-info" },
  { key: "vorbereitung", label: "Vorbereitung", color: "bg-chart-2" },
  { key: "lackierung", label: "Lackierung", color: "bg-primary" },
  { key: "finish", label: "Finish", color: "bg-success" },
  { key: "uebergabe", label: "Übergabe", color: "bg-chart-4" },
];

const SOLL_STUNDEN = 160;
const SOLL_MINUTEN = SOLL_STUNDEN * 60;

function CircularProgress({ pct, size = 120, stroke = 10, children }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={pct >= 100 ? "hsl(var(--success))" : pct >= 75 ? "hsl(var(--primary))" : "hsl(var(--warning))"}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
      <span className="font-heading text-lg text-foreground tabular-nums">{format(now, "HH:mm:ss")}</span>
    </div>
  );
}

export default function LiveDashboard() {
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-live"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 200),
    refetchInterval: 30000,
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks-live"],
    queryFn: () => base44.entities.Task.list("-created_date", 300),
    refetchInterval: 30000,
  });
  const { data: timeEntries = [] } = useQuery({
    queryKey: ["time-live"],
    queryFn: () => base44.entities.TimeEntry.list("-created_date", 500),
    refetchInterval: 30000,
  });
  const { data: errors = [] } = useQuery({
    queryKey: ["errors-live"],
    queryFn: () => base44.entities.ErrorReport.list("-created_date", 200),
    refetchInterval: 30000,
  });

  const currentMonth = format(new Date(), "yyyy-MM");
  const activeVehicles = vehicles.filter(v => v.status !== "uebergabe");
  const doneVehicles = vehicles.filter(v => v.status === "uebergabe");
  const problems = vehicles.filter(v => v.condition === "problem");
  const openTasks = tasks.filter(t => t.status !== "erledigt");
  const doneTasks = tasks.filter(t => t.status === "erledigt");
  const activeTimers = timeEntries.filter(e => e.status === "aktiv" || e.status === "pausiert");
  const unresolvedErrors = errors.filter(e => !e.resolved);

  const ranking = TEAM.map(emp => {
    const monthEntries = timeEntries.filter(e => e.employee === emp && e.status === "beendet" && e.start_time?.startsWith(currentMonth));
    const productiveMin = monthEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
    const nacharbeitMin = monthEntries.filter(e => e.activity === "nacharbeit").reduce((s, e) => s + (e.duration_minutes || 0), 0);
    const myTasks = tasks.filter(t => t.assigned_to === emp);
    const myDoneTasks = myTasks.filter(t => t.status === "erledigt").length;
    const myErrors = errors.filter(e => e.responsible === emp && !e.resolved).length;
    const pct = Math.round((productiveMin / SOLL_MINUTEN) * 100);
    const diffMin = SOLL_MINUTEN - productiveMin;
    return { emp, productiveMin, nacharbeitMin, myDoneTasks, myErrors, pct, diffMin };
  }).sort((a, b) => b.productiveMin - a.productiveMin);

  const totalProductiveMin = ranking.reduce((s, r) => s + r.productiveMin, 0);
  const teamPct = Math.round((totalProductiveMin / (SOLL_MINUTEN * TEAM.length)) * 100);
  const totalH = Math.floor(totalProductiveMin / 60);
  const totalM = totalProductiveMin % 60;

  const stageCounts = STAGES.map(s => ({ ...s, count: vehicles.filter(v => v.status === s.key).length }));
  const maxStage = Math.max(...stageCounts.map(s => s.count), 1);

  const liveKpis = [
    { label: "Fahrzeuge aktiv", value: activeVehicles.length, icon: Car, sub: `${doneVehicles.length} fertig`, accent: "info" },
    { label: "Tasks offen", value: openTasks.length, icon: Activity, sub: `${doneTasks.length} erledigt`, accent: "warning" },
    { label: "Aktive Timer", value: activeTimers.length, icon: Zap, sub: "Mitarbeiter aktiv", accent: "success" },
    { label: "Probleme", value: problems.length + unresolvedErrors.length, icon: AlertTriangle, sub: `${unresolvedErrors.length} Fehler`, accent: "destructive" },
  ];

  const podium = ranking.slice(0, 3);
  const restRanking = ranking.slice(3);
  const podiumHeights = ["h-20", "h-14", "h-10"];
  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd visual order

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-semibold tracking-[0.2em] text-success uppercase">LIVE</span>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl text-foreground tracking-tight">DASHBOARD</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })} · Auto-Refresh 30s
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Uhrzeit</p>
                <LiveClock />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {liveKpis.map((kpi, i) => (
            <motion.div key={kpi.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="relative bg-card border border-border rounded-2xl p-4 overflow-hidden group hover:border-foreground/20 transition-colors"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-foreground/[0.02] rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">{kpi.label}</p>
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                    <kpi.icon className="w-3.5 h-3.5 text-foreground" />
                  </div>
                </div>
                <p className="font-heading text-3xl text-foreground leading-none">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5">{kpi.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pipeline + Team Goal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Pipeline */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Werkstatt-Pipeline</p>
              <span className="text-[10px] text-muted-foreground">{activeVehicles.length} Fahrzeuge in Bearbeitung</span>
            </div>
            <div className="flex items-end gap-1.5 overflow-x-auto pb-2" style={{ minHeight: "140px" }}>
              {stageCounts.map((s, i) => (
                <div key={s.key} className="flex-1 min-w-[60px] flex flex-col items-center">
                  <span className="text-sm font-heading text-foreground mb-1">{s.count}</span>
                  <div className="w-full bg-secondary rounded-lg overflow-hidden flex items-end relative" style={{ height: "90px" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max((s.count / maxStage) * 100, s.count > 0 ? 12 : 0)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                      className={`w-full ${s.color} rounded-t-md relative`}
                    >
                      {s.count > 0 && <div className="absolute inset-x-0 top-0 h-1 bg-white/20 rounded-t-md" />}
                    </motion.div>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1.5 text-center leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Goal Ring */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-1 self-start">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Team-Ziel</p>
            </div>
            <p className="text-[10px] text-muted-foreground self-start mb-3">{format(new Date(), "MMMM yyyy", { locale: de })}</p>
            <CircularProgress pct={teamPct} size={130} stroke={10}>
              <p className="font-heading text-3xl text-foreground">{teamPct}%</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">vom Ziel</p>
            </CircularProgress>
            <div className="flex items-center gap-4 mt-4 text-center">
              <div>
                <p className="font-heading text-lg text-foreground">{totalH}h {totalM}min</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Geleistet</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="font-heading text-lg text-muted-foreground">{SOLL_STUNDEN * TEAM.length}h</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Soll</p>
              </div>
            </div>
          </div>
        </div>

        {/* Podium – Top 3 */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-warning" />
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Top 3 · {format(new Date(), "MMMM", { locale: de })}</p>
          </div>
          <div className="flex items-end justify-center gap-3 md:gap-6">
            {podiumOrder.map((rankIdx, visualPos) => {
              const r = podium[rankIdx];
              if (!r) return null;
              const isLeader = rankIdx === 0;
              const medal = rankIdx === 0 ? "🥇" : rankIdx === 1 ? "🥈" : "🥉";
              return (
                <motion.div key={r.emp}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: visualPos * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-heading text-lg md:text-xl mb-2 ${isLeader ? "bg-foreground text-background ring-2 ring-warning ring-offset-2 ring-offset-card" : "bg-secondary text-foreground"}`}>
                    {r.emp.charAt(0)}
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{r.emp}</p>
                  <p className="text-xs text-muted-foreground mb-2">{Math.floor(r.productiveMin / 60)}h {r.productiveMin % 60}min</p>
                  <div className={`${podiumHeights[rankIdx]} w-16 md:w-24 rounded-t-lg flex items-start justify-center pt-1.5 ${isLeader ? "bg-foreground" : "bg-secondary"}`}>
                    <span className="text-lg">{medal}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Full Ranking */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-muted-foreground" />
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Mitarbeiter-Ranking</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span>Soll: {SOLL_STUNDEN}h/Mitarbeiter</span>
            </div>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {ranking.map((r, idx) => {
                const h = Math.floor(r.productiveMin / 60);
                const m = r.productiveMin % 60;
                const diffH = Math.floor(Math.abs(r.diffMin) / 60);
                const diffM = Math.abs(r.diffMin) % 60;
                const isAhead = r.diffMin <= 0;
                const isTop3 = idx < 3;
                const barColor = r.pct >= 100 ? "bg-success" : r.pct >= 75 ? "bg-foreground" : r.pct >= 40 ? "bg-warning" : "bg-destructive";

                return (
                  <motion.div key={r.emp}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isTop3 ? "bg-secondary/50" : "hover:bg-secondary/30"}`}
                  >
                    {/* Rank */}
                    <div className="w-7 text-center flex-shrink-0">
                      {isTop3 ? (
                        <span className="text-base">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                      ) : (
                        <span className="text-xs font-heading text-muted-foreground">{idx + 1}</span>
                      )}
                    </div>

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-2.5 w-32 md:w-40 flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading text-sm ${isTop3 ? "bg-foreground text-background" : "bg-secondary text-foreground"}`}>
                        {r.emp.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-foreground truncate">{r.emp}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 min-w-0">
                      <div className="h-3 bg-secondary rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(r.pct, 100)}%` }}
                          transition={{ duration: 0.7, delay: idx * 0.04, ease: "easeOut" }}
                          className={`h-full rounded-full ${barColor} relative`}
                        >
                          {r.pct > 15 && <div className="absolute inset-x-0 top-0 h-0.5 bg-white/20 rounded-t-full" />}
                        </motion.div>
                        {r.pct >= 100 && (
                          <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-background" />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                      {r.nacharbeitMin > 0 && (
                        <span className="hidden md:flex items-center gap-0.5 text-[10px] text-destructive">
                          <AlertTriangle className="w-3 h-3" />
                          {Math.floor(r.nacharbeitMin / 60)}h {r.nacharbeitMin % 60}min
                        </span>
                      )}
                      {r.myErrors > 0 && (
                        <span className="text-[10px] text-destructive">{r.myErrors}✗</span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{r.myDoneTasks}✓</span>
                      <span className="text-xs font-heading text-foreground w-14 text-right tabular-nums">{h}h {m}min</span>
                      <span className={`text-[10px] font-bold w-14 text-right ${isAhead ? "text-success" : "text-warning"}`}>
                        {isAhead ? "+" : "−"}{diffH}h {diffM}m
                      </span>
                      <span className={`text-xs font-heading w-8 text-right ${r.pct >= 100 ? "text-success" : "text-foreground"}`}>{r.pct}%</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border text-[9px] text-muted-foreground justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> unter 40%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> 40–75%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-foreground" /> 75–100%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> Ziel erreicht</span>
          </div>
        </div>
      </div>
    </div>
  );
}