import React from "react";
import { Trophy, Edit2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const MEDALS = ["🥇", "🥈", "🥉"];

const SCORE_COLOR = (score) => {
  if (score >= 8.5) return "text-warning";
  if (score >= 7) return "text-success";
  if (score >= 5) return "text-foreground";
  return "text-destructive";
};

const BAR_COLOR = (score) => {
  if (score >= 8.5) return "bg-warning";
  if (score >= 7) return "bg-success";
  if (score >= 5) return "bg-primary";
  return "bg-destructive";
};

const BADGES_MAP = {
  "Finish-Profi": "🏆",
  "Qualitätslevel Gold": "⭐",
  "Ordnung Champion": "✨",
  "Problemlöser": "🔧",
  "Premiumstandard": "💎",
  "Team-Player": "🤝",
  "Produktivitäts-Ass": "⚡",
};

export default function RankingBoard({ scores, team, onSetEOM, onEdit }) {
  if (scores.length === 0) {
    return (
      <div className="text-center py-16">
        <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Noch keine Bewertungen für diesen Monat.</p>
        <p className="text-xs text-muted-foreground mt-1">Gehe zu „Bewertung" um Scores einzugeben.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scores.map((score, i) => {
        const pct = Math.round(((score.total_score || 0) / 10) * 100);
        return (
          <motion.div
            key={score.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`bg-card border rounded-xl p-4 transition-all
              ${score.employee_of_month ? "border-warning/40 bg-warning/5" : "border-border"}`}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="text-2xl w-8 flex-shrink-0 text-center">
                {i < 3 ? MEDALS[i] : <span className="text-sm text-muted-foreground font-heading">#{i + 1}</span>}
              </div>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-sm font-semibold text-foreground">{score.employee}</p>
                  {score.employee_of_month && (
                    <span className="text-[10px] px-2 py-0.5 bg-warning/20 text-warning rounded-md border border-warning/30 font-semibold">
                      🏆 DES MONATS
                    </span>
                  )}
                  {score.badges?.map(b => (
                    <span key={b} className="text-[10px]" title={b}>{BADGES_MAP[b] || "🏅"}</span>
                  ))}
                </div>
                {/* Score bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.04 + 0.2 }}
                      className={`h-full rounded-full ${BAR_COLOR(score.total_score || 0)}`}
                    />
                  </div>
                </div>
                {/* Sub-scores */}
                <div className="flex gap-2 mt-1.5">
                  {[
                    { label: "Q", value: score.quality_score, title: "Qualität" },
                    { label: "P", value: score.productivity_score, title: "Produktivität" },
                    { label: "V", value: score.responsibility_score, title: "Verantwortung" },
                    { label: "O", value: score.order_score, title: "Ordnung" },
                    { label: "T", value: score.team_score, title: "Team" },
                  ].map(s => (
                    <span key={s.label} title={s.title} className="text-[10px] text-muted-foreground">
                      {s.label}: <span className="text-foreground">{s.value ?? "–"}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Score */}
              <div className="text-right flex-shrink-0">
                <p className={`font-heading text-2xl ${SCORE_COLOR(score.total_score || 0)}`}>
                  {(score.total_score || 0).toFixed(1)}
                </p>
                <p className="text-[10px] text-muted-foreground">/ 10</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(score.employee)}
                className="h-7 text-xs border-border gap-1"
              >
                <Edit2 className="w-3 h-3" /> Bearbeiten
              </Button>
              {!score.employee_of_month && (
                <Button
                  size="sm"
                  onClick={() => onSetEOM(score.employee, score.id)}
                  className="h-7 text-xs bg-warning/10 hover:bg-warning/20 text-warning border border-warning/20 gap-1"
                >
                  <Crown className="w-3 h-3" /> Als Mitarbeiter des Monats
                </Button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}