import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, AlertTriangle, Loader2, ClipboardCheck, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// SOP-basierte Checklisten je Stage
const SOP_CHECKLISTS = {
  annahme: {
    label: "Fahrzeugannahme",
    icon: "🚗",
    responsible: ["Lena", "Toni"],
    items: [
      "Kunde freundlich begrüßt",
      "Schäden gemeinsam geprüft",
      "Vorschäden dokumentiert",
      "Felgen geprüft",
      "Scheiben geprüft",
      "Innenraum geprüft",
      "Kilometerstand notiert",
      "Foto vorne aufgenommen",
      "Foto hinten aufgenommen",
      "Foto links aufgenommen",
      "Foto rechts aufgenommen",
      "Schadensfoto aufgenommen",
      "Innenraumfoto aufgenommen",
      "Kundenwünsche dokumentiert",
      "Fahrzeug digital angelegt (Kennzeichen, VIN, Versicherung)",
    ],
  },
  vorbereitung: {
    label: "Vorbereitung",
    icon: "⚡",
    responsible: ["Fanny", "Pascal", "Adrian"],
    items: [
      "Fahrzeug gereinigt",
      "Schleifkörnung korrekt gewählt",
      "Schleifbild gleichmäßig — keine Kanten",
      "Übergänge weich ausgelaufen",
      "Lichtkontrolle Schleifbild bestanden",
      "Füllern aufgetragen",
      "Trocknungszeit eingehalten",
      "Oberfläche nach Füller kontrolliert",
      "Staubfreiheit sichergestellt",
      "Abklebung sauber und vollständig",
    ],
  },
  lackierung: {
    label: "Lackierung",
    icon: "🎨",
    responsible: ["Toni"],
    items: [
      "Fahrzeug gereinigt vor Lackierung",
      "Farbton geprüft (Farbcode abgeglichen)",
      "Material vorbereitet",
      "Kabine auf Staub kontrolliert",
      "Schichtaufbau korrekt",
      "Verlauf und Struktur geprüft",
      "Keine Läufer / Einschlüsse",
      "Übergänge sauber und unsichtbar",
      "Klarlack Ruhe geprüft",
      "Oberfläche nach Lackierung freigegeben",
    ],
  },
  finish: {
    label: "Finish",
    icon: "✨",
    responsible: ["Pascal", "Toni"],
    items: [
      "Staubeinschlüsse entfernt",
      "Läufer beseitigt",
      "Politur vollständig durchgeführt",
      "Hologramme geprüft — keine vorhanden",
      "Schleifspuren beseitigt",
      "Glanzgrad einheitlich",
      "Farbton stimmt überein",
      "Lichtkontrolle bestanden",
      "Übergänge unsichtbar",
      "Kunststoffteile gepflegt",
      "Politurreste entfernt",
    ],
  },
  endkontrolle: {
    label: "Endkontrolle",
    icon: "🔍",
    responsible: ["Toni"],
    items: [
      "Lackoberfläche — keine Läufer / Einschlüsse",
      "Farbton stimmt überein",
      "Glanzgrad einheitlich",
      "Keine Hologramme / Schleifspuren",
      "Übergänge sauber und unsichtbar",
      "Spaltmaße korrekt",
      "Anbauteile korrekt montiert",
      "Keine Dellen oder Beulen sichtbar",
      "Dichtungen korrekt eingesetzt",
      "Außenreinigung durchgeführt",
      "Innenreinigung durchgeführt",
      "Scheiben gereinigt",
      "Felgen gereinigt",
      "Schutzfolien entfernt",
      "Fahrzeugschlüssel vollständig",
      "Rechnung / Kostenaufstellung erstellt",
    ],
  },
  uebergabe: {
    label: "Kundenübergabe",
    icon: "🏆",
    responsible: ["Toni", "Lena"],
    items: [
      "Fahrzeug sauber positioniert",
      "Schlüssel vorbereitet",
      "Alle Arbeiten laut Auftrag abgeschlossen",
      "Qualitätskontrolle abgezeichnet",
      "Endkontrolle abgezeichnet",
      "Fotos nach Fertigstellung gemacht",
      "Durchgeführte Arbeiten erklärt",
      "Zusatzarbeiten erläutert",
      "Pflegehinweise gegeben",
      "Kundenzufriedenheit abgefragt",
      "Rechnung ausgehändigt",
      "Fahrzeugpapiere übergeben",
    ],
  },
};

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

const ERROR_CATEGORIES = [
  { value: "hologramme", label: "Hologramme" },
  { value: "durchpoliert", label: "Durchpoliert" },
  { value: "staub", label: "Staub" },
  { value: "farbton", label: "Farbtonfehler" },
  { value: "uebergaenge", label: "Übergänge" },
  { value: "laeufer", label: "Läufer" },
  { value: "schleifbild", label: "Schleifbild" },
  { value: "einschluesse", label: "Einschlüsse" },
  { value: "sonstiges", label: "Sonstiges" },
];

