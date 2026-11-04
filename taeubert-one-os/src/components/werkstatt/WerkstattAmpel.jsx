import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Zap, CheckCircle } from "lucide-react";

export default function WerkstattAmpel({ vehicles, tasks, lifts }) {
  const getBereichStatus = (bereich, vehicleCount) => {
    const capacities = {
      annahme: 2, demontage: 2, karosserie: 3,
      vorbereitung: 4, lackierung: 2, finish: 3, endkontrolle: 2
    };
    const cap = capacities[bereich] || 3;
    const pct = (vehicleCount / cap) * 100;
    
    if (pct > 100) return { status: "rot", label: "ÜBERLASTET", icon: AlertTriangle };
    if (pct > 75) return { status: "gelb", label: "KRITISCH", icon: Activity };
    if (pct > 40) return { status: "grün", label: "STABIL", icon: Zap };
    return { status: "grün", label: "FREI", icon: Zap };
  };

  const bereiche = [
    { id: "annahme", name: "Annahme" },
    { id: "demontage", name: "Demontage" },
    { id: "karosserie", name: "Karosserie" },
    { id: "vorbereitung", name: "Vorbereitung" },
    { id: "lackierung", name: "Lackierung" },
    { id: "finish", name: "Finish" },
    { id: "endkontrolle", name: "Endkontrolle" },
  ];

  const counts = {};
  vehicles.forEach(v => { counts[v.status] = (counts[v.status] || 0) + 1; });

  const problems = vehicles.filter(v => v.condition === "problem").length;
  const wartet = vehicles.filter(v => v.condition === "wartet_auf_teile").length;
  const totalVehicles = vehicles.filter(v => v.status !== "uebergabe").length;

  const gesamtwertung = problems > 2 || wartet > 3 ? "rot" : 
                        problems > 0 || wartet > 1 ? "gelb" : "grün";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm text-foreground">WERKSTATT-AMPEL</h3>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
          gesamtwertung === "rot" ? "bg-destructive/20 border-destructive/40 text-destructive" :
          gesamtwertung === "gelb" ? "bg-warning/20 border-warning/40 text-warning" :
          "bg-success/20 border-success/40 text-success"
        }`}>
          GESAMT: {gesamtwertung.toUpperCase()}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3">
        {bereiche.map(b => {
          const count = counts[b.id] || 0;
          const { status, label, icon: Icon } = getBereichStatus(b.id, count);
          
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`border rounded-xl p-4 ${
                status === "rot" ? "bg-destructive/10 border-destructive/30" :
                status === "gelb" ? "bg-warning/10 border-warning/30" :
                "bg-success/10 border-success/30"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{b.name}</p>
                  <p className={`text-xl font-heading mt-1 ${
                    status === "rot" ? "text-destructive" :
                    status === "gelb" ? "text-warning" : "text-success"
                  }`}>{label}</p>
                </div>
                {status === "rot" ? <AlertTriangle className="w-5 h-5 text-destructive" /> :
                 status === "gelb" ? <Activity className="w-5 h-5 text-warning" /> :
                 <CheckCircle className="w-5 h-5 text-success" />}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{count} Fahrzeuge</span>
                <span className={`text-[10px] font-semibold ${
                  status === "rot" ? "text-destructive" :
                  status === "gelb" ? "text-warning" : "text-success"
                }`}>●</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Critical Alerts */}
      {(problems > 0 || wartet > 0) && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">KRITISCHE MELDUNGEN</p>
          
          {problems > 0 && (
            <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-destructive font-semibold">{problems} Fahrzeuge mit Problemen</p>
                <p className="text-[10px] text-muted-foreground">Sofortige Aufmerksamkeit erforderlich</p>
              </div>
            </div>
          )}

          {wartet > 0 && (
            <div className="flex items-center gap-3 bg-warning/10 border border-warning/30 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-warning font-semibold">{wartet} Fahrzeuge warten auf Teile</p>
                <p className="text-[10px] text-muted-foreground">Lieferanten kontaktieren</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trend Indicators */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Durchsatz</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm font-semibold text-success">+12%</span>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Probleme</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendingDown className="w-4 h-4 text-success" />
            <span className="text-sm font-semibold text-success">-3</span>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Auslastung</p>
          <p className="text-sm font-semibold text-warning mt-1">78%</p>
        </div>
      </div>
    </div>
  );
}