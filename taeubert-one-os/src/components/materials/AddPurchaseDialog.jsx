import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Camera, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];
const CATEGORIES = ["karosserie", "vorbereitung", "lackierung", "finish", "aufbereitung", "reinigung", "schutz", "sonstiges"];
const URGENCIES = [
  { value: "sofort", label: "🔴 Sofort" },
  { value: "dringend", label: "🟡 Dringend" },
  { value: "normal", label: "🔵 Normal" },
  { value: "niedrig", label: "⚪ Niedrig" },
];

const EMPTY = {
  material_name: "", category: "sonstiges", quantity: 1, unit: "Stk",
  urgency: "normal", supplier: "", vehicle_info: "", requested_by: "",
  notes: "", photo: "", price_total: ""
};

export default function AddPurchaseDialog({ materials, vehicles, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [aiLoading, setAiLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload + AI recognition
    setAiLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    u("photo", file_url);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analysiere dieses Produkt-/Materialfoto aus einer Lackier- und Karosserie-Werkstatt.
      Erkenne:
      - Produktname (präzise, mit Marke wenn erkennbar)
      - Kategorie (karosserie/vorbereitung/lackierung/finish/aufbereitung/reinigung/schutz/sonstiges)
      - Hersteller
      - Lieferant (typische Bezugsquelle in Deutschland)
      - Einheit (Stk/Liter/Rolle/Packung usw.)
      Antworte auf Deutsch.`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: { type: "string" },
          supplier: { type: "string" },
          unit: { type: "string" },
          notes: { type: "string" }
        }
      }
    });

    if (result?.name) {
      setForm(f => ({
        ...f,
        material_name: result.name || f.material_name,
        category: result.category || f.category,
        supplier: result.supplier || f.supplier,
        unit: result.unit || f.unit,
        notes: result.notes ? `Foto-Erkennung: ${result.notes}` : f.notes,
      }));
    }
    setAiLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
          <p className="font-heading text-base">Material anfragen</p>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Photo upload + AI */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Produktfoto (Foto-Erkennung)</label>
            <div className="flex gap-2 items-start">
              <label className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all
                ${aiLoading ? "border-primary/40 text-primary" : "border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"}`}>
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {aiLoading ? "Erkennt..." : "Foto wählen"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={aiLoading} />
              </label>
              {photoPreview && <img src={photoPreview} alt="Vorschau" className="w-14 h-14 object-cover rounded-lg border border-border" />}
              {aiLoading && (
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Erkennt Produkt...
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Produktname *</label>
            <Input value={form.material_name} onChange={e => u("material_name", e.target.value)}
              placeholder="z.B. Schleifpapier P240" className="bg-secondary border-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Kategorie</label>
              <Select value={form.category} onValueChange={v => u("category", v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Dringlichkeit</label>
              <Select value={form.urgency} onValueChange={v => u("urgency", v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{URGENCIES.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Menge</label>
              <Input type="number" value={form.quantity} onChange={e => u("quantity", parseFloat(e.target.value))} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Einheit</label>
              <Input value={form.unit} onChange={e => u("unit", e.target.value)} placeholder="Stk / Liter / Rolle" className="bg-secondary border-border" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Lieferant</label>
              <Input value={form.supplier} onChange={e => u("supplier", e.target.value)} placeholder="z.B. Knoll" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Angefragt von</label>
              <Select value={form.requested_by} onValueChange={v => u("requested_by", v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Mitarbeiter" /></SelectTrigger>
                <SelectContent>{TEAM.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Fahrzeug / Auftrag</label>
            <Select value={form.vehicle_info} onValueChange={v => u("vehicle_info", v)}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Kein Fahrzeugbezug</SelectItem>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={`${v.make} ${v.model} – ${v.license_plate}`}>
                    {v.make} {v.model} – {v.license_plate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Notiz</label>
            <Textarea value={form.notes} onChange={e => u("notes", e.target.value)} placeholder="Weitere Hinweise..." className="bg-secondary border-border h-16 text-sm" />
          </div>

          <Button onClick={() => {
            const clean = { ...form };
            // Zahlen-Felder: leere Strings entfernen, gültige Werte casten
            if (clean.price_total === "" || clean.price_total == null) {
              delete clean.price_total;
            } else {
              clean.price_total = parseFloat(clean.price_total) || 0;
            }
            // Leere Strings nicht als Felder mitsenden (vermeidet Validierungsfehler)
            Object.keys(clean).forEach(k => {
              if (clean[k] === "" || clean[k] == null) delete clean[k];
            });
            // Pflichtfelder sicherstellen
            clean.material_name = form.material_name;
            clean.quantity = form.quantity;
            clean.urgency = form.urgency;
            onSave(clean);
          }} disabled={!form.material_name || form.quantity < 1}
            className="w-full h-10 font-heading tracking-wide">
            ANFRAGE ERSTELLEN
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}