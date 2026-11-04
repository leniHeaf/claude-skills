import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, differenceInMinutes } from "date-fns";
import { de } from "date-fns/locale";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TEAM_ALL = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

function formatMinutes(min) {
  if (!min) return "0h 0min";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${m}min`;
}

const SOLL_STUNDEN_PRO_TAG = 8 * 60;

function calcOvertime(totalPresenceMin, workingDays) {
  const soll = workingDays * SOLL_STUNDEN_PRO_TAG;
  return totalPresenceMin - soll;
}

function summarizeDay(dayBookings) {
  if (!dayBookings || dayBookings.length === 0) return null;
  const sorted = [...dayBookings].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  const firstStart = sorted[0].start_time;
  const lastEnd = sorted[sorted.length - 1].end_time;
  const totalMin = sorted.reduce((s, b) => {
    if (!b.start_time || !b.end_time) return s;
    return s + Math.max(0, differenceInMinutes(new Date(b.end_time), new Date(b.start_time)));
  }, 0);
  return { firstStart, lastEnd, totalMin, count: sorted.length };
}

function buildMonthSummary(entries, bookings, month, team) {
  const [year, mon] = month.split("-").map(Number);
  const start = startOfMonth(new Date(year, mon - 1));
  const end = endOfMonth(start);
  const TEAM_TO_USE = team || TEAM_ALL;

  return TEAM_TO_USE.map(emp => {
    const empEntries = entries.filter(e => {
      if (e.employee !== emp) return false;
      const d = e.start_time ? e.start_time.slice(0, 7) : "";
      return d === month;
    });

    const empBookings = bookings.filter(b => {
      if (b.employee !== emp) return false;
      return b.date && b.date.slice(0, 7) === month;
    });

    const totalProductiveMin = empEntries
      .filter(e => e.status === "beendet")
      .reduce((s, e) => s + (e.duration_minutes || 0), 0);

    // Group bookings by date
    const dayMap = {};
    empBookings.forEach(b => {
      if (!dayMap[b.date]) dayMap[b.date] = [];
      dayMap[b.date].push(b);
    });

    // Total presence = sum of all booking durations
    const totalPresenceMin = empBookings.reduce((s, b) => {
      if (!b.start_time || !b.end_time) return s;
      return s + Math.max(0, differenceInMinutes(new Date(b.end_time), new Date(b.start_time)));
    }, 0);

    const workingDays = Object.keys(dayMap).length;

    // Group by activity
    const byActivity = {};
    empEntries.filter(e => e.status === "beendet").forEach(e => {
      const act = e.activity || "sonstiges";
      byActivity[act] = (byActivity[act] || 0) + (e.duration_minutes || 0);
    });

    const allDays = eachDayOfInterval({ start, end });

    return { emp, totalProductiveMin, totalPresenceMin, workingDays, byActivity, dayMap, allDays };
  });
}

function exportCSV(summaries, month) {
  const rows = [
    ["Mitarbeiter", "Arbeitstage", "Anwesenheit (h)", "Produktivzeit (h)", "Überstunden (h)", "Differenz (h)"],
  ];
  summaries.forEach(s => {
    const presence = (s.totalPresenceMin / 60).toFixed(2);
    const productive = (s.totalProductiveMin / 60).toFixed(2);
    const overtime = (calcOvertime(s.totalPresenceMin, s.workingDays) / 60).toFixed(2);
    const diff = ((s.totalPresenceMin - s.totalProductiveMin) / 60).toFixed(2);
    rows.push([s.emp, s.workingDays, presence, productive, overtime, diff]);
  });

  rows.push([]);
  rows.push(["--- DETAILAUSWERTUNG PRO MITARBEITER ---"]);
  summaries.forEach(s => {
    rows.push([]);
    rows.push([`Mitarbeiter: ${s.emp}`]);
    rows.push(["Datum", "Erste Buchung", "Letzte Buchung", "Buchungen", "Anwesenheit (h)"]);
    s.allDays.forEach(day => {
      const d = format(day, "yyyy-MM-dd");
      const dayBookings = s.dayMap[d];
      if (dayBookings) {
        const summary = summarizeDay(dayBookings);
        if (summary) {
          rows.push([
            format(day, "dd.MM.yyyy"),
            summary.firstStart ? format(new Date(summary.firstStart), "HH:mm") : "",
            summary.lastEnd ? format(new Date(summary.lastEnd), "HH:mm") : "laufend",
            summary.count,
            (summary.totalMin / 60).toFixed(2),
          ]);
        }
      }
    });
    rows.push(["Tätigkeitsaufteilung:"]);
    Object.entries(s.byActivity).forEach(([act, min]) => {
      rows.push(["", act, (min / 60).toFixed(2) + " h"]);
    });
  });

  const csv = rows.map(r => r.map(c => `"${c}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Lohnabrechnung_${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Lohnabrechnung({ entries, bookings, fixedEmployee }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const displayDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const month = format(displayDate, "yyyy-MM");
  const monthLabel = format(displayDate, "MMMM yyyy", { locale: de });

  const team = fixedEmployee ? [fixedEmployee] : TEAM_ALL;
  const summaries = buildMonthSummary(entries, bookings || [], month, team);

  const totalPresence = summaries.reduce((s, x) => s + x.totalPresenceMin, 0);
  const totalProductive = summaries.reduce((s, x) => s + x.totalProductiveMin, 0);
  const totalWorkingDays = summaries.reduce((s, x) => s + x.workingDays, 0);
  const totalOvertime = calcOvertime(totalPresence, totalWorkingDays);

  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMonthOffset(o => o - 1)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="font-heading text-base text-foreground tracking-wide uppercase">{monthLabel}</p>
          <button onClick={() => setMonthOffset(o => o + 1)} disabled={monthOffset >= 0} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <Button onClick={() => exportCSV(summaries, month)} size="sm" className="gap-2 bg-primary">
          <Download className="w-3.5 h-3.5" /> CSV Export
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Anwesenheit</p>
          <p className="font-heading text-xl text-foreground">{formatMinutes(totalPresence)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Produktivzeit</p>
          <p className="font-heading text-xl text-foreground">{formatMinutes(totalProductive)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Auslastung</p>
          <p className="font-heading text-xl text-foreground">
            {totalPresence > 0 ? Math.round((totalProductive / totalPresence) * 100) : 0}%
          </p>
        </div>
        <div className={`bg-card border rounded-xl p-4 text-center ${totalOvertime > 0 ? "border-warning/30" : "border-border"}`}>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Überstunden</p>
          <p className={`font-heading text-xl ${totalOvertime > 0 ? "text-warning" : "text-foreground"}`}>
            {totalOvertime > 0 ? "+" : ""}{formatMinutes(Math.abs(totalOvertime))}
          </p>
        </div>
      </div>

      {/* Per-Employee Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-3 border-b border-border">
          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Mitarbeiter · {monthLabel}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-3 text-[10px] font-semibold text-muted-foreground uppercase">Mitarbeiter</th>
                <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Tage</th>
                <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Anwesenheit</th>
                <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Produktiv</th>
                <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Überstunden</th>
                <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Auslastung</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {summaries.map(s => {
                const auslastung = s.totalPresenceMin > 0 ? Math.round((s.totalProductiveMin / s.totalPresenceMin) * 100) : 0;
                const isExpanded = expanded === s.emp;
                return (
                  <React.Fragment key={s.emp}>
                    <tr className="border-b border-border/50 hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setExpanded(isExpanded ? null : s.emp)}>
                      <td className="p-3 font-semibold text-foreground">{s.emp}</td>
                      <td className="p-3 text-right text-muted-foreground">{s.workingDays}</td>
                      <td className="p-3 text-right text-foreground">{formatMinutes(s.totalPresenceMin)}</td>
                      <td className="p-3 text-right text-foreground">{formatMinutes(s.totalProductiveMin)}</td>
                      {(() => {
                        const ot = calcOvertime(s.totalPresenceMin, s.workingDays);
                        return (
                          <td className="p-3 text-right">
                            <span className={`text-xs font-semibold ${ot > 0 ? "text-warning" : "text-muted-foreground"}`}>
                              {ot > 0 ? "+" : ot < 0 ? "−" : ""}{formatMinutes(Math.abs(ot))}
                            </span>
                          </td>
                        );
                      })()}
                      <td className="p-3 text-right">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${auslastung >= 70 ? "bg-success/10 text-success" : auslastung >= 40 ? "bg-warning/10 text-warning" : "bg-secondary text-muted-foreground"}`}>
                          {auslastung}%
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-center text-xs">{isExpanded ? "▲" : "▼"}</td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="bg-secondary/20 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Activity breakdown */}
                            <div>
                              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-2">Tätigkeit</p>
                              {Object.keys(s.byActivity).length === 0
                                ? <p className="text-xs text-muted-foreground">Keine Einträge</p>
                                : Object.entries(s.byActivity).map(([act, min]) => (
                                  <div key={act} className="flex justify-between text-xs py-1 border-b border-border/30">
                                    <span className="text-muted-foreground capitalize">{act}</span>
                                    <span className="font-medium">{formatMinutes(min)}</span>
                                  </div>
                                ))
                              }
                            </div>
                            {/* Daily presence */}
                            <div>
                              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-2">Tage mit Buchungen</p>
                              <div className="space-y-1 max-h-40 overflow-y-auto">
                                {s.allDays.filter(d => s.dayMap[format(d, "yyyy-MM-dd")]).map(day => {
                                  const d = format(day, "yyyy-MM-dd");
                                  const summary = summarizeDay(s.dayMap[d]);
                                  if (!summary) return null;
                                  return (
                                    <div key={d} className="flex justify-between text-xs py-0.5">
                                      <span className="text-muted-foreground">{format(day, "EEE dd.MM.", { locale: de })}</span>
                                      <span className="font-medium">
                                        {summary.firstStart ? format(new Date(summary.firstStart), "HH:mm") : ""}
                                        {summary.lastEnd ? ` – ${format(new Date(summary.lastEnd), "HH:mm")}` : " laufend"}
                                        {` · ${formatMinutes(summary.totalMin)}`}
                                        {summary.count > 1 ? ` (${summary.count})` : ""}
                                      </span>
                                    </div>
                                  );
                                })}
                                {Object.keys(s.dayMap).length === 0 && <p className="text-xs text-muted-foreground">Keine Anwesenheit erfasst</p>}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        CSV-Export enthält vollständige Tages- und Tätigkeitsauflistung für den Steuerberater.
      </p>
    </div>
  );
}