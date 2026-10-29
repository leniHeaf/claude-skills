import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const AREAS = [
  { id: "annahme", name: "Annahme", capacity: 3, color: "bg-blue-500" },
  { id: "teile_bestellt", name: "Teile bestellt", capacity: 5, color: "bg-orange-500" },
  { id: "demontage", name: "Demontage", capacity: 4, color: "bg-red-500" },
  { id: "karosserie", name: "Karosserie", capacity: 6, color: "bg-purple-500" },
  { id: "vorbereitung", name: "Vorbereitung", capacity: 6, color: "bg-pink-500" },
  { id: "lackierung", name: "Lackierung", capacity: 4, color: "bg-indigo-500" },
  { id: "finish", name: "Finish", capacity: 6, color: "bg-cyan-500" },
  { id: "endkontrolle", name: "Endkontrolle", capacity: 3, color: "bg-green-500" },
  { id: "uebergabe", name: "Übergabe", capacity: 2, color: "bg-emerald-500" },
];

const STAGE_LABELS = {
  annahme: "Annahme", teile_bestellt: "Teile bestellt", demontage: "Demontage",
  karosserie: "Karosserie", vorbereitung: "Vorbereitung", lackierung: "Lackierung",
  finish: "Finish", endkontrolle: "Endkontrolle", uebergabe: "Übergabe"
};

export default function WerkstattHeatmap({ vehicles }) {
  const activeVehicles = vehicles.filter(v => 
    ["annahme", "demontage", "karosserie", "vorbereitung", "lackierung", "finish", "endkontrolle", "uebergabe"].includes(v.status)
  );

  const areaStats = AREAS.map(area => {
    const count = activeVehicles.filter(v => v.status === area.id).length;
    const utilization = (count / area.capacity) * 100;
    const isOverloaded = count > area.capacity;
    const isCritical = utilization > 80;
    const isStable = utilization < 50;
    
    return {
      ...area,
      count,
      utilization,
      isOverloaded,
      isCritical,
      isStable,
      statusColor: isOverloaded ? "bg-destructive" : isCritical ? "bg-warning" : "bg-success"
    };
  });

  const totalVehicles = activeVehicles.length;
  const overloadedAreas = areaStats.filter(a => a.isOverloaded).length;
  const criticalAreas = areaStats.filter(a => a.isCritical).length;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-heading text-sm text-foreground">WERKSTATT-HEATMAP</p>
          <p className="text-xs text-muted-foreground">Live Auslastung aller Bereiche</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-success" />
            <span className="text-[10px] text-muted-foreground">Stabil</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-warning" />
            <span className="text-[10px] text-muted-foreground">Kritisch</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-destructive" />
            <span className="text-[10px] text-muted-foreground">Überlastet</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-secondary rounded-lg p-3 text-center">
          <p className="text-2xl font-heading text-foreground">{totalVehicles}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Aktive Fzg</p>
        </div>
        <div className="bg-destructive/10 rounded-lg p-3 text-center border border-destructive/30">
          <p className="text-2xl font-heading text-destructive">{overloadedAreas}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Überlastet</p>
        </div>
        <div className="bg-warning/10 rounded-lg p-3 text-center border border-warning/30">
          <p className="text-2xl font-heading text-warning">{criticalAreas}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Kritisch</p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {areaStats.map(area => (
          <motion.div
            key={area.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden rounded-xl border p-4 ${
              area.isOverloaded ? "bg-destructive/10 border-destructive/50" :
              area.isCritical ? "bg-warning/10 border-warning/50" :
              "bg-secondary border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">{area.name}</span>
              <div className={`w-2 h-2 rounded-full ${area.statusColor}`} />
            </div>
            
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-heading text-foreground">{area.count}</span>
              <span className="text-[10px] text-muted-foreground">/ {area.capacity}</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, area.utilization)}%` }}
                className={`h-full ${area.statusColor}`}
              />
            </div>

            {/* Utilization % */}
            <p className="text-[10px] text-muted-foreground mt-2 text-right">
              {Math.round(area.utilization)}% ausgelastet
            </p>

            {/* Warning */}
            {area.isOverloaded && (
              <div className="flex items-center gap-1 mt-2 text-destructive">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-[9px] font-bold">ÜBER KAPAZITÄT</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empfehlungen */}
      {overloadedAreas > 0 && (
        <div className="mt-5 bg-destructive/10 border border-destructive/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs font-bold text-destructive">HANDLUNGSEMPFEHLUNG</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {overloadedAreas} Bereich(e) überlastet. Fahrzeuge umleiten oder Prioritäten anpassen.
          </p>
        </div>
      )}
    </div>
  );
}