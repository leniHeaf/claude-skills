import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Coffee, Car, Phone, Star, MessageSquare, CheckCircle2, Circle, User, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const EMPFANGS_CHECKLIST = [
  { id: "name", label: "Kunde mit Namen begrüßen", icon: User },
  { id: "getraenk", label: "Getränk anbieten (Kaffee / Wasser)", icon: Coffee },
  { id: "ruhe", label: "Ruhe und Professionalität ausstrahlen", icon: Star },
  { id: "fahrzeug", label: "Fahrzeug gemeinsam anschauen", icon: Car },
  { id: "schaden", label: "Schaden besprechen und erklären", icon: MessageSquare },
  { id: "wuensche", label: "Kundenwünsche aktiv erfragen", icon: AlertCircle },
  { id: "ablauf", label: "Ablauf und Timeline erklären", icon: CheckCircle2 },
  { id: "ansprechpartner", label: "Festen Ansprechpartner nennen", icon: Phone },
];

const TELEFON_LEITFADEN = [
  { id: "begruessen", label: "Freundlich und klar begrüßen" },
  { id: "ruhe", label: "Ruhe und Kompetenz vermitteln" },
  { id: "problem", label: "Problem vollständig verstehen" },
  { id: "vertrauen", label: "Vertrauen durch Fachkompetenz aufbauen" },
  { id: "termin", label: "Konkreten Termin vorschlagen" },
  { id: "bestaetigung", label: "Termin bestätigen und Infos senden" },
];

const TYPE_BADGES = {
  premium: { label: "PREMIUM", color: "bg-warning/20 text-warning border-warning/30" },
  stammkunde: { label: "STAMMKUNDE", color: "bg-success/20 text-success border-success/30" },
  vip: { label: "VIP", color: "bg-chart-1/20 text-chart-1 border-chart-1/30" },
};

