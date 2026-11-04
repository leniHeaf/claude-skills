import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Car, Clock, Camera, AlertTriangle, CheckCircle2,
  ClipboardCheck, FileText, ChevronDown, ChevronUp, History
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

const STAGE_LABELS = {
  annahme: "Annahme", teile_bestellt: "Teile", demontage: "Demontage",
  karosserie: "Karosserie", vorbereitung: "Vorbereitung", lackierung: "Lackierung",
  finish: "Finish", endkontrolle: "Endkontrolle", uebergabe: "Übergabe"
};

const EVENT_ICONS = {
  status_change: { icon: Clock, color: "text-chart-1", bg: "bg-chart-1/10" },
  photo_added: { icon: Camera, color: "text-chart-2", bg: "bg-chart-2/10" },
  task_created: { icon: ClipboardCheck, color: "text-muted-foreground", bg: "bg-secondary" },
  task_done: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  quality_check: { icon: CheckCircle2, color: "text-chart-2", bg: "bg-chart-2/10" },
  note_added: { icon: FileText, color: "text-muted-foreground", bg: "bg-secondary" },
  handover: { icon: Car, color: "text-warning", bg: "bg-warning/10" },
};

const EVENT_LABELS = {
  status_change: "Statuswechsel",
  photo_added: "Foto hinzugefügt",
  task_created: "Aufgabe erstellt",
  task_done: "Aufgabe erledigt",
  quality_check: "Qualitätsprüfung",
  note_added: "Notiz",
  handover: "Übergabe",
};

