import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialForm = {
  title: "",
  description: "",
  assigned_to: "",
  priority: "mittel",
  category: "sonstiges",
  deadline: "",
  vehicle_info: "",
};

export default function AddTaskDialog({ open, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState(initialForm);
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm(initialForm);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-wide text-foreground">NEUE AUFGABE</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label className="text-xs text-muted-foreground">Aufgabe *</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} required className="bg-secondary border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Beschreibung</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="bg-secondary border-border mt-1 h-20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Verantwortlicher *</Label>
              <Select value={form.assigned_to} onValueChange={(v) => update("assigned_to", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue placeholder="Auswählen" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {["Toni", "Lena", "Maik", "Marco", "Fanny", "Pascal", "Adrian"].map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Priorität</Label>
              <Select value={form.priority} onValueChange={(v) => update("priority", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="niedrig">Niedrig</SelectItem>
                  <SelectItem value="mittel">Mittel</SelectItem>
                  <SelectItem value="hoch">Hoch</SelectItem>
                  <SelectItem value="kritisch">Kritisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Kategorie</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="teile">Teile</SelectItem>
                  <SelectItem value="karosserie">Karosserie</SelectItem>
                  <SelectItem value="vorbereitung">Vorbereitung</SelectItem>
                  <SelectItem value="lackierung">Lackierung</SelectItem>
                  <SelectItem value="finish">Finish</SelectItem>
                  <SelectItem value="reinigung">Reinigung</SelectItem>
                  <SelectItem value="kunde">Kunde</SelectItem>
                  <SelectItem value="uebergabe">Übergabe</SelectItem>
                  <SelectItem value="lager">Lager</SelectItem>
                  <SelectItem value="sonstiges">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fällig am</Label>
              <Input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Fahrzeug (optional)</Label>
            <Input placeholder="z.B. BMW 3er - SON-TB 123" value={form.vehicle_info} onChange={(e) => update("vehicle_info", e.target.value)} className="bg-secondary border-border mt-1" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border">Abbrechen</Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/80">
              {isLoading ? "Speichern..." : "Erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}