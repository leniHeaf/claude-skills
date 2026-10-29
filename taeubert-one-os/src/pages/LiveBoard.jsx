import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, Clock, Car, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const STAGE_ORDER = ["annahme","teile_bestellt","demontage","karosserie","vorbereitung","lackierung","finish","endkontrolle","uebergabe"];
const STAGE_LABELS = { annahme:"ANNAHME", teile_bestellt:"TEILE", demontage:"DEMONTAGE", karosserie:"KAROSSERIE", vorbereitung:"VORBEREITUNG", lackierung:"LACKIERUNG", finish:"FINISH", endkontrolle:"ENDKONTROLLE", uebergabe:"ÜBERGABE" };

const conditionColors = {
  fertig: "border-l-4 border-l-success bg-success/5",
  in_arbeit: "border-l-4 border-l-warning bg-warning/5",
  problem: "border-l-4 border-l-destructive bg-destructive/10 animate-pulse",
  wartet_auf_teile: "border-l-4 border-l-muted-foreground bg-secondary",
  lackierung: "border-l-4 border-l-info bg-info/5",
};

const conditionDot = {
  fertig: "bg-success",
  in_arbeit: "bg-warning",
  problem: "bg-destructive",
  wartet_auf_teile: "bg-muted-foreground",
  lackierung: "bg-info",
};

export default function LiveBoard() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 100),
    refetchInterval: 60000,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 100),
    refetchInterval: 60000,
  });

  const active = vehicles.filter(v => v.status !== "uebergabe");
  const problems = vehicles.filter(v => v.condition === "problem");
  const done = vehicles.filter(v => v.status === "uebergabe");
  const openTasks = tasks.filter(t => t.status !== "erledigt");

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="font-heading text-xl md:text-2xl text-foreground tracking-widest">TÄUBERT LIVE</h1>
            <p className="text-xs text-muted-foreground tracking-widest">
              {now.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}
              {" · "}
              {now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} UHR
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success font-semibold tracking-widest">LIVE</span>
          </div>
        </div>
        <button
          onClick={handleFullscreen}
          className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "AKTIV", value: active.length, icon: Car, color: "text-info" },
          { label: "PROBLEME", value: problems.length, icon: AlertTriangle, color: problems.length > 0 ? "text-destructive" : "text-muted-foreground" },
          { label: "OFFENE AUFGABEN", value: openTasks.length, icon: Clock, color: "text-warning" },
          { label: "FERTIG HEUTE", value: done.length, icon: CheckCircle, color: "text-success" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <p className={`text-3xl font-heading ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] tracking-widest text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Stage Columns */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 min-w-max pb-2">
          {STAGE_ORDER.map(stage => {
            const stageVehicles = vehicles.filter(v => v.status === stage);
            return (
              <div key={stage} className="w-52 flex-shrink-0">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-[9px] font-heading tracking-[0.2em] text-muted-foreground">{STAGE_LABELS[stage]}</span>
                  {stageVehicles.length > 0 && (
                    <span className="text-[9px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-semibold">{stageVehicles.length}</span>
                  )}
                </div>
                <div className="space-y-2">
                  {stageVehicles.length === 0 ? (
                    <div className="h-20 rounded-xl border border-dashed border-border flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground">Leer</span>
                    </div>
                  ) : (
                    stageVehicles.map(v => (
                      <motion.button
                        key={v.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => navigate(`/vehicles/${v.id}`)}
                        className={`w-full text-left rounded-xl p-3 border border-border transition-all hover:border-primary/40 ${conditionColors[v.condition] || "border-l-4 border-l-border bg-card"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${conditionDot[v.condition] || "bg-muted-foreground"}`} />
                          <p className="text-xs font-heading text-foreground truncate">{v.make} {v.model}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">{v.license_plate}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">{v.responsible || "—"}</p>
                        {/* Progress */}
                        <div className="w-full h-0.5 bg-border rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${v.progress || 0}%` }} />
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Problems Alert */}
      <AnimatePresence>
        {problems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 bg-destructive/10 border border-destructive/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-xs font-heading tracking-widest text-destructive">AKTIVE PROBLEME</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {problems.map(v => (
                <button
                  key={v.id}
                  onClick={() => navigate(`/vehicles/${v.id}`)}
                  className="text-left p-3 bg-destructive/5 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{v.make} {v.model}</p>
                  <p className="text-xs text-muted-foreground">{v.license_plate} · {v.responsible || "Nicht zugewiesen"}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}