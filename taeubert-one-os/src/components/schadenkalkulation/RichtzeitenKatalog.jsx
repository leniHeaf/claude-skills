import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { GEWERKE, GEWERK_LABEL, POSITIONSTYPEN, formatStunden, formatEuro } from "@/lib/kalkulationUtils";

const EMPTY = { positionsnummer: "", bezeichnung: "", gewerk: "Karosserie", richtzeit_ah: 0, ersatzteil_kosten: 0, lackmaterial_kosten: 0, positionstyp: "Arbeitszeit" };

function PositionForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY);
  const { toast } = useToast();

  const handleSave = () => {
    if (!form.bezeichnung) {
      toast({ title: "Unvollständig", description: "Bezeichnung erforderlich.", variant: "destructive" });
      return;
    }
    onSave({
      ...form,
      richtzeit_ah: Number(form.richtzeit_ah) || 0,
      ersatzteil_kosten: Number(form.ersatzteil_kosten) || 0,
      lackmaterial_kosten: Number(form.lackmaterial_kosten) || 0,
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Positionsnummer</Label>
          <Input value={form.positionsnummer} onChange={e => setForm({ ...form, positionsnummer: e.target.value })} placeholder="K-001" />
        </div>
        <div>
          <Label className="text-xs">Gewerk</Label>
          <select value={form.gewerk} onChange={e => setForm({ ...form, gewerk: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-transparent text-sm">
            {GEWERKE.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <Label className="text-xs">Bezeichnung</Label>
        <Input value={form.bezeichnung} onChange={e => setForm({ ...form, bezeichnung: e.target.value })} placeholder="Stoßstange vorne lackieren" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Positionstyp</Label>
          <select value={form.positionstyp} onChange={e => setForm({ ...form, positionstyp: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-transparent text-sm">
            {POSITIONSTYPEN.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs">Richtzeit (AH)</Label>
          <Input type="number" step="0.1" value={form.richtzeit_ah} onChange={e => setForm({ ...form, richtzeit_ah: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Ersatzteil (€)</Label>
          <Input type="number" value={form.ersatzteil_kosten} onChange={e => setForm({ ...form, ersatzteil_kosten: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Lackmaterial (€)</Label>
          <Input type="number" value={form.lackmaterial_kosten} onChange={e => setForm({ ...form, lackmaterial_kosten: e.target.value })} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} size="sm" className="gap-1 flex-1"><Check className="w-3.5 h-3.5" /> Speichern</Button>
        <Button onClick={onCancel} variant="ghost" size="sm" className="gap-1"><X className="w-3.5 h-3.5" /> Abbrechen</Button>
      </div>
    </div>
  );
}

export default function RichtzeitenKatalog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [gewerkFilter, setGewerkFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState(null);

  const { data: positionen = [], isLoading } = useQuery({
    queryKey: ["reparaturpositionen"],
    queryFn: () => base44.entities.Reparaturposition.list("positionsnummer", 500),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Reparaturposition.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reparaturpositionen"] }); setShowForm(false); toast({ title: "Position hinzugefügt" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Reparaturposition.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reparaturpositionen"] }); setEditId(null); setEditData(null); toast({ title: "Position aktualisiert" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Reparaturposition.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reparaturpositionen"] }); toast({ title: "Position gelöscht" }); },
  });

  const filtered = positionen.filter(p => {
    const ms = !search || p.bezeichnung.toLowerCase().includes(search.toLowerCase()) || (p.positionsnummer || "").toLowerCase().includes(search.toLowerCase());
    const mk = gewerkFilter === "all" || p.gewerk === gewerkFilter;
    return ms && mk;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Position suchen..." className="pl-9" />
        </div>
        <select value={gewerkFilter} onChange={e => setGewerkFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-transparent text-sm">
          <option value="all">Alle Gewerke</option>
          {GEWERKE.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <Button onClick={() => setShowForm(s => !s)} className="gap-1">
          <Plus className="w-4 h-4" /> Neue Position
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">Neue Position</p>
          <PositionForm onSave={(data) => createMutation.mutate(data)} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-3 text-[10px] font-semibold text-muted-foreground uppercase">Nr.</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-muted-foreground uppercase">Bezeichnung</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-muted-foreground uppercase">Gewerk</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-muted-foreground uppercase">Typ</th>
                  <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Richtzeit</th>
                  <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Ersatzteil</th>
                  <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Lack</th>
                  <th className="w-16" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <React.Fragment key={p.id}>
                    <tr className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="p-3 text-xs text-muted-foreground">{p.positionsnummer}</td>
                      <td className="p-3 font-medium text-foreground">{p.bezeichnung}</td>
                      <td className="p-3 text-xs text-muted-foreground">{GEWERK_LABEL[p.gewerk] || "—"}</td>
                      <td className="p-3 text-xs text-muted-foreground">{p.positionstyp || "Arbeitszeit"}</td>
                      <td className="p-3 text-right text-muted-foreground text-xs">{formatStunden(p.richtzeit_ah)}</td>
                      <td className="p-3 text-right text-muted-foreground text-xs">{formatEuro(p.ersatzteil_kosten)}</td>
                      <td className="p-3 text-right text-muted-foreground text-xs">{formatEuro(p.lackmaterial_kosten)}</td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => { setEditId(p.id); setEditData(p); }} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { if (confirm("Position löschen?")) deleteMutation.mutate(p.id); }} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editId === p.id && (
                      <tr>
                        <td colSpan={8} className="bg-secondary/20 p-4">
                          <PositionForm initial={editData} onSave={(data) => updateMutation.mutate({ id: p.id, data })} onCancel={() => { setEditId(null); setEditData(null); }} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Keine Positionen gefunden</p>}
        </div>
      )}
    </div>
  );
}