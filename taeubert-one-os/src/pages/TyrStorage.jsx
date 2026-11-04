import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CircleDot, Plus, Search, QrCode, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CONDITION_CONFIG = {
  neu: { label: "Neu", color: "text-chart-2", dot: "bg-chart-2" },
  gut: { label: "Gut", color: "text-success", dot: "bg-success" },
  ok: { label: "Ok", color: "text-warning", dot: "bg-warning" },
  schlecht: { label: "Schlecht", color: "text-destructive", dot: "bg-destructive" },
};

const SEASONS = [
  { value: "sommer", label: "Sommer" },
  { value: "winter", label: "Winter" },
  { value: "ganzjahr", label: "Ganzjahr" },
];

function TyreForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    customer_name: "", license_plate: "", brand: "", size: "",
    season: "sommer", tread_depth: "", condition: "gut",
    storage_location: "", notes: ""
  });
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <CircleDot className="w-4 h-4 text-primary" />
            <p className="font-heading text-base">Reifensatz einlagern</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Kundenname *</label>
              <Input value={form.customer_name} onChange={e => u("customer_name", e.target.value)} className="bg-secondary border-border" placeholder="Max Mustermann" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Kennzeichen</label>
              <Input value={form.license_plate} onChange={e => u("license_plate", e.target.value)} className="bg-secondary border-border" placeholder="HH-AB 1234" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Lagerplatz</label>
              <Input value={form.storage_location} onChange={e => u("storage_location", e.target.value)} className="bg-secondary border-border" placeholder="A-12" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Marke</label>
              <Input value={form.brand} onChange={e => u("brand", e.target.value)} className="bg-secondary border-border" placeholder="Michelin" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Größe</label>
              <Input value={form.size} onChange={e => u("size", e.target.value)} className="bg-secondary border-border" placeholder="225/45 R17" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Saison</label>
              <Select value={form.season} onValueChange={v => u("season", v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{SEASONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Profiltiefe (mm)</label>
              <Input type="number" step="0.1" value={form.tread_depth} onChange={e => u("tread_depth", e.target.value)} className="bg-secondary border-border" placeholder="6.5" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Zustand</label>
              <div className="flex gap-2">
                {Object.entries(CONDITION_CONFIG).map(([k, v]) => (
                  <button key={k} onClick={() => u("condition", k)}
                    className={`flex-1 py-2 rounded-lg text-xs border font-medium transition-all
                      ${form.condition === k ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Notiz</label>
              <Textarea value={form.notes} onChange={e => u("notes", e.target.value)} className="bg-secondary border-border h-16 text-sm" />
            </div>
          </div>
          <Button onClick={() => onSave(form)} disabled={!form.customer_name} className="w-full h-10 font-heading tracking-wide">EINLAGERN</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TyrStorage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filterSeason, setFilterSeason] = useState("alle");

  const { data: tyres = [] } = useQuery({
    queryKey: ["tyres"],
    queryFn: () => base44.entities.TyreStorage.list("-created_date", 200),
  });

  const createTyre = useMutation({
    mutationFn: (data) => base44.entities.TyreStorage.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tyres"] }),
  });

  const updateTyre = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TyreStorage.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tyres"] }),
  });

  const filtered = tyres.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.customer_name?.toLowerCase().includes(q) || t.license_plate?.toLowerCase().includes(q) || t.storage_location?.toLowerCase().includes(q);
    const matchSeason = filterSeason === "alle" || t.season === filterSeason;
    return matchSearch && matchSeason;
  });

  const lowProfile = tyres.filter(t => parseFloat(t.tread_depth) < 3).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">REIFENLAGER</h1>
            <p className="text-sm text-muted-foreground mt-1">Einlagerung · Zustand · Lagerplatz</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2 h-9">
            <Plus className="w-4 h-4" /> Einlagern
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Gesamt", value: tyres.length, color: "text-chart-1" },
          { label: "Sommer", value: tyres.filter(t => t.season === "sommer").length, color: "text-chart-3" },
          { label: "Profil < 3mm", value: lowProfile, color: lowProfile > 0 ? "text-destructive" : "text-muted-foreground" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{k.label}</p>
            <p className={`font-heading text-xl ${k.color}`}>{k.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kunde, Kennzeichen, Lagerplatz..."
            className="pl-9 bg-secondary border-border text-sm h-9" />
        </div>
        <div className="flex gap-1">
          {["alle", "sommer", "winter", "ganzjahr"].map(s => (
            <button key={s} onClick={() => setFilterSeason(s)}
              className={`px-3 h-9 rounded-lg text-xs font-medium border transition-all
                ${filterSeason === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {s === "alle" ? "Alle" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {lowProfile > 0 && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl mb-4 text-xs text-destructive">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {lowProfile} Reifensatz/-sätze mit Profiltiefe unter 3mm — Rückruf empfohlen.
        </div>
      )}

      {/* Tyre list */}
      <div className="grid gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <CircleDot className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Keine Reifen gefunden</p>
          </div>
        )}
        {filtered.map(tyre => {
          const cond = CONDITION_CONFIG[tyre.condition] || CONDITION_CONFIG.gut;
          const lowTread = parseFloat(tyre.tread_depth) < 3;
          return (
            <motion.div key={tyre.id} layout
              className={`bg-card border rounded-xl p-4 ${lowTread ? "border-destructive/30" : "border-border"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{tyre.customer_name}</p>
                    {tyre.license_plate && (
                      <span className="text-[10px] px-2 py-0.5 bg-secondary rounded font-mono text-muted-foreground">{tyre.license_plate}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {tyre.brand && <span>{tyre.brand}</span>}
                    {tyre.size && <span>· {tyre.size}</span>}
                    {tyre.season && <span>· {tyre.season.charAt(0).toUpperCase() + tyre.season.slice(1)}</span>}
                    {tyre.tread_depth && (
                      <span className={lowTread ? "text-destructive font-medium" : ""}>
                        · {tyre.tread_depth}mm Profil{lowTread ? " ⚠" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {tyre.storage_location && (
                    <div className="flex items-center gap-1 mb-1">
                      <QrCode className="w-3 h-3 text-muted-foreground" />
                      <span className="font-heading text-sm text-foreground">{tyre.storage_location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 justify-end">
                    <span className={`w-1.5 h-1.5 rounded-full ${cond.dot}`} />
                    <span className={`text-[10px] ${cond.color}`}>{cond.label}</span>
                  </div>
                </div>
              </div>
              {tyre.notes && <p className="text-xs text-muted-foreground mt-2">{tyre.notes}</p>}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showForm && (
          <TyreForm
            onSave={(data) => { createTyre.mutate(data); setShowForm(false); }}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}