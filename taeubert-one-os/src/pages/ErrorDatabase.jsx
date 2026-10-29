import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Plus, CheckCircle, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import EmptyState from "../components/shared/EmptyState";

const CATEGORIES = {
  hologramme: { label: "Hologramme", color: "bg-warning/20 text-warning" },
  durchpoliert: { label: "Durchpoliert", color: "bg-destructive/20 text-destructive" },
  staub: { label: "Staub", color: "bg-muted text-muted-foreground" },
  farbton: { label: "Farbton", color: "bg-info/20 text-info" },
  uebergaenge: { label: "Übergänge", color: "bg-chart-2/20 text-chart-2" },
  laeufer: { label: "Läufer", color: "bg-destructive/20 text-destructive" },
  schleifbild: { label: "Schleifbild", color: "bg-warning/20 text-warning" },
  einschluesse: { label: "Einschlüsse", color: "bg-muted text-muted-foreground" },
  sonstiges: { label: "Sonstiges", color: "bg-muted text-muted-foreground" },
};

const SEVERITY = {
  niedrig: "bg-muted text-muted-foreground",
  mittel: "bg-warning/20 text-warning",
  hoch: "bg-destructive/20 text-destructive",
};

export default function ErrorDatabase() {
  const [showAdd, setShowAdd] = useState(false);
  const [filterCat, setFilterCat] = useState("alle");
  const queryClient = useQueryClient();

  const { data: errors = [] } = useQuery({
    queryKey: ["errors"],
    queryFn: () => base44.entities.ErrorReport.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ErrorReport.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["errors"] }); setShowAdd(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ErrorReport.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["errors"] }),
  });

  const filtered = errors.filter(e => filterCat === "alle" || e.category === filterCat);

  // Stats
  const stats = Object.keys(CATEGORIES).map(cat => ({
    cat,
    count: errors.filter(e => e.category === cat).length,
  })).sort((a, b) => b.count - a.count).filter(s => s.count > 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">FEHLERDATENBANK</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fehler analysieren — nicht wiederholen · {errors.length} Einträge
            </p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-primary hover:bg-primary/80 gap-2">
            <Plus className="w-4 h-4" /> Fehler dokumentieren
          </Button>
        </div>
      </motion.div>

      {/* Stats Bar */}
      {stats.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3 flex items-center gap-2">
            <BarChart2 className="w-3 h-3" /> FEHLERANALYSE
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.map(s => (
              <button
                key={s.cat}
                onClick={() => setFilterCat(filterCat === s.cat ? "alle" : s.cat)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                  ${filterCat === s.cat ? "bg-primary text-primary-foreground border-primary" : `${CATEGORIES[s.cat].color} border-border hover:border-primary/30`}`}
              >
                {CATEGORIES[s.cat].label}
                <span className="font-heading text-sm">{s.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error List */}
      {errors.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="Noch keine Fehler dokumentiert" description="Dokumentiere Fehler, um daraus zu lernen und sie zu vermeiden." />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(err => {
              const catCfg = CATEGORIES[err.category] || CATEGORIES.sonstiges;
              return (
                <motion.div
                  key={err.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`bg-card border rounded-xl p-5 ${err.resolved ? "opacity-60 border-border" : "border-border hover:border-primary/30"} transition-all`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={`text-[10px] border-0 ${catCfg.color}`}>{catCfg.label}</Badge>
                        <Badge className={`text-[10px] border-0 ${SEVERITY[err.severity] || SEVERITY.mittel}`}>{err.severity}</Badge>
                        {err.stage && <Badge className="text-[10px] bg-muted text-muted-foreground border-0">{err.stage}</Badge>}
                        {err.resolved && <Badge className="text-[10px] bg-success/20 text-success border-0">Gelöst</Badge>}
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{err.description}</p>
                      {err.vehicle_info && <p className="text-xs text-muted-foreground mb-2">🚗 {err.vehicle_info}</p>}
                      {err.root_cause && (
                        <div className="mt-3 p-3 bg-secondary rounded-lg">
                          <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-1">Ursache</p>
                          <p className="text-xs text-foreground">{err.root_cause}</p>
                        </div>
                      )}
                      {err.solution && (
                        <div className="mt-2 p-3 bg-success/5 border border-success/20 rounded-lg">
                          <p className="text-[10px] tracking-wider text-success uppercase mb-1">Lösung</p>
                          <p className="text-xs text-foreground">{err.solution}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-[10px] text-muted-foreground">
                        {err.created_date ? format(new Date(err.created_date), "dd.MM.yy") : ""}
                      </p>
                      {!err.resolved && (
                        <button
                          onClick={() => updateMutation.mutate({ id: err.id, data: { resolved: true } })}
                          className="text-[10px] text-success hover:text-success/80 font-medium flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" /> Gelöst
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Dialog */}
      <AddErrorDialog open={showAdd} onClose={() => setShowAdd(false)} onSubmit={createMutation.mutate} isLoading={createMutation.isPending} />
    </div>
  );
}

function AddErrorDialog({ open, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState({ vehicle_info: "", category: "hologramme", description: "", responsible: "", stage: "", severity: "mittel", root_cause: "", solution: "" });
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const handleSubmit = (e) => { e.preventDefault(); onSubmit({ ...form, vehicle_id: "manual" }); setForm({ vehicle_info: "", category: "hologramme", description: "", responsible: "", stage: "", severity: "mittel", root_cause: "", solution: "" }); };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-wide">FEHLER DOKUMENTIEREN</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Fehlerkategorie</Label>
              <Select value={form.category} onValueChange={v => update("category", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Schwere</Label>
              <Select value={form.severity} onValueChange={v => update("severity", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="niedrig">Niedrig</SelectItem>
                  <SelectItem value="mittel">Mittel</SelectItem>
                  <SelectItem value="hoch">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Fehlerbeschreibung *</Label>
            <Textarea value={form.description} onChange={e => update("description", e.target.value)} required className="bg-secondary border-border mt-1 h-20" placeholder="Was ist passiert?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Fahrzeug</Label>
              <Input value={form.vehicle_info} onChange={e => update("vehicle_info", e.target.value)} className="bg-secondary border-border mt-1" placeholder="z.B. BMW M3" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Mitarbeiter</Label>
              <Select value={form.responsible} onValueChange={v => update("responsible", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue placeholder="Auswählen" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {["Toni","Maik","Marco","Fanny","Pascal","Adrian"].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Ursache</Label>
            <Textarea value={form.root_cause} onChange={e => update("root_cause", e.target.value)} className="bg-secondary border-border mt-1 h-16" placeholder="Warum ist der Fehler entstanden?" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Lösung / Maßnahme</Label>
            <Textarea value={form.solution} onChange={e => update("solution", e.target.value)} className="bg-secondary border-border mt-1 h-16" placeholder="Wie wurde / wird es gelöst?" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border">Abbrechen</Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/80">{isLoading ? "Speichern..." : "Dokumentieren"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}