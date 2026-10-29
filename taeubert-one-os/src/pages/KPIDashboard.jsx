import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, Car, Clock, AlertTriangle, Package, Repeat } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export default function KPIDashboard() {
  const [period, setPeriod] = useState("monat");

  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles-kpi"], queryFn: () => base44.entities.Vehicle.list("-created_date", 500) });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks-kpi"], queryFn: () => base44.entities.Task.list("-created_date", 500) });
  const { data: errors = [] } = useQuery({ queryKey: ["errors-kpi"], queryFn: () => base44.entities.ErrorReport.list("-created_date", 500) });
  const { data: timeEntries = [] } = useQuery({ queryKey: ["time-kpi"], queryFn: () => base44.entities.TimeEntry.list("-created_date", 500) });
  const { data: materials = [] } = useQuery({ queryKey: ["materials-kpi"], queryFn: () => base44.entities.MaterialUsage.list("-created_date", 500) });

  // KPIs
  const active = vehicles.filter(v => v.status !== "uebergabe").length;
  const done = vehicles.filter(v => v.status === "uebergabe").length;
  const problems = vehicles.filter(v => v.condition === "problem").length;
  const reworks = errors.filter(e => !e.resolved).length;
  const totalMinutes = timeEntries.filter(e => e.status === "beendet").reduce((s, e) => s + (e.duration_minutes || 0), 0);
  const totalHours = Math.round(totalMinutes / 60);
  const materialCost = materials.reduce((s, m) => s + (m.cost || 0), 0);

  // Vehicles per status for chart
  const statusCount = {
    annahme: vehicles.filter(v => v.status === "annahme").length,
    demontage: vehicles.filter(v => v.status === "demontage").length,
    karosserie: vehicles.filter(v => v.status === "karosserie").length,
    vorbereitung: vehicles.filter(v => v.status === "vorbereitung").length,
    lackierung: vehicles.filter(v => v.status === "lackierung").length,
    finish: vehicles.filter(v => v.status === "finish").length,
    uebergabe: vehicles.filter(v => v.status === "uebergabe").length,
  };

  const statusChartData = Object.entries(statusCount).map(([k, v]) => ({ name: k, wert: v }));

  // Error categories
  const errorByCategory = errors.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});
  const errorChartData = Object.entries(errorByCategory).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => ({ name: k, wert: v }));

  const KPI_CARDS = [
    { label: "Fahrzeuge aktiv", value: active, icon: Car, color: "text-chart-1", sub: `${done} abgeschlossen` },
    { label: "Produktivstunden", value: `${totalHours}h`, icon: Clock, color: "text-chart-2", sub: "Gesamt gebucht" },
    { label: "Offene Probleme", value: problems, icon: AlertTriangle, color: problems > 0 ? "text-destructive" : "text-muted-foreground", sub: `${reworks} Nacharbeiten` },
    { label: "Materialkosten", value: `${materialCost.toFixed(0)} €`, icon: Package, color: "text-chart-3", sub: "Gesamtverbrauch" },
    { label: "Tasks erledigt", value: tasks.filter(t => t.status === "erledigt").length, icon: TrendingUp, color: "text-chart-2", sub: `${tasks.filter(t => t.status === "offen").length} offen` },
    { label: "Fehlerquote", value: errors.length > 0 ? `${Math.round((errors.filter(e => e.resolved).length / errors.length) * 100)}%` : "–", icon: Repeat, color: "text-chart-4", sub: "Gelöst" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">KPI-DASHBOARD</h1>
            <p className="text-sm text-muted-foreground mt-1">Unternehmenssteuerung · Performance · Auslastung</p>
          </div>
          <div className="flex gap-1 p-1 bg-secondary rounded-xl">
            {["heute", "monat", "gesamt"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize
                  ${period === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {KPI_CARDS.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
            </div>
            <p className={`font-heading text-2xl ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">FAHRZEUGE JE STATUS</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
              <Bar dataKey="wert" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">FEHLER NACH KATEGORIE</p>
          {errorChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={errorChartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={70} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                <Bar dataKey="wert" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Keine Fehlerdaten</p>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle status summary table */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">FAHRZEUGÜBERSICHT</p>
        <div className="space-y-2">
          {vehicles.slice(0, 8).map(v => (
            <div key={v.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
              <div>
                <span className="text-foreground font-medium">{v.customer_name}</span>
                <span className="text-muted-foreground ml-2 text-xs">{v.make} {v.model}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{v.license_plate}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                  ${v.condition === "fertig" ? "bg-success/10 text-success" :
                    v.condition === "problem" ? "bg-destructive/10 text-destructive" :
                    "bg-secondary text-muted-foreground"}`}>
                  {v.status}
                </span>
              </div>
            </div>
          ))}
          {vehicles.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Keine Fahrzeuge vorhanden</p>}
        </div>
      </div>
    </div>
  );
}