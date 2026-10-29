import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { de } from "date-fns/locale";
import { Wrench, Users, TrendingUp } from "lucide-react";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

function computeMonthCapacity(monthDate, schichtEntries, leaveRequests) {
  const mStart = startOfMonth(monthDate);
  const mEnd = endOfMonth(monthDate);
  
  // Count working days in month (Mon-Fri, not counting weekends)
  let workingDays = 0;
  let day = new Date(mStart);
  while (day <= mEnd) {
    const dow = day.getDay();
    if (dow !== 0 && dow !== 6) workingDays++;
    day = new Date(day.setDate(day.getDate() + 1));
  }

  // Count employee-days available from Schichtplan
  let availableEmployeeDays = 0;
  const monthStr = format(monthDate, "yyyy-MM");

  TEAM.forEach(emp => {
    // Find Schichtplan entries for this employee in this month
    const entries = schichtEntries.filter(e => {
      const eMonth = e.week_start?.substring(0, 7);
      return e.employee === emp && eMonth === monthStr;
    });
    
    if (entries.length === 0) {
      // No entry → assume full availability
      availableEmployeeDays += workingDays;
      return;
    }
    
    // Count available weekdays
    entries.forEach(entry => {
      const weekStart = new Date(entry.week_start);
      ["monday", "tuesday", "wednesday", "thursday", "friday"].forEach(dayKey => {
        const shift = entry[dayKey] || "frueh";
        if (shift === "frueh" || shift === "spaet") {
          const dayIndex = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(dayKey);
          const dayDate = new Date(weekStart);
          dayDate.setDate(dayDate.getDate() + dayIndex);
          const dayMonth = format(dayDate, "yyyy-MM");
          if (dayMonth === monthStr) {
            // Check leave
            const dateStr = format(dayDate, "yyyy-MM-dd");
            const onLeave = leaveRequests.find(l =>
              l.employee === emp && l.status === "genehmigt" &&
              l.start_date <= dateStr && l.end_date >= dateStr
            );
            if (!onLeave) availableEmployeeDays++;
          }
        }
      });
    });
  });

  const maxCapacity = TEAM.length * workingDays;
  const pct = maxCapacity > 0 ? Math.round((availableEmployeeDays / maxCapacity) * 100) : 100;

  return { workingDays, availableEmployeeDays, maxCapacity, pct };
}

export default function Jahresuebersicht({ year, schichtEntries, leaveRequests, tasks, onSelectMonth }) {
  const months = useMemo(() => {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    return eachMonthOfInterval({ start: yearStart, end: yearEnd });
  }, [year]);

  const monthData = useMemo(() => {
    return months.map(monthDate => {
      const monthStr = format(monthDate, "yyyy-MM");
      const capacity = computeMonthCapacity(monthDate, schichtEntries, leaveRequests);
      
      // Count tasks active in this month
      const monthTasks = tasks.filter(t => {
        if (t.status === "erledigt") return false;
        if (!t.created_date) return true;
        const tMonth = t.created_date?.substring(0, 7);
        return tMonth === monthStr || (tMonth && tMonth <= monthStr);
      });

      // Count tasks with assigned_to
      const plannedTasks = monthTasks.filter(t => t.assigned_to);
      const unplannedTasks = monthTasks.filter(t => !t.assigned_to);

      return {
        monthDate,
        monthStr,
        ...capacity,
        taskCount: monthTasks.length,
        plannedTasks: plannedTasks.length,
        unplannedTasks: unplannedTasks.length,
      };
    });
  }, [months, schichtEntries, leaveRequests, tasks]);

  const today = new Date();
  const currentMonthStr = format(today, "yyyy-MM");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Year header */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-heading text-2xl text-foreground tracking-wide">{year}</p>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Geringe Auslastung</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> Mittel</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> Hoch / Überlastet</span>
        </div>
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {monthData.map((m, i) => {
          const isCurrent = m.monthStr === currentMonthStr;
          const isPast = m.monthStr < currentMonthStr;
          const colorClass = m.pct >= 70 ? "border-success/30 bg-success/5" : m.pct >= 40 ? "border-warning/30 bg-warning/5" : "border-destructive/30 bg-destructive/5";
          const barColor = m.pct >= 70 ? "bg-success" : m.pct >= 40 ? "bg-warning" : "bg-destructive";

          return (
            <motion.button
              key={m.monthStr}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelectMonth(m.monthDate)}
              className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
                ${isCurrent ? "ring-2 ring-primary/50 border-primary bg-primary/5" : colorClass}
                ${isPast ? "opacity-60" : ""}`}
            >
              {/* Month name */}
              <p className={`text-xs font-heading tracking-widest uppercase mb-1 ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                {format(m.monthDate, "MMMM", { locale: de })}
              </p>

              {/* Capacity bar */}
              <div className="flex items-end gap-2 mb-3">
                <span className={`font-heading text-3xl ${isCurrent ? "text-primary" : "text-foreground"}`}>{m.pct}%</span>
                <span className="text-[10px] text-muted-foreground mb-1.5">Auslastung</span>
              </div>
              
              <div className="h-1 bg-secondary rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.pct}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.03 }}
                  className={`h-full rounded-full ${barColor}`}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{m.availableEmployeeDays} Tag</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{m.plannedTasks}/{m.taskCount}</span>
                </div>
                {m.unplannedTasks > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-warning" />
                    <span className="text-[10px] text-warning">{m.unplannedTasks} offen</span>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">JAHRESZUSAMMENFASSUNG</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(() => {
            const avgPct = monthData.length > 0 ? Math.round(monthData.reduce((s, m) => s + m.pct, 0) / monthData.length) : 0;
            const totalAvail = monthData.reduce((s, m) => s + m.availableEmployeeDays, 0);
            const totalMax = monthData.reduce((s, m) => s + m.maxCapacity, 0);
            const totalTasks = monthData.reduce((s, m) => s + m.taskCount, 0);
            const overloadedMonths = monthData.filter(m => m.pct < 50).length;
            
            return (
              <>
                <div className="text-center p-3 bg-secondary rounded-xl">
                  <p className="font-heading text-xl text-foreground">{avgPct}%</p>
                  <p className="text-[9px] text-muted-foreground mt-1">Ø Auslastung</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-xl">
                  <p className="font-heading text-xl text-foreground">{totalAvail}</p>
                  <p className="text-[9px] text-muted-foreground mt-1">Verfügbare Tage</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-xl">
                  <p className="font-heading text-xl text-foreground">{totalTasks}</p>
                  <p className="text-[9px] text-muted-foreground mt-1">Geplante Aufträge</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-xl">
                  <p className={`font-heading text-xl ${overloadedMonths > 0 ? "text-warning" : "text-success"}`}>{overloadedMonths}</p>
                  <p className="text-[9px] text-muted-foreground mt-1">Monate unter 50%</p>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
}