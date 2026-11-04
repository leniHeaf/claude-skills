import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, differenceInMinutes, subDays, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, LogIn, LogOut, Users } from "lucide-react";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

function fmtDuration(minutes) {
  if (!minutes || minutes <= 0) return "0min";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function fmtTime(iso) {
  if (!iso) return "–";
  return format(new Date(iso), "HH:mm");
}

export default function TeamStempelzeiten() {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["timeBookings", "team", selectedDate],
    queryFn: () => base44.entities.TimeBooking.filter({ date: selectedDate }),
    refetchInterval: 30000,
  });

  const isToday = selectedDate === todayStr;
  const goPrev = () => setSelectedDate(format(subDays(new Date(selectedDate), 1), "yyyy-MM-dd"));
  const goNext = () => {
    const next = addDays(new Date(selectedDate), 1);
    if (next <= new Date()) setSelectedDate(format(next, "yyyy-MM-dd"));
  };

  // Group by employee
  const byEmployee = TEAM.map(name => {
    const empBookings = bookings
      .filter(b => b.employee === name)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    const totalMin = empBookings.reduce((s, b) => {
      if (!b.start_time || !b.end_time) return s;
      return s + Math.max(0, differenceInMinutes(new Date(b.end_time), new Date(b.start_time)));
    }, 0);

    const firstIn = empBookings.length > 0 ? empBookings[0].start_time : null;
    const lastOut = empBookings.length > 0 ? empBookings[empBookings.length - 1].end_time : null;
    const isPresent = empBookings.some(b => !b.end_time);
    const overtime = totalMin - 480;

    return { name, empBookings, totalMin, firstIn, lastOut, isPresent, overtime };
  });

  const presentCount = byEmployee.filter(e => e.empBookings.length > 0).length;
  const activeCount = byEmployee.filter(e => e.isPresent).length;
  const grandTotal = byEmployee.reduce((s, e) => s + e.totalMin, 0);

  return (
    <div className="space-y-4">
      {/* Header with date navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={goPrev} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="font-heading text-sm text-foreground tracking-wide uppercase">
            {format(new Date(selectedDate), "EEEE, dd. MMMM yyyy", { locale: de })}
          </p>
          <button onClick={goNext} disabled={isToday} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
          {!isToday && (
            <button onClick={() => setSelectedDate(todayStr)} className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md bg-secondary/50">
              Heute
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-foreground" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Anwesend</p>
          </div>
          <p className="font-heading text-xl text-foreground">{presentCount}/{TEAM.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <LogIn className="w-3.5 h-3.5 text-success" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Eingestempelt</p>
          </div>
          <p className="font-heading text-xl text-success">{activeCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Summe</p>
          </div>
          <p className="font-heading text-xl text-foreground">{fmtDuration(grandTotal)}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Lade Stempelzeiten...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {byEmployee.map((emp, i) => {
            const { name, empBookings, totalMin, firstIn, lastOut, isPresent, overtime } = emp;
            const hasBookings = empBookings.length > 0;

            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-card border rounded-xl overflow-hidden transition-all
                  ${isPresent ? "border-success/30" : hasBookings ? "border-border" : "border-border opacity-50"}`}
              >
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full
                      ${isPresent ? "bg-success animate-pulse" : hasBookings ? "bg-muted-foreground" : "bg-muted"}`} />
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    {hasBookings && (
                      <span className="text-[10px] text-muted-foreground">
                        {empBookings.length} {empBookings.length === 1 ? "Buchung" : "Buchungen"}
                      </span>
                    )}
                  </div>
                  {hasBookings ? (
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <LogIn className="w-3 h-3" /> {fmtTime(firstIn)}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <LogOut className="w-3 h-3" /> {lastOut ? fmtTime(lastOut) : "läuft"}
                      </span>
                      <span className="text-sm font-heading text-foreground tabular-nums">{fmtDuration(totalMin)}</span>
                      {overtime !== 0 && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${overtime > 0 ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"}`}>
                          {overtime > 0 ? "+" : "−"}{fmtDuration(Math.abs(overtime))}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Nicht anwesend</span>
                  )}
                </div>

                {hasBookings && (
                  <div className="px-3 py-2 flex flex-wrap gap-2">
                    {empBookings.map((b, idx) => {
                      const dur = (b.start_time && b.end_time)
                        ? Math.max(0, differenceInMinutes(new Date(b.end_time), new Date(b.start_time)))
                        : 0;
                      const isActive = !b.end_time;
                      return (
                        <div key={b.id || idx} className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md
                          ${isActive ? "bg-success/10 text-success" : "bg-secondary/60 text-muted-foreground"}`}>
                          <span className="font-medium tabular-nums">{fmtTime(b.start_time)}</span>
                          <span>–</span>
                          <span className="font-medium tabular-nums">{b.end_time ? fmtTime(b.end_time) : "läuft"}</span>
                          {dur > 0 && <span className="text-[10px]">· {fmtDuration(dur)}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}