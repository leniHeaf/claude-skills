import React, { useState } from "react";
import { motion } from "framer-motion";
import { Gift, CheckCircle2, Circle, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

const VORBEREITUNG = [
  { id: "position", label: "Fahrzeug optimal positionieren (saubere Fläche)" },
  { id: "licht", label: "Beleuchtung aktivieren / Übergabespot" },
  { id: "innen", label: "Innenraum final prüfen (Geruch, Sitz, Spiegel)" },
  { id: "scheiben", label: "Scheiben kontrollieren (keine Schlieren)" },
  { id: "reifen", label: "Reifen und Felgen nochmals prüfen" },
  { id: "schluessel", label: "Schlüssel und alle Unterlagen vorbereiten" },
  { id: "rechnung", label: "Rechnung vorbereiten und erklärend strukturieren" },
  { id: "bericht", label: "Arbeitsbericht / Fotos bereithalten" },
];

const UEBERGABE_GESPRAECH = [
  { id: "begruessung", label: "Herzliche, persönliche Begrüßung" },
  { id: "arbeit_erklaeren", label: "Durchgeführte Arbeiten klar erklären" },
  { id: "qualitaet", label: "Qualität und Besonderheiten hervorheben" },
  { id: "nacharbeit", label: "Eventuelle Nachträge transparent ansprechen" },
  { id: "pflege", label: "Pflegehinweise für die nächsten Wochen geben" },
  { id: "rechnung", label: "Rechnung Position für Position erklären" },
  { id: "fragen", label: "Aktiv nach Fragen oder Anmerkungen fragen" },
  { id: "bewertung", label: "Diskreten Hinweis auf Google-Bewertung geben" },
];

const PREMIUM_EXTRAS = [
  { id: "foto", label: "Premium-Abschlussfoto mit Fahrzeug (für Kundenerinnerung)" },
  { id: "danke", label: "Persönliche Dankeskarte / digitale Nachricht" },
  { id: "pflegekit", label: "Pflegeprodukt / kleines Präsent für Stammkunden" },
];

export default function UebergabeLeitfaden({ vehicles }) {
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [checklist, setChecklist] = useState({});
  const [phase, setPhase] = useState("vorbereitung");

  const readyVehicles = vehicles.filter(v => ["endkontrolle", "uebergabe"].includes(v.status));
  const filteredVehicles = search
    ? readyVehicles.filter(v => v.customer_name?.toLowerCase().includes(search.toLowerCase()) || v.license_plate?.includes(search))
    : readyVehicles;

  const toggle = (id) => setChecklist(p => ({ ...p, [id]: !p[id] }));

  const PHASES = [
    { key: "vorbereitung", label: "Vorbereitung", items: VORBEREITUNG },
    { key: "gespraech", label: "Gespräch", items: UEBERGABE_GESPRAECH },
    { key: "premium", label: "Premium-Extras", items: PREMIUM_EXTRAS },
  ];

  const currentItems = PHASES.find(p => p.key === phase)?.items || [];
  const checkedCount = currentItems.filter(item => checklist[item.id]).length;

  return (
    <div className="space-y-5">
      {/* Vehicle Selection */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-3">FAHRZEUG FÜR ÜBERGABE WÄHLEN</p>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kunde oder Kennzeichen..." className="pl-9 bg-secondary border-border" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredVehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-2 py-4 text-center">Keine übergabebereiten Fahrzeuge.</p>
          ) : (
            filteredVehicles.map(v => (
              <button key={v.id} onClick={() => { setSelectedVehicle(v); setChecklist({}); setPhase("vorbereitung"); }}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                  ${selectedVehicle?.id === v.id ? "border-warning/50 bg-warning/10" : "border-border bg-secondary hover:border-warning/30"}`}>
                <Gift className={`w-4 h-4 flex-shrink-0 ${selectedVehicle?.id === v.id ? "text-warning" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{v.make} {v.model}</p>
                  <p className="text-xs text-muted-foreground">{v.customer_name} · {v.license_plate}</p>
                </div>
                <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-full ${v.status === "uebergabe" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"}`}>
                  {v.status === "uebergabe" ? "Übergabe" : "Endkontrolle"}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Leitfaden */}
      {selectedVehicle && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Header */}
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start justify-between">
            <div>
              <p className="text-[9px] tracking-widest text-warning uppercase mb-1">ÜBERGABE-MODUS AKTIV</p>
              <h2 className="font-heading text-xl text-foreground">{selectedVehicle.make} {selectedVehicle.model}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{selectedVehicle.customer_name} · {selectedVehicle.license_plate}</p>
            </div>
            <Sparkles className="w-5 h-5 text-warning" />
          </div>

          {/* Phase Tabs */}
          <div className="flex gap-1 p-1 bg-secondary rounded-xl">
            {PHASES.map(p => {
              const phaseItems = p.items;
              const pChecked = phaseItems.filter(item => checklist[item.id]).length;
              const allDone = pChecked === phaseItems.length;
              return (
                <button key={p.key} onClick={() => setPhase(p.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium flex-1 justify-center transition-all
                    ${phase === p.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {allDone && <CheckCircle2 className="w-3 h-3 text-success" />}
                  {p.label} <span className="text-[10px] text-muted-foreground">({pChecked}/{phaseItems.length})</span>
                </button>
              );
            })}
          </div>

          {/* Checklist */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                {PHASES.find(p => p.key === phase)?.label}
              </p>
              <span className="text-xs text-muted-foreground">{checkedCount}/{currentItems.length}</span>
            </div>
            <div className="space-y-2">
              {currentItems.map((item) => {
                const checked = checklist[item.id];
                return (
                  <motion.button key={item.id} onClick={() => toggle(item.id)} whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                      ${checked ? "bg-success/10 border-success/20" : "bg-secondary border-border hover:border-primary/20"}`}>
                    {checked
                      ? <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      : <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    <span className={`text-sm ${checked ? "text-success line-through" : "text-foreground"}`}>{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Zielgefühl */}
          <div className="bg-card border border-primary/20 rounded-xl p-4">
            <p className="text-[9px] tracking-wider text-primary uppercase mb-2">ZIELGEFÜHL DES KUNDEN</p>
            <p className="text-base font-heading text-foreground italic">„Das war mehr als nur Werkstatt."</p>
            <p className="text-xs text-muted-foreground mt-1">Premium · Ruhe · Wertschätzung · Qualität · modernes Handwerk.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}