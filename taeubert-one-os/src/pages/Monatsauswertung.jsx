import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, differenceInMinutes, isWeekend, isSameMonth } from "date-fns";
import { de } from "date-fns/locale";
import {
  ChevronLeft, ChevronRight, Clock, Briefcase, CheckCircle2, AlertCircle,
  CalendarDays, Car, ChevronDown, Users
} from "lucide-react";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];
const SOLL_PRO_TAG = 8 * 60;

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

function fmtDuration(min) {
  if (!min || min <= 0) return "0h 0min";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${m}min`;
}

function fmtTime(iso) {
  if (!iso) return "–";
  try { return format(new Date(iso), "HH:mm"); } catch { return "–"; }
}

export default function Monatsauswertung() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [expandedEmp, setExpandedEmp] = useState(null);
  const now = new Date();
  const displayDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const month = format(displayDate, "yyyy-MM");
  const monthLabel = format(displayDate, "MMMM yyyy", { locale: de });
  const monthStart = startOfMonth(displayDate);
  const monthEnd = endOfMonth(displayDate);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const workingDaysInMonth = allDays.filter(d => !isWeekend(d) && isSameMonth(d, displayDate)).length;

  // Fetch all TimeBookings for the month
  const { data: allBookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ["timeBookings-all"],
    queryFn: () => base44.entities.TimeBooking.list("-created_date", 3000),
    staleTime: 0,
    refetchOnMount: true,
  });

  // Fetch all TimeEntries for the month
  const { data: allEntries = [], isLoading: loadingEntries } = useQuery({
    queryKey: ["timeEntries-all"],
    queryFn: () => base44.entities.TimeEntry.list("-created_date", 3000),
    staleTime: 0,
    refetchOnMount: true,
  });

  const monthBookings = useMemo(() =>
    allBookings.filter(b => b.date && b.date.slice(0, 7) === month),
    [allBookings, month]
  );

  const monthEntries = useMemo(() =>
    allEntries.filter(e => {
      if (!e.start_time) return false;
      return e.start_time.slice(0, 7) === month;
    }),
    [allEntries, month]
  );

  // Build per-employee summary
  const summaries = useMemo(() => TEAM.map(emp => {
    const bookings = monthBookings.filter(b => b.employee === emp);
    const entries = monthEntries.filter(e => e.employee === emp);

    // Group bookings by date
    const dayMap = {};
    bookings.forEach(b => {
      if (!dayMap[b.date]) dayMap[b.date] = [];
      dayMap[b.date].push(b);
    });

    const totalPresenceMin = bookings.reduce((s, b) => {
      if (!b.start_time || !b.end_time) return s;
      return s + Math.max(0, differenceInMinutes(new Date(b.end_time), new Date(b.start_time)));
    }, 0);

    const totalProductiveMin = entries
      .filter(e => e.status === "beendet")
      .reduce((s, e) => s + (e.duration_minutes || 0), 0);

    const workingDays = Object.keys(dayMap).length;
    const sollMin = workingDays * SOLL_PRO_TAG;
    const overtime = totalPresenceMin - sollMin;

    // Group entries by activity
    const byActivity = {};
    entries.filter(e => e.status === "beendet").forEach(e => {
      const act = e.activity || "sonstiges";
      byActivity[act] = (byActivity[act] || 0) + (e.duration_minutes || 0);
    });

    // Group entries by vehicle
    const byVehicle = {};
    entries.filter(e => e.status === "beendet").forEach(e => {
      const v = e.vehicle_info || "Ohne Fahrzeug";
      if (!byVehicle[v]) byVehicle[v] = { total: 0, count: 0 };
      byVehicle[v].total += (e.duration_minutes || 0);
      byVehicle[v].count += 1;
    });

    // Check for days with bookings but no entries (gap)
    const daysWithBookings = Object.keys(dayMap).sort();
    const daysWithEntries = new Set(entries.map(e => e.start_time?.slice(0, 10)));
    const daysWithoutTasks = daysWithBookings.filter(d => !daysWithEntries.has(d));

    return {
      emp, bookings, entries, dayMap,
      totalPresenceMin, totalProductiveMin, workingDays,
      overtime, byActivity, byVehicle, daysWithoutTasks,
    };
  }), [monthBookings, monthEntries]);

  const totalPresence = summaries.reduce((s, x) => s + x.totalPresenceMin, 0);
  const totalProductive = summaries.reduce((s, x) => s + x.totalProductiveMin, 0);
  const totalOvertime = summaries.reduce((s, x) => s + x.overtime, 0);
  const auslastung = totalPresence > 0 ? Math.round((totalProductive / totalPresence) * 100) : 0;

  const loading = loadingBookings || loadingEntries;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">MONATSAUSWERTUNG</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Arbeitsstunden & Aufgaben pro Mitarbeiter — zur Prüfung
        </p>
      </motion.div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setMonthOffset(o => o - 1)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="font-heading text-base text-foreground tracking-wide uppercase flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {monthLabel}
          </p>
          <button onClick={() => setMonthOffset(o => o + 1)} disabled={monthOffset >= 0} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Team KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Anwesenheit", value: fmtDuration(totalPresence), icon: Clock },
          { label: "Produktivzeit", value: fmtDuration(totalProductive), icon: Briefcase },
          { label: "Auslastung", value: `${auslastung}%`, icon: CheckCircle2 },
          { label: "Überstunden", value: `${totalOvertime > 0 ? "+" : ""}${fmtDuration(Math.abs(totalOvertime))}`, icon: AlertCircle, warn: totalOvertime > 0 },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <k.icon className={`w-3.5 h-3.5 ${k.warn ? "text-warning" : "text-muted-foreground"}`} />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
            </div>
            <p className={`font-heading text-xl ${k.warn ? "text-warning" : "text-foreground"}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {summaries.map((s, idx) => {
            const isExpanded = expandedEmp === s.emp;
            const empAuslastung = s.totalPresenceMin > 0 ? Math.round((s.totalProductiveMin / s.totalPresenceMin) * 100) : 0;
            const hasIssues = s.daysWithoutTasks.length > 0;

            return (
              <motion.div
                key={s.emp}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Employee Header Row */}
                <button
                  onClick={() => setExpandedEmp(isExpanded ? null : s.emp)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-heading text-sm text-foreground">
                      {s.emp.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{s.emp}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.workingDays} Arbeitstage · {s.entries.filter(e => e.status === "beendet").length} Aufgabeneinträge
                        {hasIssues && <span className="text-warning ml-1">· ⚠ {s.daysWithoutTasks.length} Tag(e) ohne Aufgaben</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Mini stats */}
                    <div className="hidden md:flex items-center gap-5 text-right">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Anwesenheit</p>
                        <p className="text-sm font-heading text-foreground">{fmtDuration(s.totalPresenceMin)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Produktiv</p>
                        <p className="text-sm font-heading text-foreground">{fmtDuration(s.totalProductiveMin)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Überstunden</p>
                        <p className={`text-sm font-heading ${s.overtime > 0 ? "text-warning" : "text-muted-foreground"}`}>
                          {s.overtime > 0 ? "+" : ""}{fmtDuration(s.overtime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Auslastung</p>
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                          empAuslastung >= 70 ? "bg-success/10 text-success" : empAuslastung >= 40 ? "bg-warning/10 text-warning" : "bg-secondary text-muted-foreground"
                        }`}>
                          {empAuslastung}%
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border overflow-hidden"
                    >
                      <div className="p-4 space-y-5 bg-secondary/10">
                        {/* Mobile stats */}
                        <div className="md:hidden grid grid-cols-4 gap-2 text-center">
                          <div><p className="text-[9px] text-muted-foreground">Anwesend</p><p className="text-xs font-heading">{fmtDuration(s.totalPresenceMin)}</p></div>
                          <div><p className="text-[9px] text-muted-foreground">Produktiv</p><p className="text-xs font-heading">{fmtDuration(s.totalProductiveMin)}</p></div>
                          <div><p className="text-[9px] text-muted-foreground">Überst.</p><p className={`text-xs font-heading ${s.overtime > 0 ? "text-warning" : ""}`}>{s.overtime > 0 ? "+" : ""}{fmtDuration(s.overtime)}</p></div>
                          <div><p className="text-[9px] text-muted-foreground">Ausl.</p><p className="text-xs font-heading">{empAuslastung}%</p></div>
                        </div>

                        {/* Activity Breakdown */}
                        {Object.keys(s.byActivity).length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                              <Briefcase className="w-3 h-3" /> Tätigkeiten
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(s.byActivity).sort(([, a], [, b]) => b - a).map(([act, min]) => (
                                <span key={act} className="text-[11px] px-2.5 py-1 rounded-lg bg-secondary text-foreground">
                                  {ACTIVITY_LABELS[act] || act}: <span className="font-semibold">{fmtDuration(min)}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Vehicle Breakdown */}
                        {Object.keys(s.byVehicle).length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                              <Car className="w-3 h-3" /> Fahrzeuge
                            </p>
                            <div className="space-y-1">
                              {Object.entries(s.byVehicle).sort(([, a], [, b]) => b.total - a.total).map(([v, data]) => (
                                <div key={v} className="flex justify-between text-xs py-1 border-b border-border/30">
                                  <span className="text-foreground">{v}</span>
                                  <span className="text-muted-foreground">{data.count}x · <span className="font-medium text-foreground">{fmtDuration(data.total)}</span></span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Day-by-Day Detail */}
                        <div>
                          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                            <CalendarDays className="w-3 h-3" /> Tagesnachweis
                          </p>
                          <div className="space-y-2">
                            {allDays.filter(d => s.dayMap[format(d, "yyyy-MM-dd")] || s.entries.some(e => e.start_time?.slice(0, 10) === format(d, "yyyy-MM-dd"))).map(day => {
                              const dateStr = format(day, "yyyy-MM-dd");
                              const dayBookings = s.dayMap[dateStr] || [];
                              const dayEntries = s.entries.filter(e => e.start_time?.slice(0, 10) === dateStr);

                              if (dayBookings.length === 0 && dayEntries.length === 0) return null;

                              const dayPresence = dayBookings.reduce((sum, b) => {
                                if (!b.start_time || !b.end_time) return sum;
                                return sum + Math.max(0, differenceInMinutes(new Date(b.end_time), new Date(b.start_time)));
                              }, 0);

                              const dayProductive = dayEntries
                                .filter(e => e.status === "beendet")
                                .reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

                              const sortedBookings = [...dayBookings].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

                              return (
                                <div key={dateStr} className="bg-card border border-border rounded-lg p-3">
                                  {/* Day header */}
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-foreground">
                                      {format(day, "EEEE, dd.MM.yyyy", { locale: de })}
                                    </p>
                                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                                      <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {fmtDuration(dayPresence)}</span>
                                      {dayProductive > 0 && <span className="flex items-center gap-1"><Briefcase className="w-2.5 h-2.5" /> {fmtDuration(dayProductive)}</span>}
                                    </div>
                                  </div>

                                  {/* Time bookings (presence) */}
                                  {sortedBookings.map((b, i) => (
                                    <div key={b.id || i} className="flex items-start gap-2 py-1 text-[11px]">
                                      <span className="text-muted-foreground tabular-nums flex-shrink-0">
                                        {fmtTime(b.start_time)}–{fmtTime(b.end_time)}
                                      </span>
                                      <span className="text-foreground">{b.notes || "Keine Notiz"}</span>
                                    </div>
                                  ))}

                                  {/* Task entries */}
                                  {dayEntries.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-border/30">
                                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Aufgaben</p>
                                      {dayEntries.map((e, i) => (
                                        <div key={e.id || i} className="flex items-start gap-2 py-0.5 text-[11px]">
                                          <span className="text-muted-foreground tabular-nums flex-shrink-0">
                                            {e.status === "beendet" ? `${fmtTime(e.start_time)}–${fmtTime(e.end_time)}` : `seit ${fmtTime(e.start_time)}`}
                                          </span>
                                          <span className="text-foreground">
                                            {ACTIVITY_LABELS[e.activity] || e.activity}
                                            {e.vehicle_info ? ` · ${e.vehicle_info}` : ""}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {dayBookings.length === 0 && dayEntries.length > 0 && (
                                    <p className="text-[10px] text-warning flex items-center gap-1 mt-1">
                                      <AlertCircle className="w-3 h-3" /> Keine Anwesenheitsbuchung
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                            {allDays.every(d => !s.dayMap[format(d, "yyyy-MM-dd")] && !s.entries.some(e => e.start_time?.slice(0, 10) === format(d, "yyyy-MM-dd"))) && (
                              <p className="text-xs text-muted-foreground text-center py-4">Keine Einträge in diesem Monat</p>
                            )}
                          </div>
                        </div>

                        {/* Issues */}
                        {s.daysWithoutTasks.length > 0 && (
                          <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                            <p className="text-[10px] font-semibold text-warning uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <AlertCircle className="w-3 h-3" /> Prüfen erforderlich
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {s.daysWithoutTasks.length} Tag(e) mit Anwesenheit aber ohne Aufgabeneinträge: {s.daysWithoutTasks.map(d => format(new Date(d), "dd.MM.", { locale: de })).join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground text-center mt-6">
        <Users className="w-3 h-3 inline mr-1" />
        {TEAM.length} Mitarbeiter · {workingDaysInMonth} Werktage im Monat · Soll: {fmtDuration(workingDaysInMonth * SOLL_PRO_TAG)} pro Mitarbeiter
      </p>
    </div>
  );
}