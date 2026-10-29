import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  X, Play, Square, Pause, Camera, CheckCircle2,
  AlertTriangle, TrendingUp, TrendingDown, Minus, Loader2, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { differenceInMinutes, format } from "date-fns";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];
const AREA_LABELS = {
  annahme: "Annahme", schaden: "Schaden", vorschaden: "Vorschaden", demontage: "Demontage",
  teile: "Teile", vorbereitung: "Vorbereitung", lackierung: "Lackierung", finish: "Finish",
  endkontrolle: "Endkontrolle", uebergabe: "Übergabe", reklamation: "Reklamation",
  nacharbeit: "Nacharbeit", sonstiges: "Sonstiges"
};
const OVERTIME_REASONS = [
  "Schaden größer als kalkuliert", "Teileproblem", "Rückfrage notwendig",
  "Nacharbeit", "Fehlende Erfahrung", "Werkzeug/Material gesucht",
  "Unterbrechung", "Sonstiger Grund"
];

function formatH(minutes) {
  if (!minutes) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + "min" : ""}` : `${m}min`;
}

function extractPlannedHours(task) {
  // Try to parse from description "Geplant: X.Xh" or comments
  const src = `${task.description || ""} ${task.comments || ""}`;
  const match = src.match(/Geplant[:\s]+([0-9.,]+)\s*h/i);
  if (match) return parseFloat(match[1].replace(",", "."));
  return null;
}

export default function TaskDetailModal({ task, onClose, onUpdate, onDelete }) {
  const queryClient = useQueryClient();
  const [employee, setEmployee] = useState(task.assigned_to || "");
  const [uploading, setUploading] = useState(false);
  const [photoArea, setPhotoArea] = useState("vorbereitung");
  const [photoComment, setPhotoComment] = useState("");
  const [overtimeReason, setOvertimeReason] = useState("");
  const [overtimeComment, setOvertimeComment] = useState("");
  const [closing, setClosing] = useState(false);
  const [assignMode, setAssignMode] = useState(false);

  const plannedHours = extractPlannedHours(task);
  const plannedMinutes = plannedHours ? Math.round(plannedHours * 60) : null;

  // Active time entry for this task
  const { data: entries = [] } = useQuery({
    queryKey: ["time-entries-task", task.id],
    queryFn: () => base44.entities.TimeEntry.filter({ vehicle_id: task.vehicle_id }),
    refetchInterval: 15000,
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["vehicle-photos-task", task.vehicle_id],
    queryFn: () => base44.entities.VehiclePhoto.filter({ vehicle_id: task.vehicle_id }),
  });

  const createEntry = useMutation({
    mutationFn: (d) => base44.entities.TimeEntry.create(d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["time-entries-task", task.id] }),
  });

  const updateEntry = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TimeEntry.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["time-entries-task", task.id] }),
  });

  const createPhoto = useMutation({
    mutationFn: (d) => base44.entities.VehiclePhoto.create(d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicle-photos-task", task.vehicle_id] }),
  });

  // Tick state to refresh the live timer every 10s (hook must be unconditional)
  const [, setTick] = useState(0);

  // Find active entry for current employee on this vehicle
  const myActive = employee
    ? entries.find(e => e.employee === employee && e.status !== "beendet" && e.vehicle_id === task.vehicle_id)
    : null;

  useEffect(() => {
    if (!myActive) return;
    const t = setInterval(() => setTick(v => v + 1), 10000);
    return () => clearInterval(t);
  }, [myActive?.id, myActive?.start_time]);

  // Total real minutes worked on this task (by matching comments/description to task)
  const taskEntries = entries.filter(e =>
    e.vehicle_id === task.vehicle_id &&
    e.status === "beendet" &&
    (e.comments?.includes(task.id) || e.activity === task.category)
  );
  const totalRealMinutes = taskEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

  const liveMinutes = myActive
    ? Math.max(0, differenceInMinutes(new Date(), new Date(myActive.start_time)) - (myActive.pause_minutes || 0))
    : 0;
  const currentMinutes = totalRealMinutes + liveMinutes;

  // Time comparison
  const getTimeStatus = () => {
    if (!plannedMinutes || currentMinutes === 0) return null;
    const diff = currentMinutes - plannedMinutes;
    const pct = (diff / plannedMinutes) * 100;
    if (pct <= 0) return { label: "Im Plan", color: "text-success", bg: "bg-success/10 border-success/20", icon: TrendingDown, msg: "Sehr gut. Aufgabe innerhalb der Vorgabe." };
    if (pct <= 20) return { label: "Knapp drüber", color: "text-warning", bg: "bg-warning/10 border-warning/20", icon: Minus, msg: "Aufgabe leicht über Zeit. Bitte Grund kurz dokumentieren." };
    return { label: "Deutlich drüber", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", icon: TrendingUp, msg: "Zeitvorgabe überschritten. Ursache dokumentieren." };
  };

  const timeStatus = getTimeStatus();
  const isOvertime = timeStatus && (timeStatus.label === "Knapp drüber" || timeStatus.label === "Deutlich drüber");
  const needsOvertimeReason = isOvertime && task.status === "erledigt";

  const handleStart = () => {
    if (!employee) return;
    const activityMap = {
      karosserie: "karosserie", vorbereitung: "schleifen", lackierung: "lackierung",
      finish: "finish", reinigung: "reinigung", demontage: "demontage", sonstiges: "sonstiges"
    };
    createEntry.mutate({
      vehicle_id: task.vehicle_id,
      vehicle_info: task.vehicle_info,
      employee,
      activity: activityMap[task.category] || "sonstiges",
      start_time: new Date().toISOString(),
      status: "aktiv",
      pause_minutes: 0,
      comments: `Aufgabe: ${task.id} | ${task.title}`,
    });
  };

  const handlePause = () => {
    if (!myActive) return;
    if (myActive.status === "aktiv") {
      updateEntry.mutate({ id: myActive.id, data: { status: "pausiert" } });
    } else {
      updateEntry.mutate({ id: myActive.id, data: { status: "aktiv" } });
    }
  };

  const handleStop = () => {
    if (!myActive) return;
    const dur = differenceInMinutes(new Date(), new Date(myActive.start_time)) - (myActive.pause_minutes || 0);
    updateEntry.mutate({ id: myActive.id, data: { status: "beendet", end_time: new Date().toISOString(), duration_minutes: Math.max(0, dur) } });
  };

  const handleComplete = () => {
    if (myActive) handleStop();
    onUpdate({ status: "erledigt" });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await createPhoto.mutateAsync({
      vehicle_id: task.vehicle_id,
      vehicle_info: task.vehicle_info,
      photo_url: file_url,
      area: photoArea,
      employee: employee || "Unbekannt",
      vehicle_status: task.category,
      task_id: task.id,
      comment: photoComment,
      timestamp: new Date().toISOString(),
    });
    setPhotoComment("");
    setUploading(false);
  };

  const handleAssign = () => {
    if (!employee) return;
    onUpdate({ assigned_to: employee });
    setAssignMode(false);
  };

  const taskPhotos = photos.filter(p => p.task_id === task.id);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        onClick={e => e.stopPropagation()}
        className="relative bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-start justify-between z-10">
          <div className="flex-1 pr-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{task.category}</p>
            <p className="font-heading text-base text-foreground leading-tight">{task.title}</p>
            {task.vehicle_info && <p className="text-xs text-muted-foreground mt-1">🚗 {task.vehicle_info}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Zeitvorgabe */}
          {plannedMinutes && (
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-secondary rounded-xl text-center">
                <p className="text-[9px] text-muted-foreground uppercase mb-1">Vorgabe</p>
                <p className="font-heading text-base text-foreground">{formatH(plannedMinutes)}</p>
              </div>
              <div className="p-3 bg-secondary rounded-xl text-center">
                <p className="text-[9px] text-muted-foreground uppercase mb-1">Aktuell</p>
                <p className={`font-heading text-base ${timeStatus ? timeStatus.color : "text-foreground"}`}>
                  {formatH(currentMinutes)}
                </p>
              </div>
              <div className="p-3 bg-secondary rounded-xl text-center">
                <p className="text-[9px] text-muted-foreground uppercase mb-1">Rest</p>
                <p className={`font-heading text-base ${plannedMinutes - currentMinutes < 0 ? "text-destructive" : "text-success"}`}>
                  {plannedMinutes - currentMinutes > 0 ? formatH(plannedMinutes - currentMinutes) : "–"}
                </p>
              </div>
            </div>
          )}

          {/* Time Status Banner */}
          {timeStatus && currentMinutes > 0 && (
            <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs ${timeStatus.bg}`}>
              <timeStatus.icon className={`w-3.5 h-3.5 flex-shrink-0 ${timeStatus.color}`} />
              <div>
                <span className={`font-semibold ${timeStatus.color}`}>{timeStatus.label}</span>
                <span className="text-muted-foreground ml-2">{timeStatus.msg}</span>
              </div>
            </div>
          )}

          {/* Overtime Reason */}
          {needsOvertimeReason && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Grund der Zeitüberschreitung *
              </p>
              <Select value={overtimeReason} onValueChange={setOvertimeReason}>
                <SelectTrigger className="bg-secondary border-border text-xs h-8">
                  <SelectValue placeholder="Grund auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {OVERTIME_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea
                value={overtimeComment}
                onChange={e => setOvertimeComment(e.target.value)}
                placeholder="Optionaler Kommentar..."
                className="bg-secondary border-border text-xs h-16 resize-none"
              />
            </div>
          )}

          {/* Mitarbeiter + Zeitstempel */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">ZEITERFASSUNG</p>
            <div className="mb-3">
              <label className="text-xs text-muted-foreground mb-1 block">Mitarbeiter</label>
              <Select value={employee} onValueChange={setEmployee}>
                <SelectTrigger className="bg-secondary border-border h-8 text-xs">
                  <SelectValue placeholder="Wer arbeitet?" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {myActive ? (
              <div className={`p-3 rounded-xl border mb-3 ${myActive.status === "aktiv" ? "bg-success/5 border-success/30" : "bg-warning/5 border-warning/30"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${myActive.status === "aktiv" ? "bg-success animate-pulse" : "bg-warning"}`} />
                    <span className="text-xs font-medium text-foreground">
                      {myActive.status === "aktiv" ? "In Arbeit" : "Pausiert"} · seit {format(new Date(myActive.start_time), "HH:mm")} Uhr
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 text-xs px-2 border-border" onClick={handlePause}>
                      {myActive.status === "aktiv" ? <><Pause className="w-3 h-3 mr-1" /> Pause</> : <><Play className="w-3 h-3 mr-1" /> Weiter</>}
                    </Button>
                    <Button size="sm" onClick={handleStop} className="h-7 text-xs px-2 bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30">
                      <Square className="w-3 h-3 mr-1" /> Stop
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleStart}
                disabled={!employee || createEntry.isPending}
                className="w-full h-8 text-xs bg-success/20 hover:bg-success/30 text-success border border-success/30 gap-2"
              >
                <Play className="w-3.5 h-3.5" /> Zeit starten
              </Button>
            )}

            {/* Assign */}
            {task.assigned_to !== employee && employee && (
              <button onClick={handleAssign} className="text-[10px] text-primary underline mt-1">
                Aufgabe mir zuweisen
              </button>
            )}
            {task.assigned_to && (
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Zugewiesen: {task.assigned_to}
              </p>
            )}
          </div>

          {/* Foto-Upload */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              FOTO-DOKUMENTATION ({taskPhotos.length})
            </p>
            <div className="flex gap-2 mb-3">
              <Select value={photoArea} onValueChange={setPhotoArea}>
                <SelectTrigger className="bg-secondary border-border h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AREA_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all
                ${uploading ? "opacity-50 pointer-events-none" : "border-primary/30 text-primary hover:bg-primary/10"}`}>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                Foto
              </label>
            </div>
            <input
              value={photoComment}
              onChange={e => setPhotoComment(e.target.value)}
              placeholder="Kommentar zum Foto..."
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring mb-3"
            />
            {taskPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {taskPhotos.slice(-6).map((p, i) => (
                  <div key={i} className="relative group">
                    <img src={p.photo_url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex flex-col items-center justify-center p-1">
                      <p className="text-[8px] text-white text-center leading-tight">
                        {AREA_LABELS[p.area]}<br />{p.employee}<br />
                        {p.timestamp ? format(new Date(p.timestamp), "HH:mm") : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            {task.status !== "erledigt" ? (
              <Button
                onClick={handleComplete}
                disabled={needsOvertimeReason && !overtimeReason}
                className="flex-1 h-10 gap-2 font-heading tracking-wide text-xs"
              >
                <CheckCircle2 className="w-4 h-4" /> ABSCHLIESSEN
              </Button>
            ) : (
              <div className="flex-1 flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-xs text-success font-medium">Aufgabe erledigt</span>
              </div>
            )}
            <Button variant="outline" onClick={() => onUpdate({ status: task.status === "offen" ? "in_arbeit" : "offen" })}
              className="h-10 text-xs border-border">
              {task.status === "offen" ? "Starten" : "Zurück"}
            </Button>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground border-t border-border pt-3">{task.description}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}