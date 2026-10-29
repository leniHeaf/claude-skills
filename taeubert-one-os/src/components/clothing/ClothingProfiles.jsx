import React, { useState } from "react";
import { Edit2, X, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const FITS = [{ value: "slim", label: "Slim" }, { value: "regular", label: "Regular" }, { value: "relaxed", label: "Relaxed" }];
const ITEM_LABELS = {
  "t-shirt": "T-Shirt", "hoodie": "Hoodie", "softshell": "Softshelljacke",
  "arbeitshose": "Arbeitshose", "sicherheitsschuhe": "Sicherheitsschuhe",
  "cap": "Cap", "uebergabekleidung": "Übergabekleidung", "sonstiges": "Sonstiges"
};
const CONDITION_COLORS = { "gut": "text-success", "ok": "text-warning", "verschlissen": "text-destructive" };

function ProfileEditor({ employee, profile, onSave, onClose }) {
  const [form, setForm] = useState({
    shirt_size: profile?.shirt_size || "",
    pants_size: profile?.pants_size || "",
    shoe_size: profile?.shoe_size || "",
    fit_preference: profile?.fit_preference || "regular",
    notes: profile?.notes || "",
  });
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-card border border-border rounded-2xl w-full max-w-sm">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <p className="font-heading text-base">{employee} – Größenprofil</p>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Oberteil</label>
              <Select value={form.shirt_size} onValueChange={v => u("shirt_size", v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Größe" /></SelectTrigger>
                <SelectContent>{SHIRT_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Hose</label>
              <Input value={form.pants_size} onChange={e => u("pants_size", e.target.value)} placeholder="z.B. 32/32" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Schuh</label>
              <Input value={form.shoe_size} onChange={e => u("shoe_size", e.target.value)} placeholder="z.B. 43" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Passform</label>
              <Select value={form.fit_preference} onValueChange={v => u("fit_preference", v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{FITS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Notiz</label>
            <Input value={form.notes} onChange={e => u("notes", e.target.value)} placeholder="Besonderheiten..." className="bg-secondary border-border" />
          </div>
          <Button onClick={() => onSave(form)} className="w-full h-9 font-heading tracking-wide text-sm">SPEICHERN</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ClothingProfiles({ team, profiles, orders, onSave }) {
  const [editing, setEditing] = useState(null);

  return (
    <div className="space-y-3">
      {team.map(emp => {
        const profile = profiles.find(p => p.employee === emp);
        const empOrders = orders.filter(o => o.employee === emp && o.status !== "abgelehnt");
        const totalCost = empOrders.reduce((s, o) => s + (o.estimated_cost || 0), 0);

        return (
          <div key={emp} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{emp}</p>
                  {totalCost > 0 && <p className="text-[10px] text-muted-foreground">Gesamt: {totalCost} €</p>}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditing(emp)}
                className="h-7 text-xs border-border gap-1">
                {profile ? <><Edit2 className="w-3 h-3" /> Bearbeiten</> : <><Plus className="w-3 h-3" /> Profil anlegen</>}
              </Button>
            </div>

            {profile ? (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "Oberteil", value: profile.shirt_size },
                  { label: "Hose", value: profile.pants_size },
                  { label: "Schuh", value: profile.shoe_size },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 bg-secondary rounded-lg">
                    <p className="font-heading text-sm text-foreground">{s.value || "–"}</p>
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic mb-3">Kein Profil hinterlegt</p>
            )}

            {/* Recent orders */}
            {empOrders.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Bestellhistorie</p>
                {empOrders.slice(0, 3).map(o => (
                  <div key={o.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{ITEM_LABELS[o.item] || o.item} · {o.size}</span>
                    <span className={`font-medium ${
                      o.status === "ausgegeben" ? "text-muted-foreground" :
                      o.status === "genehmigt" || o.status === "bestellt" ? "text-success" :
                      "text-warning"
                    }`}>{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <AnimatePresence>
        {editing && (
          <ProfileEditor
            employee={editing}
            profile={profiles.find(p => p.employee === editing)}
            onSave={(data) => {
              const existing = profiles.find(p => p.employee === editing);
              onSave(editing, data, existing?.id);
              setEditing(null);
            }}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}