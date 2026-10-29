import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const defaultChecklists = {
  vorbereitung: ["Oberfläche geschliffen", "Spaltmaße geprüft", "Grundierung aufgetragen", "Schleifstaub entfernt"],
  lackierung: ["Farbe korrekt gemischt", "Gleichmäßiger Auftrag", "Keine Läufer", "Keine Einschlüsse", "Farbton geprüft"],
  finish: ["Poliert", "Keine Hologramme", "Spaltmaße korrekt", "Anbauteile montiert", "Reinigung durchgeführt"],
  endkontrolle: ["Alle Arbeiten abgeschlossen", "Qualitätsstandard erfüllt", "Fotos gemacht", "Fahrzeug gereinigt", "Übergabe vorbereitet"],
  uebergabe: ["Fahrzeug sauber", "Alle Dokumente vorhanden", "Kunde informiert", "Schlüssel bereit"],
};

export default function AddQualityCheckDialog({ open, onClose, onSubmit, isLoading }) {
  const [stage, setStage] = useState("endkontrolle");
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [inspector, setInspector] = useState("");
  const [comments, setComments] = useState("");
  const [checklist, setChecklist] = useState(
    defaultChecklists.endkontrolle.map((item) => ({ item, checked: false, comment: "" }))
  );

  const handleStageChange = (s) => {
    setStage(s);
    setChecklist((defaultChecklists[s] || []).map((item) => ({ item, checked: false, comment: "" })));
  };

  const addItem = () => {
    setChecklist([...checklist, { item: "", checked: false, comment: "" }]);
  };

  const removeItem = (i) => {
    setChecklist(checklist.filter((_, idx) => idx !== i));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ stage, vehicle_info: vehicleInfo, inspector, comments, checklist, status: "offen" });
    setVehicleInfo("");
    setInspector("");
    setComments("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-wide text-foreground">QUALITÄTSPRÜFUNG</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Prüfstufe</Label>
              <Select value={stage} onValueChange={handleStageChange}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="vorbereitung">Vorbereitung</SelectItem>
                  <SelectItem value="lackierung">Lackierung</SelectItem>
                  <SelectItem value="finish">Finish</SelectItem>
                  <SelectItem value="endkontrolle">Endkontrolle</SelectItem>
                  <SelectItem value="uebergabe">Übergabe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Prüfer</Label>
              <Select value={inspector} onValueChange={setInspector}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue placeholder="Auswählen" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {["Toni", "Maik", "Marco", "Fanny", "Pascal"].map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Fahrzeug</Label>
            <Input placeholder="z.B. BMW 3er - SON-TB 123" value={vehicleInfo} onChange={(e) => setVehicleInfo(e.target.value)} className="bg-secondary border-border mt-1" />
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Checkliste</Label>
              <button type="button" onClick={addItem} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Punkt
              </button>
            </div>
            <div className="space-y-2">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={item.item}
                    onChange={(e) => {
                      const updated = [...checklist];
                      updated[i] = { ...updated[i], item: e.target.value };
                      setChecklist(updated);
                    }}
                    className="bg-secondary border-border text-sm"
                    placeholder="Prüfpunkt"
                  />
                  <button type="button" onClick={() => removeItem(i)} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Kommentare</Label>
            <Textarea value={comments} onChange={(e) => setComments(e.target.value)} className="bg-secondary border-border mt-1 h-20" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border">Abbrechen</Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/80">
              {isLoading ? "Speichern..." : "Prüfung erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}