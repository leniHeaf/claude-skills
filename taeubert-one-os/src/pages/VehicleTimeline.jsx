import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, Camera, ListTodo, Shield, MessageSquare, Star } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { motion } from "framer-motion";

const eventIcons = {
  status_change: Clock,
  photo_added: Camera,
  task_created: ListTodo,
  task_done: CheckCircle,
  quality_check: Shield,
  note_added: MessageSquare,
  handover: Star,
};

const eventColors = {
  status_change: "bg-info/20 text-info border-info/30",
  photo_added: "bg-muted text-muted-foreground border-border",
  task_created: "bg-warning/20 text-warning border-warning/30",
  task_done: "bg-success/20 text-success border-success/30",
  quality_check: "bg-primary/20 text-primary border-primary/30",
  note_added: "bg-muted text-muted-foreground border-border",
  handover: "bg-success/30 text-success border-success/40",
};

const stageLabels = {
  annahme: "Annahme", teile_bestellt: "Teile bestellt", demontage: "Demontage",
  karosserie: "Karosserie", vorbereitung: "Vorbereitung", lackierung: "Lackierung",
  finish: "Finish", endkontrolle: "Endkontrolle", uebergabe: "Übergabe",
};

export default function VehicleTimeline() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: vehicle } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const list = await base44.entities.Vehicle.filter({ id });
      return list[0];
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["vehicleEvents", id],
    queryFn: () => base44.entities.VehicleEvent.filter({ vehicle_id: id }, "-created_date", 100),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["vehicleTasks", id],
    queryFn: () => base44.entities.Task.filter({ vehicle_id: id }, "-created_date", 50),
  });

  const { data: qualityChecks = [] } = useQuery({
    queryKey: ["vehicleQuality", id],
    queryFn: () => base44.entities.QualityCheck.filter({ vehicle_id: id }, "-created_date", 20),
  });

  // Build timeline from all sources
  const timeline = [
    ...(vehicle ? [{
      date: vehicle.created_date,
      type: "status_change",
      label: "Fahrzeug angenommen",
      detail: `${vehicle.make} ${vehicle.model} · ${vehicle.license_plate}`,
      actor: vehicle.responsible,
    }] : []),
    ...events.map(e => ({
      date: e.created_date,
      type: e.event_type,
      label: e.to_status ? `Status → ${stageLabels[e.to_status] || e.to_status}` : e.note || e.event_type,
      detail: e.note || (e.from_status ? `Von: ${stageLabels[e.from_status] || e.from_status}` : ""),
      actor: e.actor,
    })),
    ...tasks.map(t => ({
      date: t.created_date,
      type: "task_created",
      label: `Aufgabe: ${t.title}`,
      detail: t.assigned_to,
      actor: t.assigned_to,
    })),
    ...tasks.filter(t => t.status === "erledigt").map(t => ({
      date: t.updated_date,
      type: "task_done",
      label: `Erledigt: ${t.title}`,
      detail: t.assigned_to,
      actor: t.assigned_to,
    })),
    ...qualityChecks.map(q => ({
      date: q.created_date,
      type: "quality_check",
      label: `Qualitätsprüfung: ${stageLabels[q.stage] || q.stage}`,
      detail: q.status === "bestanden" ? "✓ Bestanden" : q.status === "nacharbeit" ? "⚠ Nacharbeit" : "Offen",
      actor: q.inspector,
    })),
  ]
    .filter(e => e.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(`/vehicles/${id}`)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Zurück zum Fahrzeug
      </button>

      {vehicle && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading text-2xl text-foreground">FAHRZEUGZEITLEISTE</h1>
          <p className="text-muted-foreground mt-1">{vehicle.make} {vehicle.model} · {vehicle.license_plate}</p>
        </motion.div>
      )}

      {timeline.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Noch keine Ereignisse aufgezeichnet.</div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {timeline.map((event, i) => {
              const Icon = eventIcons[event.type] || Clock;
              const color = eventColors[event.type] || "bg-secondary text-muted-foreground border-border";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-4 pl-1"
                >
                  <div className={`relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 bg-card border border-border rounded-xl p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{event.label}</p>
                        {event.detail && (
                          <p className="text-xs text-muted-foreground mt-0.5">{event.detail}</p>
                        )}
                        {event.actor && (
                          <p className="text-[10px] text-muted-foreground mt-1">von {event.actor}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(event.date), "dd.MM.", { locale: de })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(event.date), "HH:mm", { locale: de })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}