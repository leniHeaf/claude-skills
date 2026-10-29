import React from "react";
import { Trophy, AlertTriangle, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function formatDuration(minutes) {
  if (!minutes) return "0h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
}

const SCORE_CATEGORIES = [
  { key: "quality_score", label: "Qualität", weight: "40%", color: "bg-primary" },
  { key: "productivity_score", label: "Produktivität", weight: "20%", color: "bg-success" },
  { key: "responsibility_score", label: "Verantwortung", weight: "20%", color: "bg-info" },
  { key: "order_score", label: "Ordnung", weight: "10%", color: "bg-chart-2" },
  { key: "team_score", label: "Team", weight: "10%", color: "bg-warning" },
];

export default function EmployeeScoreCard({ employee, score, autoStats, onEdit }) {
  const hasScore = !!score;
  const total = score?.total_score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border rounded-xl p-4
        ${score?.employee_of_month ? "border-warning/40" : "border-border"}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-heading text-base text-foreground">{employee}</p>
            {score?.employee_of_month && <Trophy className="w-4 h-4 text-warning" />}
          </div>
          {hasScore && (
            <p className="text-2xl font-heading mt-1" style={{ color: total >= 8 ? "hsl(var(--warning))" : total >= 6 ? "hsl(var(--success))" : "hsl(var(--destructive))" }}>
              {total?.toFixed(1)} <span className="text-sm text-muted-foreground font-body">/ 10</span>
            </p>
          )}
          {!hasScore && <p className="text-xs text-warning mt-1">Noch nicht bewertet</p>}
        </div>
        <Button size="sm" variant="outline" onClick={onEdit} className="h-7 text-xs border-border gap-1">
          <Edit2 className="w-3 h-3" /> {hasScore ? "Bearbeiten" : "Bewerten"}
        </Button>
      </div>

      {/* Auto Stats from TimeTracking */}
      <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-secondary rounded-lg">
        <div className="text-center">
          <p className="font-heading text-sm text-foreground">{formatDuration(autoStats.productiveMins)}</p>
          <p className="text-[10px] text-muted-foreground">Produktiv</p>
        </div>
        <div className="text-center">
          <p className={`font-heading text-sm ${autoStats.nacharbeitPct > 10 ? "text-destructive" : "text-foreground"}`}>
            {autoStats.nacharbeitPct}%
          </p>
          <p className="text-[10px] text-muted-foreground">Nacharbeit</p>
        </div>
        <div className="text-center">
          <p className={`font-heading text-sm ${autoStats.empErrors > 3 ? "text-destructive" : "text-foreground"}`}>
            {autoStats.empErrors}
          </p>
          <p className="text-[10px] text-muted-foreground">Fehler</p>
        </div>
      </div>

      {/* Score bars */}
      {hasScore && (
        <div className="space-y-2 mb-3">
          {SCORE_CATEGORIES.map(cat => {
            const val = score[cat.key] || 0;
            return (
              <div key={cat.key} className="flex items-center gap-2">
                <p className="text-[10px] text-muted-foreground w-20 flex-shrink-0">{cat.label}</p>
                <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                  <div style={{ width: `${(val / 10) * 100}%` }} className={`h-full rounded-full ${cat.color}`} />
                </div>
                <p className="text-[10px] text-foreground w-4 text-right">{val}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Badges */}
      {score?.badges?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {score.badges.map(b => (
            <span key={b} className="text-[10px] px-2 py-0.5 bg-warning/10 text-warning border border-warning/20 rounded-md">{b}</span>
          ))}
        </div>
      )}

      {/* Development note */}
      {score?.development_areas && (
        <div className="mt-3 p-2 bg-warning/5 border border-warning/20 rounded-lg flex items-start gap-1.5">
          <AlertTriangle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-warning">{score.development_areas}</p>
        </div>
      )}
    </motion.div>
  );
}