import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  Loader2, Sparkles, Clock, Euro, Zap, CheckCircle2,
  AlertTriangle, Gauge, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import VehiclePipeline from "./VehiclePipeline";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];
const AZUBI = ["Adrian", "Lena"];
const HOURLY_RATE = 95;

const AREA_LABELS = {
  karosserie: "Karosserie", vorbereitung: "Vorbereitung", lackierung: "Lackierung",
  finish: "Finish", reinigung: "Reinigung", demontage: "Demontage",
  teile: "Teile", kunde: "Kunde", uebergabe: "Übergabe", lager: "Lager", sonstiges: "Sonstiges"
};

const AREA_COLORS = {
  karosserie: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  vorbereitung: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  lackierung: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  finish: "bg-green-500/10 text-green-400 border-green-500/20",
  reinigung: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  sonstiges: "bg-secondary text-muted-foreground border-border"
};

export default function VerteilungsWizard({
  tasks, vehicles, timeEntries, errorReports, scores, leaveRequests,
  onAssign, onUpdateHours
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [applying, setApplying] = useState(false);
  const [hourEdits, setHourEdits] = useState({});

  // Only unassigned open tasks
  const unassigned = useMemo(() =>
    tasks.filter(t => !t.assigned_to && t.status === "offen"),
    [tasks]
  );

  // Group by vehicle
  const byVehicle = useMemo(() => {
    const groups = {};
    unassigned.forEach(t => {
      const key = t.vehicle_id || "no-vehicle";
      if (!groups[key]) groups[key] = { vehicle: vehicles.find(v => v.id === t.vehicle_id), tasks: [] };
      groups[key].tasks.push(t);
    });
    return Object.values(groups);
  }, [unassigned, vehicles]);

  // Totals
  const totalHours = unassigned.reduce((s, t) => s + (hourEdits[t.id] ?? t.estimated_hours ?? 0), 0);
  const totalCost = totalHours * HOURLY_RATE;

  // Employee workload stats
  const empStats = useMemo(() => {
    const stats = {};
    TEAM.forEach(emp => {
      const empTasks = tasks.filter(t => t.assigned_to === emp && t.status !== "erledigt");
      const assignedHours = empTasks.reduce((s, t) => s + (t.estimated_hours || 0), 0);
      const empEntries = timeEntries.filter(e => e.employee === emp && e.status === "beendet");
      const totalMins = empEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
      const nacharbeitMins = empEntries.filter(e => e.activity === "nacharbeit").reduce((s, e) => s + (e.duration_minutes || 0), 0);
      const nacharbeitPct = totalMins > 0 ? Math.round((nacharbeitMins / totalMins) * 100) : 0;
      const empScores = scores.filter(s => s.employee === emp).slice(-3);
      const avgQuality = empScores.length > 0 ? (empScores.reduce((s, e) => s + (e.quality_score || 0), 0) / empScores.length) : 0;
      const today = new Date().toISOString().split("T")[0];
      const onLeave = leaveRequests.some(l => l.employee === emp && l.start_date <= today && l.end_date >= today);
      const activities = [...new Set(empEntries.map(e => e.activity))];
      stats[emp] = {
        emp, activeTasks: empTasks.length, assignedHours,
        nacharbeitPct, avgQuality, onLeave, isAzubi: AZUBI.includes(emp), activities
      };
    });
    return stats;
  }, [tasks, timeEntries, scores, leaveRequests]);

  // After suggestions: calculate projected workload
  const projectedHours = useMemo(() => {
    if (!suggestions) return null;
    const proj = {};
    TEAM.forEach(e => proj[e] = empStats[e]?.assignedHours || 0);
    Object.entries(suggestions).forEach(([taskId, employee]) => {
      const task = unassigned.find(t => t.id === taskId);
      const hrs = task ? (hourEdits[task.id] ?? task.estimated_hours ?? 0) : 0;
      proj[employee] = (proj[employee] || 0) + hrs;
    });
    return proj;
  }, [suggestions, unassigned, hourEdits, empStats]);

  const handleHourChange = (taskId, value) => {
    setHourEdits(prev => ({ ...prev, [taskId]: parseFloat(value) || 0 }));
  };

  const saveHour = (taskId) => {
    const hrs = hourEdits[taskId];
    if (hrs !== undefined && onUpdateHours) onUpdateHours(taskId, hrs);
  };

  const runAutoVerteilung = async () => {
    setAnalyzing(true);
    setSuggestions(null);

    const profiles = TEAM.map(emp => {
      const s = empStats[emp];
      return `- ${emp}${s.isAzubi ? " [AZUBI]" : ""}: ${s.activeTasks} aktive Aufg., ${s.assignedHours}h zugewiesen, Nacharbeit ${s.nacharbeitPct}%, Ø Qualität ${s.avgQuality.toFixed(1)}/10${s.onLeave ? ", URLAUB" : ""}, Erfahrungen: ${s.activities.join(", ") || "keine"}`;
    }).join("\n");

    const taskList = unassigned.map((t, i) => {
      const v = vehicles.find(v => v.id === t.vehicle_id);
      const hrs = hourEdits[t.id] ?? t.estimated_hours ?? 0;
      const isPremium = v && ["Porsche", "AMG", "Ferrari", "Lamborghini", "Maserati", "Bentley", "Aston"].some(
        b => v.make?.toLowerCase().includes(b.toLowerCase())
      );
      return `${i + 1}. ID:${t.id} | "${t.title}" | ${AREA_LABELS[t.category] || t.category} | ${hrs}h | ${t.priority}${isPremium ? " | PREMIUM" : ""}${v ? ` | ${v.make} ${v.model}` : ""}`;
    }).join("\n");

    const prompt = `Du bist der Produktionsleiter der Premium-Karosserie & Lackiererei Täubert.
Verteile ALLE folgenden Aufgaben optimal auf das Team, sodass Qualität maximiert und Auslastung balanciert wird.

REGELN:
- Azubis (Adrian, Lena) NUR für: Reinigung, Abkleben, einfache Vorbereitung, Demontage (einfach)
- Premium-Fahrzeuge → nur an Toni, Maik oder Mitarbeiter mit Qualität ≥ 8.0
- Jeder Mitarbeiter sollte max. 8 Stunden zugewiesene Arbeit haben (inkl. bestehender ${empStats})
- Bevorzuge Mitarbeiter mit niedriger Nacharbeitsquote und passender Erfahrung für den Bereich
- Karosserie → Maik/Marco, Lackierung → Toni/Pascal, Finish → Toni/Pascal/Fanny, Vorbereitung → alle, Demontage → alle
- Mitarbeiter im Urlaub dürfen NICHT zugewiesen werden
- Verteile so, dass niemand überlastet ist, aber alle ausgelastet sind

MITARBEITER:
${profiles}

AUFGABEN:
${taskList}

Gib für jede Aufgaben-ID den besten Mitarbeiter zurück. Maximal eine Aufgabe pro ID.`;

    const schema = {
      type: "object",
      properties: {
        assignments: {
          type: "array",
          items: {
            type: "object",
            properties: {
              task_id: { type: "string" },
              employee: { type: "string" },
              reason: { type: "string" },
              confidence: { type: "number" }
            }
          }
        },
        summary: { type: "string" },
        warnings: { type: "array", items: { type: "string" } },
        balance_ok: { type: "boolean" }
      }
    };

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt, response_json_schema: schema, model: "gpt_5_mini"
      });
      const map = {};
      (result.assignments || []).forEach(a => { map[a.task_id] = a.employee; });
      setSuggestions({ map, details: result.assignments || [], summary: result.summary, warnings: result.warnings, balanceOk: result.balance_ok });
    } catch (err) {
      toast.error("Verteilung fehlgeschlagen: " + err.message);
    }
    setAnalyzing(false);
  };

  const applyAll = async () => {
    setApplying(true);
    try {
      for (const [taskId, employee] of Object.entries(suggestions.map)) {
        await onAssign(taskId, employee);
      }
      toast.success(`${Object.keys(suggestions.map).length} Aufgaben verteilt!`);
      setSuggestions(null);
    } catch (err) {
      toast.error("Fehler beim Zuweisen: " + err.message);
    }
    setApplying(false);
  };

  const overrideAssign = (taskId, employee) => {
    setSuggestions(prev => ({ ...prev, map: { ...prev.map, [taskId]: employee } }));
  };

  if (unassigned.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Alle Aufgaben sind zugewiesen 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + Quick Kalkulation */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning" />
            <p className="font-heading text-sm text-foreground">SCHNELL-VERTEILUNG</p>
            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{unassigned.length} offen</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-chart-2" />
              <span className="font-heading text-foreground">{totalHours.toFixed(1)}h</span>
              <span className="text-muted-foreground">gesamt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Euro className="w-3.5 h-3.5 text-success" />
              <span className="font-heading text-foreground">{totalCost.toLocaleString("de-DE")}</span>
              <span className="text-muted-foreground">({HOURLY_RATE}€/h)</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            onClick={runAutoVerteilung}
            disabled={analyzing}
            className="flex-1 gap-2 h-10"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {analyzing ? "Analysiere Team & Aufgaben..." : "Auto-Verteilung starten"}
          </Button>
          {suggestions && (
            <>
              <Button
                onClick={applyAll}
                disabled={applying}
                className="gap-2 h-10 bg-success/20 hover:bg-success/30 text-success border border-success/30"
              >
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Alle bestätigen ({Object.keys(suggestions.map).length})
              </Button>
              <Button
                onClick={() => setSuggestions(null)}
                variant="outline"
                size="icon"
                className="h-10 w-10 border-border"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {suggestions?.summary && (
          <div className="mt-3 p-2.5 bg-secondary border border-border rounded-lg">
            <p className="text-[11px] text-muted-foreground">{suggestions.summary}</p>
          </div>
        )}
        {suggestions?.warnings?.length > 0 && (
          <div className="mt-2 space-y-1">
            {suggestions.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-warning">
                <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />{w}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks grouped by vehicle */}
      <div className="space-y-3">
        {byVehicle.map(group => {
          const v = group.vehicle;
          const isPremium = v && ["Porsche", "AMG", "Ferrari", "Lamborghini", "Maserati", "Bentley", "Aston"].some(
            b => v.make?.toLowerCase().includes(b.toLowerCase())
          );
          return (
            <div key={group.vehicle?.id || "no-vehicle"} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Vehicle header */}
              <div className="px-4 py-2.5 bg-secondary border-b border-border flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {v ? `${v.make} ${v.model}` : "Ohne Fahrzeug"}
                  </span>
                  {v && <span className="text-[10px] text-muted-foreground">{v.license_plate}</span>}
                  {isPremium && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 font-medium">PREMIUM</span>
                  )}
                  {v?.responsible && (
                    <span className="text-[9px] text-muted-foreground">· {v.responsible}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {v && <VehiclePipeline vehicle={v} />}
                  <span className="text-[10px] text-muted-foreground">{group.tasks.length} Aufgabe{group.tasks.length !== 1 ? "n" : ""}</span>
                </div>
              </div>

              {/* Tasks */}
              <div className="divide-y divide-border/50">
                {group.tasks.map(task => {
                  const hrs = hourEdits[task.id] ?? task.estimated_hours ?? 0;
                  const suggestedEmp = suggestions?.map[task.id];
                  const detail = suggestions?.details?.find(d => d.task_id === task.id);
                  const empS = suggestedEmp ? empStats[suggestedEmp] : null;

                  return (
                    <div key={task.id} className="p-3 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        {/* Category badge */}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${AREA_COLORS[task.category] || AREA_COLORS.sonstiges}`}>
                          {AREA_LABELS[task.category] || task.category}
                        </span>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{task.title}</p>
                          {task.priority === "kritisch" && (
                            <span className="text-[9px] text-destructive">⚠ Kritisch</span>
                          )}
                        </div>

                        {/* Hour input */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Input
                            type="number"
                            step="0.25"
                            min="0"
                            value={hrs || ""}
                            onChange={e => handleHourChange(task.id, e.target.value)}
                            onBlur={() => saveHour(task.id)}
                            placeholder="0"
                            className="w-14 h-7 text-xs text-center bg-secondary border-border"
                          />
                          <span className="text-[10px] text-muted-foreground">h</span>
                        </div>

                        {/* Cost */}
                        <div className="flex-shrink-0 w-16 text-right">
                          <p className="text-xs font-heading text-success">{(hrs * HOURLY_RATE).toFixed(0)}€</p>
                        </div>

                        {/* Suggested employee or manual assign */}
                        {suggestedEmp ? (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success/10 border border-success/20">
                              <span className={`w-1.5 h-1.5 rounded-full ${empS?.onLeave ? "bg-muted-foreground" : "bg-success"}`} />
                              <span className="text-xs font-medium text-foreground">{suggestedEmp}</span>
                              {detail?.confidence && (
                                <span className="text-[9px] text-muted-foreground">{detail.confidence}%</span>
                              )}
                            </div>
                            <select
                              value={suggestedEmp}
                              onChange={e => overrideAssign(task.id, e.target.value)}
                              className="h-7 text-[10px] bg-secondary border border-border rounded px-1"
                            >
                              <option value={suggestedEmp}>✓ {suggestedEmp}</option>
                              {TEAM.filter(e => e !== suggestedEmp && !empStats[e]?.onLeave).map(e => (
                                <option key={e} value={e}>{e}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-20 text-right">
                            <span className="text-[10px] text-muted-foreground">
                              {analyzing ? "..." : ""}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Reason */}
                      {detail?.reason && (
                        <p className="text-[10px] text-muted-foreground mt-1 ml-8">{detail.reason}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Team balance after suggestion */}
      {projectedHours && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-4 h-4 text-chart-2" />
            <p className="font-heading text-sm text-foreground">TEAM-AUSLASTUNG NACH VERTEILUNG</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TEAM.map(emp => {
              const proj = projectedHours[emp] || 0;
              const s = empStats[emp];
              const pct = Math.min(100, (proj / 8) * 100);
              const overloaded = proj > 8;
              return (
                <div key={emp} className={`p-2.5 rounded-lg border ${overloaded ? "bg-destructive/5 border-destructive/20" : "bg-secondary border-border"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-foreground">
                      {emp}
                      {s.isAzubi && <span className="text-[8px] text-muted-foreground ml-1">[A]</span>}
                    </p>
                    {s.onLeave && <span className="text-[8px] text-muted-foreground">Urlaub</span>}
                  </div>
                  <p className={`font-heading text-lg ${overloaded ? "text-destructive" : proj > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {proj.toFixed(1)}h
                  </p>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${overloaded ? "bg-destructive" : pct > 60 ? "bg-warning" : "bg-success"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex gap-2 mt-1 text-[9px] text-muted-foreground">
                    <span>{s.activeTasks} Aufg.</span>
                    {s.nacharbeitPct > 0 && <span className={s.nacharbeitPct > 15 ? "text-warning" : ""}>NA {s.nacharbeitPct}%</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}