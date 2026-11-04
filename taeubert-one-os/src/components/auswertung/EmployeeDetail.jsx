import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertTriangle, Wrench, Target } from "lucide-react";

const ACTIVITY_LABELS = {
  demontage: "Demontage",
  karosserie: "Karosserie",
  schleifen: "Schleifen",
  fuellern: "Füllern",
  abkleben: "Abkleben",
  lackierung: "Lackierung",
  finish: "Finish",
  reinigung: "Reinigung",
  nacharbeit: "Nacharbeit",
  sonstiges: "Sonstiges",
};

function formatHours(minutes) {
  if (!minutes) return "0h";
  return (minutes / 60).toFixed(1) + "h";
}

const KPI_CARDS = [
  { key: "total", label: "Gesamte Zeit", icon: Clock, color: "text-foreground", bg: "bg-secondary" },
  { key: "productive", label: "Produktiv", icon: Target, color: "text-success", bg: "bg-success/10" },
  { key: "tasks", label: "Aufgaben erledigt", icon: CheckCircle, color: "text-primary", bg: "bg-primary/10" },
  { key: "errors", label: "Fehler", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
];

export default function EmployeeDetail({ employee, data, score }) {
  if (!data) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-sm text-muted-foreground">Keine Daten für {employee}</p>
      </div>
    );
  }

  const activityData = Object.entries(data.activities || {})
    .filter(([, mins]) => mins > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([act, mins]) => ({
      name: ACTIVITY_LABELS[act] || act,
      stunden: Math.round(mins / 60 * 10) / 10,
    }));

  const prodPct = data.totalMins > 0 ? Math.round((data.productiveMins / data.totalMins) * 100) : 0;
  const nachPct = data.totalMins > 0 ? Math.round((data.nacharbeitMins / data.totalMins) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Mitarbeiter-Analyse</p>
            <h3 className="font-heading text-xl text-foreground">{employee}</h3>
          </div>
          {score && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase">Score</p>
              <p className="font-heading text-2xl" style={{ color: score.total_score >= 8 ? "hsl(var(--warning))" : score.total_score >= 6 ? "hsl(var(--success))" : "hsl(var(--destructive))" }}>
                {score.total_score?.toFixed(1)}<span className="text-sm text-muted-foreground">/10</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KPI_CARDS.map(k => {
          const val = k.key === "total" ? formatHours(data.totalMins)
            : k.key === "productive" ? formatHours(data.productiveMins)
            : k.key === "tasks" ? data.tasksDone
            : data.errorCount;
          return (
            <div key={k.key} className={`${k.bg} border border-border rounded-xl p-3`}>
              <div className="flex items-center gap-1.5 mb-1">
                <k.icon className={`w-3 h-3 ${k.color}`} />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
              </div>
              <p className={`font-heading text-lg ${k.color}`}>{val}</p>
            </div>
          );
        })}
      </div>

      {/* Productivity / Nacharbeit bars */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-3">Zeitverteilung</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Produktiv</span>
              <span className="text-success font-medium">{prodPct}%</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${prodPct}%` }} transition={{ duration: 0.6 }}
                className="h-full bg-success rounded-full" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Nacharbeit</span>
              <span className="text-destructive font-medium">{nachPct}%</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${nachPct}%` }} transition={{ duration: 0.6 }}
                className="h-full bg-destructive rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      {activityData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-muted-foreground" />
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Tätigkeiten (Stunden)</p>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(200, activityData.length * 32)}>
            <BarChart data={activityData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v}h`, "Stunden"]}
              />
              <Bar dataKey="stunden" radius={[0, 4, 4, 0]}>
                {activityData.map((entry, i) => (
                  <Cell key={i} fill={entry.name === "Nacharbeit" ? "hsl(var(--destructive))" : entry.name === "Finish" ? "hsl(var(--success))" : "hsl(var(--primary))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Manager score breakdown */}
      {score && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-3">Bewertung (Manager)</p>
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "Qualität", val: score.quality_score, color: "bg-primary" },
              { label: "Produkt.", val: score.productivity_score, color: "bg-success" },
              { label: "Verantw.", val: score.responsibility_score, color: "bg-info" },
              { label: "Ordnung", val: score.order_score, color: "bg-chart-2" },
              { label: "Team", val: score.team_score, color: "bg-warning" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-[9px] text-muted-foreground mb-1">{s.label}</p>
                <p className="font-heading text-lg text-foreground">{s.val || 0}</p>
                <div className="h-1 bg-secondary rounded-full overflow-hidden mt-1">
                  <div className={`h-full ${s.color}`} style={{ width: `${((s.val || 0) / 10) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          {score.strengths && (
            <div className="mt-3 p-2 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-[10px] text-success uppercase mb-0.5">Stärken</p>
              <p className="text-xs text-foreground">{score.strengths}</p>
            </div>
          )}
          {score.development_areas && (
            <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-[10px] text-warning uppercase mb-0.5">Entwicklungspotenzial</p>
              <p className="text-xs text-foreground">{score.development_areas}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}