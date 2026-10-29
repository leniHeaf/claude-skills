import React from "react";
import { motion } from "framer-motion";
import { MapPin, User, Clock } from "lucide-react";
import { differenceInMinutes } from "date-fns";

const PLANNED_MINS = {
  annahme: 30, teile_bestellt: 1440, demontage: 240, karosserie: 480,
  vorbereitung: 360, lackierung: 180, finish: 240, endkontrolle: 60, uebergabe: 30
};

export default function VehicleTracker({ vehicles, employees }) {
  const getVehicleStatus = (v) => {
    const now = new Date();
    const minsInStage = v.updated_date ? differenceInMinutes(now, new Date(v.updated_date)) : 0;
    const hours = Math.floor(minsInStage / 60);
    const mins = minsInStage % 60;
    
    const remaining = Math.max(0, (PLANNED_MINS[v.status] || 240) - minsInStage);
    
    return { hours, mins, remaining };
  };

  const getPriorityColor = (v) => {
    if (v.condition === "problem") return "text-destructive bg-destructive/10 border-destructive/30";
    if (v.customer_type === "premium" || ["Porsche", "AMG", "Bentley"].includes(v.make)) 
      return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    return "text-muted-foreground bg-secondary border-border";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm text-foreground">LIVE FAHRZEUG-TRACKING</h3>
        <span className="text-[10px] text-muted-foreground">{vehicles.length} Fahrzeuge aktiv</span>
      </div>

      <div className="grid gap-3">
        {vehicles.slice(0, 12).map(v => {
          const { hours, mins, remaining } = getVehicleStatus(v);
          const priority = getPriorityColor(v);
          
          return (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${priority}`}>
                      {v.condition === "problem" ? "⚠ PROBLEM" : 
                       v.customer_type === "premium" ? "★ PREMIUM" : "STANDARD"}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{v.license_plate}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{v.make} {v.model}</p>
                </div>
                
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  v.condition === "problem" ? "bg-destructive animate-pulse" :
                  v.condition === "fertig" ? "bg-success" : "bg-warning"
                }`} />
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-chart-1" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Standort</p>
                    <p className="text-foreground font-medium">{v.status}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-chart-2" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Mitarbeiter</p>
                    <p className="text-foreground font-medium">{v.responsible || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-chart-3" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Zeit im Bereich</p>
                    <p className="text-foreground font-medium">
                      {hours > 0 ? `${hours}h ${mins}min` : `${mins}min`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Restzeit (geschätzt)</span>
                  <span className={`text-xs font-semibold ${
                    remaining < 30 ? "text-success" : 
                    remaining < 120 ? "text-warning" : "text-foreground"
                  }`}>
                    {Math.floor(remaining / 60)}h {remaining % 60}min
                  </span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((PLANNED_MINS[v.status] || 240) - remaining) / (PLANNED_MINS[v.status] || 240) * 100)}%` }}
                    className={`h-full rounded-full ${
                      remaining < 30 ? "bg-success" : 
                      remaining < 120 ? "bg-warning" : "bg-chart-2"
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}