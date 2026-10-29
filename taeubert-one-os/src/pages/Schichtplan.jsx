import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Users, Copy, CalendarDays, CheckCircle, XCircle, Clock, LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/AuthContext";
import { format, startOfWeek, addWeeks, subWeeks, addDays, differenceInBusinessDays } from "date-fns";
import { de } from "date-fns/locale";
import Jahresuebersicht from "@/components/schichtplan/Jahresuebersicht";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];
const ADMINS = ["Toni"];

const DAYS = [
  { key: "monday", label: "Mo" },
  { key: "tuesday", label: "Di" },
  { key: "wednesday", label: "Mi" },
  { key: "thursday", label: "Do" },
  { key: "friday", label: "Fr" },
  { key: "saturday", label: "Sa" },
];

const SHIFTS = [
  { key: "frueh", label: "Früh", short: "F", color: "bg-primary text-primary-foreground" },
  { key: "spaet", label: "Spät", short: "S", color: "bg-chart-2/80 text-white" },
  { key: "frei", label: "Frei", short: "—", color: "bg-secondary text-muted-foreground" },
  { key: "urlaub", label: "Urlaub", short: "U", color: "bg-destructive/70 text-white" },
  { key: "krank", label: "Krank", short: "K", color: "bg-warning/80 text-black" },
];

const SHIFT_MAP = Object.fromEntries(SHIFTS.map(s => [s.key, s]));

function getWeekStart(date) {
  return startOfWeek(date, { weekStartsOn: 1 });
}

function weekLabel(weekStart) {
  const end = addDays(weekStart, 5);
  return `${format(weekStart, "dd. MMM", { locale: de })} – ${format(end, "dd. MMM yyyy", { locale: de })}`;
}

function weekKey(weekStart) {
  return format(weekStart, "yyyy-MM-dd");
}

