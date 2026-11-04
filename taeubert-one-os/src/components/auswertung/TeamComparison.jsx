import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

const COLORS = {
  produktiv: "hsl(var(--success))",
  nacharbeit: "hsl(var(--destructive))",
  sonstiges: "hsl(var(--muted-foreground))",
};

function formatHours(minutes) {
  if (!minutes) return "0h";
  return (minutes / 60).toFixed(1) + "h";
}

export default function TeamComparison({ data }) {
  const chartData = data.map(d => ({
    name: d.emp,
    Produktiv: Math.round(d.productiveMins / 60),
    Nacharbeit: Math.round(d.nacharbeitMins / 60),
    Sonstiges: Math.round((d.totalMins - d.productiveMins - d.nacharbeitMins) / 60),
  }));

  const maxHours = Math.max(...chartData.map(d => d.Produktiv + d.Nacharbeit + d.Sonstiges), 1);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Team-Vergleich (Stunden)</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Produktiv" stackId="a" fill={COLORS.produktiv} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Nacharbeit" stackId="a" fill={COLORS.nacharbeit} />
          <Bar dataKey="Sonstiges" stackId="a" fill={COLORS.sonstiges} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 px-2 font-medium">Mitarbeiter</th>
              <th className="text-right py-2 px-2 font-medium">Gesamt</th>
              <th className="text-right py-2 px-2 font-medium">Produktiv</th>
              <th className="text-right py-2 px-2 font-medium">Quote</th>
              <th className="text-right py-2 px-2 font-medium">Nacharb.</th>
              <th className="text-right py-2 px-2 font-medium">Aufgaben</th>
              <th className="text-right py-2 px-2 font-medium">Fehler</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              const prodPct = d.totalMins > 0 ? Math.round((d.productiveMins / d.totalMins) * 100) : 0;
              return (
                <tr key={d.emp} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-2 px-2 font-medium text-foreground flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-heading
                      ${i === 0 ? "bg-warning/20 text-warning" : "bg-secondary text-muted-foreground"}`}>{i + 1}</span>
                    {d.emp}
                  </td>
                  <td className="text-right py-2 px-2 text-foreground font-heading">{formatHours(d.totalMins)}</td>
                  <td className="text-right py-2 px-2 text-success">{formatHours(d.productiveMins)}</td>
                  <td className="text-right py-2 px-2">
                    <span className={prodPct >= 80 ? "text-success" : prodPct >= 60 ? "text-warning" : "text-destructive"}>
                      {prodPct}%
                    </span>
                  </td>
                  <td className="text-right py-2 px-2 text-destructive">{formatHours(d.nacharbeitMins)}</td>
                  <td className="text-right py-2 px-2 text-foreground">{d.tasksDone}</td>
                  <td className="text-right py-2 px-2 text-destructive">{d.errorCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}