import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import {
  AlertTriangle, CheckCircle2, Clock, Car, User,
  Layers, ArrowRight, X,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { differenceInMinutes, differenceInHours, parseISO } from "date-fns";
import VehicleTracker from "@/components/werkstatt/VehicleTracker";
import WerkstattAmpel from "@/components/werkstatt/WerkstattAmpel";
import HallenNavigation from "@/components/werkstatt/HallenNavigation";
import WerkstattKI from "@/components/werkstatt/WerkstattKI";
import KabinenPlanung from "@/components/werkstatt/KabinenPlanung";
import Morgenstart from "@/components/werkstatt/Morgenstart";

const STAGES = ["annahme","teile_bestellt","demontage","karosserie","vorbereitung","lackierung","finish","endkontrolle","uebergabe"];
const STAGE_LABELS = {
  annahme: "Annahme", teile_bestellt: "Teile", demontage: "Demontage",
  karosserie: "Karosserie", vorbereitung: "Vorbereitung", lackierung: "Lackierung",
  finish: "Finish", endkontrolle: "Endkontrolle", uebergabe: "Übergabe"
};
const STAGE_CAPACITY = {
  annahme: 2, teile_bestellt: 5, demontage: 2, karosserie: 3,
  vorbereitung: 4, lackierung: 2, finish: 3, endkontrolle: 2, uebergabe: 2
};
const TEAM = ["Toni", "Pascal", "Fanny", "Maik", "Marco", "Adrian", "Lena"];

function getPriorityConfig(v) {
  const isPremium = v.customer_type === "premium" || v.make === "Porsche" || v.make === "AMG" || v.make === "Bentley" || v.make === "Ferrari" || v.make === "Lamborghini" || v.make === "McLaren" || v.make === "Aston Martin";
  if (isPremium) return { label: "PREMIUM", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30", dot: "bg-blue-400" };
  if (v.condition === "problem") return { label: "DRINGEND", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", dot: "bg-destructive" };
  const today = new Date().toISOString().split("T")[0];
  if (v.estimated_completion === today) return { label: "HEUTE FERTIG", color: "text-warning", bg: "bg-warning/10 border-warning/30", dot: "bg-warning" };
  if (v.insurance) return { label: "VERSICHERUNG", color: "text-chart-1", bg: "bg-chart-1/10 border-chart-1/30", dot: "bg-chart-1" };
  return { label: "NORMAL", color: "text-muted-foreground", bg: "bg-secondary border-border", dot: "bg-muted-foreground" };
}

function getAmpel(v) {
  if (v.condition === "problem") return { color: "bg-destructive", label: "Verzug" };
  if (v.condition === "wartet_auf_teile") return { color: "bg-warning", label: "Kritisch" };
  if (v.condition === "fertig") return { color: "bg-success", label: "Im Plan" };
  return { color: "bg-chart-1", label: "Im Plan" };
}

function getStauWarning(vehicles) {
  const counts = {};
  vehicles.forEach(v => { counts[v.status] = (counts[v.status] || 0) + 1; });
  return STAGES.filter(s => (counts[s] || 0) > STAGE_CAPACITY[s]).map(s => ({
    stage: s, count: counts[s], capacity: STAGE_CAPACITY[s]
  }));
}

function getDurchlaufzeiten(vehicles) {
  return STAGES.map(s => {
    const veh = vehicles.filter(v => v.status === s);
    if (!veh.length) return { stage: s, avg: 0, count: 0, warning: false };
    const now = new Date();
    const hours = veh.map(v => {
      if (!v.updated_date) return 24;
      return differenceInHours(now, parseISO(v.updated_date));
    });
    const avg = hours.reduce((a, b) => a + b, 0) / hours.length;
    const thresholds = { annahme: 4, teile_bestellt: 48, demontage: 8, karosserie: 24, vorbereitung: 32, lackierung: 12, finish: 8, endkontrolle: 4, uebergabe: 2 };
    return { stage: s, avg: Math.round(avg), count: veh.length, warning: avg > thresholds[s] };
  }).filter(x => x.count > 0);
}

// Lift Card Component
function LiftCard({ lift, vehicles, onUpdate, onFree }) {
  const occ = lift.status === "belegt";
  const mins = occ && lift.occupied_since ? differenceInMinutes(new Date(), parseISO(lift.occupied_since)) : 0;
  const hours = Math.floor(mins / 60);
  const remaining = lift.planned_duration_minutes ? Math.max(0, lift.planned_duration_minutes - mins) : null;

  return (
    <div className={`bg-card rounded-xl border p-4 ${occ ? "border-warning/30" : lift.status === "wartung" ? "border-destructive/30" : "border-border"}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-heading text-sm text-foreground">{lift.name}</p>
          <p className="text-[10px] text-muted-foreground uppercase">{lift.area}</p>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${occ ? "bg-warning" : lift.status === "wartung" ? "bg-destructive" : "bg-success"}`} />
      </div>

      {occ ? (
        <div className="space-y-2">
          <p className="text-xs text-foreground font-medium">{lift.vehicle_info || "–"}</p>
          {lift.employee && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />{lift.employee}</p>}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />{hours > 0 ? `${hours}h ${mins % 60}min` : `${mins}min`}
            </span>
            {remaining !== null && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${remaining < 15 ? "bg-destructive/20 text-destructive" : "bg-secondary text-muted-foreground"}`}>
                {remaining}min rest
              </span>
            )}
          </div>
          {lift.next_vehicle_info && (
            <p className="text-[10px] text-muted-foreground border-t border-border/50 pt-2">
              Nächstes: {lift.next_vehicle_info}
            </p>
          )}
          <Button size="sm" variant="outline" onClick={() => onFree(lift)} className="w-full text-xs border-border mt-1 h-7">Freigeben</Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className={`text-xs font-medium ${lift.status === "wartung" ? "text-destructive" : "text-success"}`}>
            {lift.status === "wartung" ? "⚠ Wartung" : "✓ Frei"}
          </p>
          {lift.status !== "wartung" && (
            <Select onValueChange={vid => onUpdate(lift, vid)}>
              <SelectTrigger className="bg-secondary border-border text-xs h-7"><SelectValue placeholder="Fahrzeug zuweisen" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                {vehicles.filter(v => v.status !== "uebergabe").map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.make} {v.model} – {v.license_plate}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}

// Heatmap
function HallenHeatmap({ vehicles }) {
  const areas = ["annahme", "karosserie", "vorbereitung", "lackierung", "finish", "endkontrolle"];
  const counts = {};
  vehicles.forEach(v => { counts[v.status] = (counts[v.status] || 0) + 1; });

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="font-heading text-sm text-foreground mb-4">HALLEN-HEATMAP</p>
      <div className="grid grid-cols-3 gap-3">
        {areas.map(a => {
          const count = counts[a] || 0;
          const cap = STAGE_CAPACITY[a];
          const pct = Math.min(100, Math.round((count / cap) * 100));
          const heat = pct > 90 ? "bg-destructive/20 border-destructive/40 text-destructive" :
                       pct > 70 ? "bg-warning/20 border-warning/40 text-warning" :
                       pct > 0 ? "bg-chart-2/20 border-chart-2/40 text-chart-2" :
                       "bg-secondary border-border text-muted-foreground";
          return (
            <div key={a} className={`border rounded-xl p-3 text-center ${heat}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider">{STAGE_LABELS[a]}</p>
              <p className="text-2xl font-heading mt-1">{count}</p>
              <p className="text-[10px] mt-0.5">{pct}% Kap.</p>
              {pct > 90 && <p className="text-[9px] mt-1 font-bold">⚠ ÜBERLASTET</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Flow Diagram
function VehicleFlowDiagram({ vehicles }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 overflow-x-auto">
      <p className="font-heading text-sm text-foreground mb-4">FAHRZEUG-FLOW</p>
      <div className="flex items-center gap-1 min-w-max">
        {STAGES.map((s, i) => {
          const count = vehicles.filter(v => v.status === s).length;
          const isOver = count > STAGE_CAPACITY[s];
          return (
            <React.Fragment key={s}>
              <div className={`flex flex-col items-center p-3 rounded-xl min-w-[80px] border ${isOver ? "bg-destructive/10 border-destructive/40" : count > 0 ? "bg-primary/10 border-primary/30" : "bg-secondary border-border"}`}>
                <span className={`text-xl font-heading ${isOver ? "text-destructive" : count > 0 ? "text-primary-foreground" : "text-muted-foreground"}`}>{count}</span>
                <span className="text-[9px] uppercase tracking-wide text-muted-foreground mt-1 text-center leading-tight">{STAGE_LABELS[s]}</span>
                {isOver && <span className="text-[8px] text-destructive font-bold mt-0.5">STAU</span>}
              </div>
              {i < STAGES.length - 1 && <ArrowRight className="w-3 h-3 text-border flex-shrink-0" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function WerkstattControl() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [showLiftModal, setShowLiftModal] = useState(false);
  const [newLift, setNewLift] = useState({ name: "", area: "werkstatt" });
  const qc = useQueryClient();

  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: () => base44.entities.Vehicle.list() });
  const { data: lifts = [] } = useQuery({ queryKey: ["lifts"], queryFn: () => base44.entities.Lift.list() });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => base44.entities.Task.list() });
  const { data: timeEntries = [] } = useQuery({ queryKey: ["time-entries"], queryFn: () => base44.entities.TimeEntry.list() });

  const updateLift = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lift.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lifts"] })
  });
  const createLift = useMutation({
    mutationFn: (data) => base44.entities.Lift.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lifts"] }); setShowLiftModal(false); setNewLift({ name: "", area: "werkstatt" }); }
  });

  const stauWarnings = getStauWarning(vehicles);
  const durchlaufzeiten = getDurchlaufzeiten(vehicles);
  const activeVehicles = vehicles.filter(v => v.status !== "uebergabe");
  const activeWorkers = [...new Set(timeEntries.filter(t => t.status === "aktiv").map(t => t.employee))];

  // Auslastung je Bereich
  const auslastung = STAGES.slice(2, 8).map(s => {
    const count = vehicles.filter(v => v.status === s).length;
    const pct = Math.min(100, Math.round((count / STAGE_CAPACITY[s]) * 100));
    return { stage: s, pct, count, cap: STAGE_CAPACITY[s] };
  });

  const handleAssignLift = (lift, vehicleId) => {
    const veh = vehicles.find(v => v.id === vehicleId);
    updateLift.mutate({ id: lift.id, data: {
      vehicle_id: vehicleId,
      vehicle_info: veh ? `${veh.make} ${veh.model} – ${veh.license_plate}` : "",
      status: "belegt",
      occupied_since: new Date().toISOString()
    }});
  };

  const handleFreeLift = (lift) => {
    updateLift.mutate({ id: lift.id, data: { vehicle_id: "", vehicle_info: "", status: "frei", occupied_since: null, employee: "" }});
  };

  const TABS = [
    { id: "overview", label: "Übersicht" },
    { id: "tracking", label: "Live-Tracking" },
    { id: "halle", label: "Hallen-Nav" },
    { id: "ampel", label: "Werkstatt-Ampel" },
    { id: "ki", label: "Werkstatt-Assistent" },
    { id: "kabine", label: "Kabinen" },
    { id: "morgen", label: "Morgenstart" },
    { id: "lifts", label: "Hebebühnen" },
    { id: "flow", label: "Flow & Stau" },
    { id: "auslastung", label: "Auslastung" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">WERKSTATT-CONTROL</h1>
          <p className="text-xs text-muted-foreground mt-1">Live-Steuerung · Kapazität · Flow · Auslastung</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground">{activeVehicles.length} aktive Fzg · {activeWorkers.length} Mitarbeiter aktiv</span>
        </div>
      </div>

      {/* Stau-Warnungen */}
      <AnimatePresence>
        {stauWarnings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 space-y-2">
            {stauWarnings.map(w => (
              <div key={w.stage} className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive font-medium">
                  STAU ERKANNT: {STAGE_LABELS[w.stage]} — {w.count} Fahrzeuge (Kapazität: {w.capacity})
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-secondary rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`text-xs px-4 py-2 rounded-lg font-medium transition-all ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-5">
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Aktive Fzg", value: activeVehicles.length, icon: Car, color: "text-chart-1" },
              { label: "Mitarbeiter aktiv", value: activeWorkers.length, icon: User, color: "text-chart-2" },
              { label: "Offene Aufgaben", value: tasks.filter(t => t.status !== "erledigt").length, icon: Wrench, color: "text-warning" },
              { label: "Engpässe", value: stauWarnings.length, icon: AlertTriangle, color: stauWarnings.length > 0 ? "text-destructive" : "text-success" },
            ].map(k => (
              <div key={k.label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <k.icon className={`w-4 h-4 ${k.color}`} />
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{k.label}</span>
                </div>
                <p className={`text-2xl font-heading ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <HallenHeatmap vehicles={vehicles} />

          {/* Durchlaufzeiten */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-heading text-sm text-foreground mb-4">LIVE-WARTEZEITEN JE BEREICH</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {durchlaufzeiten.map(d => (
                <div key={d.stage} className={`p-3 rounded-xl border ${d.warning ? "bg-warning/10 border-warning/30" : "bg-secondary border-border"}`}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{STAGE_LABELS[d.stage]}</p>
                  <p className={`text-xl font-heading mt-1 ${d.warning ? "text-warning" : "text-foreground"}`}>Ø {d.avg}h</p>
                  <p className="text-[10px] text-muted-foreground">{d.count} Fzg aktuell</p>
                  {d.warning && <p className="text-[9px] text-warning font-bold mt-1">⚠ ÜBER ZIEL</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LIVE TRACKING */}
      {tab === "tracking" && (
        <VehicleTracker vehicles={activeVehicles} employees={TEAM} />
      )}

      {/* HALLEN-NAVIGATION */}
      {tab === "halle" && (
        <HallenNavigation vehicles={vehicles} lifts={lifts} employees={TEAM} />
      )}

      {/* WERKSTATT-AMPEL */}
      {tab === "ampel" && (
        <WerkstattAmpel vehicles={vehicles} tasks={tasks} lifts={lifts} />
      )}

      {/* WERKSTATT-ASSISTENT */}
      {tab === "ki" && (
        <WerkstattKI vehicles={vehicles} tasks={tasks} timeEntries={[]} />
      )}

      {/* KABINEN-PLANUNG */}
      {tab === "kabine" && (
        <KabinenPlanung vehicles={vehicles} lifts={lifts} />
      )}

      {/* MORGENSTART */}
      {tab === "morgen" && (
        <Morgenstart vehicles={vehicles} tasks={tasks} employee={user?.full_name} />
      )}

      {/* HEBEBÜHNEN */}
      {tab === "lifts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{lifts.filter(l => l.status === "belegt").length} von {lifts.length} Bühnen belegt</p>
            <Button onClick={() => setShowLiftModal(true)} size="sm" className="bg-primary hover:bg-primary/80 text-xs">+ Bühne hinzufügen</Button>
          </div>
          {lifts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Layers className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Noch keine Hebebühnen angelegt.</p>
              <Button className="mt-4 bg-primary" onClick={() => setShowLiftModal(true)}>Erste Bühne anlegen</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lifts.map(lift => (
                <LiftCard key={lift.id} lift={lift} vehicles={vehicles} onUpdate={handleAssignLift} onFree={handleFreeLift} />
              ))}
            </div>
          )}

          {/* Modal */}
          <AnimatePresence>
            {showLiftModal && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-base">NEUE BÜHNE</h3>
                    <button onClick={() => setShowLiftModal(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Bezeichnung</label>
                      <Input value={newLift.name} onChange={e => setNewLift(p => ({ ...p, name: e.target.value }))} placeholder="z.B. Bühne 1" className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Bereich</label>
                      <Select value={newLift.area} onValueChange={v => setNewLift(p => ({ ...p, area: v }))}>
                        <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {["karosserie","vorbereitung","lackierung","finish","werkstatt","aussen"].map(a => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => createLift.mutate(newLift)} disabled={!newLift.name} className="w-full bg-primary">Anlegen</Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* FLOW & STAU */}
      {tab === "flow" && (
        <div className="space-y-5">
          <VehicleFlowDiagram vehicles={vehicles} />

          {/* Stau-Erkennung Detail */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-heading text-sm text-foreground mb-4">STAU-ERKENNUNG & ENGPÄSSE</p>
            <div className="space-y-3">
              {STAGES.map(s => {
                const veh = vehicles.filter(v => v.status === s);
                const cap = STAGE_CAPACITY[s];
                const pct = Math.min(100, Math.round((veh.length / cap) * 100));
                const isOver = veh.length > cap;
                return (
                  <div key={s} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${isOver ? "text-destructive" : "text-foreground"}`}>{STAGE_LABELS[s]}</span>
                      <span className={`text-[11px] ${isOver ? "text-destructive font-bold" : "text-muted-foreground"}`}>{veh.length}/{cap} {isOver ? "⚠ ÜBERLASTET" : ""}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${isOver ? "bg-destructive" : pct > 70 ? "bg-warning" : "bg-chart-2"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    {veh.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {veh.slice(0, 4).map(v => (
                          <span key={v.id} className="text-[9px] px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">{v.make} {v.license_plate}</span>
                        ))}
                        {veh.length > 4 && <span className="text-[9px] px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">+{veh.length - 4}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warteanalyse */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-heading text-sm text-foreground mb-4">FAHRZEUGE MIT WARTEZEIT</p>
            <div className="space-y-2">
              {vehicles.filter(v => v.condition === "wartet_auf_teile" || v.condition === "problem").map(v => {
                const hours = v.updated_date ? differenceInHours(new Date(), parseISO(v.updated_date)) : 0;
                return (
                  <div key={v.id} className={`flex items-center gap-3 p-3 rounded-xl border ${v.condition === "problem" ? "bg-destructive/10 border-destructive/30" : "bg-warning/10 border-warning/30"}`}>
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${v.condition === "problem" ? "text-destructive" : "text-warning"}`} />
                    <div className="flex-1">
                      <p className="text-xs text-foreground font-medium">{v.make} {v.model} – {v.license_plate}</p>
                      <p className="text-[10px] text-muted-foreground">{STAGE_LABELS[v.status]} · {v.condition === "wartet_auf_teile" ? "Wartet auf Teile" : "Problem"}</p>
                    </div>
                    <span className={`text-[11px] font-medium ${hours > 24 ? "text-destructive" : "text-warning"}`}>{hours}h</span>
                  </div>
                );
              })}
              {vehicles.filter(v => v.condition === "wartet_auf_teile" || v.condition === "problem").length === 0 && (
                <div className="flex items-center gap-2 text-success py-4">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Kein Stau erkannt — alles im Fluss.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AUSLASTUNG */}
      {tab === "auslastung" && (
        <div className="space-y-5">
          {/* Bereich-Auslastung */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-heading text-sm text-foreground mb-4">AUSLASTUNG JE BEREICH</p>
            <div className="space-y-4">
              {auslastung.map(a => (
                <div key={a.stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">{STAGE_LABELS[a.stage]}</span>
                    <span className={`text-sm font-heading ${a.pct > 90 ? "text-destructive" : a.pct > 70 ? "text-warning" : "text-success"}`}>{a.pct}%</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${a.pct}%` }} transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${a.pct > 90 ? "bg-destructive" : a.pct > 70 ? "bg-warning" : "bg-chart-2"}`} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{a.count} Fzg von max. {a.cap} Kapazität</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mitarbeiter-Auslastung */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-heading text-sm text-foreground mb-4">MITARBEITER-AUSLASTUNG</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {TEAM.map(emp => {
                const active = timeEntries.filter(t => t.employee === emp && t.status === "aktiv");
                const today = new Date().toISOString().split("T")[0];
                const todayMinutes = timeEntries
                  .filter(t => t.employee === emp && t.created_date?.startsWith(today))
                  .reduce((s, t) => s + (t.duration_minutes || 0), 0);
                return (
                  <div key={emp} className={`p-3 rounded-xl border ${active.length > 0 ? "bg-chart-2/10 border-chart-2/30" : "bg-secondary border-border"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{emp}</span>
                      <div className={`w-2 h-2 rounded-full ${active.length > 0 ? "bg-chart-2" : "bg-muted-foreground"}`} />
                    </div>
                    {active.length > 0 ? (
                      <div className="mt-1">
                        <p className="text-[11px] text-chart-2">{active[0].activity} · {active[0].vehicle_info || "–"}</p>
                        <p className="text-[10px] text-muted-foreground">{Math.round(todayMinutes / 60)}h heute</p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground mt-1">Nicht eingestempelt</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Werkstatt-Score */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-heading text-sm text-foreground mb-4">WERKSTATT-SCORE HEUTE</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Ordnung", score: 85, icon: "🧹" },
                { label: "Durchlauf", score: stauWarnings.length === 0 ? 92 : 60, icon: "⚡" },
                { label: "Qualität", score: vehicles.filter(v => v.quality_approved).length > 0 ? 88 : 75, icon: "⭐" },
              ].map(s => (
                <div key={s.label} className="text-center p-3 bg-secondary rounded-xl">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className={`text-xl font-heading ${s.score >= 80 ? "text-success" : s.score >= 60 ? "text-warning" : "text-destructive"}`}>{s.score}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}