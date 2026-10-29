import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  Users, AlertTriangle, Car, Clock, ArrowRight, CalendarOff
} from "lucide-react";
import { format } from "date-fns";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

export default function TagesBriefing() {
  const today = format(new Date(), "yyyy-MM-dd");
  const todayStr = new Date().toDateString();

  const { data: vehicles = [] } = useQuery({
    queryKey: ["briefing-vehicles"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 200),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["briefing-tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 200),
  });
  const { data: leaveReqs = [] } = useQuery({
    queryKey: ["briefing-leave"],
    queryFn: () => base44.entities.LeaveRequest.list("-created_date", 100),
  });
  const { data: appointments = [] } = useQuery({
    queryKey: ["briefing-appointments"],
    queryFn: () => base44.entities.Appointment.list("-created_date", 100),
  });

  const absentToday = leaveReqs.filter(r =>
    r.status === "genehmigt" && r.start_date <= today && r.end_date >= today
  );

  const problemVehicles = vehicles.filter(v => v.condition === "problem");
  const activeVehicles = vehicles.filter(v => v.status !== "uebergabe");
  const unassignedTasks = tasks.filter(t => !t.assigned_to && t.status === "offen");
  const criticalTasks = tasks.filter(t => t.priority === "kritisch" && t.status !== "erledigt");

  const todaysAppointments = appointments.filter(a =>
    a.date === today && a.status !== "abgesagt"
  );

  const vehiclesForHandover = vehicles.filter(v => v.status === "uebergabe");

  const summary = [
    {
      label: "Abwesend",
      value: absentToday.length,
      sub: absentToday.length > 0 ? absentToday.map(l => l.employee).join(", ") : "Alle da",
      icon: CalendarOff,
      color: absentToday.length > 0 ? "text-destructive" : "text-success",
      bg: absentToday.length > 0 ? "bg-destructive/5 border-destructive/20" : "bg-card border-border",
      detail: absentToday,
    },
    {
      label: "Probleme",
      value: problemVehicles.length,
      sub: problemVehicles.length > 0 ? "Fahrzeuge blockiert" : "Alles im Flow",
      icon: AlertTriangle,
      color: problemVehicles.length > 0 ? "text-destructive" : "text-success",
      bg: problemVehicles.length > 0 ? "bg-destructive/5 border-destructive/20" : "bg-card border-border",
      detail: problemVehicles,
    },
    {
      label: "Unzugewiesen",
      value: unassignedTasks.length,
      sub: unassignedTasks.length > 0 ? "Aufgaben offen" : "Alles verteilt",
      icon: Users,
      color: unassignedTasks.length > 5 ? "text-destructive" : unassignedTasks.length > 0 ? "text-warning" : "text-success",
      bg: unassignedTasks.length > 0 ? "bg-warning/5 border-warning/20" : "bg-card border-border",
    },
    {
      label: "Kritisch",
      value: criticalTasks.length,
      sub: criticalTasks.length > 0 ? "Priorität kritisch" : "Nichts dringend",
      icon: Clock,
      color: criticalTasks.length > 0 ? "text-destructive" : "text-success",
      bg: criticalTasks.length > 0 ? "bg-destructive/5 border-destructive/20" : "bg-card border-border",
    },
  ];

  const teamAvailable = TEAM.filter(e =>
    !absentToday.some(l => l.employee === e)
  ).length;

  return (
    <div className="space-y-3">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summary.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`border rounded-xl p-4 ${s.bg}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{s.label}</p>
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            </div>
            <p className={`font-heading text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Detail rows */}
      <div className="grid md:grid-cols-2 gap-3">
        {/* Absent detail */}
        {absentToday.length > 0 && (
          <div className="bg-card border border-destructive/20 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider mb-2">HEUTE ABWESEND</p>
            <div className="flex flex-wrap gap-1.5">
              {absentToday.map(l => (
                <span key={l.id} className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded-md">
                  {l.employee}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Team verfügbar: {teamAvailable}/{TEAM.length}
            </p>
          </div>
        )}

        {/* Problem vehicles */}
        {problemVehicles.length > 0 && (
          <div className="bg-card border border-destructive/20 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider mb-2">PROBLEMFAHRZEUGE</p>
            <div className="space-y-1.5">
              {problemVehicles.slice(0, 4).map(v => (
                <div key={v.id} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{v.make} {v.model}</span>
                  <span className="text-muted-foreground font-mono text-[10px]">{v.license_plate}</span>
                </div>
              ))}
            </div>
            <Link to="/vehicles" className="text-[10px] text-primary hover:underline mt-2 inline-flex items-center gap-1">
              Alle ansehen <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
        )}

        {/* Today's appointments */}
        {todaysAppointments.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">TERMINE HEUTE</p>
            <div className="space-y-1.5">
              {todaysAppointments.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-foreground">{a.title}</span>
                    {a.start_time && <span className="text-muted-foreground ml-1.5">{a.start_time}</span>}
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-secondary rounded-full text-muted-foreground">{a.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vehicles for handover */}
        {vehiclesForHandover.length > 0 && (
          <div className="bg-card border border-success/20 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-success uppercase tracking-wider mb-2">BEREIT FÜR ÜBERGABE</p>
            <div className="space-y-1.5">
              {vehiclesForHandover.slice(0, 4).map(v => (
                <div key={v.id} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{v.make} {v.model}</span>
                  <Link to="/handover" className="text-[10px] text-primary hover:underline">Übergabe →</Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick stats bar */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground bg-card border border-border rounded-xl px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5" />
          <span><strong className="text-foreground">{activeVehicles.length}</strong> aktiv</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span><strong className="text-foreground">{teamAvailable}</strong> verfügbar</span>
        </div>
        {unassignedTasks.length > 0 && (
          <>
            <div className="w-px h-4 bg-border" />
            <Link to="/auftragsverteilung" className="flex items-center gap-1.5 text-warning hover:underline">
              <ArrowRight className="w-3.5 h-3.5" />
              <span><strong>{unassignedTasks.length}</strong> zu verteilen</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}