export default function VehicleHistory() {
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [expandedSections, setExpandedSections] = useState({ timeline: true, photos: false, errors: false, tasks: false });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-history"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 200),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["vehicle-events", selectedVehicle?.id],
    queryFn: () => selectedVehicle
      ? base44.entities.VehicleEvent.filter({ vehicle_id: selectedVehicle.id }, "-created_date", 100)
      : [],
    enabled: !!selectedVehicle,
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["vehicle-photos-history", selectedVehicle?.id],
    queryFn: () => selectedVehicle
      ? base44.entities.VehiclePhoto.filter({ vehicle_id: selectedVehicle.id }, "-created_date", 100)
      : [],
    enabled: !!selectedVehicle,
  });

  const { data: errorReports = [] } = useQuery({
    queryKey: ["vehicle-errors-history", selectedVehicle?.id],
    queryFn: () => selectedVehicle
      ? base44.entities.ErrorReport.filter({ vehicle_id: selectedVehicle.id }, "-created_date", 50)
      : [],
    enabled: !!selectedVehicle,
  });

  const { data: vehicleTasks = [] } = useQuery({
    queryKey: ["vehicle-tasks-history", selectedVehicle?.id],
    queryFn: () => selectedVehicle
      ? base44.entities.Task.filter({ vehicle_id: selectedVehicle.id }, "-created_date", 50)
      : [],
    enabled: !!selectedVehicle,
  });

  const { data: qualityChecks = [] } = useQuery({
    queryKey: ["vehicle-quality-history", selectedVehicle?.id],
    queryFn: () => selectedVehicle
      ? base44.entities.QualityCheck.filter({ vehicle_id: selectedVehicle.id }, "-created_date", 20)
      : [],
    enabled: !!selectedVehicle,
  });

  const filtered = vehicles.filter(v => {
    const term = search.toLowerCase();
    return !term || v.customer_name?.toLowerCase().includes(term) ||
      v.license_plate?.toLowerCase().includes(term) ||
      v.make?.toLowerCase().includes(term) ||
      v.model?.toLowerCase().includes(term);
  });

  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">FAHRZEUGHISTORIE</h1>
        <p className="text-sm text-muted-foreground mt-1">Vollständige Dokumentation · jeden Schritt nachvollziehen</p>
      </motion.div>

      <div className={`${selectedVehicle ? "grid grid-cols-1 lg:grid-cols-2 gap-5" : ""}`}>
        {/* Left: Search + List */}
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Kennzeichen, Kunde, Fahrzeug..." className="pl-9 bg-secondary border-border" />
          </div>

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filtered.map((v, i) => (
              <motion.div key={v.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedVehicle(selectedVehicle?.id === v.id ? null : v)}
                className={`bg-card border rounded-xl p-4 cursor-pointer transition-all
                  ${selectedVehicle?.id === v.id ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Car className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{v.make} {v.model}</p>
                      <span className="text-[10px] text-muted-foreground font-mono">{v.license_plate}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{v.customer_name}</p>
                      <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                        {STAGE_LABELS[v.status] || v.status}
                      </span>
                    </div>
                  </div>
                  {v.quality_approved && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12 text-sm">Keine Fahrzeuge gefunden.</p>
            )}
          </div>
        </div>

        {/* Right: History Detail */}
        {selectedVehicle && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">

            {/* Header */}
            <div className="bg-card border border-primary/30 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-heading text-base text-foreground">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedVehicle.customer_name} · {selectedVehicle.license_plate}</p>
                </div>
                <button onClick={() => setSelectedVehicle(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[
                  { label: "Events", value: events.length },
                  { label: "Fotos", value: photos.length },
                  { label: "Fehler", value: errorReports.length },
                  { label: "Aufgaben", value: vehicleTasks.length },
                ].map(stat => (
                  <div key={stat.label} className="text-center bg-secondary rounded-lg p-2">
                    <p className="font-heading text-lg text-foreground">{stat.value}</p>
                    <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Section */}
            <CollapsibleSection title="ZEITLEISTE" icon={History} count={events.length}
              open={expandedSections.timeline} onToggle={() => toggleSection("timeline")}>
              {events.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Keine Events vorhanden.</p>
              ) : (
                <div className="relative space-y-0">
                  {events.map((evt, i) => {
                    const cfg = EVENT_ICONS[evt.event_type] || EVENT_ICONS.note_added;
                    const Icon = cfg.icon;
                    return (
                      <div key={evt.id} className="flex gap-3 relative pb-3">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${cfg.bg}`}>
                            <Icon className={`w-3 h-3 ${cfg.color}`} />
                          </div>
                          {i < events.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium text-foreground">
                              {EVENT_LABELS[evt.event_type] || evt.event_type}
                            </p>
                            <span className="text-[9px] text-muted-foreground flex-shrink-0">
                              {evt.created_date ? format(new Date(evt.created_date), "dd.MM. HH:mm") : ""}
                            </span>
                          </div>
                          {(evt.from_status || evt.to_status) && (
                            <p className="text-[10px] text-muted-foreground">
                              {STAGE_LABELS[evt.from_status] || evt.from_status} → {STAGE_LABELS[evt.to_status] || evt.to_status}
                            </p>
                          )}
                          {evt.note && <p className="text-[10px] text-muted-foreground mt-0.5">{evt.note}</p>}
                          {evt.actor && <p className="text-[9px] text-muted-foreground">von {evt.actor}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleSection>

            {/* Photos Section */}
            <CollapsibleSection title="FOTODOKUMENTATION" icon={Camera} count={photos.length}
              open={expandedSections.photos} onToggle={() => toggleSection("photos")}>
              {photos.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Keine Fotos vorhanden.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map(p => (
                    <div key={p.id} className="relative group">
                      <img src={p.photo_url} alt={p.area} className="w-full aspect-square object-cover rounded-lg border border-border" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 rounded-b-lg px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[9px] text-white truncate">{p.area} · {p.employee}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleSection>

            {/* Errors Section */}
            <CollapsibleSection title="FEHLERBERICHTE" icon={AlertTriangle} count={errorReports.length}
              open={expandedSections.errors} onToggle={() => toggleSection("errors")}>
              {errorReports.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Keine Fehlerberichte.</p>
              ) : (
                <div className="space-y-2">
                  {errorReports.map(e => (
                    <div key={e.id} className={`p-3 rounded-lg border text-xs ${e.resolved ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{e.category}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${e.resolved ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                          {e.resolved ? "Gelöst" : e.severity}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1">{e.description}</p>
                      {e.solution && <p className="text-success mt-1">Lösung: {e.solution}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleSection>

            {/* Tasks Section */}
            <CollapsibleSection title="AUFGABEN & QUALITÄT" icon={ClipboardCheck} count={vehicleTasks.length + qualityChecks.length}
              open={expandedSections.tasks} onToggle={() => toggleSection("tasks")}>
              <div className="space-y-2">
                {qualityChecks.map(qc => (
                  <div key={qc.id} className={`p-3 rounded-lg border text-xs ${qc.status === "bestanden" ? "bg-success/5 border-success/20" : qc.status === "nacharbeit" ? "bg-destructive/5 border-destructive/20" : "bg-secondary border-border"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">QK: {qc.stage}</span>
                      <span className={`text-[9px] ${qc.status === "bestanden" ? "text-success" : qc.status === "nacharbeit" ? "text-destructive" : "text-warning"}`}>
                        {qc.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{qc.inspector} · {qc.checklist?.length || 0} Punkte</p>
                  </div>
                ))}
                {vehicleTasks.map(t => (
                  <div key={t.id} className={`p-3 rounded-lg border text-xs ${t.status === "erledigt" ? "bg-success/5 border-success/20" : "bg-secondary border-border"}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${t.status === "erledigt" ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.title}</span>
                      <span className="text-[9px] text-muted-foreground">{t.status}</span>
                    </div>
                    <p className="text-muted-foreground">{t.assigned_to} · {t.category}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Vehicle Notes */}
            {(selectedVehicle.notes || selectedVehicle.customer_wishes) && (
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                {selectedVehicle.damage_description && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">SCHADENSBESCHREIBUNG</p>
                    <p className="text-xs text-foreground">{selectedVehicle.damage_description}</p>
                  </div>
                )}
                {selectedVehicle.customer_wishes && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">KUNDENWÜNSCHE</p>
                    <p className="text-xs text-foreground">{selectedVehicle.customer_wishes}</p>
                  </div>
                )}
                {selectedVehicle.notes && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">INTERNE NOTIZEN</p>
                    <p className="text-xs text-foreground">{selectedVehicle.notes}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function CollapsibleSection({ title, icon: Icon, count, open, onToggle, children }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-3 hover:bg-secondary/30 transition-all text-left">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">{title}</p>
          {count > 0 && <span className="text-[9px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full">{count}</span>}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="border-t border-border p-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}