import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { format, subDays } from "date-fns";

const AREA_LABELS = {
  karosserie: "Karosserie",
  vorbereitung: "Vorbereitung",
  lackierung: "Lackierung",
  finish: "Finish",
  aufbereitung: "Aufbereitung",
  reifenlager: "Reifenlager",
  sonstiges: "Sonstiges",
};

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function UsageAnalysis({ usages, materials, vehicles }) {
  const [view, setView] = useState("bereich"); // bereich | material | mitarbeiter | fahrzeug

  const today = format(new Date(), "yyyy-MM-dd");
  const cutoff30 = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const cutoff7 = format(subDays(new Date(), 7), "yyyy-MM-dd");

  const recent30 = usages.filter(u => u.date >= cutoff30);
  const recent7 = usages.filter(u => u.date >= cutoff7);

  // Anomaly detection: compare last 7d vs avg weekly from last 30d
  const totalCost30 = recent30.reduce((s, u) => s + (u.cost || 0), 0);
  const totalCost7 = recent7.reduce((s, u) => s + (u.cost || 0), 0);
  const avgWeeklyCost = totalCost30 / 4;
  const anomalyPct = avgWeeklyCost > 0 ? Math.round(((totalCost7 - avgWeeklyCost) / avgWeeklyCost) * 100) : 0;

  // Group by area
  const byArea = Object.entries(
    recent30.reduce((acc, u) => {
      const key = u.area || "sonstiges";
      acc[key] = (acc[key] || 0) + (u.cost || 0);
      return acc;
    }, {})
  ).map(([area, cost]) => ({ name: AREA_LABELS[area] || area, value: Math.round(cost) }))
    .sort((a, b) => b.value - a.value);

  // Group by material
  const byMaterial = Object.entries(
    recent30.reduce((acc, u) => {
      const key = u.material_name || "Unbekannt";
      acc[key] = (acc[key] || { cost: 0, qty: 0 });
      acc[key].cost += u.cost || 0;
      acc[key].qty += u.quantity_used || 0;
      return acc;
    }, {})
  ).map(([name, v]) => ({ name, cost: Math.round(v.cost), qty: Math.round(v.qty) }))
    .sort((a, b) => b.cost - a.cost).slice(0, 10);

  // Group by employee
  const byEmployee = Object.entries(
    recent30.reduce((acc, u) => {
      const key = u.employee || "Unbekannt";
      acc[key] = (acc[key] || 0) + (u.cost || 0);
      return acc;
    }, {})
  ).map(([name, cost]) => ({ name, value: Math.round(cost) }))
    .sort((a, b) => b.value - a.value);

  // Group by vehicle
  const byVehicle = Object.entries(
    recent30.reduce((acc, u) => {
      const key = u.vehicle_info || "Ohne Fahrzeug";
      acc[key] = (acc[key] || 0) + (u.cost || 0);
      return acc;
    }, {})
  ).map(([name, cost]) => ({ name, value: Math.round(cost) }))
    .sort((a, b) => b.value - a.value).slice(0, 8);

  const chartData = {
    bereich: byArea,
    material: byMaterial.map(m => ({ name: m.name, value: m.cost })),
    mitarbeiter: byEmployee,
    fahrzeug: byVehicle,
  };

  const VIEWS = [
    { key: "bereich", label: "Bereiche" },
    { key: "material", label: "Materialien" },
    { key: "mitarbeiter", label: "Mitarbeiter" },
    { key: "fahrzeug", label: "Fahrzeuge" },
  ];

  const data = chartData[view] || [];
  const totalCostShown = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Kosten 30 Tage", value: `${Math.round(totalCost30)} €` },
          { label: "Kosten 7 Tage", value: `${Math.round(totalCost7)} €` },
          { label: "Buchungen gesamt", value: recent30.length },
          {
            label: "Trend (letzte 7d vs. Ø)",
            value: `${anomalyPct > 0 ? "+" : ""}${anomalyPct}%`,
            warn: anomalyPct > 30
          },
        ].map((kpi, i) => (
          <div key={kpi.label} className={`bg-card border rounded-xl p-4 ${kpi.warn ? "border-warning/30" : "border-border"}`}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</p>
            <p className={`font-heading text-lg ${kpi.warn ? "text-warning" : "text-foreground"}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Anomaly warning */}
      {anomalyPct > 30 && (
        <div className="flex items-start gap-3 p-4 bg-warning/5 border border-warning/20 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-warning">Ungewöhnlicher Materialverbrauch</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Der Materialverbrauch der letzten 7 Tage ist {anomalyPct}% höher als der wöchentliche Durchschnitt. Prüfung empfohlen.
            </p>
          </div>
        </div>
      )}

      {/* View selector */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${view === v.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {data.length > 0 ? (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-3">
            Kosten nach {VIEWS.find(v => v.key === view)?.label} — letzte 30 Tage · Gesamt: {totalCostShown} €
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v}€`} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={v => [`${v} €`, "Kosten"]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Noch keine Verbrauchsdaten. Buchungen in MaterialUsage eintragen.</p>
        </div>
      )}

      {/* Top materials table */}
      {byMaterial.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">TOP MATERIALIEN (30 TAGE)</p>
          </div>
          <div className="divide-y divide-border">
            {byMaterial.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3 px-4 py-3">
                <span className="text-sm text-muted-foreground w-5">{i + 1}</span>
                <p className="text-sm text-foreground flex-1 truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.qty} Stk</p>
                <p className="text-sm font-heading text-foreground w-16 text-right">{m.cost} €</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}