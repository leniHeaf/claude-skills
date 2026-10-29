import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ListTodo, Clock } from "lucide-react";
import TaskStartButton from "@/components/tasks/TaskStartButton";

const CATEGORY_LABELS = {
  teile: "Teile", karosserie: "Karosserie", vorbereitung: "Vorbereitung",
  lackierung: "Lackierung", finish: "Finish", reinigung: "Reinigung",
  kunde: "Kunde", uebergabe: "Übergabe", lager: "Lager", sonstiges: "Sonstiges"
};

const PRIORITY_COLORS = {
  kritisch: "bg-destructive/10 text-destructive",
  hoch: "bg-warning/10 text-warning",
  mittel: "bg-secondary text-muted-foreground",
  niedrig: "bg-secondary text-muted-foreground"
};

export default function VehicleTasks({ vehicleId, vehicleInfo }) {
  const { data: tasks = [] } = useQuery({
    queryKey: ["vehicle-tasks", vehicleId],
    queryFn: () => base44.entities.Task.filter({ vehicle_id: vehicleId }),
  });

  const openTasks = tasks.filter(t => t.status !== "erledigt");
  const doneTasks = tasks.filter(t => t.status === "erledigt");

  if (tasks.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">
          AUFGABEN
        </h3>
        <p className="text-sm text-muted-foreground">Keine Aufgaben für dieses Fahrzeug.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            AUFGABEN
          </h3>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {openTasks.length} offen · {doneTasks.length} erledigt
        </span>
      </div>

      <div className="space-y-2">
        {openTasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/50 hover:border-primary/20 transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{task.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.mittel}`}>
                  {task.priority}
                </span>
                {task.category && (
                  <span className="text-[9px] text-muted-foreground">{CATEGORY_LABELS[task.category] || task.category}</span>
                )}
                {task.estimated_hours > 0 && (
                  <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> {task.estimated_hours}h
                  </span>
                )}
                {task.assigned_to && (
                  <span className="text-[9px] text-muted-foreground">· {task.assigned_to}</span>
                )}
              </div>
            </div>
            <TaskStartButton task={task} size="sm" variant="success" />
          </motion.div>
        ))}

        {doneTasks.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground mb-2">Erledigt</p>
            {doneTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg opacity-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-through truncate">{task.title}</p>
                </div>
                <TaskStartButton task={task} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}