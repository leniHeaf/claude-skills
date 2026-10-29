import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Lock, CheckCircle, XCircle, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// The Gate system — every stage has non-negotiable criteria that must be cleared before progression
const GATES = {
  vorbereitung: {
    label: "Vorbereitung-Gate",
    nextStage: "lackierung",
    nextLabel: "Lackierung",
    color: "text-warning border-warning/30 bg-warning/10",
    criteria: [
      "Oberfläche vollständig geschliffen",
      "Schleifbild geprüft und freigegeben",
      "Spaltmaße kontrolliert",
      "Grundierung aufgetragen",
      "Reinigung nach Schleifen durchgeführt",
      "Abklebung korrekt",
      "Qualitätsprüfung Vorbereitung bestanden",
    ],
  },
  lackierung: {
    label: "Lackierungs-Gate",
    nextStage: "finish",
    nextLabel: "Finish",
    color: "text-info border-info/30 bg-info/10",
    criteria: [
      "Farbton korrekt gemischt und gematcht",
      "Gleichmäßiger Lackauftrag",
      "Keine Läufer sichtbar",
      "Keine Einschlüsse / Staubteilchen",
      "Übergänge sauber",
      "Klarlack aufgetragen",
      "Trocknungszeit eingehalten",
    ],
  },
  finish: {
    label: "Finish-Gate",
    nextStage: "endkontrolle",
    nextLabel: "Endkontrolle",
    color: "text-chart-2 border-chart-2/30 bg-chart-2/10",
    criteria: [
      "Vollständig poliert",
      "Keine Hologramme",
      "Keine Schleifspuren",
      "Anbauteile korrekt montiert",
      "Spaltmaße korrekt",
      "Fahrzeug innen gereinigt",
      "Fahrzeug außen gereinigt",
    ],
  },
  endkontrolle: {
    label: "Endkontroll-Gate",
    nextStage: "uebergabe",
    nextLabel: "Übergabe",
    color: "text-success border-success/30 bg-success/10",
    criteria: [
      "Alle Arbeiten lückenlos abgeschlossen",
      "Qualitätsstandard Täubert erfüllt",
      "Fotodokumentation vollständig",
      "Fahrzeug übergabefertig gereinigt",
      "Übergabedokumente bereit",
      "Kunde informiert",
    ],
  },
};

function GateCard({ vehicle, gate, gateKey, onApprove }) {
  const [checks, setChecks] = useState(
    gate.criteria.reduce((acc, c) => ({ ...acc, [c]: false }), {})
  );
  const [expanded, setExpanded] = useState(false);
  const allChecked = Object.values(checks).every(Boolean);

  return (
    <motion.div
      layout
      className={`border rounded-xl overflow-hidden ${allChecked ? "border-success/40" : "border-border"}`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <div className={`p-2 rounded-lg text-xs font-heading ${gate.color}`}>
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <Link
              to={`/vehicles/${vehicle.id}`}
              onClick={e => e.stopPropagation()}
              className="text-sm font-heading text-foreground hover:text-primary transition-colors"
            >
              {vehicle.make} {vehicle.model}
            </Link>
            <p className="text-xs text-muted-foreground">{vehicle.license_plate} · {gate.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {Object.values(checks).filter(Boolean).length}/{gate.criteria.length}
          </span>
          {allChecked ? (
            <CheckCircle className="w-4 h-4 text-success" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
        </div>
      </button>

      {/* Checklist */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 bg-card border-t border-border space-y-2">
              {gate.criteria.map(criterion => (
                <button
                  key={criterion}
                  onClick={() => setChecks(c => ({ ...c, [criterion]: !c[criterion] }))}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all
                    ${checks[criterion] ? "bg-success/10" : "bg-secondary hover:bg-secondary/80"}`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors
                    ${checks[criterion] ? "bg-success border-success" : "border-border"}`}>
                    {checks[criterion] && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${checks[criterion] ? "text-foreground" : "text-muted-foreground"}`}>
                    {criterion}
                  </span>
                </button>
              ))}

              {/* Gate Action */}
              <div className="pt-3 border-t border-border">
                {allChecked ? (
                  <Button
                    onClick={() => onApprove(vehicle.id, gate.nextStage)}
                    className="w-full bg-success/20 hover:bg-success/30 text-success border border-success/30 gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    FREIGABE ERTEILEN → {gate.nextLabel}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-xs text-destructive">
                      Alle {gate.criteria.length} Punkte müssen bestätigt werden, bevor die Freigabe möglich ist.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TaeubertStandard() {
  const queryClient = useQueryClient();

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, progress }) => base44.entities.Vehicle.update(id, { status, progress }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });

  const progressMap = { lackierung: 65, finish: 80, endkontrolle: 90, uebergabe: 100 };

  const handleApprove = (vehicleId, nextStage) => {
    updateMutation.mutate({ id: vehicleId, status: nextStage, progress: progressMap[nextStage] || 90 });
  };

  // Vehicles currently at a gate stage
  const gateVehicles = vehicles.filter(v => Object.keys(GATES).includes(v.status));
  const approvedCount = vehicles.filter(v => v.status === "uebergabe").length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">TÄUBERT STANDARD</h1>
            <p className="text-sm text-muted-foreground">Qualitäts-Gate-System · kein Fortschritt ohne Freigabe</p>
          </div>
        </div>

        {/* Philosophy Banner */}
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-sm text-foreground/80 leading-relaxed italic">
            „Kein Fahrzeug verlässt eine Stufe, ohne dass der Täubert Standard erfüllt wurde.
            Nicht das Gefühl entscheidet — der Standard entscheidet."
          </p>
        </div>
      </motion.div>

      {/* Gate Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {Object.entries(GATES).map(([key, gate]) => {
          const count = vehicles.filter(v => v.status === key).length;
          return (
            <div key={key} className={`rounded-xl border p-4 ${gate.color}`}>
              <p className="text-2xl font-heading">{count}</p>
              <p className="text-[10px] tracking-widest mt-1">{gate.label.replace("-Gate", "")}</p>
            </div>
          );
        })}
      </div>

      {/* Active Gates */}
      {gateVehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-5 rounded-2xl bg-success/10 border border-success/20 mb-4">
            <Star className="w-8 h-8 text-success" />
          </div>
          <h3 className="font-heading text-lg text-foreground">Alle Freigaben erteilt</h3>
          <p className="text-sm text-muted-foreground mt-2">Momentan warten keine Fahrzeuge auf eine Gate-Prüfung.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">
            WARTENDE GATES ({gateVehicles.length})
          </p>
          {gateVehicles.map(vehicle => (
            <GateCard
              key={vehicle.id}
              vehicle={vehicle}
              gate={GATES[vehicle.status]}
              gateKey={vehicle.status}
              onApprove={handleApprove}
            />
          ))}
        </div>
      )}
    </div>
  );
}