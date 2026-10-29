import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ListTodo, Clock, Car, ArrowRight, CheckCircle, Timer,
  Play, CalendarDays, Flame
} from "lucide-react";
import MotivationBanner from "@/components/dashboard/MotivationBanner";
import PerformanceArena from "@/components/dashboard/PerformanceArena";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function PersonalDashboard({ userName }) {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: tasks = [] } = useQuery({
    queryKey: ["personal-tasks", userName],
    queryFn: () => base44.entities.Task.filter({ assigned_to: userName }, "-created_date", 100),
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["personal-time", userName],
    queryFn: () => base44.entities.TimeEntry.filter({ employee: userName }, "-created_date", 100),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["personal-vehicles", userName],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 100),
  });

  const { data: leaveReqs = [] } = useQuery({
    queryKey: ["personal-leave", userName],
    queryFn: () => base44.entities.LeaveRequest.filter({ employee: userName }, "-created_date", 20),
  });

  const myOpenTasks = tasks.filter(t => t.status !== "erledigt");
  const myActiveTasks = tasks.filter(t => t.status === "in_arbeit");
  const myCriticalTasks = tasks.filter(t => t.priority === "kritisch" && t.status !== "erledigt");

  const activeTimer = timeEntries.find(e => e.status === "aktiv");
  const todaysEntries = timeEntries.filter(e => {
    const eDate = e.start_time ? new Date(e.start_time).toISOString().split("T")[0] : null;
    return eDate === today && e.status === "beendet";
  });
  const minutesToday = todaysEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
  const hoursToday = (minutesToday / 60).toFixed(1);

  const myVehicles = vehicles.filter(v => v.responsible?.includes(userName) && v.status !== "uebergabe");

  const pendingLeave = leaveReqs.filter(l => l.status === "eingereicht");

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return "Guten Morgen";
    if (h < 17) return "Hallo";
    return "Guten Abend";
  })();

  const hourOfDay = new Date().getHours();
  const primaryTask = myActiveTasks[0] || myCriticalTasks[0] || myOpenTasks[0];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">
          {greeting}, {userName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })}
        </p>
      </motion.div>

      {/* Primary task spotlight */}
      {primaryTask && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-primary/20 rounded-xl p-4 mb-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-3.5 h-3.5 text-primary" />
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Dein Fokus</p>
          </div>
          <Link to="/mein-tag" className="flex items-center justify-between gap-3 group">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {primaryTask.title}
              </p>
              {primaryTask.vehicle_info && (
                <p className="text-[11px] text-muted-foreground truncate">{primaryTask.vehicle_info}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                primaryTask.status === "in_arbeit"
                  ? "bg-success/10 text-success"
                  : primaryTask.priority === "kritisch"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-secondary text-muted-foreground"
              }`}>
                {primaryTask.status === "in_arbeit" ? "In Arbeit" : primaryTask.priority === "kritisch" ? "Kritisch" : "Offen"}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </motion.div>
      )}

      {/* Gamified Performance Arena */}
      <div className="mb-6">
        <PerformanceArena userName={userName} tasks={tasks} timeEntries={timeEntries} />
      </div>

      {/* Active timer banner */}
      {activeTimer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-success/5 border border-success/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-3"
        >
          <div className="relative">
            <Timer className="w-4 h-4 text-success" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-success">Timer läuft</p>
            <p className="text-[11px] text-muted-foreground">
              {activeTimer.vehicle_info || activeTimer.activity || "Aktive Sitzung"}
            </p>
          </div>
          <Link to="/timetracking">
            <span className="text-xs text-success hover:underline">Ansehen →</span>
          </Link>
        </motion.div>
      )}

      {/* My tasks list */}
      {myOpenTasks.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-heading text-sm text-foreground">MEINE AUFGABEN</p>
            <Link to="/tasks" className="text-[10px] text-muted-foreground hover:text-primary">
              Alle ({myOpenTasks.length})
            </Link>
          </div>
          <div className="space-y-2">
            {myOpenTasks.slice(0, 5).map(t => (
              <Link key={t.id} to="/mein-tag" className="flex items-center gap-3 py-1.5 hover:bg-secondary/40 -mx-2 px-2 rounded-lg transition-colors group">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  t.priority === "kritisch" ? "bg-destructive" :
                  t.priority === "hoch" ? "bg-warning" :
                  t.status === "in_arbeit" ? "bg-success" :
                  "bg-muted-foreground"
                }`} />
                <span className="text-sm text-foreground flex-1 truncate group-hover:text-primary transition-colors">{t.title}</span>
                {t.vehicle_info && <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{t.vehicle_info}</span>}
                {t.estimated_hours > 0 && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />{t.estimated_hours}h
                  </span>
                )}
              </Link>
            ))}
            {myOpenTasks.length > 5 && (
              <Link to="/tasks" className="block text-center text-[10px] text-muted-foreground hover:text-primary pt-1">
                +{myOpenTasks.length - 5} weitere
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pending leave */}
      {pendingLeave.length > 0 && (
        <div className="bg-warning/5 border border-warning/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <CalendarDays className="w-4 h-4 text-warning flex-shrink-0" />
          <p className="text-xs text-warning flex-1">{pendingLeave.length} Urlaubsantrag{pendingLeave.length !== 1 ? "e" : ""} wartet auf Genehmigung</p>
          <Link to="/leave" className="text-[10px] text-warning hover:underline">Ansehen →</Link>
        </div>
      )}

      {/* Motivation */}
      <div className="mb-5">
        <MotivationBanner />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { path: "/mein-tag", label: "Mein Tag", icon: Play },
          { path: "/tasks", label: "Aufgaben", icon: ListTodo },
          { path: "/timetracking", label: "Zeit", icon: Timer },
          { path: "/vehicles", label: "Fahrzeuge", icon: Car },
          { path: "/performance-hub", label: "Hub", icon: CheckCircle },
          { path: "/tagesstart", label: "Tagesstart", icon: CalendarDays },
        ].map(q => (
          <Link key={q.path} to={q.path}
            className="flex flex-col items-center gap-2 p-3 bg-card border border-border hover:border-primary/30 rounded-xl transition-all group">
            <q.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">{q.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}