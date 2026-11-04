import React, { useState, useEffect } from "react";
import { Clock, Trash2, Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AREA_LABELS = {
  demontage: "Demontage", karosserie: "Karosserie", vorbereitung: "Vorbereitung",
  lackierung: "Lackierung", finish: "Finish", reinigung: "Reinigung", sonstiges: "Sonstiges"
};

const PRIORITY_LABELS = {
  niedrig: "Niedrig", mittel: "Mittel", hoch: "Hoch", kritisch: "Kritisch"
};

export default function DATTaskCard({ task, areaColors, onEdit, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task);

  useEffect(() => setDraft(task), [task]);

  const areaClass = areaColors[task.area] || areaColors.sonstiges;

  const save = () => {
    onEdit?.(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(task);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="p-3 bg-secondary/60 rounded-lg border border-primary/30 space-y-2">
        <Input
          value={draft.title || ""}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="bg-card border-border text-sm h-8"
          placeholder="Aufgabentitel"
        />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">Std</label>
            <Input
              type="number"
              step="0.1"
              value={draft.estimated_hours ?? 0}
              onChange={(e) => setDraft({ ...draft, estimated_hours: parseFloat(e.target.value) || 0 })}
              className="bg-card border-border text-xs h-8"
            />
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">Bereich</label>
            <Select value={draft.area || "sonstiges"} onValueChange={(v) => setDraft({ ...draft, area: v })}>
              <SelectTrigger className="bg-card border-border text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AREA_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">Prio</label>
            <Select value={draft.priority || "mittel"} onValueChange={(v) => setDraft({ ...draft, priority: v })}>
              <SelectTrigger className="bg-card border-border text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-1.5">
          <button onClick={cancel} className="p-1.5 hover:bg-secondary rounded text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
          <button onClick={save} className="p-1.5 hover:bg-secondary rounded text-success">
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-secondary/60 rounded-lg border border-border/50 hover:border-border transition-all group">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium truncate">{task.title}</p>
        {task.dat_position && (
          <p className="text-[10px] text-muted-foreground font-mono">{task.dat_position}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${areaClass}`}>
          {AREA_LABELS[task.area] || task.area}
        </span>
        {task.estimated_hours > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{task.estimated_hours.toFixed(1)}h</span>
          </div>
        )}
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium
          ${task.priority === "hoch" || task.priority === "kritisch" ? "bg-destructive/10 text-destructive" :
            task.priority === "mittel" ? "bg-warning/10 text-warning" : "bg-secondary text-muted-foreground"}`}>
          {PRIORITY_LABELS[task.priority] || task.priority}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground">
            <Pencil className="w-3 h-3" />
          </button>
          {onRemove && (
            <button onClick={() => onRemove(task)} className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}