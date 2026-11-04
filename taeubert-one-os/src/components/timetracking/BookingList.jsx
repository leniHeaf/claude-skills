import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInMinutes, subDays, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChevronLeft, ChevronRight, Clock, Coffee, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function fmtDuration(minutes) {
  if (!minutes || minutes <= 0) return "0min";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function timeToISO(dateStr, timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(dateStr + "T00:00:00");
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function isoToTime(isoStr) {
  if (!isoStr) return "";
  return format(new Date(isoStr), "HH:mm");
}

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

export default function BookingList({ employee, isChef, onSelectEmployee }) {
  const queryClient = useQueryClient();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  const { data: bookings = [] } = useQuery({
    queryKey: ["timeBookings", employee, selectedDate],
    queryFn: () => base44.entities.TimeBooking.filter({ employee, date: selectedDate }),
  });

  const sorted = [...bookings].sort((a, b) =>
    new Date(a.start_time) - new Date(b.start_time)
  );

  const invalidateAll = () => queryClient.invalidateQueries({ queryKey: ["timeBookings"] });

  const createBooking = useMutation({
    mutationFn: (data) => base44.entities.TimeBooking.create(data),
    onSuccess: () => invalidateAll(),
  });

  const updateBooking = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TimeBooking.update(id, data),
    onSuccess: () => invalidateAll(),
  });

  const deleteBooking = useMutation({
    mutationFn: (id) => base44.entities.TimeBooking.delete(id),
    onSuccess: () => invalidateAll(),
  });

  const handleAdd = () => {
    if (!newStart) return;
    createBooking.mutate({
      employee,
      date: selectedDate,
      start_time: timeToISO(selectedDate, newStart),
      end_time: newEnd ? timeToISO(selectedDate, newEnd) : null,
    });
    setNewStart("");
    setNewEnd("");
  };

  const handleSaveEdit = (id) => {
    const data = {};
    if (editStart) data.start_time = timeToISO(selectedDate, editStart);
    data.end_time = editEnd ? timeToISO(selectedDate, editEnd) : null;
    updateBooking.mutate({ id, data });
    setEditingId(null);
    setEditStart("");
    setEditEnd("");
  };

  // Compute durations and pauses
  let totalWorked = 0;
  let totalPause = 0;
  const processed = sorted.map((b, i) => {
    const start = b.start_time ? new Date(b.start_time) : null;
    const end = b.end_time ? new Date(b.end_time) : null;
    const duration = (start && end) ? Math.max(0, differenceInMinutes(end, start)) : 0;
    totalWorked += duration;

    let pause = 0;
    if (i < sorted.length - 1) {
      const nextStart = sorted[i + 1].start_time ? new Date(sorted[i + 1].start_time) : null;
      if (end && nextStart) {
        pause = Math.max(0, differenceInMinutes(nextStart, end));
        totalPause += pause;
      }
    }
    return { ...b, duration, pause };
  });

  const isToday = selectedDate === todayStr;
  const overtime = totalWorked - 480;

  const goPrev = () => setSelectedDate(format(subDays(new Date(selectedDate), 1), "yyyy-MM-dd"));
  const goNext = () => {
    const next = addDays(new Date(selectedDate), 1);
    if (next <= new Date()) setSelectedDate(format(next, "yyyy-MM-dd"));
  };

  return (
    <div className="space-y-4">
      {/* Employee selector (Chef only) */}
      {isChef && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Mitarbeiter:</span>
          <div className="flex gap-1 flex-wrap">
            {TEAM.map(t => (
              <button
                key={t}
                onClick={() => onSelectEmployee?.(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  employee === t
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground bg-secondary/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goPrev} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="font-heading text-sm text-foreground tracking-wide uppercase">
            {format(new Date(selectedDate), "EEEE, dd. MMMM yyyy", { locale: de })}
          </p>
          <button onClick={goNext} disabled={isToday} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {!isToday && (
          <Button size="sm" variant="ghost" onClick={() => setSelectedDate(todayStr)}>
            Heute
          </Button>
        )}
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-foreground" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gearbeitet</p>
          </div>
          <p className="font-heading text-xl text-foreground">{fmtDuration(totalWorked)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Coffee className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pause</p>
          </div>
          <p className="font-heading text-xl text-muted-foreground">{fmtDuration(totalPause)}</p>
        </div>
        <div className={`bg-card border rounded-xl p-4 ${overtime > 0 ? "border-warning/30" : "border-border"}`}>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Überstunden</p>
          <p className={`font-heading text-xl ${overtime > 0 ? "text-warning" : "text-foreground"}`}>
            {overtime > 0 ? "+" : ""}{fmtDuration(Math.abs(overtime))}
          </p>
        </div>
      </div>

      {/* Booking list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-3 border-b border-border">
          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Buchungen · {processed.length} {processed.length === 1 ? "Eintrag" : "Einträge"}
          </p>
        </div>

        {processed.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Keine Buchungen an diesem Tag.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence>
              {processed.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-3 hover:bg-secondary/20 transition-colors"
                >
                  {editingId === b.id ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold text-muted-foreground w-4">{i + 1}.</span>
                      <Input
                        type="time"
                        value={editStart}
                        onChange={(e) => setEditStart(e.target.value)}
                        className="w-28 h-8 text-sm"
                      />
                      <span className="text-muted-foreground text-xs">–</span>
                      <Input
                        type="time"
                        value={editEnd}
                        onChange={(e) => setEditEnd(e.target.value)}
                        className="w-28 h-8 text-sm"
                      />
                      <div className="flex gap-1 ml-auto">
                        <Button size="sm" onClick={() => handleSaveEdit(b.id)} className="gap-1">
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold text-muted-foreground w-4">{i + 1}.</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground tabular-nums">
                              {isoToTime(b.start_time)}
                            </span>
                            <span className="text-muted-foreground text-xs">–</span>
                            <span className="text-sm font-medium text-foreground tabular-nums">
                              {b.end_time ? isoToTime(b.end_time) : "läuft"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              {fmtDuration(b.duration)}
                            </span>
                            {b.pause > 0 && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Coffee className="w-2.5 h-2.5" /> {fmtDuration(b.pause)} Pause
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(b.id);
                            setEditStart(isoToTime(b.start_time));
                            setEditEnd(b.end_time ? isoToTime(b.end_time) : "");
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteBooking.mutate(b.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add new booking */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">
          Neue Buchung hinzufügen
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="w-28 h-9 text-sm"
            />
            <span className="text-[10px] text-muted-foreground uppercase">Von</span>
          </div>
          <span className="text-muted-foreground text-xs">–</span>
          <div className="flex items-center gap-1">
            <Input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="w-28 h-9 text-sm"
            />
            <span className="text-[10px] text-muted-foreground uppercase">Bis</span>
          </div>
          <Button onClick={handleAdd} disabled={!newStart} className="gap-1.5 ml-auto">
            <Plus className="w-3.5 h-3.5" /> Hinzufügen
          </Button>
        </div>
      </div>
    </div>
  );
}