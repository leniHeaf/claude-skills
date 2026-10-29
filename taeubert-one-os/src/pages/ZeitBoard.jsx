import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInMinutes, startOfWeek, addDays, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import {
  Clock, LogIn, Play, Coffee, Users, TrendingUp, Calendar, Zap, AlertTriangle,
} from "lucide-react";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];
const SOLL_PRO_TAG = 480; // 8h in Minuten

const ACTIVITY_LABELS = {
  demontage: "Demontage",
  karosserie: "Karosserie",
  schleifen: "Schleifen",
  fuellern: "Füllern",
  abkleben: "Abkleben",
  lackierung: "Lackierung",
  finish: "Finish",
  reinigung: "Reinigung",
  nacharbeit: "Nacharbeit",
  sonstiges: "Sonstiges",
};

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

function fmtDuration(min) {
  if (!min || min <= 0) return "0h 0min";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${m}min`;
}

function getWeekDays() {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 6 }, (_, i) => addDays(start, i)); // Mo–Sa
}

export default function ZeitBoard() {
  const today = format(new Date(), "yyyy-MM-dd");
  const now = new Date();

  const { data: workDays = [] } = useQuery({
    queryKey: ["workDays", today],
    queryFn: () => base44.entities.WorkDay.filter({ date: today }),
    refetchInterval: 30000,
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["timeEntries-board"],
    queryFn: () => base44.entities.TimeEntry.list("-created_date", 500),
    refetchInterval: 30000,
  });

  const { data: allWorkDays = [] } = useQuery({
    queryKey: ["workDays-week"],
    queryFn: () => base44.entities.WorkDay.list("-created_date", 500),
    refetchInterval: 60000,
  });

  const weekDays = getWeekDays();
  const activeEntries = entries.filter(e => e.status === "aktiv" || e.status === "pausiert");

  // Status pro Mitarbeiter heute
  const teamStatus = TEAM.map(emp => {
    const wd = workDays.find(w => w.employee === emp);
    const isPresent = wd?.status === "anwesend";
    const activeTimer = activeEntries.find(e => e.employee === emp);

    let liveMinutes = 0;
    if (wd?.clock_in && isPresent) {
      liveMinutes = differenceInMinutes(now, new Date(wd.clock_in)) - (wd.break_minutes || 0);
    }

    // Heutige erledigte Task-Zeiten
    const todayEntries = entries.filter(e =>
      e.employee === emp && e.status === "beendet" && e.start_time?.startsWith(today)
    );
    const taskMinutes = todayEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);

    return {
      emp,
      isPresent,
      wd,
      activeTimer,
      liveMinutes: Math.max(0, liveMinutes),
      taskMinutes,
      totalMinutes: isPresent ? Math.max(liveMinutes, taskMinutes) : taskMinutes,
      overtime: (isPresent ? liveMinutes : taskMinutes) - SOLL_PRO_TAG,
    };
  });

  const present = teamStatus.filter(t => t.isPresent);
  const absent = teamStatus.filter(t => !t.isPresent);

  // Wochen-Übersicht
  const weekData = TEAM.map(emp => {
    const days = weekDays.map(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      const wd = allWorkDays.find(w => w.employee === emp && w.date === dateStr);
      const isToday = isSameDay(day, now);
      let minutes = 0;
      if (wd?.total_minutes) {
        minutes = wd.total_minutes;
      } else if (wd?.clock_in && isToday) {
        minutes = differenceInMinutes(now, new Date(wd.clock_in)) - (wd.break_minutes || 0);
      }
      return { day, minutes: Math.max(0, minutes), isToday, wd };
    });
    const weekTotal = days.reduce((s, d) => s + d.minutes, 0);
    return { emp, days, weekTotal, weekOvertime: weekTotal - SOLL_PRO_TAG * 5 };
  });

  const maxDayMin = Math.max(...weekData.flatMap(w => w.days.map(d => d.minutes)), SOLL_PRO_TAG, 1);
  const totalToday = teamStatus.reduce((s, t) => s + t.totalMinutes, 0);
  const totalWeek = weekData.reduce((s, w) => s + w.weekTotal, 0);

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
              <h1 className="font-heading text-3xl md:text-4xl text-foreground tracking-tight">ZEIT-BOARD</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {format(now, "EEEE, dd. MMMM yyyy", { locale: de })} · Auto-Refresh 30s
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Uhrzeit</p>
              <LiveClock />
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Anwesend", value: `${present.length}/${TEAM.length}`, icon: Users, sub: `${absent.length} abwesend`, accent: "success" },
            { label: "Aktive Timer", value: activeEntries.length, icon: Zap, sub: "Mitarbeiter am Arbeiten", accent: "info" },
            { label: "Heute gesamt", value: fmtDuration(totalToday), icon: Clock, sub: "Team heute", accent: "warning" },
            { label: "Woche gesamt", value: fmtDuration(totalWeek), icon: TrendingUp, sub: `Soll: ${SOLL_PRO_TAG * 5 * TEAM.length / 60}h`, accent: "primary" },
          ].map((kpi, i) => (
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
                <p className="font-heading text-2xl text-foreground leading-none">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5">{kpi.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Anwesenheit */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <LogIn className="w-4 h-4 text-success" />
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Anwesenheit · Heute</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {teamStatus.map((t, idx) => (
                <motion.div key={t.emp}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.04 }}
                  className={`border rounded-xl p-4 ${t.isPresent ? "border-success/30 bg-success/5" : "border-border bg-secondary/20"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-heading text-sm ${t.isPresent ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>
                        {t.emp.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.emp}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {t.isPresent ? "Anwesend" : "Nicht anwesend"}
                        </p>
                      </div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${t.isPresent ? "bg-success animate-pulse" : "bg-muted-foreground/30"}`} />
                  </div>

                  {t.isPresent && (
                    <div className="space-y-1.5 mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Eingestempelt</span>
                        <span className="text-foreground font-medium tabular-nums">
                          {t.wd?.clock_in ? format(new Date(t.wd.clock_in), "HH:mm") : "–"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Aktuelle Zeit</span>
                        <span className="text-foreground font-heading tabular-nums">{fmtDuration(t.liveMinutes)}</span>
                      </div>
                      {t.overtime !== 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Überstunden</span>
                          <span className={`font-bold tabular-nums ${t.overtime > 0 ? "text-warning" : "text-muted-foreground"}`}>
                            {t.overtime > 0 ? "+" : ""}{fmtDuration(t.overtime)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Aktiver Timer */}
                  {t.activeTimer && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        {t.activeTimer.status === "pausiert" ? (
                          <Coffee className="w-3.5 h-3.5 text-warning" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-success" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">
                            {ACTIVITY_LABELS[t.activeTimer.activity] || t.activeTimer.activity}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {t.activeTimer.vehicle_info || "Kein Fahrzeug"}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          seit {format(new Date(t.activeTimer.start_time), "HH:mm")}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                          t.activeTimer.status === "pausiert"
                            ? "bg-warning/20 text-warning"
                            : "bg-success/20 text-success"
                        }`}>
                          {t.activeTimer.status === "pausiert" ? "PAUSE" : "LÄUFT"}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Wochen-Übersicht */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Wochen-Übersicht</p>
            </div>
            <span className="text-[10px] text-muted-foreground">
              KW {format(now, "I", { locale: de })} · {format(weekDays[0], "dd.MM.")} – {format(weekDays[5], "dd.MM.")}
            </span>
          </div>

          {/* Tages-Header */}
          <div className="flex items-center gap-2 mb-2 pl-28 md:pl-36">
            {weekDays.map((day, i) => (
              <div key={i} className="flex-1 text-center">
                <p className={`text-[10px] font-medium ${isSameDay(day, now) ? "text-success" : "text-muted-foreground"}`}>
                  {format(day, "EE", { locale: de })}
                </p>
                <p className={`text-[9px] ${isSameDay(day, now) ? "text-success font-bold" : "text-muted-foreground"}`}>
                  {format(day, "dd.MM.")}
                </p>
              </div>
            ))}
            <div className="w-16 text-center">
              <p className="text-[10px] font-medium text-muted-foreground">Σ</p>
            </div>
          </div>

          {/* Pro Mitarbeiter */}
          <div className="space-y-2">
            {weekData.map((w, idx) => (
              <motion.div key={w.emp}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
                className="flex items-center gap-2"
              >
                {/* Name */}
                <div className="flex items-center gap-2 w-24 md:w-32 flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center font-heading text-xs text-foreground">
                    {w.emp.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-foreground truncate">{w.emp}</span>
                </div>

                {/* Tages-Balken */}
                {w.days.map((d, di) => {
                  const barPct = Math.min((d.minutes / maxDayMin) * 100, 100);
                  const isOverSoll = d.minutes >= SOLL_PRO_TAG;
                  const barColor = d.isToday ? (isOverSoll ? "bg-success" : "bg-foreground") : (isOverSoll ? "bg-success/60" : "bg-muted-foreground/30");
                  return (
                    <div key={di} className="flex-1 flex flex-col items-center">
                      <div className="w-full h-8 bg-secondary rounded-md overflow-hidden flex items-end relative">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(barPct, d.minutes > 0 ? 8 : 0)}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.04 + di * 0.02, ease: "easeOut" }}
                          className={`w-full ${barColor} rounded-md ${d.isToday ? "ring-1 ring-foreground/20" : ""}`}
                        />
                        {/* Soll-Linie */}
                        <div className="absolute left-0 right-0 border-t border-dashed border-foreground/15" style={{ bottom: `${(SOLL_PRO_TAG / maxDayMin) * 100}%` }} />
                      </div>
                      {d.minutes > 0 && (
                        <p className="text-[8px] text-muted-foreground mt-0.5 tabular-nums">{Math.floor(d.minutes / 60)}h{d.minutes % 60 > 0 ? ` ${d.minutes % 60}` : ""}</p>
                      )}
                    </div>
                  );
                })}

                {/* Wochensumme */}
                <div className="w-16 flex-shrink-0 text-right">
                  <p className="text-xs font-heading text-foreground tabular-nums">{Math.floor(w.weekTotal / 60)}h</p>
                  <p className={`text-[9px] tabular-nums font-bold ${w.weekOvertime > 0 ? "text-warning" : w.weekOvertime < -600 ? "text-destructive" : "text-muted-foreground"}`}>
                    {w.weekOvertime > 0 ? "+" : ""}{Math.floor(w.weekOvertime / 60)}h
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Legende */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border text-[9px] text-muted-foreground justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-foreground" /> Heute</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> Soll erreicht (8h)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Unter Soll</span>
            <span className="flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Gestrichelte Linie = 8h-Soll</span>
          </div>
        </div>
      </div>
    </div>
  );
}