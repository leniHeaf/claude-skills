import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus, Clock, CheckCircle, XCircle, CalendarClock, User, Car, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/AuthContext";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];
const ADMINS = ["Toni", "Lena"];

const CATEGORIES = {
  teile: "Teile", karosserie: "Karosserie", vorbereitung: "Vorbereitung",
  lackierung: "Lackierung", finish: "Finish", reinigung: "Reinigung",
  kunde: "Kunde", uebergabe: "Übergabe", lager: "Lager", sonstiges: "Sonstiges",
};

const PRIORITY_COLORS = {
  niedrig: "bg-secondary text-muted-foreground",
  mittel: "bg-info/20 text-info",
  hoch: "bg-warning/20 text-warning",
  kritisch: "bg-destructive/20 text-destructive",
};

const STATUS_CFG = {
  eingereicht: { label: "Eingereicht", color: "bg-warning/20 text-warning border-warning/30", icon: Clock },
  genehmigt: { label: "Genehmigt", color: "bg-success/20 text-success border-success/30", icon: CheckCircle },
  abgelehnt: { label: "Abgelehnt", color: "bg-destructive/20 text-destructive border-destructive/30", icon: XCircle },
};

function resolveEmployee(user) {
  if (!user?.full_name) return null;
  return TEAM.find(t => user.full_name.toLowerCase().includes(t.toLowerCase())) || null;
}

