import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, parseISO } from "date-fns";
import { de } from "date-fns/locale";

const MOODS = [
  { key: "motiviert", emoji: "😊", label: "Motiviert", color: "bg-success/20 border-success/40 text-success", bg: "bg-success" },
  { key: "neutral", emoji: "😐", label: "Neutral", color: "bg-warning/20 border-warning/40 text-warning", bg: "bg-warning" },
  { key: "gestresst", emoji: "😤", label: "Gestresst", color: "bg-destructive/20 border-destructive/40 text-destructive", bg: "bg-destructive" },
];

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

export default function MoodBarometer() {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: entries = [] } = useQuery({
    queryKey: ["moodEntries"],
    queryFn: () => base44.entities.MoodEntry.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MoodEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moodEntries"] });
      setSubmitted(true);
      setSelectedMood("");
      setNote("");
    },
  });

  const todayEntries = entries.filter(e => e.date === today);
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const dayEntries = entries.filter(e => e.date === d);
    const motiviert = dayEntries.filter(e => e.mood === "motiviert").length;
    const gestresst = dayEntries.filter(e => e.mood === "gestresst").length;
    return { date: d, total: dayEntries.length, motiviert, gestresst };
  });

  const handleSubmit = () => {
    if (!selectedEmployee || !selectedMood) return;
    createMutation.mutate({ employee: selectedEmployee, mood: selectedMood, note, date: today });
  };

  // Per-employee today status
  const employeeToday = TEAM.map(emp => {
    const entry = todayEntries.find(e => e.employee === emp);
    return { emp, entry };
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">STIMMUNGSBAROMETER</h1>
        <p className="text-sm text-muted-foreground mt-1">Täglich · {format(new Date(), "EEEE, dd. MMMM", { locale: de })}</p>
      </motion.div>

      {/* Daily Input */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-4">TAGES-CHECK-IN</p>

        <div className="mb-4">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Mitarbeiter auswählen" /></SelectTrigger>
            <SelectContent className="bg-card border-border">
              {TEAM.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {MOODS.map(m => (
            <button
              key={m.key}
              onClick={() => setSelectedMood(m.key)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${selectedMood === m.key ? m.color + " scale-105" : "border-border bg-secondary hover:border-primary/30"}`}
            >
              <p className="text-3xl mb-1">{m.emoji}</p>
              <p className={`text-xs font-semibold ${selectedMood === m.key ? "" : "text-muted-foreground"}`}>{m.label}</p>
            </button>
          ))}
        </div>

        <Textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Optional: Möchtest du etwas mitteilen? (anonym möglich)"
          className="bg-secondary border-border mb-4 h-20"
        />

        <AnimatePresence>
          {submitted && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-3 p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success text-center">
              Danke! Check-in gespeichert ✓
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={handleSubmit}
          disabled={!selectedEmployee || !selectedMood || createMutation.isPending}
          className="w-full bg-primary hover:bg-primary/80"
        >
          Check-in abschicken
        </Button>
      </div>

      {/* Team Overview Today */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-4">
          TEAM HEUTE — {todayEntries.length}/{TEAM.length} eingecheckt
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {employeeToday.map(({ emp, entry }) => {
            const moodCfg = entry ? MOODS.find(m => m.key === entry.mood) : null;
            return (
              <div key={emp} className={`p-3 rounded-xl border text-center transition-all ${moodCfg ? moodCfg.color : "border-border bg-secondary"}`}>
                <p className="text-2xl mb-1">{moodCfg ? moodCfg.emoji : "—"}</p>
                <p className={`text-xs font-semibold ${moodCfg ? "" : "text-muted-foreground"}`}>{emp}</p>
                {!entry && <p className="text-[10px] text-muted-foreground">Nicht eingecheckt</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Trend */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-4 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" /> 7-TAGE-VERLAUF
        </p>
        <div className="flex items-end gap-2 h-24">
          {last7.map(day => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: "72px" }}>
                {day.motiviert > 0 && (
                  <div className="w-full rounded-sm bg-success" style={{ height: `${(day.motiviert / Math.max(TEAM.length, 1)) * 72}px`, minHeight: "4px" }} />
                )}
                {day.gestresst > 0 && (
                  <div className="w-full rounded-sm bg-destructive" style={{ height: `${(day.gestresst / Math.max(TEAM.length, 1)) * 72}px`, minHeight: "4px" }} />
                )}
                {day.total === 0 && <div className="w-full bg-border rounded-sm" style={{ height: "4px" }} />}
              </div>
              <p className="text-[9px] text-muted-foreground">{format(parseISO(day.date), "EEE", { locale: de })}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-success" /> Motiviert</div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-destructive" /> Gestresst</div>
        </div>
      </div>
    </div>
  );
}