export default function Schichtplan() {
  const [view, setView] = useState("woche");
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));
  const [year, setYear] = useState(new Date().getFullYear());
  const [saving, setSaving] = useState({});
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ start_date: "", end_date: "", reason: "" });
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const resolveEmployee = () => {
    if (!user?.full_name) return TEAM[0];
    const match = TEAM.find(t => user.full_name.toLowerCase().includes(t.toLowerCase()));
    return match || TEAM[0];
  };
  
  const myName = resolveEmployee();
  const isAdmin = ADMINS.includes(myName);

  const weekStr = weekKey(currentWeek);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["schichtplan", weekStr],
    queryFn: () => base44.entities.Schichtplan.filter({ week_start: weekStr }),
  });

  // 4-week overview
  const weeks = useMemo(() => Array.from({ length: 4 }, (_, i) => addWeeks(currentWeek, i)), [currentWeek]);
  const weekStrs = weeks.map(weekKey);

  const { data: overviewEntries = [] } = useQuery({
    queryKey: ["schichtplan-overview", weekStrs[0]],
    queryFn: async () => {
      const all = await Promise.all(weekStrs.map(w => base44.entities.Schichtplan.filter({ week_start: w })));
      return all.flat();
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async ({ employee, day, value }) => {
      const existing = entries.find(e => e.employee === employee);
      if (existing) {
        return base44.entities.Schichtplan.update(existing.id, { [day]: value });
      } else {
        const newEntry = { week_start: weekStr, employee };
        DAYS.forEach(d => { newEntry[d.key] = d.key === "saturday" ? "frei" : "frueh"; });
        newEntry[day] = value;
        return base44.entities.Schichtplan.create(newEntry);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schichtplan", weekStr] });
      queryClient.invalidateQueries({ queryKey: ["schichtplan-overview", weekStrs[0]] });
    },
  });

  const handleCellClick = async (employee, day) => {
    const existing = entries.find(e => e.employee === employee);
    const current = existing?.[day] || "frueh";
    const idx = SHIFTS.findIndex(s => s.key === current);
    const next = SHIFTS[(idx + 1) % SHIFTS.length].key;

    const key = `${employee}-${day}`;
    setSaving(p => ({ ...p, [key]: true }));
    await upsertMutation.mutateAsync({ employee, day, value: next });
    setSaving(p => ({ ...p, [key]: false }));
  };

  const copyWeek = async () => {
    const prevWeek = subWeeks(currentWeek, 1);
    const prevStr = weekKey(prevWeek);
    const prevEntries = await base44.entities.Schichtplan.filter({ week_start: prevStr });
    for (const entry of prevEntries) {
      const { id, created_date, updated_date, created_by, week_start, ...rest } = entry;
      const exists = entries.find(e => e.employee === entry.employee);
      if (exists) {
        await base44.entities.Schichtplan.update(exists.id, rest);
      } else {
        await base44.entities.Schichtplan.create({ ...rest, week_start: weekStr });
      }
    }
    queryClient.invalidateQueries({ queryKey: ["schichtplan", weekStr] });
  };

  // Compute capacity per day for current week
  const capacityByDay = useMemo(() => {
    return DAYS.map(day => {
      const available = TEAM.filter(emp => {
        const entry = entries.find(e => e.employee === emp);
        const shift = entry?.[day.key] || (day.key === "saturday" ? "frei" : "frueh");
        return shift === "frueh" || shift === "spaet";
      }).length;
      return { ...day, available, total: TEAM.length };
    });
  }, [entries]);

  // Year-wide data for Jahresübersicht
  const { data: allSchichtEntries = [] } = useQuery({
    queryKey: ["schichtplan-year", year],
    queryFn: () => base44.entities.Schichtplan.list("-created_date", 500),
    enabled: view === "jahr",
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ["tasks-year"],
    queryFn: () => base44.entities.Task.list("-created_date", 500),
    enabled: view === "jahr",
  });

  // Leave Requests
  const { data: leaveRequests = [] } = useQuery({
    queryKey: ["leaveRequests"],
    queryFn: () => base44.entities.LeaveRequest.list("-created_date", 100),
  });

  const createLeaveMutation = useMutation({
    mutationFn: (data) => base44.entities.LeaveRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      setShowLeaveDialog(false);
      setLeaveForm({ start_date: "", end_date: "", reason: "" });
    },
  });

  const reviewLeaveMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LeaveRequest.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leaveRequests"] }),
  });

  const pendingLeaves = leaveRequests.filter(r => r.status === "eingereicht");

  const getLeaveForEmployeeDay = (emp, dayDate) => {
    const dateStr = format(dayDate, "yyyy-MM-dd");
    return leaveRequests.find(l =>
      l.employee === emp && l.start_date <= dateStr && l.end_date >= dateStr
    );
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    const days = differenceInBusinessDays(new Date(leaveForm.end_date), new Date(leaveForm.start_date)) + 1;
    createLeaveMutation.mutate({
      employee: myName,
      start_date: leaveForm.start_date,
      end_date: leaveForm.end_date,
      days: Math.max(1, days),
      reason: leaveForm.reason,
      status: "eingereicht",
    });
  };

  const overviewCapacity = useMemo(() => {
    return weeks.map((week, i) => {
      const wStr = weekStrs[i];
      const wEntries = overviewEntries.filter(e => e.week_start === wStr);
      const available = TEAM.filter(emp => {
        const entry = wEntries.find(e => e.employee === emp);
        if (!entry) return true;
        const days = ["monday","tuesday","wednesday","thursday","friday"];
        return days.some(d => entry[d] === "frueh" || entry[d] === "spaet");
      }).length;
      return { week, available };
    });
  }, [overviewEntries, weeks, weekStrs]);

  const handleSelectMonth = (monthDate) => {
    setCurrentWeek(startOfWeek(monthDate, { weekStartsOn: 1 }));
    setView("woche");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">SCHICHTPLAN</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {view === "woche" ? "Wochenplanung · Klick auf Zelle zum Ändern" : "Jahresübersicht · Auslastung & Planung"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-secondary rounded-lg p-0.5 mr-1">
            <button onClick={() => setView("woche")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${view === "woche" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutList className="w-3.5 h-3.5" /> Woche
            </button>
            <button onClick={() => setView("jahr")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${view === "jahr" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="w-3.5 h-3.5" /> Jahr
            </button>
          </div>
          {view === "woche" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowLeaveDialog(true)} className="gap-1.5 text-xs border-border">
                <CalendarDays className="w-3.5 h-3.5" /> Urlaub beantragen
              </Button>
              <Button variant="outline" size="sm" onClick={copyWeek} className="gap-1.5 text-xs border-border">
                <Copy className="w-3.5 h-3.5" /> Vorwoche kopieren
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* JAHRESÜBERSICHT */}
      {view === "jahr" && (
        <Jahresuebersicht
          year={year}
          schichtEntries={allSchichtEntries}
          leaveRequests={leaveRequests}
          tasks={allTasks}
          onSelectMonth={handleSelectMonth}
        />
      )}

      {/* WOCHENANSICHT */}
      {view === "woche" && (
        <>
          {/* Pending Leave Requests */}
          {isAdmin && pendingLeaves.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-warning/5 border border-warning/20 rounded-xl p-4 mb-5">
              <p className="text-[10px] font-semibold tracking-wider text-warning uppercase mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> {pendingLeaves.length} ausstehende Urlaubsanträge
              </p>
              <div className="space-y-2">
                {pendingLeaves.map(req => (
                  <div key={req.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{req.employee}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.start_date && format(new Date(req.start_date), "dd. MMM", { locale: de })} – {req.end_date && format(new Date(req.end_date), "dd. MMM yyyy", { locale: de })} · {req.days} Tage
                      </p>
                      {req.reason && <p className="text-xs text-muted-foreground/70 mt-0.5">{req.reason}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => reviewLeaveMutation.mutate({ id: req.id, data: { status: "abgelehnt", reviewed_by: myName } })}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors font-medium"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Ablehnen
                      </button>
                      <button
                        onClick={() => reviewLeaveMutation.mutate({ id: req.id, data: { status: "genehmigt", reviewed_by: myName } })}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-success hover:bg-success/10 transition-colors font-medium"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Genehmigen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Week Nav */}
          <div className="flex items-center justify-between mb-5 bg-card border border-border rounded-xl px-4 py-3">
            <button onClick={() => setCurrentWeek(w => subWeeks(w, 1))} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="text-center">
              <p className="font-heading text-sm tracking-widest text-foreground">{weekLabel(currentWeek).toUpperCase()}</p>
              {weekKey(currentWeek) === weekKey(getWeekStart(new Date())) && (
                <span className="text-[10px] text-primary font-semibold">AKTUELLE WOCHE</span>
              )}
            </div>
            <button onClick={() => setCurrentWeek(w => addWeeks(w, 1))} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Shift Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
            <div className="grid border-b border-border" style={{ gridTemplateColumns: "140px repeat(6, 1fr)" }}>
              <div className="p-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Mitarbeiter</span>
              </div>
              {DAYS.map((day, i) => {
                const dayDate = addDays(currentWeek, i);
                const isToday = format(dayDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                return (
                  <div key={day.key} className={`p-3 text-center border-l border-border ${isToday ? "bg-primary/5" : ""}`}>
                    <p className={`text-[10px] font-semibold tracking-wider uppercase ${isToday ? "text-primary" : "text-muted-foreground"}`}>{day.label}</p>
                    <p className={`text-xs font-bold mt-0.5 ${isToday ? "text-primary" : "text-foreground"}`}>{format(dayDate, "dd", { locale: de })}</p>
                  </div>
                );
              })}
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              TEAM.map((emp, idx) => {
                const entry = entries.find(e => e.employee === emp);
                return (
                  <div key={emp} className={`grid border-b border-border last:border-b-0 ${idx % 2 === 0 ? "" : "bg-secondary/20"}`}
                    style={{ gridTemplateColumns: "140px repeat(6, 1fr)" }}>
                    <div className="p-3 flex items-center">
                      <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold text-foreground mr-2">
                        {emp[0]}
                      </div>
                      <span className="text-sm font-medium text-foreground">{emp}</span>
                    </div>
                    {DAYS.map((day, di) => {
                      const shiftKey = entry?.[day.key] || (day.key === "saturday" ? "frei" : "frueh");
                      const shift = SHIFT_MAP[shiftKey];
                      const cellKey = `${emp}-${day.key}`;
                      const isSaving = saving[cellKey];
                      const dayDate = addDays(currentWeek, di);
                      const isToday = format(dayDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                      const leaveReq = getLeaveForEmployeeDay(emp, dayDate);
                      const isLeavePending = leaveReq && leaveReq.status === "eingereicht";
                      const isLeaveApproved = leaveReq && leaveReq.status === "genehmigt";
                      
                      return (
                        <div key={day.key} className={`border-l border-border flex items-center justify-center p-2 ${isToday ? "bg-primary/5" : ""}`}>
                          {isLeavePending ? (
                            <div className="relative w-full">
                              <button
                                onClick={() => handleCellClick(emp, day.key)}
                                className="w-full h-8 rounded-md text-[11px] font-bold tracking-wide transition-all hover:opacity-80 active:scale-95 bg-warning/20 border border-warning/30 text-warning"
                              >
                                ?
                              </button>
                              {isAdmin && (
                                <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-0.5">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); reviewLeaveMutation.mutate({ id: leaveReq.id, data: { status: "genehmigt", reviewed_by: myName } }); }}
                                    className="w-3.5 h-3.5 rounded-full bg-success flex items-center justify-center hover:scale-110 transition-transform"
                                  >
                                    <CheckCircle className="w-2 h-2 text-white" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); reviewLeaveMutation.mutate({ id: leaveReq.id, data: { status: "abgelehnt", reviewed_by: myName } }); }}
                                    className="w-3.5 h-3.5 rounded-full bg-destructive flex items-center justify-center hover:scale-110 transition-transform"
                                  >
                                    <XCircle className="w-2 h-2 text-white" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : isLeaveApproved ? (
                            <div className="w-full h-8 rounded-md text-[11px] font-bold tracking-wide bg-destructive/30 text-destructive border border-destructive/20 flex items-center justify-center cursor-default">
                              U
                            </div>
                          ) : leaveReq ? (
                            <div className="w-full h-8 rounded-md text-[11px] font-bold tracking-wide bg-muted/30 text-muted-foreground flex items-center justify-center cursor-default">
                              —
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCellClick(emp, day.key)}
                              disabled={isSaving}
                              className={`w-full h-8 rounded-md text-[11px] font-bold tracking-wide transition-all hover:opacity-80 active:scale-95 ${shift.color} ${isSaving ? "opacity-50" : ""}`}
                            >
                              {isSaving ? "..." : shift.short}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Day Capacity Bar */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">TAGESKAPAZITÄT DIESE WOCHE</p>
            <div className="grid grid-cols-6 gap-2">
              {capacityByDay.map(day => {
                const pct = Math.round((day.available / day.total) * 100);
                const color = pct >= 70 ? "bg-success" : pct >= 40 ? "bg-warning" : "bg-destructive";
                return (
                  <div key={day.key} className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">{day.label}</p>
                    <div className="h-16 bg-secondary rounded-lg overflow-hidden flex flex-col-reverse">
                      <div className={`${color} transition-all duration-500 rounded-lg`} style={{ height: `${pct}%` }} />
                    </div>
                    <p className="text-xs font-bold text-foreground mt-1">{day.available}/{day.total}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4-Week Capacity Overview */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">4-WOCHEN KAPAZITÄTSÜBERSICHT</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {overviewCapacity.map(({ week, available }, i) => {
                const wStr = weekKey(week);
                const isCurrent = wStr === weekKey(getWeekStart(new Date()));
                const pct = Math.round((available / TEAM.length) * 100);
                return (
                  <button key={wStr} onClick={() => setCurrentWeek(week)}
                    className={`p-4 rounded-xl border text-left transition-all hover:border-primary/40 ${isCurrent ? "border-primary bg-primary/5" : "border-border"}`}>
                    <p className={`text-[9px] font-semibold tracking-wider uppercase mb-1 ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                      {i === 0 ? "Diese Woche" : i === 1 ? "Nächste Woche" : `+${i} Wochen`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{format(week, "dd. MMM", { locale: de })}</p>
                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pct >= 70 ? "bg-success" : pct >= 40 ? "bg-warning" : "bg-destructive"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-sm font-bold text-foreground mt-1">{available}/{TEAM.length} verfügbar</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {SHIFTS.map(s => (
              <div key={s.key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${s.color}`}>{s.short}</span>
                {s.label}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold bg-warning/20 text-warning border border-warning/30">?</span>
              Beantragt
            </div>
          </div>
        </>
      )}

      {/* Leave Request Dialog (available in both views) */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading tracking-wide">URLAUB BEANTRAGEN</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLeaveSubmit} className="space-y-4 mt-4">
            <div className="p-3 bg-secondary rounded-xl flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground font-medium">{myName}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">angemeldet</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Von *</Label>
                <Input type="date" value={leaveForm.start_date} onChange={e => setLeaveForm(f => ({ ...f, start_date: e.target.value }))} required className="bg-secondary border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bis *</Label>
                <Input type="date" value={leaveForm.end_date} onChange={e => setLeaveForm(f => ({ ...f, end_date: e.target.value }))} required className="bg-secondary border-border mt-1" />
              </div>
            </div>
            {leaveForm.start_date && leaveForm.end_date && (
              <p className="text-xs text-muted-foreground">
                = {differenceInBusinessDays(new Date(leaveForm.end_date), new Date(leaveForm.start_date)) + 1} Arbeitstage
              </p>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">Grund (optional)</Label>
              <Textarea value={leaveForm.reason} onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} className="bg-secondary border-border mt-1 h-20" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowLeaveDialog(false)} className="flex-1 border-border">Abbrechen</Button>
              <Button type="submit" disabled={createLeaveMutation.isPending} className="flex-1 bg-primary hover:bg-primary/80">
                {createLeaveMutation.isPending ? "..." : "Einreichen"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}