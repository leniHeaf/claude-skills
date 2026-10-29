import React from "react";

const statusConfig = {
  annahme: { label: "Annahme", color: "bg-info/20 text-info border-info/30" },
  teile_bestellt: { label: "Teile bestellt", color: "bg-muted text-muted-foreground border-border" },
  demontage: { label: "Demontage", color: "bg-warning/20 text-warning border-warning/30" },
  karosserie: { label: "Karosserie", color: "bg-warning/20 text-warning border-warning/30" },
  vorbereitung: { label: "Vorbereitung", color: "bg-warning/20 text-warning border-warning/30" },
  lackierung: { label: "Lackierung", color: "bg-info/20 text-info border-info/30" },
  finish: { label: "Finish", color: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  endkontrolle: { label: "Endkontrolle", color: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  uebergabe: { label: "Übergabe", color: "bg-success/20 text-success border-success/30" },
};

const conditionConfig = {
  fertig: { label: "Fertig", dot: "bg-success" },
  in_arbeit: { label: "In Arbeit", dot: "bg-warning" },
  problem: { label: "Problem", dot: "bg-destructive" },
  wartet_auf_teile: { label: "Wartet auf Teile", dot: "bg-muted-foreground" },
  lackierung: { label: "Lackierung", dot: "bg-info" },
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, color: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border ${config.color}`}>
      {config.label}
    </span>
  );
}

export function ConditionDot({ condition }) {
  const config = conditionConfig[condition] || { label: condition, dot: "bg-muted-foreground" };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}