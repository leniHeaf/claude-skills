import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, addWeeks } from "date-fns";
import { de } from "date-fns/locale";

const STATUS_COLORS = {
  geplant: "bg-warning/20 text-warning border-warning/30",
  ausgegeben: "bg-info/20 text-info border-info/30",
  zurueck: "bg-success/20 text-success border-success/30",
};

const STATUS_LABELS = { geplant: "Geplant", ausgegeben: "Ausgegeben", zurueck: "Zurück" };

export default function LeihwagenPanel() {
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const queryClient = useQueryClient();

  const { data: rentals = [] } = useQuery({
    queryKey: ["rentals"],
    queryFn: () => base44.entities.RentalCar.list("-start_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RentalCar.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["rentals"] }); setShowAdd(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RentalCar.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["rentals"] }); setEditItem(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RentalCar.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rentals"] }),
  });

  // Week timeline
  const baseDate = new Date();
  const weekStart = startOfWeek(addWeeks(baseDate, weekOffset), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const isActiveOnDay = (rental, day) => {
    const d = format(day, "yyyy-MM-dd");
    return rental.start_date <= d && rental.end_date >= d;
  };

  const activeNow = rentals.filter(r => r.status !== "zurueck");
  const returned = rentals.filter(r => r.status === "zurueck");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-foreground" />
          <h2 className="font-heading text-lg tracking-wide">LEIHWAGEN</h2>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{activeNow.length} aktiv</span>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm" className="gap-2 bg-primary hover:bg-primary/80">
          <Plus className="w-3.5 h-3.5" /> Leihwagen
        </Button>
      </div>

      {/* Timeline */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground">◀</button>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">
            {format(weekStart, "dd. MMM", { locale: de })} – {format(weekEnd, "dd. MMM yyyy", { locale: de })}
          </p>
          <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground">▶</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 text-[10px] font-semibold text-muted-foreground w-32">KUNDE / AUTO</th>
                {weekDays.map(day => (
                  <th key={day.toISOString()} className={`p-2 text-center text-[10px] font-semibold ${isSameDay(day, new Date()) ? "text-primary" : "text-muted-foreground"}`}>
                    <div>{format(day, "EEE", { locale: de }).toUpperCase()}</div>
                    <div className={`w-6 h-6 mx-auto flex items-center justify-center rounded-full text-[11px] font-bold ${isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : ""}`}>
                      {format(day, "d")}
                    </div>
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {activeNow.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-xs text-muted-foreground py-8">Keine aktiven Leihwagen</td></tr>
              ) : activeNow.map(rental => (
                <tr key={rental.id} className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors">
                  <td className="p-2">
                    <p className="text-[11px] font-semibold truncate">{rental.customer_name}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{rental.rental_car_info || "–"}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[rental.status]}`}>{STATUS_LABELS[rental.status]}</span>
                  </td>
                  {weekDays.map(day => (
                    <td key={day.toISOString()} className="p-1 text-center">
                      {isActiveOnDay(rental, day) && (
                        <div className={`h-5 rounded ${
                          format(day, "yyyy-MM-dd") === rental.start_date ? "rounded-l-full" : ""
                        } ${
                          format(day, "yyyy-MM-dd") === rental.end_date ? "rounded-r-full" : ""
                        } bg-info/30 border border-info/50`} />
                      )}
                    </td>
                  ))}
                  <td className="p-1">
                    <button onClick={() => setEditItem(rental)} className="p-1 text-muted-foreground hover:text-foreground">✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Rentals Cards */}
      {activeNow.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Aktive Leihwagen</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeNow.map(r => (
              <div key={r.id} className={`p-3 rounded-xl border ${STATUS_COLORS[r.status]} flex items-start justify-between`}>
                <div>
                  <p className="text-sm font-semibold">{r.customer_name}</p>
                  <p className="text-xs opacity-80">🚗 {r.rental_car_info || "kein Fahrzeug"}</p>
                  {r.vehicle_info && <p className="text-[10px] opacity-70">Reparatur: {r.vehicle_info}</p>}
                  <p className="text-[10px] opacity-70 mt-1">
                    {r.start_date} → {r.end_date}
                  </p>
                  {r.notes && <p className="text-[10px] opacity-60 mt-0.5">{r.notes}</p>}
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  {r.status === "geplant" && (
                    <button onClick={() => updateMutation.mutate({ id: r.id, data: { status: "ausgegeben" } })}
                      className="text-[10px] bg-info/20 text-info px-2 py-0.5 rounded hover:bg-info/30">Ausgeben</button>
                  )}
                  {r.status === "ausgegeben" && (
                    <button onClick={() => updateMutation.mutate({ id: r.id, data: { status: "zurueck" } })}
                      className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded hover:bg-success/30">Zurück</button>
                  )}
                  <button onClick={() => setEditItem(r)}
                    className="text-[10px] text-muted-foreground px-2 py-0.5 rounded hover:bg-secondary">Bearbeiten</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently returned */}
      {returned.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Zurückgegeben</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {returned.slice(0, 6).map(r => (
              <div key={r.id} className="p-2.5 rounded-lg border border-border bg-secondary/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">{r.customer_name}</p>
                  <p className="text-[10px] text-muted-foreground">{r.rental_car_info} · {r.start_date} – {r.end_date}</p>
                </div>
                <span className="text-[10px] text-success">✓ Zurück</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Dialog */}
      <RentalDialog open={showAdd} onClose={() => setShowAdd(false)} onSubmit={createMutation.mutate} isLoading={createMutation.isPending} />
      {editItem && (
        <RentalDialog
          open={!!editItem}
          onClose={() => setEditItem(null)}
          initial={editItem}
          onSubmit={(data) => updateMutation.mutate({ id: editItem.id, data })}
          onDelete={() => { deleteMutation.mutate(editItem.id); setEditItem(null); }}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}

function RentalDialog({ open, onClose, onSubmit, onDelete, isLoading, initial }) {
  const empty = { customer_name: "", vehicle_info: "", rental_car_info: "", start_date: format(new Date(), "yyyy-MM-dd"), end_date: format(new Date(), "yyyy-MM-dd"), start_km: "", end_km: "", notes: "", status: "geplant" };
  const [form, setForm] = useState(initial || empty);
  const u = (f, v) => setForm(p => ({ ...p, [f]: v }));

  React.useEffect(() => {
    if (open) setForm(initial || empty);
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-wide">{initial ? "LEIHWAGEN BEARBEITEN" : "NEUER LEIHWAGEN"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label className="text-xs text-muted-foreground">Kunde *</Label>
            <Input value={form.customer_name} onChange={e => u("customer_name", e.target.value)} required className="bg-secondary border-border mt-1" placeholder="Kundenname" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Reparaturfahrzeug des Kunden</Label>
            <Input value={form.vehicle_info} onChange={e => u("vehicle_info", e.target.value)} className="bg-secondary border-border mt-1" placeholder="z.B. BMW M3 – SON-TM 420" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Leihwagen (Kennzeichen / Typ)</Label>
            <Input value={form.rental_car_info} onChange={e => u("rental_car_info", e.target.value)} className="bg-secondary border-border mt-1" placeholder="z.B. VW Golf – SON-LW 01" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Ausgabe *</Label>
              <Input type="date" value={form.start_date} onChange={e => u("start_date", e.target.value)} required className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Rückgabe *</Label>
              <Input type="date" value={form.end_date} onChange={e => u("end_date", e.target.value)} required className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">KM Ausgabe</Label>
              <Input type="number" value={form.start_km} onChange={e => u("start_km", e.target.value)} className="bg-secondary border-border mt-1" placeholder="km" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">KM Rückgabe</Label>
              <Input type="number" value={form.end_km} onChange={e => u("end_km", e.target.value)} className="bg-secondary border-border mt-1" placeholder="km" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={form.status} onValueChange={v => u("status", v)}>
              <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="geplant">Geplant</SelectItem>
                <SelectItem value="ausgegeben">Ausgegeben</SelectItem>
                <SelectItem value="zurueck">Zurückgegeben</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Notizen</Label>
            <Textarea value={form.notes} onChange={e => u("notes", e.target.value)} className="bg-secondary border-border mt-1 h-16" />
          </div>
          <div className="flex gap-3 pt-2">
            {onDelete && (
              <Button type="button" variant="outline" onClick={onDelete} className="border-destructive text-destructive hover:bg-destructive/10">Löschen</Button>
            )}
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border">Abbrechen</Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/80">{isLoading ? "..." : "Speichern"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}