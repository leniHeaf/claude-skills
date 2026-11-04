import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Trophy, Zap, Star } from "lucide-react";

const MESSAGES = {
  task_done: [
    { text: "Saubere Arbeit.", sub: "Aufgabe abgeschlossen.", icon: CheckCircle2, color: "text-success", border: "border-success/20" },
    { text: "Im Zeitplan geblieben.", sub: "Effizienz bestätigt.", icon: Zap, color: "text-chart-1", border: "border-chart-1/20" },
    { text: "Null Nacharbeit erkannt.", sub: "Stark.", icon: Trophy, color: "text-warning", border: "border-warning/20" },
  ],
  quality_pass: [
    { text: "Qualitätsfreigabe bestanden.", sub: "Täubert-Standard gehalten.", icon: Trophy, color: "text-warning", border: "border-warning/20" },
    { text: "Premium-Finish erkannt.", sub: "Exzellente Arbeit.", icon: Star, color: "text-warning", border: "border-warning/20" },
  ],
  general: [
    { text: "Top Dokumentation.", sub: "Alles ordentlich erfasst.", icon: CheckCircle2, color: "text-success", border: "border-success/20" },
    { text: "Sehr gute Ordnung heute.", sub: "Weiter so.", icon: Star, color: "text-chart-2", border: "border-chart-2/20" },
  ],
};

export default function FeedbackToast({ type = "task_done", show, onHide }) {
  const msgs = MESSAGES[type] || MESSAGES.general;
  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  const Icon = msg.icon;

  useEffect(() => {
    if (show) {
      const t = setTimeout(onHide, 3000);
      return () => clearTimeout(t);
    }
  }, [show, onHide]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5
            px-5 py-3.5 rounded-2xl border bg-card/95 backdrop-blur-xl shadow-2xl ${msg.border}`}
        >
          <Icon className={`w-4 h-4 flex-shrink-0 ${msg.color}`} />
          <div>
            <p className={`text-sm font-semibold leading-none ${msg.color}`}>{msg.text}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{msg.sub}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}