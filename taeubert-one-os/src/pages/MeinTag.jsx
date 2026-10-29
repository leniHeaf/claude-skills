import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { differenceInMinutes } from "date-fns";
import { useAuth } from "@/lib/AuthContext";
import MissionComplete from "../components/meinTag/MissionComplete";
import MissionCard from "../components/meinTag/MissionCard";
import DayGreeting from "../components/meinTag/DayGreeting";
import TaskDetailModal from "../components/tasks/TaskDetailModal";

const TEAM = ["Toni", "Pascal", "Fanny", "Maik", "Marco", "Adrian", "Lena"];
const ADMINS = ["Toni", "Lena"];
const PRIORITY_ORDER = { kritisch: 0, hoch: 1, mittel: 2, niedrig: 3 };

const STAGE_HINTS = {
  lackierung: "Schwarze Lacke → doppelte Lichtkontrolle vor dem Auftrag",
  finish: "Premium-Finish: Arbeite bei Tageslicht oder Spotlicht",
  endkontrolle: "Jedes Detail zählt — letzte Chance vor der Übergabe",
  uebergabe: "Kunde erwartet Premiumstandard — Fahrzeug auf Hochglanz",
  vorbereitung: "Sauberkeit ist die Basis für perfekte Lackierung",
  karosserie: "Richtmaße prüfen bevor weitergegangen wird",
};

const PREMIUM_BRANDS = ["porsche", "bentley", "ferrari", "lamborghini", "mclaren", "aston martin", "rolls-royce"];

function isPremiumVehicle(v) {
  if (!v) return false;
  const make = v.make?.toLowerCase() || "";
  return PREMIUM_BRANDS.includes(make) ||
    (make === "bmw" && v.model?.toUpperCase().includes("M")) ||
    (make === "mercedes" && (v.model?.toLowerCase().includes("amg") || v.model?.toLowerCase().includes("s-klass")));
}

