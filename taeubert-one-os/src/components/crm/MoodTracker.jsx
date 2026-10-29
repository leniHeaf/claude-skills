import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Smile, Frown, Meh, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MOOD_OPTIONS = [
  { value: "begeistert", icon: Smile, color: "text-success", bg: "bg-success/10", label: "Begeistert" },
  { value: "neutral", icon: Meh, color: "text-muted-foreground", bg: "bg-secondary", label: "Neutral" },
  { value: "kritisch", icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "Kritisch" },
  { value: "gefaehrdet", icon: Frown, color: "text-destructive", bg: "bg-destructive/10", label: "Gefährdet" },
];

export default function MoodTracker({ customer }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState(customer.mood_status || "neutral");
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const updateMoodMutation = useMutation({
    mutationFn: async ({ mood, note }) => {
      await base44.entities.Customer.update(customer.id, {
        mood_status: mood,
        last_contact: new Date().toISOString().split("T")[0],
        notes: note ? `${customer.notes || ""}\n[${new Date().toLocaleDateString("de-DE")}]: ${note}`.trim() : customer.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowDialog(false);
      setNote("");
    },
  });

  const currentMood = MOOD_OPTIONS.find(m => m.value === (customer.mood_status || "neutral")) || MOOD_OPTIONS[1];
  const CurrentIcon = currentMood.icon;

  const getMoodHistory = () => {
    // Parse notes for mood history
    const moodPattern = /\[(\d{1,2}\.\d{1,2}\.\d{4})\]:/g;
    const notes = customer.notes || "";
    const matches = [...notes.matchAll(moodPattern)];
    return matches.map(m => ({ date: m[1] }));
  };

  const history = getMoodHistory();

  return (
    <>
      {/* Mood Display */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CurrentIcon className={`w-5 h-5 ${currentMood.color}`} />
            <p className="text-xs font-semibold text-foreground">KUNDENSTIMMUNG</p>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowDialog(true)}
            className="text-xs border-border"
          >
            Aktualisieren
          </Button>
        </div>

        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${currentMood.bg}`}>
          <CurrentIcon className={`w-4 h-4 ${currentMood.color}`} />
          <span className={`text-sm font-medium ${currentMood.color}`}>{currentMood.label}</span>
        </div>

        {history.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-[9px] text-muted-foreground uppercase">Letzte Kontakte: {history.length}</p>
          </div>
        )}
      </div>

      {/* Mood Update Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading tracking-wide">STIMMUNG AKTUALISIEREN</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Mood Selection */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Aktuelle Stimmung wählen</p>
              <div className="grid grid-cols-2 gap-2">
                {MOOD_OPTIONS.map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setSelectedMood(m.value)}
                      className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        selectedMood === m.value
                          ? `${m.bg} ${m.color} border-current`
                          : "bg-secondary border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Optional: Notiz hinzufügen</p>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Grund für Stimmungsänderung..."
                className="bg-secondary border-border h-20 text-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1 border-border"
              >
                Abbrechen
              </Button>
              <Button
                onClick={() => updateMoodMutation.mutate({ mood: selectedMood, note })}
                disabled={updateMoodMutation.isPending}
                className="flex-1 bg-primary hover:bg-primary/80"
              >
                {updateMoodMutation.isPending ? "..." : "Speichern"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}