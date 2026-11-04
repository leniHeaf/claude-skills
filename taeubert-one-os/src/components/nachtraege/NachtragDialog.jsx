import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Loader2, AlertTriangle } from "lucide-react";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

const CATEGORIES = {
  karosserie: "Karosserie",
  lackierung: "Lackierung",
  mechanik: "Mechanik",
  elektrik: "Elektrik",
  innenraum: "Innenraum",
  sonstiges: "Sonstiges",
};

export default function NachtragDialog({ open, onClose, vehicleId, vehicleInfo }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    reported_by: "",
    category: "karosserie",
    description: "",
    extra_time_hours: "",
    estimated_cost: "",
    urgency: "normal",
  });
  const [photosBefore, setPhotosBefore] = useState([]);
  const [photosAfter, setPhotosAfter] = useState([]);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Nachtrag.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nachtraege", vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["nachtraege-all"] });
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setForm({ reported_by: "", category: "karosserie", description: "", extra_time_hours: "", estimated_cost: "", urgency: "normal" });
    setPhotosBefore([]);
    setPhotosAfter([]);
  };

  const handleUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (type === "before") setUploadingBefore(true);
    else setUploadingAfter(true);

    const urls = await Promise.all(files.map(async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    }));

    if (type === "before") { setPhotosBefore((p) => [...p, ...urls]); setUploadingBefore(false); }
    else { setPhotosAfter((p) => [...p, ...urls]); setUploadingAfter(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      vehicle_id: vehicleId,
      vehicle_info: vehicleInfo,
      reported_by: form.reported_by,
      category: form.category,
      description: form.description,
      extra_time_hours: form.extra_time_hours ? parseFloat(form.extra_time_hours) : null,
      estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null,
      urgency: form.urgency,
      photos_before: photosBefore,
      photos_after: photosAfter,
      status: "offen",
    });
  };

  const u = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            NACHTRAG MELDEN
          </DialogTitle>
          {vehicleInfo && <p className="text-xs text-muted-foreground mt-1">{vehicleInfo}</p>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Gemeldet von *</Label>
              <Select value={form.reported_by} onValueChange={(v) => u("reported_by", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue placeholder="Mitarbeiter" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {TEAM.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Kategorie</Label>
              <Select value={form.category} onValueChange={(v) => u("category", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {Object.entries(CATEGORIES).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Schadensbeschreibung *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => u("description", e.target.value)}
              required
              placeholder="Was wurde entdeckt? Wo genau? Wie ist der Zustand?"
              className="bg-secondary border-border mt-1 h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Zusatzzeit (Std.)</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={form.extra_time_hours}
                onChange={(e) => u("extra_time_hours", e.target.value)}
                placeholder="z.B. 2.5"
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Mehrkosten (€)</Label>
              <Input
                type="number"
                min="0"
                value={form.estimated_cost}
                onChange={(e) => u("estimated_cost", e.target.value)}
                placeholder="z.B. 150"
                className="bg-secondary border-border mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Dringlichkeit</Label>
            <Select value={form.urgency} onValueChange={(v) => u("urgency", v)}>
              <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="niedrig">Niedrig</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="dringend">Dringend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Photo Uploads */}
          <div className="grid grid-cols-2 gap-3">
            <PhotoUploadBox
              label="Vorher-Fotos"
              photos={photosBefore}
              uploading={uploadingBefore}
              onUpload={(e) => handleUpload(e, "before")}
              onRemove={(i) => setPhotosBefore((p) => p.filter((_, idx) => idx !== i))}
            />
            <PhotoUploadBox
              label="Nachher-Fotos"
              photos={photosAfter}
              uploading={uploadingAfter}
              onUpload={(e) => handleUpload(e, "after")}
              onRemove={(i) => setPhotosAfter((p) => p.filter((_, idx) => idx !== i))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border">Abbrechen</Button>
            <Button
              type="submit"
              disabled={mutation.isPending || !form.reported_by || !form.description}
              className="flex-1 bg-warning/80 hover:bg-warning text-black font-semibold"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Nachtrag einreichen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PhotoUploadBox({ label, photos, uploading, onUpload, onRemove }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1 border border-dashed border-border rounded-lg p-2 min-h-[80px]">
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {photos.map((url, i) => (
            <div key={i} className="relative w-14 h-14">
              <img src={url} alt="" className="w-full h-full object-cover rounded-md" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute -top-1 -right-1 bg-destructive rounded-full w-4 h-4 flex items-center justify-center"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}
        </div>
        <label className="cursor-pointer flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          <span>{uploading ? "Lädt..." : "Foto hinzufügen"}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={onUpload} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}