import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { StatusBadge, ConditionDot } from "../shared/StatusBadge";
import { Calendar, User, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import TaskStartButton from "../tasks/TaskStartButton";

export default function VehicleCard({ vehicle, index }) {
  const { data: tasks = [] } = useQuery({
    queryKey: ["vehicle-tasks", vehicle.id],
    queryFn: () => base44.entities.Task.filter({ vehicle_id: vehicle.id }),
    refetchInterval: 15000,
  });

  const openTasks = tasks.filter(t => t.status !== "erledigt");
  const nextTask = openTasks[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all duration-300 group">
        <div className="flex items-start justify-between mb-3">
          <Link to={`/vehicles/${vehicle.id}`} className="flex-1 min-w-0">
            <h3 className="font-heading text-sm text-foreground">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{vehicle.license_plate}</p>
          </Link>
          <Link to={`/vehicles/${vehicle.id}`} className="flex-shrink-0">
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={vehicle.status} />
          <ConditionDot condition={vehicle.condition} />
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${vehicle.progress || 0}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{vehicle.responsible || "Nicht zugewiesen"}</span>
          </div>
          {vehicle.estimated_completion && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(vehicle.estimated_completion), "dd.MM.")}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-2 truncate">
          {vehicle.customer_name}
        </p>

        {/* Quick Start: nächste Aufgabe mit Start-Button */}
        {nextTask ? (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase mb-0.5">Nächste Aufgabe</p>
              <p className="text-xs text-foreground truncate">{nextTask.title}</p>
            </div>
            <TaskStartButton task={nextTask} size="sm" variant="success" />
          </div>
        ) : openTasks.length === 0 && tasks.length > 0 ? (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-[10px] text-success">Alle Aufgaben erledigt</p>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}