export default function EmpfangsModus({ customers, vehicles, appointments }) {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [checklist, setChecklist] = useState({});
  const [mode, setMode] = useState("suche"); // suche | empfang | telefon

  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter(a => a.date === today);

  const filtered = search.length > 1
    ? customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search))
    : [];

  const getCustomerVehicles = (name) =>
    vehicles.filter(v => v.customer_name?.toLowerCase() === name?.toLowerCase());

  const toggleCheck = (id) => setChecklist(p => ({ ...p, [id]: !p[id] }));
  const checkedCount = Object.values(checklist).filter(Boolean).length;

  const startEmpfang = (customer) => {
    setSelectedCustomer(customer);
    setChecklist({});
    setMode("empfang");
  };

  return (
    <div className="space-y-5">
      {/* Mode Toggle */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        {[
          { key: "suche", label: "Kunde empfangen" },
          { key: "telefon", label: "Telefon-Leitfaden" },
          { key: "heute", label: `Heute (${todayAppointments.length})` },
        ].map(m => (
          <button key={m.key} onClick={() => setMode(m.key)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all
              ${mode === m.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* EMPFANG MODE */}
      {mode === "suche" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-3">KUNDE SUCHEN</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Name oder Telefon eingeben..." className="pl-9 bg-secondary border-border" />
            </div>

            {filtered.length > 0 && (
              <div className="mt-3 space-y-2">
                {filtered.map(c => {
                  const cvehicles = getCustomerVehicles(c.name);
                  const badge = TYPE_BADGES[c.customer_type];
                  return (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-secondary rounded-xl border border-border hover:border-primary/30 cursor-pointer transition-all"
                      onClick={() => startEmpfang(c)}>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{c.name}</p>
                          {badge && (
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold tracking-wider ${badge.color}`}>
                              {badge.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                          {c.phone && <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{c.phone}</span>}
                          {cvehicles.length > 0 && <span className="flex items-center gap-0.5"><Car className="w-2.5 h-2.5" />{cvehicles.length} Fz.</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        {c.special_wishes && (
                          <p className="text-[10px] text-warning flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" /> Wünsche vorhanden</p>
                        )}
                        <p className="text-[10px] text-primary mt-1">Empfang starten →</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE EMPFANG */}
      {mode === "empfang" && selectedCustomer && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {/* Customer Card */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] tracking-widest text-primary uppercase mb-1">EMPFANG AKTIV</p>
                <h2 className="font-heading text-2xl text-foreground">{selectedCustomer.name}</h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {selectedCustomer.phone && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />{selectedCustomer.phone}
                    </span>
                  )}
                  {selectedCustomer.customer_type === "premium" && (
                    <span className="text-xs px-2 py-0.5 bg-warning/20 text-warning rounded-full border border-warning/30 font-bold">★ PREMIUM KUNDE</span>
                  )}
                  {selectedCustomer.customer_type === "stammkunde" && (
                    <span className="text-xs px-2 py-0.5 bg-success/20 text-success rounded-full border border-success/30 font-bold">STAMMKUNDE</span>
                  )}
                </div>
              </div>
              <button onClick={() => setMode("suche")} className="text-xs text-muted-foreground hover:text-foreground">✕ Beenden</button>
            </div>

            {/* Vehicles */}
            {getCustomerVehicles(selectedCustomer.name).length > 0 && (
              <div className="mt-4 space-y-1.5">
                <p className="text-[9px] tracking-wider text-muted-foreground uppercase">LETZTE FAHRZEUGE</p>
                {getCustomerVehicles(selectedCustomer.name).slice(0, 3).map(v => (
                  <div key={v.id} className="flex justify-between items-center p-2 bg-secondary rounded-lg text-xs">
                    <span className="font-medium text-foreground">{v.make} {v.model} {v.color && `· ${v.color}`}</span>
                    <span className="text-muted-foreground font-mono">{v.license_plate}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Special wishes */}
            {selectedCustomer.special_wishes && (
              <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-[9px] tracking-wider text-warning uppercase mb-1">⚠ BESONDERE WÜNSCHE</p>
                <p className="text-sm text-foreground">{selectedCustomer.special_wishes}</p>
              </div>
            )}

            {selectedCustomer.notes && (
              <div className="mt-2 p-3 bg-secondary rounded-lg">
                <p className="text-[9px] tracking-wider text-muted-foreground uppercase mb-1">NOTIZEN</p>
                <p className="text-xs text-foreground/80">{selectedCustomer.notes}</p>
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase">EMPFANGS-CHECKLISTE</p>
              <span className="text-xs text-muted-foreground">{checkedCount}/{EMPFANGS_CHECKLIST.length}</span>
            </div>
            <div className="space-y-2">
              {EMPFANGS_CHECKLIST.map((item) => {
                const checked = checklist[item.id];
                const Icon = item.icon;
                return (
                  <motion.button key={item.id} onClick={() => toggleCheck(item.id)} whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                      ${checked ? "bg-success/10 border-success/20" : "bg-secondary border-border hover:border-primary/20"}`}>
                    {checked
                      ? <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      : <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${checked ? "text-success" : "text-muted-foreground"}`} />
                    <span className={`text-sm ${checked ? "text-success line-through" : "text-foreground"}`}>{item.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {checkedCount === EMPFANGS_CHECKLIST.length && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-success/10 border border-success/20 rounded-xl text-center">
                <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-1" />
                <p className="text-sm font-semibold text-success">Empfang abgeschlossen ✓</p>
                <p className="text-xs text-muted-foreground mt-0.5">Premium-Erlebnis erfolgreich gestartet.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* TELEFON-LEITFADEN */}
      {mode === "telefon" && (
        <div className="bg-card border border-border rounded-xl p-5 max-w-lg">
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-1">PREMIUM TELEFON-LEITFADEN</p>
          <p className="text-xs text-muted-foreground mb-4">Für jeden eingehenden Anruf — Schritt für Schritt</p>
          <div className="space-y-2">
            {TELEFON_LEITFADEN.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl">
            <p className="text-[10px] text-primary uppercase tracking-wider mb-1">ZIELGEFÜHL</p>
            <p className="text-sm text-foreground italic">„Die kümmern sich wirklich."</p>
          </div>
        </div>
      )}

      {/* HEUTE */}
      {mode === "heute" && (
        <div className="space-y-3">
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase">HEUTIGE TERMINE</p>
          {todayAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Keine Termine heute eingetragen.</p>
          ) : (
            todayAppointments.sort((a, b) => (a.start_time || "").localeCompare(b.start_time || "")).map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="text-center w-12">
                  <p className="text-sm font-semibold text-foreground">{a.start_time || "—"}</p>
                  <p className="text-[9px] text-muted-foreground">{a.end_time}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.customer_name} {a.vehicle_info ? `· ${a.vehicle_info}` : ""}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-secondary rounded-md text-muted-foreground">{a.type}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}