import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Shield, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "../components/shared/EmptyState";
import AddQualityCheckDialog from "../components/quality/AddQualityCheckDialog";
import { format } from "date-fns";

const stageLabels = {
  vorbereitung: "Vorbereitung",
  lackierung: "Lackierung",
  finish: "Finish",
  endkontrolle: "Endkontrolle",
  uebergabe: "Übergabe",
};

const statusConfig = {
  offen: { label: "Offen", icon: Clock, color: "bg-warning/20 text-warning" },
  bestanden: { label: "Bestanden", icon: CheckCircle, color: "bg-success/20 text-success" },
  nacharbeit: { label: "Nacharbeit", icon: XCircle, color: "bg-destructive/20 text-destructive" },
};

export default function QualityControl() {
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();

  const { data: checks = [] } = useQuery({
    queryKey: ["qualityChecks"],
    queryFn: () => base44.entities.QualityCheck.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.QualityCheck.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualityChecks"] });
      setShowAdd(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.QualityCheck.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["qualityChecks"] }),
  });

  const openCount = checks.filter((c) => c.status === "offen").length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">QUALITÄT</h1>
          <p className="text-sm text-muted-foreground mt-1">{openCount} offene Prüfungen</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-primary hover:bg-primary/80 gap-2">
          <Plus className="w-4 h-4" /> Prüfung
        </Button>
      </motion.div>

      {checks.length === 0 ? (
        <EmptyState icon={Shield} title="Keine Qualitätsprüfungen" description="Erstelle eine neue Prüfung." />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {checks.map((check) => {
              const config = statusConfig[check.status] || statusConfig.offen;
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-card border border-border rounded-xl p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-foreground">
                          {stageLabels[check.stage] || check.stage}
                        </h3>
                        <Badge className={`text-[10px] border-0 ${config.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      {check.vehicle_info && (
                        <p className="text-xs text-muted-foreground mt-1">🚗 {check.vehicle_info}</p>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {check.created_date ? format(new Date(check.created_date), "dd.MM.yyyy") : ""}
                    </p>
                  </div>

                  {/* Checklist */}
                  {check.checklist?.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {check.checklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newChecklist = [...check.checklist];
                              newChecklist[i] = { ...newChecklist[i], checked: !newChecklist[i].checked };
                              updateMutation.mutate({ id: check.id, data: { checklist: newChecklist } });
                            }}
                            className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                              ${item.checked ? "bg-success border-success" : "border-border hover:border-primary"}`}
                          >
                            {item.checked && <CheckCircle className="w-3 h-3 text-white" />}
                          </button>
                          <span className={`text-sm ${item.checked ? "text-muted-foreground line-through" : "text-foreground"}`}>
                            {item.item}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {check.comments && (
                    <p className="text-xs text-muted-foreground border-t border-border pt-3 mt-3">{check.comments}</p>
                  )}

                  {/* Actions */}
                  {check.status === "offen" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => updateMutation.mutate({ id: check.id, data: { status: "nacharbeit" } })}
                      >
                        Nacharbeit
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs bg-success/20 text-success hover:bg-success/30 border-0"
                        onClick={() => updateMutation.mutate({ id: check.id, data: { status: "bestanden", approved: true } })}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Freigabe
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AddQualityCheckDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}