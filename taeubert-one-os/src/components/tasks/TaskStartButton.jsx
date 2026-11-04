import React from "react";
import { Play, Square, Pause, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTaskTimer, resolveEmployeeFromUser } from "@/hooks/useTaskTimer";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

/**
 * Reusable Start/Stop button that links a task to time tracking.
 * Pressing Start creates a TimeEntry for the task's vehicle and sets the task to "in_arbeit".
 */
export default function TaskStartButton({ task, size = "sm", variant = "default" }) {
  const { user } = useAuth();
  const { startTask, completeTask, pauseTask, isPending } = useTaskTimer();

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["timeEntries"],
    queryFn: () => base44.entities.TimeEntry.list("-created_date", 100),
    refetchInterval: 10000,
  });

  const employee = resolveEmployeeFromUser(user);

  const myActive = employee ? timeEntries.find(e => e.employee === employee && e.status === "aktiv") : null;
  const isThisTaskActive = myActive && task.vehicle_id === myActive.vehicle_id && task.category === myActive.activity && task.status === "in_arbeit";
  const isPaused = myActive && myActive.status === "pausiert" && task.vehicle_id === myActive.vehicle_id;

  if (!employee) return null;

  const handleStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    startTask(task, employee, myActive);
  };

  const handleStop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    completeTask(task, employee, myActive);
  };

  const handlePause = (e) => {
    e.preventDefault();
    e.stopPropagation();
    pauseTask(myActive);
  };

  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  const btnSize = size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs";

  if (task.status === "erledigt") {
    return (
      <span className={`inline-flex items-center gap-1 ${size === "sm" ? "text-[10px]" : "text-xs"} text-muted-foreground`}>
        <Square className={iconSize} /> Erledigt
      </span>
    );
  }

  if (isThisTaskActive) {
    return (
      <div className="flex items-center gap-1.5">
        <motion.button
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          onClick={handlePause}
          disabled={isPending}
          className={`inline-flex items-center gap-1 ${btnSize} rounded-lg bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30 transition-all font-medium`}
        >
          <Pause className={iconSize} /> Pause
        </motion.button>
        <button
          onClick={handleStop}
          disabled={isPending}
          className={`inline-flex items-center gap-1 ${btnSize} rounded-lg bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-all font-medium`}
        >
          {isPending ? <Loader2 className={`${iconSize} animate-spin`} /> : <Square className={iconSize} />} Stopp
        </button>
      </div>
    );
  }

  if (isPaused) {
    return (
      <button
        onClick={handleStart}
        disabled={isPending}
        className={`inline-flex items-center gap-1 ${btnSize} rounded-lg bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30 transition-all font-medium`}
      >
        {isPending ? <Loader2 className={`${iconSize} animate-spin`} /> : <Play className={iconSize} />} Weiter
      </button>
    );
  }

  return (
    <button
      onClick={handleStart}
      disabled={isPending}
      className={`inline-flex items-center gap-1 ${btnSize} rounded-lg transition-all font-medium
        ${variant === "default"
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-success/20 text-success border border-success/30 hover:bg-success/30"}
        ${isPending ? "opacity-60" : ""}
      `}
    >
      {isPending ? <Loader2 className={`${iconSize} animate-spin`} /> : <Play className={iconSize} />}
      Start
    </button>
  );
}