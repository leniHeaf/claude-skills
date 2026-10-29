import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight, Car, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import LeihwagenPanel from "@/components/calendar/LeihwagenPanel";
import { useAuth } from "@/lib/AuthContext";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  addWeeks, subWeeks, addDays, subDays, addYears, subYears,
} from "date-fns";
import { de } from "date-fns/locale";

const APPOINTMENT_TYPES = {
  annahme: { label: "Annahme", color: "bg-info/20 text-info border-info/30" },
  abholung: { label: "Abholung", color: "bg-success/20 text-success border-success/30" },
  lackierung: { label: "Lackierung", color: "bg-primary/20 text-primary border-primary/30" },
  werkstatt: { label: "Werkstatt", color: "bg-warning/20 text-warning border-warning/30" },
  urlaub: { label: "Urlaub", color: "bg-destructive/20 text-destructive border-destructive/30" },
  probearbeit: { label: "Probearbeit", color: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  kundentermin: { label: "Kundentermin", color: "bg-info/20 text-info border-info/30" },
  autohaus: { label: "Autohaus", color: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  tuev: { label: "TÜV/HU", color: "bg-warning/20 text-warning border-warning/30" },
  reifenwechsel: { label: "Reifenwechsel", color: "bg-muted text-muted-foreground border-border" },
  nachkontrolle: { label: "Nachkontrolle", color: "bg-success/20 text-success border-success/30" },
  sonstiges: { label: "Sonstiges", color: "bg-muted text-muted-foreground border-border" },
};

const DOT_COLORS = {
  annahme: "bg-info", abholung: "bg-success", lackierung: "bg-primary",
  werkstatt: "bg-warning", urlaub: "bg-destructive", probearbeit: "bg-chart-2",
  kundentermin: "bg-info", autohaus: "bg-chart-2", tuev: "bg-warning",
  reifenwechsel: "bg-muted-foreground", nachkontrolle: "bg-success", sonstiges: "bg-muted-foreground",
};

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

const VIEWS = ["Tag", "Woche", "Monat", "Jahr"];

export default function Calendar() {
  const [view, setView] = useState("Monat");
  const [tab, setTab] = useState("termine"); // "termine" | "leihwagen"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const myName = user?.full_name || "";
  const isAdmin = myName.toLowerCase().includes("toni");

  const navigate = (dir) => {
    if (view === "Tag") { setCurrentDate(dir > 0 ? addDays(currentDate, 1) : subDays(currentDate, 1)); setSelectedDay(dir > 0 ? addDays(currentDate, 1) : subDays(currentDate, 1)); }
    else if (view === "Woche") setCurrentDate(dir > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    else if (view === "Monat") setCurrentMonth(dir > 0 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1));
    else if (view === "Jahr") setCurrentDate(dir > 0 ? addYears(currentDate, 1) : subYears(currentDate, 1));
  };

  const headerLabel = () => {
    if (view === "Tag") return format(selectedDay, "EEEE, dd. MMMM yyyy", { locale: de }).toUpperCase();
    if (view === "Woche") {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(ws, "dd. MMM", { locale: de })} – ${format(we, "dd. MMM yyyy", { locale: de })}`.toUpperCase();
    }
    if (view === "Monat") return format(currentMonth, "MMMM yyyy", { locale: de }).toUpperCase();
    if (view === "Jahr") return format(currentDate, "yyyy");
  };

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => base44.entities.Appointment.list("-date", 500),
  });

  const { data: leaves = [] } = useQuery({
    queryKey: ["leaveRequests"],
    queryFn: () => base44.entities.LeaveRequest.list("-created_date", 100),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["calendar-tasks"],
    queryFn: () => base44.entities.Task.list("-deadline", 500),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["appointments"] }); setShowAdd(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const reviewLeaveMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LeaveRequest.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leaveRequests"] }),
  });



  const getAppointmentsForDay = (day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return appointments.filter(a => a.date === dateStr);
  };

  const getTasksForDay = (day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return tasks.filter(t => t.deadline === dateStr && t.status !== "erledigt");
  };

  const getLeavesForDay = (day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return leaves.filter(l => l.start_date <= dateStr && l.end_date >= dateStr);
  };

  const selectedDayAppointments = getAppointmentsForDay(selectedDay);
  const selectedDayLeaves = getLeavesForDay(selectedDay);
  const selectedDayTasks = getTasksForDay(selectedDay);

  // Week view days
  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 }),
  });

  // Year view months
  const yearMonths = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">KALENDER</h1>
          <p className="text-sm text-muted-foreground mt-1">{appointments.length} Termine · {tasks.filter(t => t.deadline && t.status !== "erledigt").length} Aufgaben</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tab switcher */}
          <div className="flex bg-secondary rounded-lg p-0.5">
            <button onClick={() => setTab("termine")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${tab === "termine" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Termine
            </button>
            <button onClick={() => setTab("leihwagen")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${tab === "leihwagen" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Car className="w-3.5 h-3.5" /> Leihwagen
            </button>
          </div>
          {tab === "termine" && (
            <>
              {/* View switcher */}
              <div className="flex bg-secondary rounded-lg p-0.5">
                {VIEWS.map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {v}
                  </button>
                ))}
              </div>
              <Button onClick={() => setShowAdd(true)} className="bg-primary hover:bg-primary/80 gap-2">
                <Plus className="w-4 h-4" /> Termin
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Leihwagen Tab */}
      {tab === "leihwagen" && <LeihwagenPanel />}

      {/* Termine Tab */}
      {tab === "termine" && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          {/* Header with nav */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <h2 className="font-heading text-sm text-foreground tracking-widest">{headerLabel()}</h2>
            <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* TAG VIEW */}
          {view === "Tag" && (
            <div className="p-4 space-y-3 min-h-[300px]">
              {getAppointmentsForDay(selectedDay).length === 0 && getTasksForDay(selectedDay).length === 0 && getLeavesForDay(selectedDay).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-12">Keine Einträge für diesen Tag</p>
              ) : (
                <>
                  {getLeavesForDay(selectedDay).filter(l => l.status === "genehmigt").map(l => (
                    <div key={l.id} className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-destructive" />
                      <span className="text-xs text-destructive font-medium">{l.employee} · Urlaub</span>
                    </div>
                  ))}
                  {isAdmin && getLeavesForDay(selectedDay).filter(l => l.status === "eingereicht").map(l => (
                    <div key={l.id} className="flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-warning" />
                        <span className="text-xs text-warning font-medium">{l.employee} · Urlaub angefragt ({l.days} Tage)</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => reviewLeaveMutation.mutate({ id: l.id, data: { status: "abgelehnt", reviewed_by: myName } })}
                          className="w-6 h-6 rounded-full bg-destructive/20 hover:bg-destructive/30 flex items-center justify-center transition-colors">
                          <XCircle className="w-3 h-3 text-destructive" />
                        </button>
                        <button onClick={() => reviewLeaveMutation.mutate({ id: l.id, data: { status: "genehmigt", reviewed_by: myName } })}
                          className="w-6 h-6 rounded-full bg-success/20 hover:bg-success/30 flex items-center justify-center transition-colors">
                          <CheckCircle className="w-3 h-3 text-success" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {getTasksForDay(selectedDay).map(t => (
                    <div key={t.id} className="p-3 rounded-lg border bg-chart-3/10 border-chart-3/30">
                      <p className="text-xs font-semibold">{t.title}</p>
                      {t.assigned_to && <p className="text-[10px] opacity-70">👤 {t.assigned_to}</p>}
                    </div>
                  ))}
                  {getAppointmentsForDay(selectedDay).map(a => {
                    const cfg = APPOINTMENT_TYPES[a.type] || APPOINTMENT_TYPES.sonstiges;
                    return (
                      <div key={a.id} className={`p-3 rounded-lg border ${cfg.color}`}>
                        <p className="text-xs font-semibold">{a.title}</p>
                        {a.start_time && <p className="text-[10px] opacity-80">{a.start_time}{a.end_time ? ` – ${a.end_time}` : ""}</p>}
                        {a.customer_name && <p className="text-[10px] opacity-70">{a.customer_name}</p>}
                        {a.employee && <p className="text-[10px] opacity-70">{a.employee}</p>}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* WOCHE VIEW */}
          {view === "Woche" && (
            <>
              <div className="grid grid-cols-7 border-b border-border">
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="p-2 text-center border-r border-border last:border-r-0">
                    <p className="text-[9px] font-semibold tracking-wider text-muted-foreground">{format(day, "EEE", { locale: de }).toUpperCase()}</p>
                    <button onClick={() => { setSelectedDay(day); setView("Tag"); }}
                      className={`w-7 h-7 rounded-full mx-auto mt-0.5 flex items-center justify-center text-xs font-bold transition-colors
                        ${isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : isSameDay(day, selectedDay) ? "bg-secondary text-foreground" : "hover:bg-secondary text-foreground"}`}>
                      {format(day, "d")}
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 min-h-[280px]">
                {weekDays.map(day => {
                  const dayApps = getAppointmentsForDay(day);
                  const dayTasks = getTasksForDay(day);
                  const dayLeaves = getLeavesForDay(day);
                  return (
                    <div key={day.toISOString()} onClick={() => setSelectedDay(day)}
                      className={`p-1.5 border-r border-border last:border-r-0 cursor-pointer hover:bg-secondary/30 transition-colors ${isSameDay(day, selectedDay) ? "bg-primary/5" : ""}`}>
                      <div className="space-y-0.5">
                        {dayLeaves.filter(l => l.status === "eingereicht").slice(0, 1).map((l, i) => <div key={i} className="text-[9px] bg-warning/20 text-warning px-1 py-0.5 rounded truncate">{l.employee}?</div>)}
                        {dayLeaves.filter(l => l.status === "genehmigt").slice(0, 1).map((l, i) => <div key={i} className="text-[9px] bg-destructive/20 text-destructive px-1 py-0.5 rounded truncate">{l.employee}</div>)}
                        {dayApps.slice(0, 3).map((a, i) => {
                          const cfg = APPOINTMENT_TYPES[a.type] || APPOINTMENT_TYPES.sonstiges;
                          return <div key={i} className={`text-[9px] px-1 py-0.5 rounded truncate border ${cfg.color}`}>{a.title}</div>;
                        })}
                        {dayTasks.slice(0, 2).map((t, i) => <div key={i} className="text-[9px] bg-chart-3/20 text-chart-3 px-1 py-0.5 rounded truncate">{t.title}</div>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* MONAT VIEW */}
          {view === "Monat" && (
            <>
              <div className="grid grid-cols-7 border-b border-border">
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(d => (
                  <div key={d} className="p-2 text-center text-[10px] font-semibold tracking-wider text-muted-foreground">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {eachDayOfInterval({ start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }) }).map(day => {
                  const dayApps = getAppointmentsForDay(day);
                  const dayLeaves = getLeavesForDay(day);
                  const dayTasks = getTasksForDay(day);
                  const isSelected = isSameDay(day, selectedDay);
                  const isToday = isSameDay(day, new Date());
                  const inMonth = isSameMonth(day, currentMonth);
                  return (
                    <button key={day.toISOString()} onClick={() => setSelectedDay(day)}
                      className={`min-h-[64px] p-1.5 border-b border-r border-border text-left transition-all
                        ${isSelected ? "bg-primary/10 border-primary/30" : inMonth ? "hover:bg-secondary/50" : "opacity-30"}`}>
                      <span className={`text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full
                        ${isToday ? "bg-primary text-primary-foreground" : isSelected ? "text-primary" : "text-foreground"}`}>
                        {format(day, "d")}
                      </span>
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {dayLeaves.slice(0, 2).map((l, i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-destructive" />)}
                        {dayApps.slice(0, 3).map((a, i) => <span key={i} className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[a.type] || "bg-muted-foreground"}`} />)}
                        {dayTasks.slice(0, 2).map((t, i) => <span key={`t${i}`} className="w-1.5 h-1.5 rounded-full bg-chart-3" />)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* JAHR VIEW */}
          {view === "Jahr" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
              {yearMonths.map((monthDate) => {
                const mStart = startOfMonth(monthDate);
                const mEnd = endOfMonth(monthDate);
                const mDays = eachDayOfInterval({ start: startOfWeek(mStart, { weekStartsOn: 1 }), end: endOfWeek(mEnd, { weekStartsOn: 1 }) });
                return (
                  <div key={monthDate.toISOString()} className="bg-card p-3">
                    <p className="text-[10px] font-heading tracking-widest text-muted-foreground mb-2">
                      {format(monthDate, "MMMM", { locale: de }).toUpperCase()}
                    </p>
                    <div className="grid grid-cols-7 gap-px">
                      {["M","D","M","D","F","S","S"].map((d, i) => (
                        <div key={i} className="text-[8px] text-center text-muted-foreground pb-0.5">{d}</div>
                      ))}
                      {mDays.map(day => {
                        const hasItems = getAppointmentsForDay(day).length > 0 || getTasksForDay(day).length > 0;
                        const inM = isSameMonth(day, monthDate);
                        const isToday = isSameDay(day, new Date());
                        return (
                          <button key={day.toISOString()} onClick={() => { setSelectedDay(day); setCurrentMonth(monthDate); setView("Tag"); }}
                            className={`text-[9px] h-5 w-full flex items-center justify-center rounded-sm transition-colors
                              ${!inM ? "opacity-0 pointer-events-none" : ""}
                              ${isToday ? "bg-primary text-primary-foreground font-bold" : hasItems ? "bg-primary/20 text-foreground font-semibold" : "hover:bg-secondary text-muted-foreground"}`}>
                            {inM ? format(day, "d") : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Day Detail */}
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="font-heading text-sm text-foreground tracking-wide mb-3">
              {format(selectedDay, "EEEE, dd. MMMM", { locale: de }).toUpperCase()}
            </p>

            {/* Approved Leaves */}
            {selectedDayLeaves.filter(l => l.status === "genehmigt").map(l => (
              <div key={l.id} className="flex items-center gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                <span className="text-xs text-destructive">{l.employee} · Urlaub</span>
              </div>
            ))}
            
            {/* Pending Leaves */}
            {selectedDayLeaves.filter(l => l.status === "eingereicht").map(l => (
              <div key={l.id} className="flex items-center justify-between p-2.5 bg-warning/10 border border-warning/20 rounded-lg mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                  <div>
                    <span className="text-xs text-warning font-medium">{l.employee} · Urlaub angefragt</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{l.start_date && format(new Date(l.start_date), "dd.MM.")} – {l.end_date && format(new Date(l.end_date), "dd.MM.yyyy", { locale: de })}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => reviewLeaveMutation.mutate({ id: l.id, data: { status: "abgelehnt", reviewed_by: myName } })}
                      className="w-6 h-6 rounded-full bg-destructive/20 hover:bg-destructive/30 flex items-center justify-center transition-colors">
                      <XCircle className="w-3 h-3 text-destructive" />
                    </button>
                    <button onClick={() => reviewLeaveMutation.mutate({ id: l.id, data: { status: "genehmigt", reviewed_by: myName } })}
                      className="w-6 h-6 rounded-full bg-success/20 hover:bg-success/30 flex items-center justify-center transition-colors">
                      <CheckCircle className="w-3 h-3 text-success" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* Rejected Leaves */}
            {selectedDayLeaves.filter(l => l.status === "abgelehnt").map(l => (
              <div key={l.id} className="flex items-center gap-2 p-2.5 bg-muted/20 border border-border rounded-lg mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                <span className="text-xs text-muted-foreground line-through">{l.employee} · Urlaub (abgelehnt)</span>
              </div>
            ))}

            {/* Tasks */}
            {selectedDayTasks.length > 0 && (
              <div className="space-y-2 mb-3">
                <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Aufträge/Aufgaben</p>
                {selectedDayTasks.map(t => (
                  <div key={t.id} className="p-3 rounded-lg border bg-chart-3/10 border-chart-3/30">
                    <p className="text-xs font-semibold text-foreground">{t.title}</p>
                    {t.vehicle_info && <p className="text-[10px] opacity-70 mt-0.5">🚗 {t.vehicle_info}</p>}
                    {t.assigned_to && <p className="text-[10px] opacity-70">👤 {t.assigned_to}</p>}
                    <div className="flex gap-2 mt-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        t.priority === "kritisch" ? "bg-destructive/20 text-destructive" :
                        t.priority === "hoch" ? "bg-warning/20 text-warning" :
                        "bg-secondary text-muted-foreground"
                      }`}>{t.priority}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{t.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Appointments */}
            {selectedDayAppointments.length === 0 && selectedDayLeaves.length === 0 && selectedDayTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Keine Termine</p>
            ) : (
              <div className="space-y-2">
                {selectedDayAppointments.map(a => {
                  const cfg = APPOINTMENT_TYPES[a.type] || APPOINTMENT_TYPES.sonstiges;
                  return (
                    <div key={a.id} className={`p-3 rounded-lg border ${cfg.color}`}>
                      <p className="text-xs font-semibold">{a.title}</p>
                      {a.start_time && <p className="text-[10px] mt-0.5 opacity-80">{a.start_time}{a.end_time ? ` – ${a.end_time}` : ""}</p>}
                      {a.customer_name && <p className="text-[10px] opacity-70">{a.customer_name}</p>}
                      {a.employee && <p className="text-[10px] opacity-70">{a.employee}</p>}
                      {a.vehicle_info && <p className="text-[10px] opacity-70">🚗 {a.vehicle_info}</p>}
                      <div className="flex gap-2 mt-2">
                        {a.status !== "abgeschlossen" && (
                          <button
                            onClick={() => updateMutation.mutate({ id: a.id, data: { status: "abgeschlossen" } })}
                            className="text-[10px] underline opacity-60 hover:opacity-100"
                          >
                            Abschließen
                          </button>
                        )}
                        {a.status === "abgeschlossen" && (
                          <span className="text-[10px] opacity-60">✓ Abgeschlossen</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Button onClick={() => setShowAdd(true)} variant="outline" className="w-full mt-3 border-border text-xs h-8">
              <Plus className="w-3 h-3 mr-1" /> Termin hinzufügen
            </Button>
          </div>

          {/* Type Legend */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">LEGENDE</p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(APPOINTMENT_TYPES).slice(0, 8).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[k]}`} />
                  {v.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>}

      {tab === "termine" && <AddAppointmentDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        defaultDate={format(selectedDay, "yyyy-MM-dd")}
        onSubmit={createMutation.mutate}
        isLoading={createMutation.isPending}
      />}
    </div>
  );
}

function AddAppointmentDialog({ open, onClose, defaultDate, onSubmit, isLoading }) {
  const [form, setForm] = useState({ title: "", type: "annahme", date: defaultDate, start_time: "", end_time: "", customer_name: "", employee: "", vehicle_info: "", notes: "" });
  const u = (f, v) => setForm(p => ({ ...p, [f]: v }));

  React.useEffect(() => {
    if (open) setForm(p => ({ ...p, date: defaultDate }));
  }, [open, defaultDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ title: "", type: "annahme", date: defaultDate, start_time: "", end_time: "", customer_name: "", employee: "", vehicle_info: "", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-wide">NEUER TERMIN</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label className="text-xs text-muted-foreground">Titel *</Label>
            <Input value={form.title} onChange={e => u("title", e.target.value)} required className="bg-secondary border-border mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Typ</Label>
              <Select value={form.type} onValueChange={v => u("type", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {Object.entries(APPOINTMENT_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Datum</Label>
              <Input type="date" value={form.date} onChange={e => u("date", e.target.value)} required className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Von</Label>
              <Input type="time" value={form.start_time} onChange={e => u("start_time", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Bis</Label>
              <Input type="time" value={form.end_time} onChange={e => u("end_time", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Kunde</Label>
              <Input value={form.customer_name} onChange={e => u("customer_name", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Mitarbeiter</Label>
              <Select value={form.employee} onValueChange={v => u("employee", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue placeholder="Auswählen" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {TEAM.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Fahrzeug</Label>
            <Input value={form.vehicle_info} onChange={e => u("vehicle_info", e.target.value)} placeholder="z.B. BMW M3 – SON-TM 420" className="bg-secondary border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Notizen</Label>
            <Textarea value={form.notes} onChange={e => u("notes", e.target.value)} className="bg-secondary border-border mt-1 h-16" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border">Abbrechen</Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/80">{isLoading ? "..." : "Speichern"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}