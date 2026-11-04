import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Wrench, Car } from "lucide-react";
import TaskStartButton from "@/components/tasks/TaskStartButton";

const CATEGORY_LABELS = {
  teile: "Teile",
  karosserie: "Karosserie",
  vorbereitung: "Vorbereitung",
  lackierung: "Lackierung",
  finish: "Finish",
  reinigung: "Reinigung",
  kunde: "Kunde",
  uebergabe: "Übergabe",
  lager: "Lager",
  sonstiges: "Sonstiges",
};

const PRIORITY_STYLES = {
  kritisch: "bg-destructive/20 text-destructive",
  hoch: "bg-warning/20 text-warning",
  mittel: "bg-muted text-muted-foreground",
  niedrig: "bg-muted text-muted-foreground",
};

export default function AssignedTasks({ employee }) {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["assignedTasks", employee],
    queryFn: () =>
      employee
        ? base44.entities.Task.filter({ assigned_to: employee, status: "offen" })
        : Promise.resolve([]),
    enabled: !!employee,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Also include tasks that are in_arbeit (started but not finished)
  const { data: inProgressTasks = [] } = useQuery({
    queryKey: ["inProgressTasks", employee],
    queryFn: () =>
      employee
        ? base44.entities.Task.filter({ assigned_to: employee, status: "in_arbeit" })
        : Promise.resolve([]),
    enabled: !!employee,
    staleTime: 0,
    refetchOnMount: true,
  });

  const allTasks = [...inProgressTasks, ...tasks];

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 text-center">
        <p className="text-xs text-muted-foreground">Lade Aufgaben...</p>
      </div>
    );
  }

  if (allTasks.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <Wrench className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Keine Aufgaben zugewiesen.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Car className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          Zugewiesene Fahrzeuge · {allTasks.length}
        </p>
      </div>
      <div className="divide-y divide-border/50">
        {allTasks.map((task, i) => (
          <motion.div
            key={task.id || i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-3 flex items-center justify-between gap-3 hover:bg-secondary/20 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                {task.priority && PRIORITY_STYLES[task.priority] && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${PRIORITY_STYLES[task.priority]}`}>
                    {task.priority}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {task.vehicle_info || "—"}
                {task.category ? ` · ${CATEGORY_LABELS[task.category] || task.category}` : ""}
              </p>
            </div>
            <TaskStartButton task={task} size="sm" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}