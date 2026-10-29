import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const ACTIVITY_LABELS = {
  demontage: "Demontage", karosserie: "Karosserie", schleifen: "Schleifen",
  fuellern: "Füllern", abkleben: "Abkleben", lackierung: "Lackierung",
  finish: "Finish", reinigung: "Reinigung", nacharbeit: "Nacharbeit", sonstiges: "Sonstiges"
};

// DAT typical hour estimates per activity (benchmark)
const DAT_BENCHMARK = {
  demontage: 1.5, karosserie: 4.0, schleifen: 2.0, fuellern: 1.5,
  abkleben: 0.5, lackierung: 3.0, finish: 1.5, reinigung: 0.5,
  nacharbeit: 2.0, sonstiges: 1.0
};

export default function Nachkalkulation() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const { data: datImports = [] } = useQuery({
    queryKey: ["dat-imports-nk"],
    queryFn: () => base44.entities.DATImport.list("-created_date", 100),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-nk"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 100),
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["time-nk"],
    queryFn: () => base44.entities.TimeEntry.list("-created_date", 500),
  });

  const { data: materials = [] } = useQuery({
    queryKey: ["materials-nk"],
    queryFn: () => base44.entities.MaterialUsage.list("-created_date", 500),
  });

  const { data: errors = [] } = useQuery({
    queryKey: ["errors-nk"],
    queryFn: () => base44.entities.ErrorReport.list("-created_date", 200),
  });

  // Per-activity time analysis (all vehicles)
  const activityMinutes = timeEntries
    .filter(e => e.status === "beendet" && e.duration_minutes)
    .reduce((acc, e) => {
      acc[e.activity] = (acc[e.activity] || 0) + e.duration_minutes;
      return acc;
    }, {});

  const activityData = Object.entries(activityMinutes).map(([activity, minutes]) => {
    const hours = minutes / 60;
    const benchmark = DAT_BENCHMARK[activity] || 1;
    const diff = hours - benchmark;
    const diffPercent = Math.round((diff / benchmark) * 100);
    return {
      name: ACTIVITY_LABELS[activity] || activity,
      activity,
      hours: Math.round(hours * 10) / 10,
      benchmark,
      diff: Math.round(diff * 10) / 10,
      diffPercent,
      over: diffPercent > 15,
    };
  }).sort((a, b) => b.diffPercent - a.diffPercent);

  // Per-vehicle analysis
  const vehicleAnalysis = vehicles.map(v => {
    const vEntries = timeEntries.filter(e => e.vehicle_id === v.id && e.status === "beendet" && e.duration_minutes);
    const realHours = vEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0) / 60;
    const dat = datImports.find(d => d.vehicle_id === v.id);
    const datHours = dat?.total_hours || 0;
    const vMaterials = materials.filter(m => m.vehicle_id === v.id);
    const materialCost = vMaterials.reduce((s, m) => s + (m.cost || 0), 0);
    const datPartsTotal = dat?.total_parts_cost || 0;
    const vErrors = errors.filter(e => e.vehicle_id === v.id && !e.resolved);
    const timeDiff = datHours > 0 ? Math.round((realHours - datHours) * 10) / 10 : null;

    return {
      ...v,
      realHours: Math.round(realHours * 10) / 10,
      datHours,
      timeDiff,
      materialCost: Math.round(materialCost),
      datPartsTotal,
      matDiff: datPartsTotal > 0 ? Math.round(materialCost - datPartsTotal) : null,
      reworkCount: vErrors.length,
      profitable: timeDiff !== null ? timeDiff <= 1 : null,
    };
  }).filter(v => v.realHours > 0).sort((a, b) => (b.timeDiff || 0) - (a.timeDiff || 0));

  // Summary KPIs
  const totalRealHours = vehicleAnalysis.reduce((s, v) => s + v.realHours, 0);
  const totalDatHours = vehicleAnalysis.reduce((s, v) => s + v.datHours, 0);
  const overBudgetCount = vehicleAnalysis.filter(v => v.timeDiff !== null && v.timeDiff > 1).length;
  const nacharbeitHours = activityMinutes["nacharbeit"] ? Math.round(activityMinutes["nacharbeit"] / 60 * 10) / 10 : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">NACHKALKULATION</h1>
        <p className="text-sm text-muted-foreground mt-1">DAT-Zeit vs. echte Zeit · Material · Profitabilität</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Echte Std. gesamt", value: `${Math.round(totalRealHours)}h`, icon: Clock, color: "text-chart-1" },
          { label: "DAT-Stunden gesamt", value: `${Math.round(totalDatHours)}h`, icon: Clock, color: "text-muted-foreground" },
          { label: "Über Budget", value: overBudgetCount, icon: AlertTriangle, color: overBudgetCount > 0 ? "text-destructive" : "text-muted-foreground" },
          { label: "Nacharbeit-Stunden", value: `${nacharbeitHours}h`, icon: TrendingDown, color: nacharbeitHours > 5 ? "text-warning" : "text-muted-foreground" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
            </div>
            <p className={`font-heading text-2xl ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      {activityData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            AKTIVITÄTEN · ECHTE STUNDEN
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} unit="h" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }}
                formatter={(v) => [`${v}h`, "Stunden"]}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {activityData.map((entry, i) => (
                  <Cell key={i} fill={entry.over ? "hsl(var(--destructive))" : "hsl(var(--chart-1))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {activityData.filter(a => a.over).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activityData.filter(a => a.over).map(a => (
                <span key={a.activity} className="text-xs bg-destructive/10 text-destructive border border-destructive/20 px-2 py-1 rounded-lg flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {a.name}: +{a.diffPercent}% über Benchmark
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Per Vehicle */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">FAHRZEUG-KALKULATION</p>
        {vehicleAnalysis.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Noch keine Zeiterfassungsdaten vorhanden.</p>
        ) : (
          <div className="space-y-2">
            {vehicleAnalysis.map(v => (
              <div key={v.id} className={`p-3 rounded-xl border transition-all text-sm
                ${v.profitable === false ? "bg-destructive/5 border-destructive/20" :
                  v.profitable === true ? "bg-success/5 border-success/20" : "bg-secondary border-border"}`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{v.customer_name} · {v.make} {v.model}</p>
                    <p className="text-[10px] text-muted-foreground">{v.license_plate}</p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] flex-wrap">
                    <span className="text-muted-foreground">Echt: <span className="text-foreground font-semibold">{v.realHours}h</span></span>
                    {v.datHours > 0 && <span className="text-muted-foreground">DAT: {v.datHours}h</span>}
                    {v.timeDiff !== null && (
                      <span className={`flex items-center gap-0.5 font-semibold ${v.timeDiff > 1 ? "text-destructive" : "text-success"}`}>
                        {v.timeDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {v.timeDiff > 0 ? "+" : ""}{v.timeDiff}h
                      </span>
                    )}
                    {v.reworkCount > 0 && (
                      <span className="text-warning text-[10px]">⚠ {v.reworkCount} Nacharbeiten</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}