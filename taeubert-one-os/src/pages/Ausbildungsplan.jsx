import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus, ChevronLeft, ChevronRight, MapPin, User, GraduationCap,
  LayoutGrid, List, Pencil, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO,
} from "date-fns";
import { de } from "date-fns/locale";
import AusbildungsEntryDialog from "@/components/ausbildung/AusbildungsEntryDialog";

export const DEPARTMENTS = {
  karosserie: { label: "Karosserie", color: "bg-chart-2/20 text-chart-2 border-chart-2/30", dot: "bg-chart-2" },
  lackierung: { label: "Lackierung", color: "bg-primary/20 text-primary border-primary/30", dot: "bg-primary" },
  vorbereitung: { label: "Vorbereitung", color: "bg-chart-3/20 text-chart-3 border-chart-3/30", dot: "bg-chart-3" },
  finish: { label: "Finish", color: "bg-success/20 text-success border-success/30", dot: "bg-success" },
  werkstatt: { label: "Werkstatt", color: "bg-warning/20 text-warning border-warning/30", dot: "bg-warning" },
  buerro: { label: "Büro", color: "bg-info/20 text-info border-info/30", dot: "bg-info" },
  annahme: { label: "Annahme", color: "bg-info/20 text-info border-info/30", dot: "bg-info" },
  lackaufbereitung: { label: "Lackaufbereitung", color: "bg-chart-4/20 text-chart-4 border-chart-4/30", dot: "bg-chart-4" },
  qualitaet: { label: "Qualität", color: "bg-destructive/20 text-destructive border-destructive/30", dot: "bg-destructive" },
  schule: { label: "Berufsschule", color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
  betrieb: { label: "Betrieb", color: "bg-secondary text-muted-foreground border-border", dot: "bg-muted-foreground" },
  sonstiges: { label: "Sonstiges", color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
};

export default function Ausbildungsplan() {
  const [view, setView] = useState("monat");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["ausbildungsplan"],
    queryFn: () => base44.entities.Ausbildungsplan.list("-start_date", 500),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Ausbildungsplan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ausbildungsplan"] }),
  });

  const apprentices = [...new Set(entries.map(e => e.apprentice).filter(Boolean))].sort();

  const getEntriesForDay = (day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return entries.filter(e => e.start_date <= dateStr && e.end_date >= dateStr);
  };

  const getEntriesForMonth = () => {
    const mStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const mEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    return entries.filter(e => e.start_date <= mEnd && e.end_date >= mStart);
  };

  const monthEntries = getEntriesForMonth();

  // Calendar grid
  const calStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const calEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">AUSBILDUNGSRAHMENPLAN</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {apprentices.length} Azubis · {entries.length} Einsätze geplant
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-secondary rounded-lg p-0.5">
            <button onClick={() => setView("monat")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${view === "monat" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="w-3.5 h-3.5" /> Kalender
            </button>
            <button onClick={() => setView("liste")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${view === "liste" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="w-3.5 h-3.5" /> Liste
            </button>
          </div>
          <Button onClick={() => { setEditEntry(null); setShowDialog(true); }} className="bg-primary hover:bg-primary/80 gap-2">
            <Plus className="w-4 h-4" /> Einsatz
          </Button>
        </div>
      </motion.div>

      {/* KALENDER VIEW */}
      {view === "monat" && (
        <>
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-5 bg-card border border-border rounded-xl px-4 py-3">
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <p className="font-heading text-sm tracking-widest text-foreground">
              {format(currentMonth, "MMMM yyyy", { locale: de }).toUpperCase()}
            </p>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
            <div className="grid grid-cols-7 border-b border-border">
              {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(d => (
                <div key={d} className="p-2 text-center text-[10px] font-semibold tracking-wider text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calDays.map(day => {
                const dayEntries = getEntriesForDay(day);
                const inMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                return (
                  <div key={day.toISOString()}
                    className={`min-h-[80px] p-1.5 border-b border-r border-border ${inMonth ? "" : "opacity-30"} ${isToday ? "bg-primary/5" : ""}`}>
                    <span className={`text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full
                      ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                      {format(day, "d")}
                    </span>
                    <div className="space-y-0.5 mt-0.5">
                      {dayEntries.slice(0, 3).map(e => {
                        const dep = DEPARTMENTS[e.department] || DEPARTMENTS.sonstiges;
                        return (
                          <div key={e.id} className={`text-[9px] px-1 py-0.5 rounded truncate border ${dep.color}`}
                            title={`${e.apprentice} – ${dep.label}${e.topic ? ": " + e.topic : ""}`}>
                            <span className="font-semibold">{e.apprentice}</span> {dep.label}
                          </div>
                        );
                      })}
                      {dayEntries.length > 3 && (
                        <p className="text-[8px] text-muted-foreground">+{dayEntries.length - 3} weitere</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-6">
            {Object.entries(DEPARTMENTS).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className={`w-3 h-3 rounded ${v.dot}`} />
                {v.label}
              </div>
            ))}
          </div>
        </>
      )}

      {/* LISTE VIEW */}
      {view === "liste" && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : monthEntries.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <GraduationCap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Keine Einsätze in diesem Monat</p>
            </div>
          ) : (
            monthEntries
              .sort((a, b) => (a.start_date || "").localeCompare(b.start_date || ""))
              .map(e => {
                const dep = DEPARTMENTS[e.department] || DEPARTMENTS.sonstiges;
                return (
                  <div key={e.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className={`w-2 h-12 rounded-full ${dep.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{e.apprentice}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${dep.color}`}>{dep.label}</span>
                        {e.year_of_apprenticeship && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {e.year_of_apprenticeship}. Lehrjahr
                          </span>
                        )}
                      </div>
                      {e.topic && <p className="text-xs text-muted-foreground mt-1">{e.topic}</p>}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {format(parseISO(e.start_date), "dd.MM.", { locale: de })}–{format(parseISO(e.end_date), "dd.MM.yyyy", { locale: de })}
                        </span>
                        {e.instructor && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {e.instructor}</span>}
                        {e.department === "schule" && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Berufsschule</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => { setEditEntry(e); setShowDialog(true); }}
                        className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(e.id)}
                        className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      <AusbildungsEntryDialog
        open={showDialog}
        onClose={() => { setShowDialog(false); setEditEntry(null); }}
        editEntry={editEntry}
      />
    </div>
  );
}