import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, Clock, Package, CheckCircle2, X } from "lucide-react";
import { differenceInHours, parseISO } from "date-fns";

function buildAlerts(vehicles, tasks, materials) {
  const alerts = [];
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Vehicles overdue
  vehicles.forEach(v => {
    if (v.estimated_completion && v.estimated_completion < today && v.status !== "uebergabe") {
      alerts.push({
        id: `overdue-${v.id}`,
        type: "warning",
        icon: Clock,
        title: `${v.make} ${v.model} überfällig`,
        desc: `Fertigstellung war am ${v.estimated_completion}`,
        color: "text-destructive bg-destructive/10 border-destructive/20",
      });
    }
  });

  // Vehicles stuck (no status change > 24h, not awaiting parts)
  vehicles.forEach(v => {
    if (v.updated_date && v.status !== "uebergabe" && v.condition !== "fertig") {
      const h = differenceInHours(now, parseISO(v.updated_date));
      if (h > 48) {
        alerts.push({
          id: `stuck-${v.id}`,
          type: "warning",
          icon: AlertTriangle,
          title: `${v.make} ${v.model} steht seit ${h}h`,
          desc: `Kein Statuswechsel in Stufe: ${v.status}`,
          color: "text-warning bg-warning/10 border-warning/20",
        });
      }
    }
  });

  // Low materials
  materials.forEach(m => {
    if (m.current_stock !== undefined && m.min_stock !== undefined && m.current_stock <= m.min_stock) {
      alerts.push({
        id: `mat-${m.id}`,
        type: "info",
        icon: Package,
        title: `${m.name} Mindestbestand`,
        desc: `Nur noch ${m.current_stock} ${m.unit || "Stk"} — Nachbestellung prüfen`,
        color: "text-chart-1 bg-chart-1/10 border-chart-1/20",
      });
    }
  });

  // Overloaded tasks
  const overdueTaskCount = tasks.filter(t => t.deadline && t.deadline < today && t.status !== "erledigt").length;
  if (overdueTaskCount > 0) {
    alerts.push({
      id: "overdue-tasks",
      type: "warning",
      icon: AlertTriangle,
      title: `${overdueTaskCount} überfällige Aufgaben`,
      desc: "Deadline überschritten — Priorisierung prüfen",
      color: "text-warning bg-warning/10 border-warning/20",
    });
  }

  // Positive: no problems today
  const problems = vehicles.filter(v => v.condition === "problem").length;
  if (problems === 0 && vehicles.length > 0) {
    alerts.push({
      id: "all-good",
      type: "success",
      icon: CheckCircle2,
      title: "Kein Stau erkannt",
      desc: "Alle Fahrzeuge laufen planmäßig",
      color: "text-success bg-success/10 border-success/20",
    });
  }

  return alerts.slice(0, 8);
}

export default function SmartAlerts() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());

  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: () => base44.entities.Vehicle.list() });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => base44.entities.Task.list() });
  const { data: materials = [] } = useQuery({ queryKey: ["materials"], queryFn: () => base44.entities.Material.list() });

  const allAlerts = buildAlerts(vehicles, tasks, materials);
  const visible = allAlerts.filter(a => !dismissed.has(a.id));
  const warnings = visible.filter(a => a.type === "warning");
  const urgentCount = warnings.length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative">
        <Bell className="w-4 h-4" />
        {urgentCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-[9px] text-white flex items-center justify-center font-heading leading-none">
            {urgentCount}
          </span>
        )}
        {urgentCount === 0 && visible.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 z-50 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-xs font-semibold text-foreground">Smarte Hinweise</p>
                <button onClick={() => setOpen(false)}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
              </div>

              {visible.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Alles im grünen Bereich.</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {visible.map(alert => {
                    const Icon = alert.icon;
                    return (
                      <div key={alert.id} className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0`}>
                        <div className={`p-1.5 rounded-lg border flex-shrink-0 ${alert.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{alert.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{alert.desc}</p>
                        </div>
                        <button onClick={() => setDismissed(d => new Set([...d, alert.id]))}
                          className="text-muted-foreground/50 hover:text-muted-foreground flex-shrink-0 mt-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}