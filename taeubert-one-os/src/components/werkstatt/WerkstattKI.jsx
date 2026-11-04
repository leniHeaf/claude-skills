import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, AlertTriangle, TrendingUp, Clock, User, Zap } from "lucide-react";
import { differenceInMinutes, parseISO } from "date-fns";

const STAGE_LABELS = {
  annahme: "Annahme", teile_bestellt: "Teile bestellt", demontage: "Demontage",
  karosserie: "Karosserie", vorbereitung: "Vorbereitung", lackierung: "Lackierung",
  finish: "Finish", endkontrolle: "Endkontrolle", uebergabe: "Übergabe"
};

const TARGET_TIMES = {
  annahme: 30, teile_bestellt: 1440, demontage: 240, karosserie: 480,
  vorbereitung: 360, lackierung: 180, finish: 240, endkontrolle: 60, uebergabe: 30
};

export default function WerkstattKI({ vehicles, tasks, timeEntries }) {
  const insights = useMemo(() => {
    const alerts = [];
    const activeVehicles = vehicles.filter(v => 
      ["annahme", "demontage", "karosserie", "vorbereitung", "lackierung", "finish", "endkontrolle", "uebergabe"].includes(v.status)
    );

    // 1. Zeitverlust-Analyse
    activeVehicles.forEach(v => {
      if (v.created_date) {
        const minsInStage = differenceInMinutes(new Date(), parseISO(v.created_date));
        const targetMins = TARGET_TIMES[v.status] || 240;
        
        if (minsInStage > targetMins * 1.5) {
          alerts.push({
            type: "time_loss",
            severity: "high",
            vehicle: v,
            message: `${v.make} ${v.model} (${v.license_plate}) überschreitet Zielzeit um ${Math.round((minsInStage - targetMins) / 60)}h`,
            stage: v.status,
            recommendation: "Priorität prüfen oder Ressourcen aufstocken"
          });
        }
      }
    });

    // 2. Engpass-Erkennung
    const stageCounts = {};
    activeVehicles.forEach(v => {
      stageCounts[v.status] = (stageCounts[v.status] || 0) + 1;
    });

    Object.entries(stageCounts).forEach(([stage, count]) => {
      const capacity = stage === "vorbereitung" ? 6 : stage === "finish" ? 6 : 4;
      if (count > capacity) {
        alerts.push({
          type: "bottleneck",
          severity: "critical",
          stage,
          message: `${STAGE_LABELS[stage]}: ${count} Fahrzeuge (Kapazität: ${capacity})`,
          recommendation: "Fahrzeuge auf andere Bereiche umleiten"
        });
      }
    });

    // 3. Mitarbeiter-Überlastung
    const employeeTasks = {};
    tasks.filter(t => t.status !== "erledigt").forEach(t => {
      if (t.assigned_to) {
        employeeTasks[t.assigned_to] = (employeeTasks[t.assigned_to] || 0) + 1;
      }
    });

    Object.entries(employeeTasks).forEach(([employee, count]) => {
      if (count > 5) {
        alerts.push({
          type: "overload",
          severity: "medium",
          employee,
          message: `${employee} hat ${count} offene Aufgaben`,
          recommendation: "Aufgaben umverteilen"
        });
      }
    });

    // 4. Qualitätsrisiko
    vehicles.filter(v => v.condition === "problem").forEach(v => {
      alerts.push({
        type: "quality_risk",
        severity: "high",
        vehicle: v,
        message: `${v.make} ${v.model} hat Qualitätsproblem markiert`,
        recommendation: "Zusätzliche Qualitätskontrolle erforderlich"
      });
    });

    // 5. Stau-Erkennung
    const waitingForParts = activeVehicles.filter(v => v.status === "teile_bestellt");
    if (waitingForParts.length > 3) {
      alerts.push({
        type: "parts_delay",
        severity: "medium",
        message: `${waitingForParts.length} Fahrzeuge warten auf Teile`,
        recommendation: "Teilelieferung nachverfolgen"
      });
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return alerts.slice(0, 10); // Top 10 alerts
  }, [vehicles, tasks, timeEntries]);

  const criticalCount = insights.filter(i => i.severity === "critical").length;
  const highCount = insights.filter(i => i.severity === "high").length;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-heading text-sm text-foreground">WERKSTATT-ASSISTENT</p>
          <p className="text-xs text-muted-foreground">Intelligente Prozess-Analyse</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-destructive/10 rounded-lg p-3 text-center border border-destructive/30">
          <p className="text-2xl font-heading text-destructive">{criticalCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Kritisch</p>
        </div>
        <div className="bg-warning/10 rounded-lg p-3 text-center border border-warning/30">
          <p className="text-2xl font-heading text-warning">{highCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Hoch</p>
        </div>
        <div className="bg-secondary rounded-lg p-3 text-center">
          <p className="text-2xl font-heading text-foreground">{insights.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Gesamt</p>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-4 rounded-xl border ${
              insight.severity === "critical" ? "bg-destructive/10 border-destructive/50" :
              insight.severity === "high" ? "bg-warning/10 border-warning/50" :
              "bg-secondary border-border"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                insight.severity === "critical" ? "bg-destructive text-destructive-foreground" :
                insight.severity === "high" ? "bg-warning text-warning-foreground" :
                "bg-info/20 text-info"
              }`}>
                {insight.type === "time_loss" && <Clock className="w-4 h-4" />}
                {insight.type === "bottleneck" && <AlertTriangle className="w-4 h-4" />}
                {insight.type === "overload" && <User className="w-4 h-4" />}
                {insight.type === "quality_risk" && <Zap className="w-4 h-4" />}
                {insight.type === "parts_delay" && <TrendingUp className="w-4 h-4" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{insight.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  💡 {insight.recommendation}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {insights.length === 0 && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Alles im grünen Bereich</p>
            <p className="text-xs text-muted-foreground mt-1">Keine Probleme erkannt</p>
          </div>
        )}
      </div>
    </div>
  );
}