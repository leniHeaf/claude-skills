import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, MessageSquare, Clock, Euro, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const STATUS_CFG = {
  offen: { label: "Offen", color: "text-warning", bg: "bg-warning/10 border-warning/20", dot: "bg-warning" },
  genehmigt: { label: "Genehmigt", color: "text-success", bg: "bg-success/10 border-success/20", dot: "bg-success" },
  abgelehnt: { label: "Abgelehnt", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", dot: "bg-destructive" },
  rueckfrage: { label: "Rückfrage", color: "text-info", bg: "bg-info/10 border-info/20", dot: "bg-info" },
};

const URGENCY_CFG = {
  niedrig: { label: "Niedrig", color: "text-muted-foreground" },
  normal: { label: "Normal", color: "text-foreground" },
  dringend: { label: "DRINGEND", color: "text-destructive font-bold" },
};

const CATEGORY_LABEL = {
  karosserie: "Karosserie", lackierung: "Lackierung", mechanik: "Mechanik",
  elektrik: "Elektrik", innenraum: "Innenraum", sonstiges: "Sonstiges",
};

export default function NachtragInbox() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("offen");
  const [expanded, setExpanded] = useState(null);
  const [comments, setComments] = useState({});

  const { data: nachtraege = [], isLoading } = useQuery({
    queryKey: ["nachtraege-all"],
    queryFn: () => base44.entities.Nachtrag.list("-created_date", 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Nachtrag.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nachtraege-all"] }),
  });

  const handleDecision = (id, status) => {
    updateMutation.mutate({
      id,
      data: {
        status,
        manager_comment: comments[id] || "",
        reviewed_by: "Toni",
        reviewed_at: new Date().toISOString(),
      },
    });
    setExpanded(null);
  };

  const filtered = nachtraege.filter((n) => filter === "alle" || n.status === filter);
  const counts = {
    offen: nachtraege.filter((n) => n.status === "offen").length,
    genehmigt: nachtraege.filter((n) => n.status === "genehmigt").length,
    abgelehnt: nachtraege.filter((n) => n.status === "abgelehnt").length,
    rueckfrage: nachtraege.filter((n) => n.status === "rueckfrage").length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">NACHTRAG-INBOX</h1>
        <p className="text-sm text-muted-foreground mt-1">Gemeldete Zusatzarbeiten · Freigabe durch Toni</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(STATUS_CFG).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`p-3 rounded-xl border text-left transition-all ${filter === k ? v.bg + " border-current" : "bg-card border-border hover:border-primary/30"}`}
          >
            <p className={`text-2xl font-heading ${filter === k ? v.color : "text-foreground"}`}>{counts[k]}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{v.label}</p>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        {["offen", "genehmigt", "abgelehnt", "rueckfrage", "alle"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all capitalize
              ${filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {f === "alle" ? `Alle (${nachtraege.length})` : STATUS_CFG[f]?.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
          Keine Nachträge in dieser Kategorie.
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((n, i) => {
              const cfg = STATUS_CFG[n.status] || STATUS_CFG.offen;
              const isOpen = expanded === n.id;
              const urgencyCfg = URGENCY_CFG[n.urgency] || URGENCY_CFG.normal;

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`bg-card border rounded-xl overflow-hidden ${isOpen ? cfg.bg : "border-border"}`}
                >
                  {/* Header row */}
                  <button
                    className="w-full text-left p-4 flex items-start gap-3"
                    onClick={() => setExpanded(isOpen ? null : n.id)}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{n.vehicle_info || "Fahrzeug"}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-secondary rounded-md text-muted-foreground">
                            {CATEGORY_LABEL[n.category]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] ${urgencyCfg.color}`}>{urgencyCfg.label}</span>
                          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{n.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">von {n.reported_by}</span>
                        {n.extra_time_hours && (
                          <span className="text-[10px] flex items-center gap-0.5 text-muted-foreground">
                            <Clock className="w-2.5 h-2.5" />+{n.extra_time_hours}h
                          </span>
                        )}
                        {n.estimated_cost && (
                          <span className="text-[10px] flex items-center gap-0.5 text-muted-foreground">
                            <Euro className="w-2.5 h-2.5" />+{n.estimated_cost}€
                          </span>
                        )}
                        {n.created_date && (
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(n.created_date), "dd.MM. HH:mm")}
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${cfg.color} ${cfg.bg}`}>{cfg.label}</span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                          {/* Description */}
                          <div>
                            <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-1">SCHADENSBESCHREIBUNG</p>
                            <p className="text-sm text-foreground/90 leading-relaxed">{n.description}</p>
                          </div>

                          {/* Time & Cost */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-secondary rounded-lg p-3">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Zusatzzeit</p>
                              <p className="text-lg font-heading text-foreground">
                                {n.extra_time_hours ? `${n.extra_time_hours}h` : "—"}
                              </p>
                            </div>
                            <div className="bg-secondary rounded-lg p-3">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Mehrkosten</p>
                              <p className="text-lg font-heading text-foreground">
                                {n.estimated_cost ? `${n.estimated_cost}€` : "—"}
                              </p>
                            </div>
                          </div>

                          {/* Photos */}
                          {(n.photos_before?.length > 0 || n.photos_after?.length > 0) && (
                            <div className="grid grid-cols-2 gap-3">
                              {n.photos_before?.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Vorher ({n.photos_before.length})</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {n.photos_before.map((url, i) => (
                                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                        <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-border hover:border-primary/50 transition-colors" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {n.photos_after?.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Nachher ({n.photos_after.length})</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {n.photos_after.map((url, i) => (
                                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                        <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-border hover:border-primary/50 transition-colors" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Existing manager comment */}
                          {n.manager_comment && n.status !== "offen" && (
                            <div className="bg-secondary rounded-lg p-3">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                                Kommentar von {n.reviewed_by}
                              </p>
                              <p className="text-sm text-foreground">{n.manager_comment}</p>
                            </div>
                          )}

                          {/* Decision area — only for open or rueckfrage */}
                          {(n.status === "offen" || n.status === "rueckfrage") && (
                            <div className="space-y-3">
                              <div>
                                <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-1">Kommentar (optional)</p>
                                <Textarea
                                  value={comments[n.id] || ""}
                                  onChange={(e) => setComments((p) => ({ ...p, [n.id]: e.target.value }))}
                                  placeholder="Begründung, Hinweis oder Rückfrage..."
                                  className="bg-secondary border-border h-20 text-sm"
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleDecision(n.id, "genehmigt")}
                                  className="bg-success/80 hover:bg-success text-white gap-1.5"
                                  disabled={updateMutation.isPending}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Genehmigen
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleDecision(n.id, "rueckfrage")}
                                  variant="outline"
                                  className="border-info/30 text-info hover:bg-info/10 gap-1.5"
                                  disabled={updateMutation.isPending}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" /> Rückfrage
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleDecision(n.id, "abgelehnt")}
                                  variant="outline"
                                  className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                                  disabled={updateMutation.isPending}
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Ablehnen
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}