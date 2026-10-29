import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ITEMS = [
  { value: "t-shirt", label: "T-Shirt", emoji: "👕" },
  { value: "hoodie", label: "Hoodie", emoji: "🧥" },
  { value: "softshell", label: "Softshelljacke", emoji: "🧥" },
  { value: "arbeitshose", label: "Arbeitshose", emoji: "👖" },
  { value: "sicherheitsschuhe", label: "Sicherheitsschuhe", emoji: "👟" },
  { value: "cap", label: "Cap", emoji: "🧢" },
  { value: "uebergabekleidung", label: "Übergabekleidung", emoji: "🎽" },
  { value: "sonstiges", label: "Sonstiges", emoji: "📦" },
];

const REASONS = [
  { value: "neu", label: "Neu (erstmalig)" },
  { value: "beschaedigt", label: "Beschädigt" },
  { value: "verschlissen", label: "Verschlissen" },
  { value: "zusaetzlich", label: "Zusätzlicher Bedarf" },
];

const SIZES_SHIRT = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const COST_ESTIMATES = {
  "t-shirt": 25, "hoodie": 55, "softshell": 80, "arbeitshose": 60,
  "sicherheitsschuhe": 90, "cap": 20, "uebergabekleidung": 70, "sonstiges": 30
};

export default function ClothingRequestForm({ team, profiles, onSave, onClose }) {
  const [form, setForm] = useState({
    employee: "", item: "", size: "", quantity: 1, reason: "neu", notes: ""
  });

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Pre-fill size from profile
  useEffect(() => {
    if (!form.employee || !form.item) return;
    const profile = profiles.find(p => p.employee === form.employee);
    if (!profile) return;
    const isShoe = form.item === "sicherheitsschuhe";
    const isPants = form.item === "arbeitshose";
    if (isShoe && profile.shoe_size) u("size", profile.shoe_size);
    else if (isPants && profile.pants_size) u("size", profile.pants_size);
    else if (profile.shirt_size) u("size", profile.shirt_size);
  }, [form.employee, form.item]);

  const item = ITEMS.find(i => i.value === form.item);
  const estimatedCost = (COST_ESTIMATES[form.item] || 30) * (form.quantity || 1);

  const isShoe = form.item === "sicherheitsschuhe";
  const isPants = form.item === "arbeitshose";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Shirt className="w-4 h-4 text-primary" />
            <p className="font-heading text-base">Kleidungsantrag</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Employee */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Mitarbeiter *</label>
            <Select value={form.employee} onValueChange={v => u("employee", v)}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>{team.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* Item selection */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Artikel *</label>
            <div className="grid grid-cols-2 gap-2">
              {ITEMS.map(i => (
                <button key={i.value} onClick={() => u("item", i.value)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm text-left transition-all
                    ${form.item === i.value ? "bg-primary/10 border-primary/40 text-foreground" : "bg-secondary border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"}`}>
                  <span className="text-lg">{i.emoji}</span>
                  <span className="font-medium text-xs">{i.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size + Quantity */}
          {form.item && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Größe *</label>
                {isShoe ? (
                  <Input value={form.size} onChange={e => u("size", e.target.value)} placeholder="z.B. 42" className="bg-secondary border-border" />
                ) : isPants ? (
                  <Input value={form.size} onChange={e => u("size", e.target.value)} placeholder="z.B. 32/32" className="bg-secondary border-border" />
                ) : (
                  <Select value={form.size} onValueChange={v => u("size", v)}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Größe" /></SelectTrigger>
                    <SelectContent>{SIZES_SHIRT.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Menge</label>
                <Input type="number" min={1} max={5} value={form.quantity} onChange={e => u("quantity", parseInt(e.target.value))}
                  className="bg-secondary border-border" />
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Grund *</label>
            <div className="flex flex-wrap gap-2">
              {REASONS.map(r => (
                <button key={r.value} onClick={() => u("reason", r.value)}
                  className={`px-3 py-1.5 rounded-full text-xs border font-medium transition-all
                    ${form.reason === r.value ? "bg-primary/10 border-primary/40 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Notiz</label>
            <Textarea value={form.notes} onChange={e => u("notes", e.target.value)} placeholder="Weitere Hinweise..." className="bg-secondary border-border h-16 text-sm" />
          </div>

          {/* Cost estimate */}
          {form.item && (
            <div className="p-3 bg-secondary rounded-lg flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Geschätzte Kosten</p>
              <p className="font-heading text-sm text-foreground">~ {estimatedCost} €</p>
            </div>
          )}

          <Button
            onClick={() => onSave({ ...form, estimated_cost: estimatedCost })}
            disabled={!form.employee || !form.item || !form.size}
            className="w-full h-10 font-heading tracking-wide">
            ANTRAG EINREICHEN
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}