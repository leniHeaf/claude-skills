import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const initialForm = {
  customer_name: "",
  license_plate: "",
  make: "",
  model: "",
  color: "",
  vin: "",
  insurance: "",
  insurance_case_number: "",
  damage_description: "",
  customer_wishes: "",
  status: "annahme",
  condition: "in_arbeit",
  progress: 0,
};

export default function AddVehicleDialog({ open, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState(initialForm);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm(initialForm);
  };

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-wide text-foreground">
            FAHRZEUG ERFASSEN
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Marke *</Label>
              <Input value={form.make} onChange={(e) => update("make", e.target.value)} required className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Modell *</Label>
              <Input value={form.model} onChange={(e) => update("model", e.target.value)} required className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Kennzeichen *</Label>
              <Input value={form.license_plate} onChange={(e) => update("license_plate", e.target.value)} required className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Farbe</Label>
              <Input value={form.color} onChange={(e) => update("color", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Kundenname *</Label>
            <Input value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} required className="bg-secondary border-border mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Versicherung</Label>
              <Input value={form.insurance} onChange={(e) => update("insurance", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Schadensnummer</Label>
              <Input value={form.insurance_case_number} onChange={(e) => update("insurance_case_number", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">FIN</Label>
            <Input value={form.vin} onChange={(e) => update("vin", e.target.value)} className="bg-secondary border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Schadensbeschreibung</Label>
            <Textarea value={form.damage_description} onChange={(e) => update("damage_description", e.target.value)} className="bg-secondary border-border mt-1 h-20" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Kundenwünsche</Label>
            <Textarea value={form.customer_wishes} onChange={(e) => update("customer_wishes", e.target.value)} className="bg-secondary border-border mt-1 h-20" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border">
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/80">
              {isLoading ? "Speichern..." : "Fahrzeug anlegen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}