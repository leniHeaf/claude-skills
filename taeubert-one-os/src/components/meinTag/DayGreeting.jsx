import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TEAM = ["Toni", "Pascal", "Fanny", "Maik", "Marco", "Adrian", "Lena"];

const GREETINGS = [
  "Heute wird präzise gearbeitet.",
  "Jedes Fahrzeug verdient das Beste.",
  "Perfektion entsteht im Detail.",
  "Qualität ist kein Zufall.",
  "Konzentration. Präzision. Täubert.",
];

export default function DayGreeting({ employee, onChangeEmployee, completedToday, openCount, activeMinutes, hasActiveEntry, isAdmin = false }) {
  const greeting = GREETINGS[new Date().getDay() % GREETINGS.length];
  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? "Guten Morgen" : hour < 17 ? "Guten Tag" : "Guten Abend";

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="pt-8 pb-6"
    >
      {/* Date */}
      <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-4">
        {format(new Date(), "EEEE · d. MMMM yyyy", { locale: de })}
      </p>

      {/* Greeting + Employee Selector (nur für Admins) */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="text-muted-foreground text-sm mb-0.5">{timeGreet},</p>
          <h1 className="font-heading text-3xl text-foreground tracking-wide">{employee.toUpperCase()}</h1>
        </div>
        {isAdmin && (
          <Select value={employee} onValueChange={onChangeEmployee}>
            <SelectTrigger className="w-32 bg-secondary border-border text-xs h-8 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEAM.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Tagesmotto */}
      <p className="text-sm text-muted-foreground/70 italic mb-5">„{greeting}"</p>

      {/* Mini stats — inline, airy */}
      <div className="flex items-center gap-6">
        <div>
          <span className="font-heading text-2xl text-success">{completedToday}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Erledigt</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div>
          <span className="font-heading text-2xl text-foreground">{openCount}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Offen</p>
        </div>
        {hasActiveEntry && (
          <>
            <div className="w-px h-8 bg-border" />
            <div>
              <span className="font-heading text-2xl text-warning">{activeMinutes}<span className="text-sm font-body ml-0.5">min</span></span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Aktiv</p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}