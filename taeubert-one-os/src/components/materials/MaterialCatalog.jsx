import React, { useState } from "react";
import { Plus, Edit2, AlertTriangle, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { value: "karosserie", label: "Karosserie" },
  { value: "vorbereitung", label: "Vorbereitung" },
  { value: "lackierung", label: "Lackierung" },
  { value: "finish", label: "Finish" },
  { value: "aufbereitung", label: "Aufbereitung" },
  { value: "reinigung", label: "Reinigung" },
  { value: "schutz", label: "Schutz" },
  { value: "sonstiges", label: "Sonstiges" },
];

const EMPTY = {
  name: "", category: "sonstiges", supplier_main: "", supplier_alt: "",
  article_number: "", unit: "Stk", price_per_unit: "", current_stock: "",
  min_stock: "", preferred_order_qty: "", lead_time_days: "", notes: ""
};

function MaterialForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY);
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
          <p className="font-heading text-base">{initial?.id ? "Material bearbeiten" : "Neues Material"}</p>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Produktname *</label>
              <Input value={form.name} onChange={e => u("name", e.target.value)} placeholder="z.B. 3M Schleifscheibe P240" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Kategorie</label>
              <Select value={form.category} onValueChange={v => u("category", v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Einheit</label>
              <Input value={form.unit} onChange={e => u("unit", e.target.value)} placeholder="Stk / Liter / Rolle" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Hauptlieferant</label>
              <Input value={form.supplier_main} onChange={e => u("supplier_main", e.target.value)} placeholder="z.B. Knoll" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Ersatzlieferant</label>
              <Input value={form.supplier_alt} onChange={e => u("supplier_alt", e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Artikelnummer</label>
              <Input value={form.article_number} onChange={e => u("article_number", e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Preis / Einheit (€)</label>
              <Input type="number" value={form.price_per_unit} onChange={e => u("price_per_unit", parseFloat(e.target.value))} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Aktueller Bestand</label>
              <Input type="number" value={form.current_stock} onChange={e => u("current_stock", parseFloat(e.target.value))} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Mindestbestand</label>
              <Input type="number" value={form.min_stock} onChange={e => u("min_stock", parseFloat(e.target.value))} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Bestellmenge (bevorzugt)</label>
              <Input type="number" value={form.preferred_order_qty} onChange={e => u("preferred_order_qty", parseFloat(e.target.value))} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Lieferzeit (Tage)</label>
              <Input type="number" value={form.lead_time_days} onChange={e => u("lead_time_days", parseInt(e.target.value))} className="bg-secondary border-border" />
            </div>
          </div>
          <Button onClick={() => onSave(form)} disabled={!form.name} className="w-full h-10 font-heading tracking-wide">
            SPEICHERN
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MaterialCatalog({ materials, onSave }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("alle");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {id,...} = existing

  const filtered = materials.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "alle" || m.category === catFilter;
    return matchSearch && matchCat;
  });

  const isLow = (m) => m.current_stock !== undefined && m.min_stock !== undefined && m.current_stock <= m.min_stock;

  return (
    <div className="space-y-4">
      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche..." className="bg-secondary border-border pl-8" />
          <Package className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="bg-secondary border-border w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setEditing({})} className="gap-1.5 h-9 text-sm">
          <Plus className="w-4 h-4" /> Neu
        </Button>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Keine Materialien</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(m => (
          <div key={m.id} className={`bg-card border rounded-xl p-4 ${isLow(m) ? "border-destructive/30" : "border-border"}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isLow(m) && <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />}
                  <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{m.category}</p>
              </div>
              <button onClick={() => setEditing(m)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-secondary rounded-lg">
                <p className={`font-heading text-sm ${isLow(m) ? "text-destructive" : "text-foreground"}`}>{m.current_stock ?? "–"}</p>
                <p className="text-[9px] text-muted-foreground">Bestand</p>
              </div>
              <div className="text-center p-2 bg-secondary rounded-lg">
                <p className="font-heading text-sm text-foreground">{m.min_stock ?? "–"}</p>
                <p className="text-[9px] text-muted-foreground">Minimum</p>
              </div>
              <div className="text-center p-2 bg-secondary rounded-lg">
                <p className="font-heading text-sm text-foreground">{m.price_per_unit ? `${m.price_per_unit}€` : "–"}</p>
                <p className="text-[9px] text-muted-foreground">/ {m.unit || "Stk"}</p>
              </div>
            </div>
            {m.supplier_main && (
              <p className="text-[10px] text-muted-foreground mt-2">Lieferant: {m.supplier_main}{m.lead_time_days ? ` · ${m.lead_time_days}d` : ""}</p>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editing !== null && (
          <MaterialForm
            initial={editing?.id ? editing : null}
            onSave={(data) => { onSave(editing?.id || null, data); setEditing(null); }}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}