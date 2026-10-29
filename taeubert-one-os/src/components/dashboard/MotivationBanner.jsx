import React from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";

const QUOTES = [
  { quote: "Qualität beginnt im Detail.", sub: "Täubert-Standard" },
  { quote: "Nicht schnell. Sondern sauber.", sub: "Das ist der Unterschied" },
  { quote: "Premium entsteht, wenn niemand hinsieht.", sub: "Disziplin" },
  { quote: "Du arbeitest in einem Premiumbetrieb, nicht in einer Werkstatt.", sub: "Identität" },
  { quote: "Jedes Fahrzeug ist eine Visitenkarte.", sub: "Verantwortung" },
  { quote: "Verbesserungspotenzial ist kein Fehler — es ist Wachstum.", sub: "Entwicklung" },
  { quote: "Ordnung ist die halbe Produktion.", sub: "Effizienz" },
];

export default function MotivationBanner({ compact = false }) {
  const todayQuote = QUOTES[new Date().getDay() % QUOTES.length];

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/5 border border-primary/15 rounded-xl">
        <Flame className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <p className="text-xs text-foreground/80 italic">„{todayQuote.quote}"</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl px-5 py-4 flex items-center gap-4"
    >
      <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
        <TrendingUp className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">„{todayQuote.quote}"</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{todayQuote.sub}</p>
      </div>
    </motion.div>
  );
}