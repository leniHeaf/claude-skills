import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, CheckCircle, XCircle, MessageSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInBusinessDays } from "date-fns";
import { de } from "date-fns/locale";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];
const ANNUAL_DAYS = 28;

const statusConfig = {
  eingereicht: { label: "Eingereicht", color: "bg-info/20 text-info border-info/30" },
  genehmigt: { label: "Genehmigt", color: "bg-success/20 text-success border-success/30" },
  abgelehnt: { label: "Abgelehnt", color: "bg-destructive/20 text-destructive border-destructive/30" },
  rueckfrage: { label: "Rückfrage", color: "bg-warning/20 text-warning border-warning/30" },
};

function calcBusinessDays(start, end) {
  if (!start || !end) return 0;
  return Math.max(0, differenceInBusinessDays(new Date(end), new Date(start)) + 1);
}

export default function LeaveManagement() {
  const [showAdd, setShowAdd] = useState(false);
  const [filterEmployee, setFilterEmployee] = useState("alle");
  const [form, setForm] = useState({ employee: "", start_date: "", end_date: "", reason: "" });
  const [reviewDialog, setReviewDialog] = useState(null);
  const [reviewComment, setReviewComment] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isApprover = !!user?.full_name?.toLowerCase().includes("toni");

  const { data: requests = [] } = useQuery({
    queryKey: ["leaveRequests"],
    queryFn: () => base44.entities.LeaveRequest.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LeaveRequest.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leaveRequests"] }); setShowAdd(false); setForm({ employee: "", start_date: "", end_date: "", reason: "" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LeaveRequest.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leaveRequests"] }); setReviewDialog(null); setReviewComment(""); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const days = calcBusinessDays(form.start_date, form.end_date);
    createMutation.mutate({ ...form, days, status: "eingereicht" });
  };

  const handleReview = (status) => {
    updateMutation.mutate({
      id: reviewDialog.id,
      data: { status, manager_comment: reviewComment, reviewed_by: "Toni" },
    });
  };

  const filtered = filterEmployee === "alle" ? requests : requests.filter(r => r.employee === filterEmployee);

  // Per-employee used days
  const usedDays = {};
  requests.filter(r => r.status === "genehmigt").forEach(r => {
    usedDays[r.employee] = (usedDays[r.employee] || 0) + (r.days || 0);
  });

  // Upcoming approved leaves
  const today = format(new Date(), "yyyy-MM-dd");
  const upcoming = requests.filter(r => r.status === "genehmigt" && r.end_date >= today);
  const pendingCount = requests.filter(r => r.status === "eingereicht").length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">URLAUB & ABWESENHEIT</h1>
            <p className="text-sm text-muted-foreground mt-1">{pendingCount} ausstehende Anträge</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-primary hover:bg-primary/80 gap-2">
            <Plus className="w-4 h-4" /> Urlaub beantragen
          </Button>
        </div>
      </motion.div>

      {/* Capacity Overview */}
      {upcoming.length > 0 && (
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <p className="text-xs font-semibold tracking-wider text-warning uppercase">KOMMENDE ABWESENHEITEN</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {upcoming.map(r => (
              <span key={r.id} className="text-xs px-3 py-1.5 bg-warning/10 text-warning border border-warning/20 rounded-lg">
                {r.employee} · {format(new Date(r.start_date), "dd.MM.")} – {format(new Date(r.end_date), "dd.MM.")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Employee vacation balance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {TEAM.filter(t => t !== "Lena").map(emp => {
          const used = usedDays[emp] || 0;
          const remaining = ANNUAL_DAYS - used;
          return (
            <div key={emp} className="bg-card border border-border rounded-xl p-3">
              <p className="text-xs font-medium text-foreground">{emp}</p>
              <p className="font-heading text-xl text-foreground mt-1">{remaining} <span className="text-xs text-muted-foreground font-body">Tage</span></p>
              <div className="w-full h-1 bg-secondary rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(used / ANNUAL_DAYS) * 100}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{used} von {ANNUAL_DAYS} verbraucht</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <Select value={filterEmployee} onValueChange={setFilterEmployee}>
          <SelectTrigger className="w-44 bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="alle">Alle Mitarbeiter</SelectItem>
            {TEAM.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Request List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(req => {
            const cfg = statusConfig[req.status] || statusConfig.eingereicht;
            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">{req.employee}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-foreground">
                      {req.start_date && format(new Date(req.start_date), "dd. MMM", { locale: de })} – {req.end_date && format(new Date(req.end_date), "dd. MMM yyyy", { locale: de })}
                      <span className="text-xs text-muted-foreground ml-2">({req.days} Arbeitstage)</span>
                    </p>
                    {req.reason && <p className="text-xs text-muted-foreground mt-1">{req.reason}</p>}
                    {req.manager_comment && (
                      <p className="text-xs text-muted-foreground mt-1 italic">Kommentar: {req.manager_comment}</p>
                    )}
                  </div>
                  {req.status === "eingereicht" && isApprover && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => { setReviewDialog(req); }}
                        className="text-xs bg-secondary border border-border hover:border-primary/30 text-foreground"
                      >
                        Prüfen
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">Keine Urlaubsanträge.</p>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading tracking-wide">URLAUB BEANTRAGEN</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label className="text-xs text-muted-foreground">Mitarbeiter</Label>
              <Select value={form.employee} onValueChange={v => setForm(f => ({ ...f, employee: v }))}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue placeholder="Auswählen" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {TEAM.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Von</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required className="bg-secondary border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bis</Label>
                <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} required className="bg-secondary border-border mt-1" />
              </div>
            </div>
            {form.start_date && form.end_date && (
              <p className="text-xs text-muted-foreground">= {calcBusinessDays(form.start_date, form.end_date)} Arbeitstage</p>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">Grund (optional)</Label>
              <Textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="bg-secondary border-border mt-1 h-20" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)} className="flex-1 border-border">Abbrechen</Button>
              <Button type="submit" disabled={createMutation.isPending} className="flex-1 bg-primary hover:bg-primary/80">Einreichen</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={!!reviewDialog} onOpenChange={() => { setReviewDialog(null); setReviewComment(""); }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading tracking-wide">ANTRAG PRÜFEN</DialogTitle>
          </DialogHeader>
          {reviewDialog && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-secondary rounded-xl">
                <p className="font-medium text-foreground">{reviewDialog.employee}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(reviewDialog.start_date), "dd. MMM", { locale: de })} – {format(new Date(reviewDialog.end_date), "dd. MMM yyyy", { locale: de })} · {reviewDialog.days} Tage
                </p>
                {reviewDialog.reason && <p className="text-xs text-muted-foreground mt-2">{reviewDialog.reason}</p>}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Kommentar</Label>
                <Textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Optional..." className="bg-secondary border-border mt-1 h-20" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleReview("abgelehnt")} className="flex-1 bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30 gap-1.5">
                  <XCircle className="w-4 h-4" /> Ablehnen
                </Button>
                <Button onClick={() => handleReview("rueckfrage")} className="flex-1 bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30 gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Rückfrage
                </Button>
                <Button onClick={() => handleReview("genehmigt")} className="flex-1 bg-success/20 hover:bg-success/30 text-success border border-success/30 gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Genehmigen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}