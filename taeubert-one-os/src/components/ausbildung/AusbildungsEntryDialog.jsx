import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DEPARTMENTS } from "@/pages/Ausbildungsplan";

export default function AusbildungsEntryDialog({ open, onClose, editEntry }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    apprentice: "",
    department: "werkstatt",
    topic: "",
    instructor: "",
    start_date: "",
    end_date: "",
    year_of_apprenticeship: 1,
    notes: "",
    status: "geplant",
  });

  useEffect(() => {
    if (editEntry) {
      setForm({
        apprentice: editEntry.apprentice || "",
        department: editEntry.department || "werkstatt",
        topic: editEntry.topic || "",
        instructor: editEntry.instructor || "",
        start_date: editEntry.start_date || "",
        end_date: editEntry.end_date || "",
        year_of_apprenticeship: editEntry.year_of_apprenticeship || 1,
        notes: editEntry.notes || "",
        status: editEntry.status || "geplant",
      });
    } else {
      setForm({
        apprentice: "", department: "werkstatt", topic: "", instructor: "",
        start_date: "", end_date: "", year_of_apprenticeship: 1, notes: "", status: "geplant",
      });
    }
  }, [editEntry, open]);

  const u = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Ausbildungsplan.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["ausbildungsplan"] }); onClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Ausbildungsplan.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["ausbildungsplan"] }); onClose(); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editEntry) {
      updateMutation.mutate({ id: editEntry.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-wide">
            {editEntry ? "EINSATZ BEARBEITEN" : "NEUER EINSATZ"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label className="text-xs text-muted-foreground">Azubi *</Label>
            <Input value={form.apprentice} onChange={e => u("apprentice", e.target.value)} required
              placeholder="z.B. Adrian" className="bg-secondary border-border mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Einsatzort</Label>
              <Select value={form.department} onValueChange={v => u("department", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {Object.entries(DEPARTMENTS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Lehrjahr</Label>
              <Select value={String(form.year_of_apprenticeship)} onValueChange={v => u("year_of_apprenticeship", Number(v))}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {[1, 2, 3].map(y => <SelectItem key={y} value={String(y)}>{y}. Lehrjahr</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Lerninhalt / Thema</Label>
            <Input value={form.topic} onChange={e => u("topic", e.target.value)}
              placeholder="z.B. Spachteln, Lackvorbereitung" className="bg-secondary border-border mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Von *</Label>
              <Input type="date" value={form.start_date} onChange={e => u("start_date", e.target.value)} required
                className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Bis *</Label>
              <Input type="date" value={form.end_date} onChange={e => u("end_date", e.target.value)} required
                className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Ausbilder / Betreuer</Label>
            <Input value={form.instructor} onChange={e => u("instructor", e.target.value)}
              placeholder="z.B. Toni, Maik" className="bg-secondary border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Notizen</Label>
            <Textarea value={form.notes} onChange={e => u("notes", e.target.value)}
              className="bg-secondary border-border mt-1 h-16" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border">Abbrechen</Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/80">
              {isLoading ? "..." : "Speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}