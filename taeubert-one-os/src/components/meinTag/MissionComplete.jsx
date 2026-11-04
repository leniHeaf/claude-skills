import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Trophy, Star, Zap } from "lucide-react";

const MESSAGES = [
  { headline: "MISSION ABGESCHLOSSEN", sub: "Saubere Arbeit. Kein Rework.", icon: CheckCircle2, color: "text-success", glow: "shadow-[0_0_60px_rgba(0,200,100,0.15)]" },
  { headline: "QUALITÄTSLEVEL GEHALTEN", sub: "Präzision bestätigt.", icon: Trophy, color: "text-warning", glow: "shadow-[0_0_60px_rgba(255,180,0,0.15)]" },
  { headline: "PREMIUM-FINISH DONE", sub: "Täubert-Standard erfüllt.", icon: Star, color: "text-warning", glow: "shadow-[0_0_60px_rgba(255,180,0,0.15)]" },
  { headline: "IM ZEITPLAN", sub: "Stark. Weiter so.", icon: Zap, color: "text-chart-1", glow: "shadow-[0_0_60px_rgba(60,130,220,0.15)]" },
];

// Confetti-like particles
function Particles() {
  const dots = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.4,
    color: ["bg-success", "bg-warning", "bg-primary", "bg-chart-1"][i % 4],
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map(d => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: "60%", x: `${d.x}vw` }}
          animate={{ opacity: [0, 1, 0], y: ["60%", "-20%"] }}
          transition={{ duration: 1.2, delay: d.delay, ease: "easeOut" }}
          className={`absolute w-1.5 h-1.5 rounded-full ${d.color}`}
        />
      ))}
    </div>
  );
}

export default function MissionComplete({ task, vehicle, employee, onClose }) {
  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const Icon = msg.icon;

  useEffect(() => {
    // Vibration feedback on mobile
    if (navigator.vibrate) navigator.vibrate([30, 20, 80]);
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <Particles />
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 18, stiffness: 200 }}
        onClick={e => e.stopPropagation()}
        className={`relative bg-card border border-border rounded-3xl p-8 mx-6 text-center max-w-xs w-full ${msg.glow}`}
      >
        {/* Icon pulse */}
        <div className="relative inline-flex mb-5">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`w-16 h-16 rounded-full flex items-center justify-center bg-secondary`}
          >
            <Icon className={`w-8 h-8 ${msg.color}`} />
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute inset-0 rounded-full border-2 ${msg.color.replace("text-", "border-")}`}
          />
        </div>

        {/* Headline */}
        <p className={`font-heading text-xl tracking-widest mb-1 ${msg.color}`}>
          {msg.headline}
        </p>
        <p className="text-xs text-muted-foreground mb-4">{msg.sub}</p>

        {/* Task + vehicle info */}
        <div className="bg-secondary/60 rounded-2xl px-4 py-3 text-left">
          <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
          {vehicle && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {vehicle.make} {vehicle.model}
              {vehicle.license_plate && ` · ${vehicle.license_plate}`}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/60 mt-1">{employee}</p>
        </div>

        {/* Auto-close bar */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 2.8, ease: "linear" }}
          style={{ transformOrigin: "left" }}
          className={`absolute bottom-0 left-0 h-[2px] w-full rounded-b-3xl ${msg.color.replace("text-", "bg-")}`}
        />
      </motion.div>
    </motion.div>
  );
}