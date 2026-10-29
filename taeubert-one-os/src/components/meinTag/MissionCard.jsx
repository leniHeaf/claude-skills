import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, CheckCircle2, Camera, AlertTriangle, Crown, Zap, Pause } from "lucide-react";
import { differenceInMinutes } from "date-fns";

const CATEGORY_ICONS = {
  lackierung: "🎨",
  finish: "✨",
  karosserie: "🔧",
  vorbereitung: "🧹",
  endkontrolle: "🔍",
  uebergabe: "🤝",
  teile: "📦",
  reinigung: "🧽",
  kunde: "👤",
  sonstiges: "⚙️",
};

const PRIORITY_COLORS = {
  kritisch: { bar: "bg-destructive", label: "text-destructive", bg: "border-destructive/20" },
  hoch: { bar: "bg-warning", label: "text-warning", bg: "border-warning/20" },
  mittel: { bar: "bg-primary", label: "text-primary", bg: "border-primary/20" },
  niedrig: { bar: "bg-muted-foreground", label: "text-muted-foreground", bg: "border-border" },
};

// Live timer hook
function useTimer(startTime) {
  const [mins, setMins] = useState(() => startTime ? differenceInMinutes(new Date(), new Date(startTime)) : 0);
  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => setMins(differenceInMinutes(new Date(), new Date(startTime))), 30000);
    return () => clearInterval(id);
  }, [startTime]);
  return mins;
}

export default function MissionCard({ task, vehicle, isPremium, hint, activeEntry, onStart, onComplete, onPause, isPaused, onResume, onOpenDetails }) {
  const prio = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.mittel;
  const categoryIcon = CATEGORY_ICONS[task.category] || "⚙️";
  const isRunning = !!activeEntry;
  const elapsedMins = useTimer(activeEntry?.start_time);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-3xl border mb-6
        ${isPremium
          ? "bg-gradient-to-br from-[#1a1408] via-card to-card border-warning/25"
          : "bg-card border-border/80"
        }`}
    >
      {/* Top accent line */}
      <div className={`h-[2px] w-full ${prio.bar} opacity-80`} />

      {/* Content */}
      <div className="p-6">
        {/* Labels row */}
        <div className="flex items-center gap-2 mb-5">
          <span className={`text-[9px] font-heading tracking-[0.2em] uppercase px-2.5 py-1 rounded-full bg-secondary border ${prio.bg} ${prio.label}`}>
            {task.priority} · Mission
          </span>
          {isPremium && (
            <span className="text-[9px] font-heading tracking-[0.15em] uppercase px-2.5 py-1 rounded-full bg-warning/10 border border-warning/25 text-warning flex items-center gap-1">
              <Crown className="w-2.5 h-2.5" /> Premium
            </span>
          )}
          {isRunning && !isPaused && (
            <span className="ml-auto text-[10px] font-heading text-success flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              {elapsedMins}min
            </span>
          )}
          {isPaused && (
            <span className="ml-auto text-[10px] font-heading text-warning flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              PAUSE
            </span>
          )}
        </div>

        {/* Category + Mission Title */}
        <div className="mb-1">
          <span className="text-2xl">{categoryIcon}</span>
        </div>
        <p className="font-heading text-2xl text-foreground leading-tight mb-2 tracking-wide">
          {task.title.toUpperCase()}
        </p>

        {/* Vehicle */}
        {vehicle ? (
          <p className="text-sm text-muted-foreground mb-1">
            <span className="text-foreground/80 font-medium">{vehicle.make} {vehicle.model}</span>
            {vehicle.color && <span className="mx-1.5 text-muted-foreground/50">·</span>}
            {vehicle.color && <span>{vehicle.color}</span>}
            {vehicle.license_plate && (
              <span className="ml-2 font-mono text-xs text-muted-foreground/60 bg-secondary px-1.5 py-0.5 rounded">
                {vehicle.license_plate}
              </span>
            )}
          </p>
        ) : task.vehicle_info ? (
          <p className="text-sm text-muted-foreground mb-1">{task.vehicle_info}</p>
        ) : null}

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground/70 mt-2 mb-3 leading-relaxed">{task.description}</p>
        )}

        {/* Hint */}
        {hint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-2.5 mt-4 p-3.5 rounded-2xl bg-warning/5 border border-warning/15"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-warning/80 leading-relaxed">{hint}</p>
          </motion.div>
        )}

        {/* Divider */}
        <div className="h-px bg-border/50 my-5" />

        {/* CTA Buttons */}
        <div className="space-y-2.5">
          {!isRunning ? (
            <motion.button
              onClick={onStart}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-primary hover:bg-primary/90 transition-colors font-heading text-base tracking-widest text-primary-foreground"
            >
              <Play className="w-5 h-5" />
              MISSION STARTEN
            </motion.button>
          ) : isPaused ? (
            <>
              <motion.button
                onClick={onResume}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-primary hover:bg-primary/90 transition-colors font-heading text-base tracking-widest text-primary-foreground"
              >
                <Play className="w-5 h-5" />
                FORTSETZEN
              </motion.button>
              <motion.button
                onClick={onComplete}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border border-success/30 bg-success/10 hover:bg-success/20 transition-colors text-sm font-medium text-success"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mission abschließen
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                onClick={onComplete}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-success hover:bg-success/90 transition-colors font-heading text-base tracking-widest text-white"
              >
                <CheckCircle2 className="w-5 h-5" />
                MISSION ABSCHLIESSEN
              </motion.button>
              <motion.button
                onClick={onPause}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border border-warning/30 bg-warning/5 hover:bg-warning/10 transition-colors text-sm font-medium text-warning"
              >
                <Pause className="w-4 h-4" />
                Pause
              </motion.button>
            </>
          )}

          {/* Secondary row */}
          {!isPaused && (
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onOpenDetails}
                className="flex items-center justify-center gap-2 h-11 rounded-2xl border border-border/60 bg-secondary/50 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all font-medium"
              >
                <Camera className="w-4 h-4" /> Fotos & Details
              </motion.button>
              {isRunning && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onComplete}
                  className="flex items-center justify-center gap-2 h-11 rounded-2xl border border-border/60 bg-secondary/50 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all font-medium"
                >
                  <Zap className="w-4 h-4" /> Direkt fertig
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}