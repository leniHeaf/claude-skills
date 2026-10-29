import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isToday,
  differenceInMinutes, isSameMonth, getDay, addMonths,
  isWeekend,
} from "date-fns";
import { de } from "date-fns/locale";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, TrendingUp, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

const SOLL_PRO_TAG = 8 * 60; // 8h in minutes

function fmtDuration(minutes) {
  if (!minutes || minutes <= 0) return "0min";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function MonthView({ employee, isChef }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState(employee);

  const now = new Date();
  const displayDate = addMonths(new Date(now.getFullYear(), now.getMonth(), 1), monthOffset);
  const monthKey = format(displayDate, "yyyy-MM");
  const monthLabel = format(displayDate, "MMMM yyyy", { locale: de });

  const targetEmployee = isChef ? selectedEmployee : employee;

  // Fetch ALL bookings for the selected employee — filter by month client-side
  // (date-Feld enthält volle Daten wie "2026-07-15", nicht Monats-Keys)
  const { data: allEmpBookings = [], isLoading } = useQuery({
    queryKey: ["timeBookings", "employee", targetEmployee],
    queryFn: () => base44.entities.TimeBooking.filter({ employee: targetEmployee }),
    enabled: !!targetEmployee,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const bookings = allEmpBookings.filter(b => b.date && b.date.startsWith(monthKey));

  // For chef: fetch all bookings — filter by month client-side
  const { data: allBookings = [] } = useQuery({
    queryKey: ["timeBookings", "all"],
    queryFn: () => base44.entities.TimeBooking.list("-created_date", 2000),
    enabled: isChef,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const allMonthBookings = allBookings.filter(b => b.date && b.date.startsWith(monthKey));

  // Group bookings by date for calendar
  const dayMap = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [bookings]);

  // Calculate daily totals
  const dayTotals = useMemo(() => {
    const totals = {};
    Object.entries(dayMap).forEach(([date, dayBookings]) => {
      const sorted = [...dayBookings].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      const worked = sorted.reduce((s, b) => {
        if (!b.start_time || !b.end_time) return s;
        return s + Math.max(0, differenceInMinutes(new Date(b.end_time), new Date(b.start_time)));
      }, 0);
      totals[date] = { worked, count: sorted.length, firstStart: sorted[0]?.start_time, lastEnd: sorted[sorted.length - 1]?.end_time };
    });
    return totals;
  }, [dayMap]);

  // Build calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(displayDate);
    const end = endOfMonth(displayDate);
    const days = eachDayOfInterval({ start, end });
    // Pad start to begin on Monday
    const firstDayOfWeek = (getDay(start) + 6) % 7;
    const padded = [];
    for (let i = 0; i < firstDayOfWeek; i++) padded.push(null);
    return [...padded, ...days];
  }, [displayDate]);

  // Monthly KPIs
  const totalWorked = Object.values(dayTotals).reduce((s, d) => s + d.worked, 0);
  const workingDays = Object.keys(dayTotals).length;
  const avgPerDay = workingDays > 0 ? Math.round(totalWorked / workingDays) : 0;
  const overtime = totalWorked - workingDays * SOLL_PRO_TAG;

  // Team summary for chef
  const teamSummary = useMemo(() => {
    if (!isChef) return [];
    const teamMap = {};
    allMonthBookings.forEach(b => {
      if (!teamMap[b.employee]) teamMap[b.employee] = { employee: b.employee, days: new Set(), worked: 0 };
      teamMap[b.employee].days.add(b.date);
      if (b.start_time && b.end_time) {
        teamMap[b.employee].worked += Math.max(0, differenceInMinutes(new Date(b.end_time), new Date(b.start_time)));
      }
    });
    return Object.values(teamMap).map(t => ({
      ...t,
      workingDays: t.days.size,
      overtime: t.worked - t.days.size * SOLL_PRO_TAG,
    })).sort((a, b) => b.worked - a.worked);
  }, [allMonthBookings, isChef]);

  const teamMembers = teamSummary.map(t => t.employee);

  return (
    <div className="space-y-5">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMonthOffset(o => o - 1)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="font-heading text-base text-foreground tracking-wide uppercase">{monthLabel}</p>
          <button onClick={() => setMonthOffset(o => o + 1)} disabled={monthOffset >= 0} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
          {monthOffset !== 0 && (
            <Button size="sm" variant="ghost" onClick={() => setMonthOffset(0)}>Aktueller Monat</Button>
          )}
        </div>
        {isChef && (
          <select
            value={selectedEmployee || ""}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground"
          >
            <option value={employee}>Ich ({employee})</option>
            {teamMembers.filter(m => m !== employee).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-foreground" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gearbeitet</p>
          </div>
          <p className="font-heading text-xl text-foreground">{fmtDuration(totalWorked)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Arbeitstage</p>
          </div>
          <p className="font-heading text-xl text-foreground">{workingDays}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ø pro Tag</p>
          </div>
          <p className="font-heading text-xl text-foreground">{fmtDuration(avgPerDay)}</p>
        </div>
        <div className={`bg-card border rounded-xl p-4 ${overtime > 0 ? "border-warning/30" : "border-border"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Überstunden</p>
          </div>
          <p className={`font-heading text-xl ${overtime > 0 ? "text-warning" : "text-foreground"}`}>
            {overtime > 0 ? "+" : ""}{fmtDuration(Math.abs(overtime))}
          </p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`pad-${idx}`} />;
            const dateStr = format(day, "yyyy-MM-dd");
            const total = dayTotals[dateStr];
            const weekend = isWeekend(day);
            const today = isToday(day);
            const overtimeDay = total ? total.worked - SOLL_PRO_TAG : 0;

            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.005 }}
                className={`relative rounded-lg p-2 min-h-[68px] border transition-colors
                  ${today ? "border-foreground/40 bg-secondary/50" : "border-border"}
                  ${weekend && !total ? "bg-secondary/20" : ""}
                  ${total ? "bg-secondary/30" : ""}
                `}
              >
                <p className={`text-[10px] font-semibold ${today ? "text-foreground" : weekend ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                  {format(day, "d")}
                </p>
                {total ? (
                  <div className="mt-1">
                    <p className="text-xs font-heading text-foreground tabular-nums leading-tight">
                      {fmtDuration(total.worked)}
                    </p>
                    <p className="text-[9px] text-muted-foreground tabular-nums leading-tight">
                      {total.firstStart ? format(new Date(total.firstStart), "HH:mm", { locale: de }) : ""}
                      {total.lastEnd ? `–${format(new Date(total.lastEnd), "HH:mm", { locale: de })}` : ""}
                    </p>
                    {overtimeDay !== 0 && (
                      <p className={`text-[9px] font-medium tabular-nums ${overtimeDay > 0 ? "text-warning" : "text-muted-foreground"}`}>
                        {overtimeDay > 0 ? "+" : ""}{fmtDuration(Math.abs(overtimeDay))}
                      </p>
                    )}
                  </div>
                ) : (
                  !weekend && isSameMonth(day, new Date()) && day <= now && (
                    <p className="text-[9px] text-muted-foreground/30 mt-1">–</p>
                  )
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Team overview for chef */}
      {isChef && teamSummary.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-3 border-b border-border">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Team-Übersicht · {monthLabel}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-3 text-[10px] font-semibold text-muted-foreground uppercase">Mitarbeiter</th>
                  <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Tage</th>
                  <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Gearbeitet</th>
                  <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Ø/Tag</th>
                  <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Überstunden</th>
                </tr>
              </thead>
              <tbody>
                {teamSummary.map(t => (
                  <tr
                    key={t.employee}
                    onClick={() => setSelectedEmployee(t.employee)}
                    className={`border-b border-border/50 hover:bg-secondary/20 transition-colors cursor-pointer
                      ${selectedEmployee === t.employee ? "bg-secondary/30" : ""}`}
                  >
                    <td className="p-3 font-semibold text-foreground">{t.employee}</td>
                    <td className="p-3 text-right text-muted-foreground">{t.workingDays}</td>
                    <td className="p-3 text-right text-foreground tabular-nums">{fmtDuration(t.worked)}</td>
                    <td className="p-3 text-right text-muted-foreground tabular-nums">
                      {t.workingDays > 0 ? fmtDuration(Math.round(t.worked / t.workingDays)) : "–"}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`text-xs font-semibold ${t.overtime > 0 ? "text-warning" : "text-muted-foreground"}`}>
                        {t.overtime > 0 ? "+" : ""}{fmtDuration(Math.abs(t.overtime))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-secondary/20">
                  <td className="p-3 font-heading text-xs text-foreground">GESAMT</td>
                  <td className="p-3 text-right font-heading text-xs text-foreground">{teamSummary.reduce((s, t) => s + t.workingDays, 0)}</td>
                  <td className="p-3 text-right font-heading text-xs text-foreground">{fmtDuration(teamSummary.reduce((s, t) => s + t.worked, 0))}</td>
                  <td className="p-3" />
                  <td className="p-3 text-right font-heading text-xs text-warning">
                    {(() => {
                      const total = teamSummary.reduce((s, t) => s + t.overtime, 0);
                      return `${total > 0 ? "+" : ""}${fmtDuration(Math.abs(total))}`;
                    })()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {!isChef && (
        <p className="text-[10px] text-muted-foreground text-center">
          SOLL: {workingDays} × 8h = {fmtDuration(workingDays * SOLL_PRO_TAG)} · IST: {fmtDuration(totalWorked)} · Differenz: {overtime > 0 ? "+" : ""}{fmtDuration(Math.abs(overtime))}
        </p>
      )}
    </div>
  );
}