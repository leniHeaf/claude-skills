import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Sun, Moon, CheckCircle2, Circle, AlertTriangle, Car
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const TEAM = ["Toni", "Pascal", "Fanny", "Maik", "Marco", "Adrian", "Lena"];

const STAGE_LABELS = {
  annahme: "Annahme", teile_bestellt: "Teile", demontage: "Demontage",
  karosserie: "Karosserie", vorbereitung: "Vorbereitung", lackierung: "Lackierung",
  finish: "Finish", endkontrolle: "Endkontrolle", uebergabe: "Übergabe"
};

const MORNING_CHECKS = [
  { id: "platz", label: "Arbeitsplatz kontrolliert & sauber" },
  { id: "werkzeug", label: "Werkzeug vollständig & in Ordnung" },
  { id: "material", label: "Material für heute geprüft" },
  { id: "aufgaben", label: "Heutige Aufgaben gelesen" },
  { id: "sicherheit", label: "PSA angezogen (Schuhe, Brille, Handschuhe)" },
];

const EVENING_CHECKS = [
  { id: "aufgaben_update", label: "Aufgabenstatus aktualisiert" },
  { id: "fotos", label: "Fotos hochgeladen" },
  { id: "material_melden", label: "Materialverbrauch gemeldet" },
  { id: "platz_aufraemen", label: "Arbeitsplatz aufgeräumt" },
  { id: "bericht", label: "Bericht / Notizen eingetragen" },
  { id: "werkzeug_weg", label: "Werkzeug weggeräumt & gesichert" },
];

const QUOTES = [
  "Qualität entsteht nicht durch Zufall — sie wird täglich erarbeitet.",
  "Der Unterschied zwischen gut und premium ist Disziplin.",
  "Jedes Fahrzeug, das die Halle verlässt, ist unsere Visitenkarte.",
  "Ordnung ist die halbe Produktion.",
  "Wer schnell sein will, muss zuerst genau sein.",
  "Premium bedeutet: keine Kompromisse.",
];