export default function MeinTag() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Ermittle den Mitarbeiter aus dem eingeloggten Benutzer
  const resolveEmployee = () => {
    if (!user?.full_name) return TEAM[0];
    const match = TEAM.find(t => user.full_name.toLowerCase().includes(t.toLowerCase()));
    return match || TEAM[0];
  };
  
  const [employee, setEmployee] = useState(resolveEmployee);
  const isAdmin = ADMINS.includes(employee);
  const [showComplete, setShowComplete] = useState(false);
  const [completedTask, setCompletedTask] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedEntryId, setPausedEntryId] = useState(null);
  const [detailTask, setDetailTask] = useState(null);

  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => base44.entities.Task.list("-created_date", 200) });
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: () => base44.entities.Vehicle.list() });
  const { data: timeEntries = [] } = useQuery({ queryKey: ["time-entries-mein"], queryFn: () => base44.entities.TimeEntry.list("-created_date", 100) });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const createTimeEntry = useMutation({
    mutationFn: (data) => base44.entities.TimeEntry.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["time-entries-mein"] }),
  });
  const updateTimeEntry = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TimeEntry.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["time-entries-mein"] }),
  });

  const myTasks = tasks
    .filter(t => t.assigned_to === employee && t.status !== "erledigt")
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2));

  const doneTasks = tasks.filter(t => t.assigned_to === employee && t.status === "erledigt");
  const currentTask = myTasks[0];
  const nextTask = myTasks[1];

  const currentVehicle = currentTask?.vehicle_id ? vehicles.find(v => v.id === currentTask.vehicle_id) : null;
  const isPremium = isPremiumVehicle(currentVehicle);
  const hint = STAGE_HINTS[currentVehicle?.status] || null;

  const activeEntry = timeEntries.find(t => t.employee === employee && t.status === "aktiv");
  const pauseEntry = timeEntries.find(t => t.employee === employee && t.status === "pausiert");
  const activeMinutes = activeEntry ? differenceInMinutes(new Date(), new Date(activeEntry.start_time)) : 0;

  const today = new Date().toISOString().split("T")[0];
  const completedToday = doneTasks.filter(t => t.updated_date?.startsWith(today)).length;

  const allMyTasks = tasks.filter(t => t.assigned_to === employee);
  const progressPct = allMyTasks.length > 0 ? Math.round((doneTasks.length / allMyTasks.length) * 100) : 0;

  const handleStart = async () => {
    if (!currentTask || activeEntry) return;
    await createTimeEntry.mutateAsync({
      vehicle_id: currentTask.vehicle_id || "",
      vehicle_info: currentTask.vehicle_info || "",
      employee,
      activity: currentTask.category || "sonstiges",
      start_time: new Date().toISOString(),
      status: "aktiv",
    });
    await updateTask.mutateAsync({ id: currentTask.id, data: { status: "in_arbeit" } });
  };

  const handleComplete = async (task) => {
    if (activeEntry) {
      await updateTimeEntry.mutateAsync({ id: activeEntry.id, data: { status: "beendet", end_time: new Date().toISOString() } });
    }
    await updateTask.mutateAsync({ id: task.id, data: { status: "erledigt" } });
    setIsPaused(false);
    setPausedEntryId(null);
    setCompletedTask(task);
    setShowComplete(true);
  };

  const handlePause = async () => {
    if (!activeEntry) return;
    const now = new Date().toISOString();
    await updateTimeEntry.mutateAsync({ id: activeEntry.id, data: { status: "pausiert", end_time: now } });
    setIsPaused(true);
  };

  const handleResume = async () => {
    if (!currentTask) return;
    await createTimeEntry.mutateAsync({
      vehicle_id: currentTask.vehicle_id || "",
      vehicle_info: currentTask.vehicle_info || "",
      employee,
      activity: currentTask.category || "sonstiges",
      start_time: new Date().toISOString(),
      status: "aktiv",
    });
    setIsPaused(false);
  };

  const handleSwitchTask = async (newTask) => {
    // End current time entry if active
    if (activeEntry) {
      await updateTimeEntry.mutateAsync({ id: activeEntry.id, data: { status: "beendet", end_time: new Date().toISOString() } });
    }
    // Keep current task in_arbeit or reset to offen
    if (currentTask && currentTask.status === "in_arbeit") {
      await updateTask.mutateAsync({ id: currentTask.id, data: { status: "offen" } });
    }
    // Start new task
    await createTimeEntry.mutateAsync({
      vehicle_id: newTask.vehicle_id || "",
      vehicle_info: newTask.vehicle_info || "",
      employee,
      activity: newTask.category || "sonstiges",
      start_time: new Date().toISOString(),
      status: "aktiv",
    });
    await updateTask.mutateAsync({ id: newTask.id, data: { status: "in_arbeit" } });
    setIsPaused(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mission Complete Overlay */}
      <AnimatePresence>
        {showComplete && completedTask && (
          <MissionComplete
            task={completedTask}
            vehicle={vehicles.find(v => v.id === completedTask.vehicle_id)}
            employee={employee}
            onClose={() => setShowComplete(false)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto px-4 pb-16">
        {/* Top: Greeting */}
        <DayGreeting
          employee={employee}
          onChangeEmployee={setEmployee}
          completedToday={completedToday}
          openCount={myTasks.length}
          activeMinutes={activeMinutes}
          hasActiveEntry={!!activeEntry}
          isAdmin={isAdmin}
        />

        {/* Progress Bar — thin, cinematic */}
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex justify-between text-[11px] mb-2 px-0.5">
            <span className="text-muted-foreground tracking-wider uppercase">Tagesfortschritt</span>
            <span className={`font-heading ${progressPct === 100 ? "text-success" : "text-foreground"}`}>{progressPct}%</span>
          </div>
          <div className="h-[3px] bg-secondary rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full ${progressPct === 100 ? "bg-success" : "bg-primary"}`}
            />
          </div>
        </motion.div>

        {/* MISSION CARD — current task */}
        <AnimatePresence mode="wait">
          {currentTask ? (
            <MissionCard
              key={currentTask.id}
              task={currentTask}
              vehicle={currentVehicle}
              isPremium={isPremium}
              hint={hint}
              activeEntry={activeEntry}
              activeMinutes={activeMinutes}
              onStart={handleStart}
              onComplete={() => handleComplete(currentTask)}
              onPause={handlePause}
              isPaused={isPaused}
              onResume={handleResume}
              onOpenDetails={() => setDetailTask(currentTask)}
            />
          ) : (
            <motion.div
              key="all-done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative overflow-hidden rounded-3xl border border-success/20 bg-gradient-to-br from-success/10 via-card to-card p-10 text-center mb-6"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="text-5xl mb-4"
              >🏆</motion.div>
              <p className="font-heading text-2xl text-success tracking-wide mb-2">TAG ABGESCHLOSSEN</p>
              <p className="text-sm text-muted-foreground">{completedToday} Missionen erledigt. Starke Leistung, {employee}.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All remaining tasks — each startable */}
        {myTasks.length > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-3">Weitere Aufgaben</p>
            <div className="space-y-2">
              {myTasks.slice(1).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30"
                >
                  <button
                    onClick={() => handleComplete(t)}
                    className="w-4 h-4 rounded-full border border-border/50 hover:border-success hover:bg-success/20 flex-shrink-0 transition-all"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/80 truncate">{t.title}</p>
                    {t.vehicle_info && (
                      <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">{t.vehicle_info}</p>
                    )}
                  </div>
                  <span className={`text-[10px] flex-shrink-0 px-2 py-1 rounded-full
                    ${t.priority === "kritisch" || t.priority === "hoch"
                      ? "bg-warning/10 text-warning/70" : "text-muted-foreground/50"}`}>
                    {t.priority}
                  </span>
                  <button
                    onClick={() => handleSwitchTask(t)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] hover:bg-primary/90 transition-all font-medium flex-shrink-0"
                  >
                    <Play className="w-3 h-3" />
                    Starten
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      {/* Task Detail Modal */}
      <AnimatePresence>
        {detailTask && (
          <TaskDetailModal
            task={detailTask}
            onClose={() => setDetailTask(null)}
            onUpdate={(data) => {
              updateTask.mutate({ id: detailTask.id, data });
              setDetailTask(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}