export default function Aufgabeneinplanung() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const currentEmployee = resolveEmployee(user);
  const isAdmin = currentEmployee && ADMINS.includes(currentEmployee);
  const [showDialog, setShowDialog] = useState(false);
  const [filter, setFilter] = useState("alle"); // alle | eingereicht | genehmigt | abgelehnt

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["taskRequests"],
    queryFn: () => base44.entities.TaskRequest.list("-created_date", 500),
    refetchInterval: 30000,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-req"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 100),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, comment }) => {
      const update = base44.entities.TaskRequest.update(id, {
        status, reviewed_by: currentEmployee, manager_comment: comment || "",
      });
      if (status === "genehmigt") {
        const req = requests.find(r => r.id === id);
        if (req) {
          const task = await base44.entities.Task.create({
            title: req.title,
            description: req.description || "",
            vehicle_info: req.vehicle_info || "",
            category: req.category || "sonstiges",
            assigned_to: req.employee,
            priority: req.priority || "mittel",
            status: "offen",
            deadline: req.planned_date,
            estimated_hours: req.estimated_hours || 0,
          });
          await base44.entities.TaskRequest.update(id, { task_id: task.id });
        }
      }
      return update;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskRequests"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-tasks"] });
    },
  });

  // Employees see only their own; admins see all
  const visibleRequests = isAdmin
    ? requests
    : requests.filter(r => r.employee === currentEmployee);

  const filtered = filter === "alle"
    ? visibleRequests
    : visibleRequests.filter(r => r.status === filter);

  const pendingCount = requests.filter(r => r.status === "eingereicht").length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">AUFGABEN-EINPLANUNG</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentEmployee ? `Angemeldet: ${currentEmployee}` : ""}
            {isAdmin && pendingCount > 0 && (
              <span className="text-warning ml-2">· {pendingCount} Genehmigung offen</span>
            )}
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-primary hover:bg-primary/80 gap-2">
          <Plus className="w-4 h-4" /> Aufgabe einplanen
        </Button>
      </motion.div>

      {/* Filter */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6 overflow-x-auto">
        {["alle", "eingereicht", "genehmigt", "abgelehnt"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {f === "alle" ? "Alle" : STATUS_CFG[f].label}
            {f === "eingereicht" && pendingCount > 0 && isAdmin && (
              <span className="ml-1.5 w-4 h-4 rounded-full bg-warning text-white text-[9px] inline-flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <CalendarClock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Keine Anträge vorhanden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const sc = STATUS_CFG[r.status] || STATUS_CFG.eingereicht;
            const StatusIcon = sc.icon;
            return (
              <div key={r.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-foreground">{r.title}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${sc.color} flex items-center gap-1`}>
                        <StatusIcon className="w-2.5 h-2.5" /> {sc.label}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[r.priority] || PRIORITY_COLORS.mittel}`}>
                        {r.priority}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {CATEGORIES[r.category] || r.category}
                      </span>
                    </div>
                    {r.description && <p className="text-xs text-muted-foreground mb-2">{r.description}</p>}
                    <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {r.employee}</span>
                      <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" />
                        {r.planned_date && format(new Date(r.planned_date), "dd.MM.yyyy", { locale: de })}
                        {r.planned_start_time && ` ab ${r.planned_start_time}`}
                      </span>
                      {r.estimated_hours > 0 && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{r.estimated_hours}h</span>
                      )}
                      {r.vehicle_info && <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {r.vehicle_info}</span>}
                    </div>
                    {r.reason && (
                      <p className="text-[10px] text-muted-foreground mt-1.5 italic">Begründung: {r.reason}</p>
                    )}
                    {r.manager_comment && (
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {r.reviewed_by}: {r.manager_comment}
                      </p>
                    )}
                  </div>
                  {isAdmin && r.status === "eingereicht" && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Button size="sm" onClick={() => reviewMutation.mutate({ id: r.id, status: "genehmigt" })}
                        className="bg-success/20 hover:bg-success/30 text-success border border-success/30 gap-1 text-xs">
                        <CheckCircle className="w-3.5 h-3.5" /> Genehmigen
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        const comment = window.prompt("Grund für Ablehnung (optional):") || "";
                        reviewMutation.mutate({ id: r.id, status: "abgelehnt", comment });
                      }}
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1 text-xs">
                        <XCircle className="w-3.5 h-3.5" /> Ablehnen
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskRequestDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        employee={currentEmployee}
        vehicles={vehicles}
      />
    </div>
  );
}

function TaskRequestDialog({ open, onClose, employee, vehicles }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "", description: "", vehicle_info: "", category: "sonstiges",
    planned_date: "", planned_start_time: "", estimated_hours: 1,
    priority: "mittel", reason: "",
  });

  const u = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TaskRequest.create({
      ...data, employee: employee || "Unbekannt", status: "eingereicht",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskRequests"] });
      onClose();
      setForm({
        title: "", description: "", vehicle_info: "", category: "sonstiges",
        planned_date: "", planned_start_time: "", estimated_hours: 1,
        priority: "mittel", reason: "",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-wide">AUFGABE EINPLANEN</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="p-3 bg-secondary rounded-xl flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground font-medium">{employee || "—"}</span>
            <span className="text-[10px] text-muted-foreground ml-auto">wird zur Genehmigung eingereicht</span>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Aufgabe *</Label>
            <Input value={form.title} onChange={e => u("title", e.target.value)} required
              placeholder="z.B. Kotflügel vorbereiten" className="bg-secondary border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Beschreibung</Label>
            <Textarea value={form.description} onChange={e => u("description", e.target.value)}
              className="bg-secondary border-border mt-1 h-16" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Kategorie</Label>
              <Select value={form.category} onValueChange={v => u("category", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Priorität</Label>
              <Select value={form.priority} onValueChange={v => u("priority", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {["niedrig","mittel","hoch","kritisch"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Datum *</Label>
              <Input type="date" value={form.planned_date} onChange={e => u("planned_date", e.target.value)} required
                className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Startzeit</Label>
              <Input type="time" value={form.planned_start_time} onChange={e => u("planned_start_time", e.target.value)}
                className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Geschätzte Dauer (h)</Label>
              <Input type="number" step="0.5" min="0" value={form.estimated_hours}
                onChange={e => u("estimated_hours", parseFloat(e.target.value) || 0)}
                className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fahrzeug (optional)</Label>
              <Input value={form.vehicle_info} onChange={e => u("vehicle_info", e.target.value)}
                placeholder="z.B. BMW M3 – SON-TM 420" className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Begründung</Label>
            <Textarea value={form.reason} onChange={e => u("reason", e.target.value)}
              placeholder="Warum wird diese Einplanung benötigt?" className="bg-secondary border-border mt-1 h-16" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border">Abbrechen</Button>
            <Button type="submit" disabled={createMutation.isPending} className="flex-1 bg-primary hover:bg-primary/80">
              {createMutation.isPending ? "..." : "Zur Genehmigung einreichen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}