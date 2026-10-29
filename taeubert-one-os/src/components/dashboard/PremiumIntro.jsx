import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUOTES = [
  "Qualität entsteht im Detail.",
  "Nur perfekte Fahrzeuge verlassen die Halle.",
  "Premiumarbeit ist kein Zufall — sie ist System.",
  "Jeder Handgriff zählt.",
  "Das Täubert-Versprechen: Kein Kompromiss.",
];

export default function PremiumIntro() {
  const [visible, setVisible] = useState(true);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl px-5 py-3 mb-5 flex items-center gap-3"
        >
          <div className="w-1 h-8 bg-primary rounded-full flex-shrink-0" />
          <p className="text-sm text-foreground font-medium italic">„{quote}"</p>
          <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">TÄUBERT ONE</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}