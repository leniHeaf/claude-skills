import React from "react";
import { motion } from "framer-motion";
import { Sun, Target, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const STAGE_LABELS = {
  annahme: "Annahme", teile_bestellt: "Teile bestellt", demontage: "Demontage",
  karosserie: "Karosserie", vorbereitung: "Vorbereitung", lackierung: "Lackierung",
  finish: "Finish", endkontrolle: "Endkontrolle", uebergabe: "Übergabe"
};

export default function Morgenstart({ vehicles, tasks, employee }) {
  const today = new Date();
  
  const employeeVehicles = vehicles.filter(v => 
    v.responsible === employee || v.condition === "problem"
  );

  const employeeTasks = tasks.filter(t => 
    t.assigned_to === employee && t.status !== "erledigt"
  );

  const priorities = {
    critical: employeeVehicles.filter(v => v.condition === "problem" || v.priority === "sofort"),
    high: employeeVehicles.filter(v => v.priority === "hoch"),
    normal: employeeVehicles.filter(v => v.priority === "normal" || !v.priority),
  };

  const todaysGoals = [
    { id: 1, text: "Alle Problem-Fahrzeuge priorisieren", done: priorities.critical.length === 0 },
    { id: 2, text: `Offene Aufgaben bearbeiten (${employeeTasks.length})`, done: employeeTasks.length === 0 },
    { id: 3, text: "Qualitätsstandards einhalten", done: false },
    { id: 4, text: "Materialverbrauch dokumentieren", done: false },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
          <Sun className="w-5 h-5 text-warning" />
        </div>
        <div>
          <p className="font-heading text-sm text-foreground">DIGITALER MORGENSTART</p>
          <p className="text-xs text-muted-foreground">{format(today, "EEEE, dd. MMMM yyyy")}</p>
        </div>
      </div>

      {/* Begrüßung */}
      <div className="mb-5 p-4 bg-gradient-to-r from-warning/10 to-warning/5 rounded-xl border border-warning/20">
        <p className="text-sm text-muted-foreground">Guten Morgen,</p>
        <p className="text-lg font-heading text-foreground">{employee || "Team"}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-foreground">
              {priorities.critical.length + priorities.high.length} Prioritäts-Fahrzeuge
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs text-foreground">
              {employeeTasks.length} Aufgaben offen
            </span>
          </div>
        </div>
      </div>

      {/* Heutige Fahrzeuge */}
      <div className="mb-5">
        <p className="text-xs font-medium text-foreground mb-3">HEUTIGE FAHRZEUGE</p>
        
        {priorities.critical.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-xs font-bold text-destructive">KRITISCH</span>
            </div>
            <div className="space-y-2">
              {priorities.critical.map(v => (
                <div key={v.id} className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
                  <p className="text-xs font-medium text-foreground">
                    {v.make} {v.model}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{v.license_plate}</p>
                  <p className="text-[10px] text-destructive mt-1">
                    {STAGE_LABELS[v.status]} • Problem markiert
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {priorities.high.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-warning" />
              <span className="text-xs font-bold text-warning">HOHE PRIORITÄT</span>
            </div>
            <div className="space-y-2">
              {priorities.high.slice(0, 3).map(v => (
                <div key={v.id} className="p-3 bg-warning/10 border border-warning/30 rounded-xl">
                  <p className="text-xs font-medium text-foreground">
                    {v.make} {v.model}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{v.license_plate}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {STAGE_LABELS[v.status]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {priorities.normal.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-xs font-medium text-success">NORMAL</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {priorities.normal.length} weitere Fahrzeuge
            </p>
          </div>
        )}
      </div>

      {/* Offene Aufgaben */}
      {employeeTasks.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-medium text-foreground mb-3">OFFENE AUFGABEN</p>
          <div className="space-y-2">
            {employeeTasks.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-3 p-2 bg-secondary rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  t.priority === "kritisch" ? "bg-destructive" :
                  t.priority === "hoch" ? "bg-warning" : "bg-success"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{t.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t.vehicle_info || "Allgemein"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tagesziele */}
      <div>
        <p className="text-xs font-medium text-foreground mb-3">TAGESZIELE</p>
        <div className="space-y-2">
          {todaysGoals.map(goal => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                goal.done ? "bg-success/10 border-success/30" : "bg-secondary border-border"
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                goal.done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {goal.done ? <CheckCircle className="w-3 h-3" /> : <span className="text-[10px]">{goal.id}</span>}
              </div>
              <span className={`text-xs ${
                goal.done ? "text-success line-through" : "text-foreground"
              }`}>
                {goal.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}