// Live Checklist Component for one stage
function LiveChecklist({ vehicle, stage, stageConfig, inspector, onComplete }) {
  const queryClient = useQueryClient();
  const [checks, setChecks] = useState(
    stageConfig.items.map(item => ({ item, checked: false, hasError: false, errorNote: "" }))
  );
  const [errorModal, setErrorModal] = useState(null); // { index, item }
  const [errorForm, setErrorForm] = useState({ category: "sonstiges", description: "", severity: "mittel" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const createErrorReport = useMutation({
    mutationFn: (data) => base44.entities.ErrorReport.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["errorReports"] }),
  });

  const createQualityCheck = useMutation({
    mutationFn: (data) => base44.entities.QualityCheck.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualityChecks"] });
      setSubmitted(true);
      if (onComplete) onComplete();
    },
  });

  const toggle = (i) => {
    setChecks(prev => prev.map((c, idx) => idx === i ? { ...c, checked: !c.checked } : c));
  };

  const markError = (i) => {
    setErrorModal({ index: i, item: checks[i].item });
    setErrorForm({ category: "sonstiges", description: "", severity: "mittel" });
  };

  const confirmError = async () => {
    const i = errorModal.index;
    // Create error report
    await createErrorReport.mutateAsync({
      vehicle_id: vehicle.id,
      vehicle_info: `${vehicle.make} ${vehicle.model} - ${vehicle.license_plate}`,
      category: errorForm.category,
      description: `Checkliste ${stageConfig.label}: ${checks[i].item}. ${errorForm.description}`,
      responsible: inspector,
      stage,
      severity: errorForm.severity,
    });
    // Mark item as error
    setChecks(prev => prev.map((c, idx) => idx === i ? { ...c, hasError: true, errorNote: errorForm.description } : c));
    setErrorModal(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const allChecked = checks.every(c => c.checked || c.hasError);
    const hasErrors = checks.some(c => c.hasError);

    await createQualityCheck.mutateAsync({
      vehicle_id: vehicle.id,
      vehicle_info: `${vehicle.make} ${vehicle.model} - ${vehicle.license_plate}`,
      stage: stage === "annahme" ? "vorbereitung" : stage,
      inspector,
      checklist: checks.map(c => ({ item: c.item, checked: c.checked, comment: c.errorNote })),
      status: hasErrors ? "nacharbeit" : allChecked ? "bestanden" : "offen",
      approved: !hasErrors && allChecked,
      comments: `SOP-Checkliste ${stageConfig.label}. Fehler: ${checks.filter(c => c.hasError).length}`,
    });
    setSubmitting(false);
  };

  const doneCount = checks.filter(c => c.checked || c.hasError).length;
  const errorCount = checks.filter(c => c.hasError).length;
  const progress = Math.round((doneCount / checks.length) * 100);

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-success/30 rounded-xl p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
        <p className="font-heading text-lg text-foreground">Checkliste abgeschlossen</p>
        <p className="text-sm text-muted-foreground mt-1">
          {doneCount} Punkte · {errorCount > 0 ? `${errorCount} Fehler gemeldet` : "Keine Fehler"}
        </p>
        {errorCount > 0 && (
          <p className="text-xs text-warning mt-2 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> {errorCount} Fehlerberichte wurden automatisch erstellt
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-foreground">{doneCount}/{checks.length} Punkte</p>
          <div className="flex gap-2 text-xs">
            {errorCount > 0 && (
              <span className="text-destructive flex items-center gap-1">
                <XCircle className="w-3 h-3" />{errorCount} Fehler
              </span>
            )}
            <span className="text-muted-foreground">{progress}%</span>
          </div>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {checks.map((check, i) => (
          <motion.div key={i} layout
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all
              ${check.hasError ? "bg-destructive/5 border-destructive/20" :
                check.checked ? "bg-success/5 border-success/20" : "bg-card border-border"}`}>
            {/* Checkbox */}
            <button
              onClick={() => !check.hasError && toggle(i)}
              disabled={check.hasError}
              className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
                ${check.hasError ? "border-destructive bg-destructive/10" :
                  check.checked ? "border-success bg-success" : "border-border hover:border-primary"}`}
            >
              {check.hasError ? <XCircle className="w-3 h-3 text-destructive" /> :
                check.checked ? <CheckCircle2 className="w-3 h-3 text-white" /> : null}
            </button>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm transition-all ${
                check.hasError ? "text-destructive" :
                check.checked ? "text-muted-foreground line-through" : "text-foreground"
              }`}>
                {check.item}
              </p>
              {check.errorNote && (
                <p className="text-[10px] text-destructive mt-0.5">{check.errorNote}</p>
              )}
            </div>

            {/* Error Button */}
            {!check.checked && !check.hasError && (
              <button onClick={() => markError(i)}
                className="flex-shrink-0 p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all"
                title="Fehler melden">
                <AlertTriangle className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={submitting || doneCount === 0}
        className="w-full h-11 font-heading tracking-wide gap-2"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
        {submitting ? "Wird gespeichert..." : `CHECKLISTE ABSCHLIESSEN (${doneCount}/${checks.length})`}
      </Button>

      {/* Error Modal */}
      <AnimatePresence>
        {errorModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-destructive/30 rounded-xl p-5 w-full max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Fehler melden</p>
                  <p className="text-[10px] text-muted-foreground">{errorModal.item}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Fehlerkategorie</label>
                  <Select value={errorForm.category} onValueChange={v => setErrorForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ERROR_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Schweregrad</label>
                  <Select value={errorForm.severity} onValueChange={v => setErrorForm(p => ({ ...p, severity: v }))}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="niedrig">Niedrig</SelectItem>
                      <SelectItem value="mittel">Mittel</SelectItem>
                      <SelectItem value="hoch">Hoch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Beschreibung (optional)</label>
                  <Textarea
                    placeholder="Was genau ist das Problem?"
                    value={errorForm.description}
                    onChange={e => setErrorForm(p => ({ ...p, description: e.target.value }))}
                    className="bg-secondary border-border text-sm h-20"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setErrorModal(null)} className="flex-1 h-9 text-sm">
                  Abbrechen
                </Button>
                <Button onClick={confirmError} className="flex-1 h-9 text-sm bg-destructive hover:bg-destructive/90 gap-2">
                  {createErrorReport.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Fehler melden
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main Page
export default function ChecklistRunner() {
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [inspector, setInspector] = useState("");
  const [activeChecklist, setActiveChecklist] = useState(false);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-checklist"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 100),
  });

  const { data: recentChecks = [] } = useQuery({
    queryKey: ["qualityChecks-recent"],
    queryFn: () => base44.entities.QualityCheck.list("-created_date", 20),
  });

  const vehicle = vehicles.find(v => v.id === selectedVehicle);
  const stageConfig = SOP_CHECKLISTS[selectedStage];

  const canStart = selectedVehicle && selectedStage && inspector;

  const stageStatusConfig = {
    offen: "text-warning bg-warning/10 border-warning/20",
    bestanden: "text-success bg-success/10 border-success/20",
    nacharbeit: "text-destructive bg-destructive/10 border-destructive/20",
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">ECHTZEIT-CHECKLISTEN</h1>
        <p className="text-sm text-muted-foreground mt-1">SOP-basiert · direkt am Fahrzeug · Fehler sofort melden</p>
      </motion.div>

      {!activeChecklist ? (
        <div className="space-y-5">
          {/* Setup */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">CHECKLISTE STARTEN</p>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">Fahrzeug *</label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Fahrzeug wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.filter(v => v.status !== "uebergabe").map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      🚗 {v.make} {v.model} – {v.license_plate}
                      {v.customer_name ? ` (${v.customer_name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">SOP / Prüfstufe *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(SOP_CHECKLISTS).map(([key, cfg]) => (
                  <button key={key} onClick={() => setSelectedStage(key)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all
                      ${selectedStage === key ? "bg-primary/10 border-primary text-foreground" : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-border/80"}`}>
                    <span className="text-lg leading-none">{cfg.icon}</span>
                    <div>
                      <p className="text-xs font-medium">{cfg.label}</p>
                      <p className="text-[10px] text-muted-foreground">{cfg.items.length} Punkte</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">Prüfer / Mitarbeiter *</label>
              <Select value={inspector} onValueChange={setInspector}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Mitarbeiter wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {TEAM.map(emp => <SelectItem key={emp} value={emp}>{emp}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {canStart && stageConfig && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-muted-foreground">
                <span className="text-foreground font-medium">{stageConfig.icon} {stageConfig.label}</span> ·{" "}
                {stageConfig.items.length} Prüfpunkte · Verantwortlich: {stageConfig.responsible.join(", ")}
              </div>
            )}

            <Button onClick={() => setActiveChecklist(true)} disabled={!canStart}
              className="w-full h-11 font-heading tracking-wide gap-2">
              <ClipboardCheck className="w-4 h-4" />
              CHECKLISTE STARTEN
            </Button>
          </div>

          {/* Recent Checks */}
          {recentChecks.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">LETZTE PRÜFUNGEN</p>
              <div className="space-y-2">
                {recentChecks.slice(0, 8).map(check => (
                  <div key={check.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{check.vehicle_info || "–"}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {SOP_CHECKLISTS[check.stage]?.label || check.stage} · {check.inspector || "–"}
                        {check.checklist?.length > 0 && ` · ${check.checklist.filter(c => c.checked).length}/${check.checklist.length}`}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${stageStatusConfig[check.status] || stageStatusConfig.offen}`}>
                      {check.status === "bestanden" ? "✓ Bestanden" : check.status === "nacharbeit" ? "✗ Nacharbeit" : "Offen"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">{stageConfig?.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{stageConfig?.label}</p>
              <p className="text-xs text-muted-foreground">
                🚗 {vehicle?.make} {vehicle?.model} – {vehicle?.license_plate} · Prüfer: {inspector}
              </p>
            </div>
            <button onClick={() => { setActiveChecklist(false); setSelectedStage(""); }}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:border-border/80 transition-all">
              ✕ Abbrechen
            </button>
          </div>

          <LiveChecklist
            vehicle={vehicle}
            stage={selectedStage}
            stageConfig={stageConfig}
            inspector={inspector}
            onComplete={() => setTimeout(() => setActiveChecklist(false), 2000)}
          />
        </div>
      )}
    </div>
  );
}