export default function Tagesstart() {
  const [mode, setMode] = useState("morgen");
  const [employee, setEmployee] = useState(TEAM[0]);
  const [checks, setChecks] = useState({});
  const [time, setTime] = useState(new Date());

  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: () => base44.entities.Vehicle.list() });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => base44.entities.Task.list() });
  const { data: leaveReqs = [] } = useQuery({ queryKey: ["leave"], queryFn: () => base44.entities.LeaveRequest.list() });

  const myTasks = tasks.filter(t => t.assigned_to === employee && t.status !== "erledigt");
  const urgentVehicles = vehicles.filter(v => v.condition === "problem" || v.estimated_completion === new Date().toISOString().split("T")[0]);
  const today = new Date().toISOString().split("T")[0];
  const absent = leaveReqs.filter(l => l.status === "genehmigt" && l.start_date <= today && l.end_date >= today).map(l => l.employee);

  const checkList = mode === "morgen" ? MORNING_CHECKS : EVENING_CHECKS;
  const checkedCount = checkList.filter(c => checks[c.id]).length;
  const allDone = checkedCount === checkList.length;

  const toggle = (id) => setChecks(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="text-4xl mb-2">{mode === "morgen" ? "☀️" : "🌙"}</div>
        <h1 className="font-heading text-2xl text-foreground tracking-wide">
          {mode === "morgen" ? "GUTEN MORGEN" : "TAGESABSCHLUSS"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{format(time, "EEEE, d. MMMM yyyy", { locale: de })}</p>
        <p className="font-heading text-3xl text-primary mt-1">{format(time, "HH:mm:ss")}</p>
      </motion.div>

      {/* Quote */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="bg-card border border-primary/20 rounded-xl px-5 py-4 mb-6 text-center">
        <p className="text-sm text-foreground/70 italic">„{quote}"</p>
      </motion.div>

      {/* Mode Toggle & Employee */}
      <div className="flex gap-3 mb-6">
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          <button onClick={() => { setMode("morgen"); setChecks({}); }}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-all ${mode === "morgen" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <Sun className="w-3 h-3" /> Morgen
          </button>
          <button onClick={() => { setMode("abend"); setChecks({}); }}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-all ${mode === "abend" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <Moon className="w-3 h-3" /> Abend
          </button>
        </div>
        <Select value={employee} onValueChange={setEmployee}>
          <SelectTrigger className="bg-secondary border-border flex-1"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-card border-border">
            {TEAM.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Abwesend Hinweis */}
      {absent.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
          <p className="text-xs text-warning font-medium">Heute abwesend: {absent.join(", ")}</p>
        </div>
      )}

      {/* Morning: Heutige Infos */}
      {mode === "morgen" && (
        <div className="space-y-4 mb-6">
          {/* Dringende Fahrzeuge */}
          {urgentVehicles.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
              <p className="font-heading text-xs text-destructive mb-3">🔴 HEUTE KRITISCH</p>
              {urgentVehicles.map(v => (
                <div key={v.id} className="flex items-center gap-2 py-1.5 border-t border-destructive/20 first:border-0">
                  <Car className="w-3 h-3 text-destructive" />
                  <span className="text-xs text-foreground">{v.make} {v.model} – {v.license_plate}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{STAGE_LABELS[v.status]}</span>
                </div>
              ))}
            </div>
          )}

          {/* Meine Aufgaben */}
          {myTasks.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="font-heading text-xs text-foreground mb-3">DEINE AUFGABEN HEUTE ({myTasks.length})</p>
              <div className="space-y-2">
                {myTasks.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.priority === "kritisch" ? "bg-destructive" : t.priority === "hoch" ? "bg-warning" : "bg-chart-2"}`} />
                    <span className="text-foreground flex-1 truncate">{t.title}</span>
                    {t.vehicle_info && <span className="text-muted-foreground text-[10px] truncate max-w-[100px]">{t.vehicle_info}</span>}
                  </div>
                ))}
                {myTasks.length > 5 && <p className="text-[10px] text-muted-foreground">+{myTasks.length - 5} weitere</p>}
              </div>
            </div>
          )}

          {/* Fahrzeuge in Arbeit */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="font-heading text-xs text-foreground mb-3">FAHRZEUGE IN DER HALLE ({vehicles.filter(v => v.status !== "uebergabe").length})</p>
            <div className="space-y-1.5">
              {vehicles.filter(v => v.status !== "uebergabe").slice(0, 6).map(v => (
                <div key={v.id} className="flex items-center gap-2 text-xs">
                  <span className="text-foreground font-medium">{v.make} {v.model}</span>
                  <span className="text-muted-foreground font-mono text-[10px]">{v.license_plate}</span>
                  <span className="ml-auto text-[10px] px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">{STAGE_LABELS[v.status]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Checkliste */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-heading text-sm text-foreground">
            {mode === "morgen" ? "MORGEN-CHECKLISTE" : "ABEND-CHECKLISTE"}
          </p>
          <span className="text-xs text-muted-foreground">{checkedCount}/{checkList.length}</span>
        </div>
        <div className="space-y-3">
          {checkList.map(item => (
            <button key={item.id} onClick={() => toggle(item.id)}
              className="w-full flex items-center gap-3 text-left group">
              {checks[item.id]
                ? <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                : <Circle className="w-5 h-5 text-border flex-shrink-0 group-hover:text-muted-foreground" />}
              <span className={`text-sm transition-all ${checks[item.id] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div animate={{ width: `${(checkedCount / checkList.length) * 100}%` }} transition={{ duration: 0.3 }}
              className={`h-full rounded-full ${allDone ? "bg-success" : "bg-primary"}`} />
          </div>
        </div>
      </div>

      {/* Done State */}
      {allDone && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-success/10 border border-success/30 rounded-xl p-5 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <p className="font-heading text-sm text-success">
            {mode === "morgen" ? "PERFEKTER START — LOS GEHT'S!" : "TOP ARBEITSTAG — DANKE!"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {mode === "morgen" ? "Alle Checks erledigt. Fokus auf Premium-Qualität." : "Alle Pflichten erfüllt. Gute Erholung."}
          </p>
        </motion.div>
      )}
    </div>
  );
}