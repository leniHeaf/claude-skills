import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SCORE_CATEGORIES = [
  { key: "quality_score", notesKey: "quality_notes", label: "Qualität", weight: "40%", desc: "Nacharbeit, Fehlerquote, Finishqualität, Kontrolle", color: "bg-primary" },
  { key: "productivity_score", notesKey: "productivity_notes", label: "Produktivität", weight: "20%", desc: "Produktive Stunden, Aufträge, Zeitmanagement", color: "bg-success" },
  { key: "responsibility_score", notesKey: "responsibility_notes", label: "Verantwortung", weight: "20%", desc: "Mitdenken, Probleme lösen, Selbstständigkeit", color: "bg-info" },
  { key: "order_score", notesKey: "order_notes", label: "Ordnung & Sauberkeit", weight: "10%", desc: "Arbeitsplatz, Werkzeugwagen, Hallenbereich", color: "bg-chart-2" },
  { key: "team_score", notesKey: "team_notes", label: "Teamverhalten", weight: "10%", desc: "Kommunikation, Unterstützung, Haltung", color: "bg-warning" },
];

const ALL_BADGES = [
  "Finish-Profi", "Qualitätslevel Gold", "Ordnung Champion",
  "Problemlöser", "Premiumstandard", "Team-Player", "Produktivitäts-Ass"
];

function ScoreSlider({ value, onChange, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 h-7 rounded text-[10px] font-medium transition-all
              ${value >= n
                ? n >= 8 ? "bg-warning text-black" : n >= 6 ? "bg-success text-black" : n >= 4 ? "bg-primary text-white" : "bg-destructive text-white"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
          >
            {n}
          </button>
        ))}
      </div>
      <span className="text-sm font-heading text-foreground w-4">{value || "–"}</span>
    </div>
  );
}

export default function ScoreEditor({ employee, existing, autoStats, onSave, onClose }) {
  const [form, setForm] = useState({
    employee,
    quality_score: existing?.quality_score || 0,
    quality_notes: existing?.quality_notes || "",
    productivity_score: existing?.productivity_score || 0,
    productivity_notes: existing?.productivity_notes || "",
    responsibility_score: existing?.responsibility_score || 0,
    responsibility_notes: existing?.responsibility_notes || "",
    order_score: existing?.order_score || 0,
    order_notes: existing?.order_notes || "",
    team_score: existing?.team_score || 0,
    team_notes: existing?.team_notes || "",
    strengths: existing?.strengths || "",
    development_areas: existing?.development_areas || "",
    badges: existing?.badges || [],
  });

  const [expandedCat, setExpandedCat] = useState(null);

  const u = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleBadge = (badge) => {
    setForm(f => ({
      ...f,
      badges: f.badges.includes(badge) ? f.badges.filter(b => b !== badge) : [...f.badges, badge],
    }));
  };

  const previewTotal = Math.round(
    (form.quality_score * 0.4 + form.productivity_score * 0.2 +
     form.responsibility_score * 0.2 + form.order_score * 0.1 + form.team_score * 0.1) * 10
  ) / 10;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
          <div>
            <p className="font-heading text-base text-foreground">{employee} bewerten</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Score-Vorschau: <span className="font-heading text-foreground text-lg ml-1">{previewTotal}</span>/10
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Auto Stats Info */}
          {(autoStats.productiveMins > 0 || autoStats.nacharbeitPct > 0) && (
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">AUTO-DATEN AUS ZEITERFASSUNG</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Produktiv: <span className="text-success">{Math.floor(autoStats.productiveMins / 60)}h</span></span>
                <span>Nacharbeit: <span className={autoStats.nacharbeitPct > 10 ? "text-destructive" : "text-foreground"}>{autoStats.nacharbeitPct}%</span></span>
                <span>Fehler: <span className="text-foreground">{autoStats.empErrors}</span></span>
              </div>
            </div>
          )}

          {/* Score Categories */}
          {SCORE_CATEGORIES.map(cat => (
            <div key={cat.key} className="space-y-2">
              <button
                onClick={() => setExpandedCat(expandedCat === cat.key ? null : cat.key)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">Gewichtung: {cat.weight}</span>
                </div>
                <span className="text-xs text-muted-foreground">{cat.desc.substring(0, 25)}…</span>
              </button>
              <ScoreSlider value={form[cat.key]} onChange={v => u(cat.key, v)} color={cat.color} />
              {expandedCat === cat.key && (
                <Textarea
                  value={form[cat.notesKey]}
                  onChange={e => u(cat.notesKey, e.target.value)}
                  placeholder={`Notiz zu ${cat.label}...`}
                  className="bg-secondary border-border text-xs h-16 mt-1"
                />
              )}
            </div>
          ))}

          {/* Strengths + Development */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Stärken (erscheint im EOM-Banner)</label>
              <Textarea value={form.strengths} onChange={e => u("strengths", e.target.value)} placeholder="z.B. Qualität, Verantwortung, Problemlösung" className="bg-secondary border-border h-16 text-xs" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Entwicklungsbereiche</label>
              <Textarea value={form.development_areas} onChange={e => u("development_areas", e.target.value)} placeholder="z.B. Pünktlichkeit, Ordnung am Arbeitsplatz" className="bg-secondary border-border h-16 text-xs" />
            </div>
          </div>

          {/* Badges */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Badges vergeben</p>
            <div className="flex flex-wrap gap-2">
              {ALL_BADGES.map(b => (
                <button
                  key={b}
                  onClick={() => toggleBadge(b)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all
                    ${form.badges.includes(b)
                      ? "bg-warning/20 text-warning border-warning/30"
                      : "bg-secondary border-border text-muted-foreground hover:border-warning/20"
                    }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <Button
            onClick={() => onSave(form)}
            className="w-full bg-primary hover:bg-primary/80 h-11 font-heading tracking-wide"
          >
            <Trophy className="w-4 h-4 mr-2" />
            BEWERTUNG SPEICHERN — {previewTotal}/10
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}