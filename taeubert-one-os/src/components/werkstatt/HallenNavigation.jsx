import React from "react";
import { motion } from "framer-motion";
import { Users, AlertTriangle, CheckCircle } from "lucide-react";

export default function HallenNavigation({ vehicles, lifts, employees }) {
  // Bereiche mit Kapazitäten
  const areas = [
    { id: "annahme", name: "Annahme", capacity: 2, x: 0, y: 0 },
    { id: "demontage", name: "Demontage", capacity: 2, x: 1, y: 0 },
    { id: "karosserie", name: "Karosserie", capacity: 3, x: 2, y: 0 },
    { id: "vorbereitung", name: "Vorbereitung", capacity: 4, x: 0, y: 1 },
    { id: "lackierung", name: "Lackierung", capacity: 2, x: 1, y: 1 },
    { id: "finish", name: "Finish", capacity: 3, x: 2, y: 1 },
    { id: "endkontrolle", name: "Endkontrolle", capacity: 2, x: 0, y: 2 },
    { id: "uebergabe", name: "Übergabe", capacity: 2, x: 1, y: 2 },
  ];

  const areaCounts = {};
  vehicles.forEach(v => {
    areaCounts[v.status] = (areaCounts[v.status] || 0) + 1;
  });

  const getAreaStatus = (count, capacity) => {
    const pct = (count / capacity) * 100;
    if (pct > 100) return { color: "bg-destructive", border: "border-destructive/40", text: "text-destructive" };
    if (pct > 75) return { color: "bg-warning", border: "border-warning/40", text: "text-warning" };
    if (pct > 40) return { color: "bg-chart-2", border: "border-chart-2/40", text: "text-chart-2" };
    return { color: "bg-success", border: "border-success/40", text: "text-success" };
  };

  const getEmployeeLocation = (empName) => {
    // Simuliere Mitarbeiter-Position basierend auf aktiven TimeEntries
    return "werkstatt"; // Placeholder
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm text-foreground">HALLEN-NAVIGATION</h3>
        <span className="text-[10px] text-muted-foreground">Live-Übersicht</span>
      </div>

      {/* Hallen-Layout Grid */}
      <div className="relative bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-3 gap-3">
          {areas.map(area => {
            const count = areaCounts[area.id] || 0;
            const status = getAreaStatus(count, area.capacity);
            const isOverloaded = count > area.capacity;
            
            return (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative border rounded-xl p-3 min-h-[100px] ${status.border} bg-secondary/50`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{area.name}</p>
                    <p className={`text-lg font-heading ${status.text}`}>{count}/{area.capacity}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${status.color}`} />
                </div>

                {/* Fahrzeuge */}
                {count > 0 && (
                  <div className="space-y-1">
                    {vehicles
                      .filter(v => v.status === area.id)
                      .slice(0, 3)
                      .map(v => (
                        <div key={v.id} className="text-[9px] bg-card rounded px-1.5 py-0.5 truncate">
                          {v.license_plate}
                        </div>
                      ))}
                    {count > 3 && (
                      <p className="text-[9px] text-muted-foreground">+{count - 3} weitere</p>
                    )}
                  </div>
                )}

                {/* Overload Warning */}
                {isOverloaded && (
                  <div className="absolute top-2 right-2">
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                  </div>
                )}

                {/* Capacity Bar */}
                <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${status.color}`}
                    style={{ width: `${Math.min(100, (count / area.capacity) * 100)}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mitarbeiter Positionen */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">MITARBEITER POSITIONEN</p>
          <div className="grid grid-cols-4 gap-2">
            {employees.slice(0, 8).map(emp => (
              <div key={emp} className="flex items-center gap-1.5 text-[10px]">
                <Users className="w-3 h-3 text-chart-2" />
                <span className="text-foreground">{emp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engpass-Erkennung */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <p className="text-xs font-semibold text-foreground">ENGPASS-ERKENNUNG</p>
        </div>
        <div className="space-y-2">
          {areas.map(area => {
            const count = areaCounts[area.id] || 0;
            const isCritical = count > area.capacity;
            if (!isCritical) return null;
            
            return (
              <div key={area.id} className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-2">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-destructive font-semibold">{area.name} überlastet</p>
                  <p className="text-[10px] text-muted-foreground">{count} Fahrzeuge (max: {area.capacity})</p>
                </div>
              </div>
            );
          })}
          {!Object.values(areaCounts).some((count, i) => count > (areas[i]?.capacity || 0)) && (
            <div className="flex items-center gap-2 text-success py-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Keine Engpässe erkannt</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}