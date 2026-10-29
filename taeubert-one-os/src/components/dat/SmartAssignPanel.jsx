import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, User, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

const MEDAL = ["🥇", "🥈", "🥉"];

const SCORE_COLOR = (score) => {
  if (score >= 85) return "text-success";
  if (score >= 65) return "text-warning";
  return "text-destructive";
};

const SCORE_BG = (score) => {
  if (score >= 85) return "bg-success/10 border-success/20";
  if (score >= 65) return "bg-warning/10 border-warning/20";
  return "bg-destructive/10 border-destructive/20";
};

export default function SmartAssignPanel({ tasks, scores, timeEntries, errorReports, vehicle, onAssign }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [assignments, setAssignments] = useState({});

  const buildContext = () => {
    const profiles = TEAM.map(emp => {
      const empEntries = (timeEntries || []).filter(e => e.employee === emp && e.status === "beendet");
      const totalMins = empEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
      const nacharbeitMins = empEntries.filter(e => e.activity === "nacharbeit").reduce((s, e) => s + (e.duration_minutes || 0), 0);
      const empErrors = (errorReports || []).filter(e => e.responsible === emp).length;
      const resolvedErrors = (errorReports || []).filter(e => e.responsible === emp && e.resolved).length;
      const nacharbeitPct = totalMins > 0 ? Math.round((nacharbeitMins / totalMins) * 100) : 0;
      const activities = [...new Set(empEntries.map(e => e.activity))];
      const empScore = (scores || []).filter(s => s.employee === emp).slice(-3);
      const avgQuality = empScore.length > 0 ? (empScore.reduce((s, e) => s + (e.quality_score || 0), 0) / empScore.length).toFixed(1) : "n/a";
      const avgProductivity = empScore.length > 0 ? (empScore.reduce((s, e) => s + (e.productivity_score || 0), 0) / empScore.length).toFixed(1) : "n/a";
      const isAzubi = emp === "Adrian";

      return {
        name: emp,
        totalHoursWorked: Math.round(totalMins / 60),
        nacharbeitPct,
        errorCount: empErrors,
        resolvedErrors,
        activities,
        avgQuality,
        avgProductivity,
        isAzubi,
        recentScores: empScore.map(s => ({ month: s.month, quality: s.quality_score, productivity: s.productivity_score, total: s.total_score })),
      };
    });

    const isPremium = vehicle && ["Porsche", "AMG", "Ferrari", "Lamborghini", "Maserati", "Bentley", "Rolls", "Aston"].some(
      b => vehicle.make?.toLowerCase().includes(b.toLowerCase())
    );

    return { profiles, tasks: tasks.map(t => ({ title: t.title, area: t.area, estimated_hours: t.estimated_hours, priority: t.priority })), vehicle: { make: vehicle?.make, model: vehicle?.model, isPremium } };
  };

  const analyze = async () => {
    setAnalyzing(true);
    const ctx = buildContext();

    const prompt = `Du bist ein intelligenter Produktionsleiter einer Premium-Karosserie & Lackiererei (Täubert).

Analysiere die folgenden Aufgaben und empfehle für jede Aufgabe die TOP 3 geeignetsten Mitarbeiter.

FAHRZEUG: ${ctx.vehicle.make} ${ctx.vehicle.model}${ctx.vehicle.isPremium ? " (PREMIUMFAHRZEUG)" : ""}

MITARBEITERPROFILE:
${ctx.profiles.map(p => `
- ${p.name}${p.isAzubi ? " [AZUBI]" : ""}:
  Gelernte Tätigkeiten: ${p.activities.join(", ") || "keine Daten"}
  Nacharbeitsquote: ${p.nacharbeitPct}%
  Fehlerberichte: ${p.errorCount} (davon ${p.resolvedErrors} gelöst)
  Ø Qualität (letzte Bewertungen): ${p.avgQuality}/10
  Ø Produktivität: ${p.avgProductivity}/10
  Gesamtstunden erfasst: ${p.totalHoursWorked}h
`).join("")}

AUFGABEN:
${ctx.tasks.map((t, i) => `${i + 1}. "${t.title}" | Bereich: ${t.area} | Zeit: ${t.estimated_hours}h | Priorität: ${t.priority}`).join("\n")}

WICHTIGE REGELN:
- Azubis (Adrian, Lena) NUR für einfache Aufgaben (Reinigung, Abkleben, Vorbereitung, Demontage einfach)
- Premiumfahrzeuge: bevorzuge Toni, Maik oder sehr erfahrene Mitarbeiter
- Bei hoher Nacharbeitsquote → Warnung ausgeben
- Berücksichtige Eignung nach Bereich: Karosserie→Maik/Marco, Lackierung→Toni/Pascal, Finish→Toni/Pascal, Demontage→alle, Vorbereitung→alle außer komplexes
- Gib für jeden Mitarbeiter eine Eignungsquote (0-100) und einen kurzen Grund an (max 1 Satz)
- Wenn ein Mitarbeiter keine passenden Tätigkeiten hat, gib niedrige Quote an

ANTWORTE NUR mit dem JSON-Objekt.`;

    const schema = {
      type: "object",
      properties: {
        task_suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              task_title: { type: "string" },
              is_premium: { type: "boolean" },
              team_note: { type: "string" },
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    employee: { type: "string" },
                    score: { type: "number" },
                    reason: { type: "string" },
                    warning: { type: "string" },
                    is_azubi_safe: { type: "boolean" }
                  }
                }
              }
            }
          }
        },
        overall_notes: { type: "string" },
        premium_warning: { type: "string" }
      }
    };

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
    });

    setSuggestions(result);
    setAnalyzing(false);
  };

  const handleAssign = (taskTitle, employee) => {
    setAssignments(prev => ({ ...prev, [taskTitle]: employee }));
    if (onAssign) onAssign(taskTitle, employee);
  };

  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="bg-card border border-primary/20 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-heading">5</div>
          <p className="font-semibold text-sm text-foreground">Intelligente Aufgabenverteilung</p>
          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Nur Toni/Meister</span>
        </div>
        <Button
          onClick={analyze}
          disabled={analyzing}
          size="sm"
          className="gap-2 text-xs h-8"
        >
          {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {analyzing ? "Analysiere..." : "Vorschläge"}
        </Button>
      </div>

      {analyzing && (
        <div className="text-center py-6">
          <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Analysiert Mitarbeiter, Auslastung und Eignung...</p>
          <p className="text-[10px] text-muted-foreground mt-1">Kann etwas dauern...</p>
        </div>
      )}

      <AnimatePresence>
        {suggestions && !analyzing && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {suggestions.premium_warning && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg text-xs text-warning">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {suggestions.premium_warning}
              </div>
            )}

            {(suggestions.task_suggestions || []).map((taskSug, ti) => {
              const isExpanded = expanded[ti] !== false;
              const assigned = assignments[taskSug.task_title];
              return (
                <div key={ti} className={`border rounded-xl overflow-hidden transition-all ${assigned ? "border-success/30 bg-success/5" : "border-border"}`}>
                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, [ti]: !isExpanded }))}
                    className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-all"
                  >
                    <div className="flex items-center gap-2 text-left">
                      {assigned ? <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" /> : <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                      <div>
                        <p className="text-xs font-semibold text-foreground leading-tight">{taskSug.task_title}</p>
                        {assigned && <p className="text-[10px] text-success">→ {assigned}</p>}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border/50 p-3 space-y-2">
                      {taskSug.team_note && (
                        <p className="text-[10px] text-muted-foreground flex items-start gap-1">
                          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />{taskSug.team_note}
                        </p>
                      )}
                      {(taskSug.suggestions || []).slice(0, 3).map((s, si) => (
                        <div key={si} className={`flex items-center gap-3 p-2.5 rounded-lg border ${SCORE_BG(s.score)}`}>
                          <span className="text-base leading-none">{MEDAL[si]}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-foreground">{s.employee}</p>
                              <span className={`text-[10px] font-heading font-bold ${SCORE_COLOR(s.score)}`}>{s.score}%</span>
                              {s.employee === "Adrian" && (
                                <span className="text-[8px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-medium">Azubi</span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{s.reason}</p>
                            {s.warning && (
                              <p className="text-[10px] text-warning mt-0.5 flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />{s.warning}
                              </p>
                            )}
                          </div>
                          <Select
                            value={assigned === s.employee ? s.employee : ""}
                            onValueChange={() => handleAssign(taskSug.task_title, s.employee)}
                          >
                            <SelectTrigger className="h-7 w-24 text-[10px] bg-secondary border-border">
                              <SelectValue placeholder="Zuweisen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={s.employee}>✓ Zuweisen</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}

                      <div className="flex items-center gap-2 pt-1">
                        <p className="text-[10px] text-muted-foreground flex-shrink-0">Manuell:</p>
                        <Select value={assigned || ""} onValueChange={(v) => handleAssign(taskSug.task_title, v)}>
                          <SelectTrigger className="h-7 text-[10px] bg-secondary border-border flex-1">
                            <SelectValue placeholder="Mitarbeiter wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {TEAM.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {suggestions.overall_notes && (
              <p className="text-[10px] text-muted-foreground flex items-start gap-1.5 pt-1">
                <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />{suggestions.overall_notes}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground">
                {Object.keys(assignments).length}/{tasks.length} zugewiesen
              </p>
              {Object.keys(assignments).length > 0 && (
                <p className="text-[10px] text-success font-medium">Zuweisung beim Freigeben übernommen</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}