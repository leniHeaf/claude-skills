import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "hsl(215, 55%, 40%)",
  "hsl(40, 80%, 55%)",
  "hsl(150, 50%, 40%)",
  "hsl(0, 70%, 50%)",
  "hsl(230, 10%, 40%)",
];

const statusLabels = {
  annahme: "Annahme",
  teile_bestellt: "Teile",
  demontage: "Demontage",
  karosserie: "Karosserie",
  vorbereitung: "Vorbereitung",
  lackierung: "Lackierung",
  finish: "Finish",
  endkontrolle: "Endkontrolle",
  uebergabe: "Übergabe",
};

export default function VehicleStatusChart({ vehicles }) {
  const statusCounts = {};
  vehicles.forEach((v) => {
    statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;
  });

  const data = Object.entries(statusCounts).map(([key, value]) => ({
    name: statusLabels[key] || key,
    value,
  }));

  if (data.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase mb-4">
        Fahrzeugverteilung
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(230, 12%, 8%)",
                border: "1px solid hsl(230, 10%, 16%)",
                borderRadius: "8px",
                color: "hsl(0, 0%, 95%)",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </div>
  );
}