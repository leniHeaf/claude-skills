import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInMinutes, parseISO } from "date-fns";
import {
  Clock, CheckCircle2, XCircle, FileEdit, Inbox, Send, History, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

const ACTIVITY_LABELS = {
  demontage: "Demontage", karosserie: "Karosserie", schleifen: "Schleifen",
  fuellern: "Füllern", abkleben: "Abkleben", lackierung: "Lackierung",
  finish: "Finish", reinigung: "Reinigung", nacharbeit: "Nacharbeit", sonstiges: "Sonstiges",
};

function resolveEmployeeFromUser(user) {
  const name = user?.full_name || user?.email || "";
  return TEAM.find(t => name.toLowerCase().includes(t.toLowerCase())) || name;
}

function fmtDuration(min) {
  if (!min || min <= 0) return "0h 0min";
  return `${Math.floor(min / 60)}h ${Math.round(min % 60)}min`;
}

function fmtTime(iso) {
  if (!iso) return "–";
  try { return format(parseISO(iso), "dd.MM.yyyy HH:mm"); } catch { return iso; }
}

function toLocalInput(iso) {
  if (!iso) return "";
  try {
    const d = parseISO(iso);
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 16);
  } catch { return ""; }
}

export default function ZeitKorrektur() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const currentEmployee = resolveEmployeeFromUser(user);
  const isChef = (user?.full_name || user?.email || "").toLowerCase().includes("toni");

  const [tab, setTab] = useState(isChef ? "inbox" : "meine");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [correction, setCorrection] = useState({ start: "", end: "", reason: "" });
  const [reviewComment, setReviewComment] = useState({});

  // TimeEntries laden
  const { data: entries = [] } = useQuery({
    queryKey: ["timeEntries-korrektur"],
    queryFn: () => base44.entities.TimeEntry.list("-created_date", 500),
  });

  // Korrektur-Anfragen laden
  const { data: korrekturen = [] } = useQuery({
    queryKey: ["zeitKorrekturen"],
    queryFn: () => base44.entities.ZeitKorrektur.list("-created_date", 200),
    refetchInterval: 30000,
  });

  // Korrektur erstellen
  const createKorrektur = useMutation({
    mutationFn: (data) => base44.entities.ZeitKorrektur.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zeitKorrekturen"] });
      setSelectedEntry(null);
      setCorrection({ start: "", end: "", reason: "" });
      toast({ title: "Korrektur eingereicht", description: "Wird nach Genehmigung angewendet." });
    },
  });

  // Korrektur bewerten (Genehmigen/Ablehnen)
  const reviewKorrektur = useMutation({
    mutationFn: ({ id, status, comment }) =>
      base44.entities.ZeitKorrektur.update(id, {
        status,
        reviewed_by: currentEmployee,
        manager_comment: comment,
      }),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["zeitKorrekturen"] });
      // Bei Genehmigung → Original TimeEntry aktualisieren
      if (data.status === "genehmigt" && data.time_entry_id) {
        try {
          const update = {};
          if (data.corrected_start_time) update.start_time = data.corrected_start_time;
          if (data.corrected_end_time) update.end_time = data.corrected_end_time;
          if (data.corrected_duration_minutes != null) update.duration_minutes = data.corrected_duration_minutes;
          await base44.entities.TimeEntry.update(data.time_entry_id, update);
          queryClient.invalidateQueries({ queryKey: ["timeEntries-korrektur"] });
          queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
          queryClient.invalidateQueries({ queryKey: ["timeEntries-board"] });
          queryClient.invalidateQueries({ queryKey: ["workDays", undefined] });
          toast({ title: "Korrektur genehmigt", description: "Zeit wurde aktualisiert." });
        } catch (err) {
          toast({ title: "Fehler beim Anwenden", description: err.message, variant: "destructive" });
        }
      } else {
        toast({ title: status === "abgelehnt" ? "Abgelehnt" : "Aktualisiert" });
      }
      setReviewComment(prev => ({ ...prev, [data.id]: "" }));
    },
  });

  // Meine Einträge (beendet)
  const myEntries = useMemo(() => {
    return entries
      .filter(e => e.employee === currentEmployee && e.status === "beendet")
      .slice(0, 50);
  }, [entries, currentEmployee]);

  // Offene Anfragen für Chef
  const openRequests = korrekturen.filter(k => k.status === "eingereicht");
  const reviewedRequests = korrekturen.filter(k => k.status !== "eingereicht");

  // Eigene Korrektur-Anfragen
  const myRequests = korrekturen.filter(k => k.employee === currentEmployee);

  const handleSubmit = () => {
    if (!selectedEntry) return;
    if (!correction.reason.trim()) {
      toast({ title: "Begründung fehlt", variant: "destructive" });
      return;
    }

    const correctedStart = correction.start ? new Date(correction.start).toISOString() : selectedEntry.start_time;
    const correctedEnd = correction.end ? new Date(correction.end).toISOString() : selectedEntry.end_time;
    const correctedDuration = correctedStart && correctedEnd
      ? Math.max(0, differenceInMinutes(new Date(correctedEnd), new Date(correctedStart)) - (selectedEntry.pause_minutes || 0))
      : selectedEntry.duration_minutes;

    createKorrektur.mutate({
      employee: currentEmployee,
      time_entry_id: selectedEntry.id,
      date: selectedEntry.start_time ? format(parseISO(selectedEntry.start_time), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      vehicle_info: selectedEntry.vehicle_info || "",
      activity: ACTIVITY_LABELS[selectedEntry.activity] || selectedEntry.activity || "",
      original_start_time: selectedEntry.start_time,
      original_end_time: selectedEntry.end_time,
      original_duration_minutes: selectedEntry.duration_minutes || 0,
      corrected_start_time: correctedStart,
      corrected_end_time: correctedEnd,
      corrected_duration_minutes: correctedDuration,
      reason: correction.reason,
      status: "eingereicht",
    });
  };

  const handleReview = (korrektur, status) => {
    reviewKorrektur.mutate({
      id: korrektur.id,
      status,
      comment: reviewComment[korrektur.id] || "",
    });
  };

  const TABS = [
    { key: "inbox", label: "Offene Anfragen", icon: Inbox, badge: openRequests.length },
    { key: "meine", label: "Meine Zeiten", icon: Clock },
    { key: "anfragen", label: "Meine Anfragen", icon: History, badge: myRequests.filter(k => k.status === "eingereicht").length },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">ZEIT-KORREKTUR</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isChef ? "Genehmigung ausstehender Korrektur-Anfragen" : "Korrekturen an eigenen Zeiten einreichen"} · {currentEmployee}
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.badge > 0 && (
              <span className="w-4 h-4 rounded-full bg-warning text-black text-[9px] flex items-center justify-center font-bold">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* OFFENE ANFRAGEN – für alle sichtbar, nur Chef kann genehmigen */}
      {tab === "inbox" && (
        <div className="space-y-3">
          {!isChef && (
            <div className="bg-info/10 border border-info/20 rounded-lg p-3 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-info flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Offene Anfragen sind für alle sichtbar. Genehmigungen werden von Toni geprüft.</p>
            </div>
          )}
          {openRequests.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Keine offenen Korrektur-Anfragen</p>
            </div>
          )}
          <AnimatePresence>
            {openRequests.map((k, idx) => (
              <KorrekturCard key={k.id} korrektur={k} onReview={isChef ? handleReview : undefined}
                comment={reviewComment[k.id] || ""}
                onCommentChange={(v) => setReviewComment(prev => ({ ...prev, [k.id]: v }))}
                readonly={!isChef}
                delay={idx * 0.04}
              />
            ))}
          </AnimatePresence>

          {reviewedRequests.length > 0 && (
            <>
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mt-6 mb-2">Bereits bearbeitet</p>
              {reviewedRequests.slice(0, 20).map((k, idx) => (
                <KorrekturCard key={k.id} korrektur={k} delay={idx * 0.02} readonly />
              ))}
            </>
          )}
        </div>
      )}

      {/* MEINE ZEITEN – Korrektur anfordern */}
      {tab === "meine" && (
        <div className="space-y-3">
          {!selectedEntry && (
            <>
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-2">
                Beendete Zeiteinträge · Zum Korrigieren anklicken
              </p>
              {myEntries.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Keine beendeten Zeiteinträge</p>
                </div>
              )}
              <AnimatePresence>
                {myEntries.map((e, idx) => {
                  const hasPending = korrekturen.some(k => k.time_entry_id === e.id && k.status === "eingereicht");
                  return (
                    <motion.button key={e.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                      onClick={() => {
                        setSelectedEntry(e);
                        setCorrection({
                          start: toLocalInput(e.start_time),
                          end: toLocalInput(e.end_time),
                          reason: "",
                        });
                      }}
                      disabled={hasPending}
                      className={`w-full text-left bg-card border rounded-xl p-4 transition-colors
                        ${hasPending ? "border-warning/30 opacity-60 cursor-not-allowed" : "border-border hover:border-foreground/20"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {ACTIVITY_LABELS[e.activity] || e.activity}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{e.vehicle_info || "Kein Fahrzeug"}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-muted-foreground tabular-nums">{fmtTime(e.start_time)}</p>
                          <p className="text-sm font-heading text-foreground tabular-nums">{fmtDuration(e.duration_minutes)}</p>
                        </div>
                        {hasPending && (
                          <span className="ml-3 text-[9px] px-2 py-0.5 rounded-full bg-warning/20 text-warning font-medium">OFFEN</span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </>
          )}

          {/* Korrektur-Formular */}
          {selectedEntry && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <FileEdit className="w-4 h-4 text-foreground" />
                <p className="text-sm font-semibold text-foreground">Korrektur anfordern</p>
              </div>

              {/* Original */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Original Start</p>
                  <p className="text-sm text-foreground tabular-nums">{fmtTime(selectedEntry.start_time)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Original Ende</p>
                  <p className="text-sm text-foreground tabular-nums">{fmtTime(selectedEntry.end_time)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Original Dauer</p>
                  <p className="text-sm font-heading text-foreground tabular-nums">{fmtDuration(selectedEntry.duration_minutes)}</p>
                </div>
              </div>

              {/* Korrektur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <Label className="text-xs">Korrigierter Start</Label>
                  <Input type="datetime-local" value={correction.start}
                    onChange={(e) => setCorrection(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Korrigiertes Ende</Label>
                  <Input type="datetime-local" value={correction.end}
                    onChange={(e) => setCorrection(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-xs">Begründung *</Label>
                <Textarea value={correction.reason}
                  onChange={(e) => setCorrection(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Warum muss die Zeit korrigiert werden?"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={createKorrektur.isPending}
                  className="gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Korrektur einreichen
                </Button>
                <Button variant="outline" onClick={() => { setSelectedEntry(null); setCorrection({ start: "", end: "", reason: "" }); }}>
                  Abbrechen
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* MEINE ANFRAGEN */}
      {tab === "anfragen" && (
        <div className="space-y-3">
          {myRequests.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Keine Korrektur-Anfragen vorhanden</p>
            </div>
          )}
          <AnimatePresence>
            {myRequests.map((k, idx) => (
              <KorrekturCard key={k.id} korrektur={k} delay={idx * 0.03} readonly />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function KorrekturCard({ korrektur, onReview, comment, onCommentChange, delay = 0, readonly = false }) {
  const [expanded, setExpanded] = useState(!readonly);
  const status = korrektur.status;
  const diffMin = (korrektur.corrected_duration_minutes || 0) - (korrektur.original_duration_minutes || 0);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className={`bg-card border rounded-xl p-4 ${status === "eingereicht" ? "border-warning/30" : status === "genehmigt" ? "border-success/30" : "border-destructive/30"}`}
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-heading text-xs text-foreground flex-shrink-0">
              {korrektur.employee?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{korrektur.employee}</p>
              <p className="text-[10px] text-muted-foreground">
                {korrektur.activity || "–"} · {korrektur.vehicle_info || "Kein Fahrzeug"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
              status === "eingereicht" ? "bg-warning/20 text-warning" :
              status === "genehmigt" ? "bg-success/20 text-success" :
              "bg-destructive/20 text-destructive"
            }`}>
              {status === "eingereicht" ? "OFFEN" : status === "genehmigt" ? "GENEHMIGT" : "ABGELEHNT"}
            </span>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-border space-y-3">
              {/* Original vs Korrigiert */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Original</p>
                  <p className="text-xs text-foreground tabular-nums">{fmtTime(korrektur.original_start_time)}</p>
                  <p className="text-xs text-foreground tabular-nums">{fmtTime(korrektur.original_end_time)}</p>
                  <p className="text-sm font-heading text-foreground tabular-nums mt-1">{fmtDuration(korrektur.original_duration_minutes)}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Korrigiert</p>
                  <p className="text-xs text-foreground tabular-nums">{fmtTime(korrektur.corrected_start_time)}</p>
                  <p className="text-xs text-foreground tabular-nums">{fmtTime(korrektur.corrected_end_time)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-heading text-foreground tabular-nums">{fmtDuration(korrektur.corrected_duration_minutes)}</p>
                    {diffMin !== 0 && (
                      <span className={`text-[10px] font-bold ${diffMin > 0 ? "text-warning" : "text-destructive"}`}>
                        {diffMin > 0 ? "+" : ""}{fmtDuration(diffMin)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Begründung */}
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Begründung</p>
                <p className="text-xs text-foreground">{korrektur.reason}</p>
              </div>

              {/* Manager-Kommentar */}
              {korrektur.manager_comment && (
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Kommentar ({korrektur.reviewed_by})</p>
                  <p className="text-xs text-foreground">{korrektur.manager_comment}</p>
                </div>
              )}

              {/* Genehmigen / Ablehnen */}
              {!readonly && status === "eingereicht" && onReview && (
                <>
                  <Textarea value={comment || ""} onChange={(e) => onCommentChange(e.target.value)}
                    placeholder="Kommentar (optional)" rows={2} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onReview(korrektur, "genehmigt")}
                      className="bg-success/20 hover:bg-success/30 text-success border border-success/30 gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Genehmigen
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onReview(korrektur, "abgelehnt")}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Ablehnen
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}