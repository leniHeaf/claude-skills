import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Circle, Clock, User, Trash2 } from "lucide-react";
import { format } from "date-fns";
import TaskDetailModal from "./TaskDetailModal";

const priorityConfig = {
  niedrig: { color: "bg-muted text-muted-foreground" },
  mittel: { color: "bg-info/20 text-info" },
  hoch: { color: "bg-warning/20 text-warning" },
  kritisch: { color: "bg-destructive/20 text-destructive" },
};

const statusIcons = { offen: Circle, in_arbeit: Clock, erledigt: CheckCircle };

function extractPlannedHours(task) {
  const src = `${task.description || ""} ${task.comments || ""}`;
  const match = src.match(/Geplant[:\s]+([0-9.,]+)\s*h/i);
  if (match) return parseFloat(match[1].replace(",", "."));
  return null;
}

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [showDetail, setShowDetail] = useState(false);
  const StatusIcon = statusIcons[task.status] || Circle;
  const prioConfig = priorityConfig[task.priority] || priorityConfig.mittel;
  const plannedHours = extractPlannedHours(task);

  const cycleStatus = (e) => {
    e.stopPropagation();
    const next = { offen: "in_arbeit", in_arbeit: "erledigt", erledigt: "offen" };
    onUpdate({ status: next[task.status] || "offen" });
  };

  const deadlineLabel = task.deadline
    ? format(new Date(task.deadline), "dd.MM.")
    : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowDetail(true)}
        className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5 border-b border-border group hover:bg-secondary/50 transition-colors cursor-pointer
          ${task.status === "erledigt" ? "opacity-50" : ""}`}
      >
        {/* Status toggle */}
        <button onClick={cycleStatus} className="flex-shrink-0 flex items-center justify-center w-5 h-5">
          <StatusIcon className={`w-4 h-4 transition-colors ${
            task.status === "erledigt" ? "text-success" : task.status === "in_arbeit" ? "text-warning" : "text-muted-foreground hover:text-foreground"
          }`} />
        </button>

        {/* Title + meta */}
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-sm truncate ${task.status === "erledigt" ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {task.title}
          </span>
          <span className={`hidden md:inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${prioConfig.color.split(" ")[0]}`} />
          {task.assigned_to && (
            <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <User className="w-3 h-3" /> {task.assigned_to}
            </span>
          )}
          {plannedHours && (
            <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <Clock className="w-3 h-3" /> {plannedHours}h
            </span>
          )}
          {task.vehicle_info && (
            <span className="hidden lg:inline text-xs text-muted-foreground truncate max-w-[140px] flex-shrink-0">
              🚗 {task.vehicle_info}
            </span>
          )}
        </div>

        {/* Right: deadline + actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {deadlineLabel && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" /> {deadlineLabel}
            </span>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDetail && (
          <TaskDetailModal
            task={task}
            onClose={() => setShowDetail(false)}
            onUpdate={(data) => { onUpdate(data); }}
            onDelete={onDelete}
          />
        )}
      </AnimatePresence>
    </>
  );
}