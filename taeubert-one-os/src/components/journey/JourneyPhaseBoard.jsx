import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Phone, Mail, Car, Crown, ChevronRight, ArrowRight, TrendingUp, Sparkles,
  Gift, Shield, MessageSquare, UserCheck, Eye
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PHASES = [
  { key: "interessent", label: "Interessent", icon: Eye, color: "text-muted-foreground", bg: "bg-muted/20" },
  { key: "erstkontakt", label: "Erstkontakt", icon: Phone, color: "text-chart-1", bg: "bg-chart-1/10" },
  { key: "annahme", label: "Annahme", icon: UserCheck, color: "text-info", bg: "bg-info/10" },
  { key: "kalkulation", label: "Kalkulation", icon: TrendingUp, color: "text-chart-3", bg: "bg-chart-3/10" },
  { key: "aktiv", label: "In Produktion", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  { key: "fertigstellung", label: "Fertigstellung", icon: Shield, color: "text-chart-2", bg: "bg-chart-2/10" },
  { key: "uebergabe", label: "Übergabe", icon: Gift, color: "text-warning", bg: "bg-warning/10" },
  { key: "nachkontakt", label: "Nachkontakt", icon: MessageSquare, color: "text-success", bg: "bg-success/10" },
  { key: "stammkunde", label: "Stammkunde", icon: Crown, color: "text-warning", bg: "bg-warning/15" },
];

const TYPE_COLOR = {
  privat: "bg-muted text-muted-foreground",
  autohaus: "bg-info/20 text-info",
  versicherung: "bg-chart-2/20 text-chart-2",
  flotte: "bg-primary/20 text-primary",
  premium: "bg-warning/20 text-warning",
  interessent: "bg-muted text-muted-foreground",
  stammkunde: "bg-success/20 text-success",
};

export default function JourneyPhaseBoard({ customers, vehicles, appointments }) {
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  const getCustomerVehicles = (name) =>
    vehicles.filter(v => v.customer_name?.toLowerCase() === name?.toLowerCase());

  const getActiveVehicle = (name) => {
    const cv = getCustomerVehicles(name);
    return cv.find(v => v.status !== "uebergabe") || cv[0];
  };

  const STATUS_MAP = {
    annahme: "annahme", teile_bestellt: "aktiv", demontage: "aktiv",
    karosserie: "aktiv", vorbereitung: "aktiv", lackierung: "aktiv",
    finish: "fertigstellung", endkontrolle: "fertigstellung", uebergabe: "uebergabe",
  };

  // Stats
  const phaseCounts = PHASES.reduce((acc, p) => {
    acc[p.key] = customers.filter(c => c.journey_stage === p.key).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Phase Stats Bar */}
      <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
        {PHASES.map(p => {
          const Icon = p.icon;
          const count = phaseCounts[p.key] || 0;
          return (
            <div key={p.key} className={`rounded-xl p-2 text-center ${p.bg} border border-white/5`}>
              <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${p.color}`} />
              <p className={`font-heading text-lg leading-none ${p.color}`}>{count}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5 leading-tight">{p.label}</p>
            </div>
          );
        })}
      </div>

      {/* Journey Pipeline Visual */}
      <div className="bg-card border border-border rounded-xl p-5 overflow-x-auto">
        <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-4">JOURNEY FLOW</p>
        <div className="flex items-center gap-1 min-w-max">
          {PHASES.map((p, i) => {
            const Icon = p.icon;
            const count = phaseCounts[p.key] || 0;
            return (
              <React.Fragment key={p.key}>
                <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl ${p.bg} min-w-[80px]`}>
                  <Icon className={`w-4 h-4 ${p.color}`} />
                  <span className={`text-[10px] font-medium ${p.color}`}>{p.label}</span>
                  {count > 0 && (
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/10 ${p.color}`}>
                      {count} Kunden
                    </span>
                  )}
                </div>
                {i < PHASES.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Customer List + Detail */}
      <div className={selected ? "grid grid-cols-1 lg:grid-cols-5 gap-4" : ""}>
        <div className={selected ? "lg:col-span-3 space-y-2" : "space-y-2"}>
          {customers.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Keine Kunden gefunden.</p>
          ) : (
            customers.map((c, i) => {
              const phase = PHASES.find(p => p.key === c.journey_stage) || PHASES[0];
              const Icon = phase.icon;
              const activeVehicle = getActiveVehicle(c.name);
              return (
                <motion.div key={c.id}
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  className={`bg-card border rounded-xl p-3.5 cursor-pointer transition-all
                    ${selected?.id === c.id ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/20"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${phase.bg} flex-shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${phase.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${TYPE_COLOR[c.customer_type] || "bg-muted text-muted-foreground"}`}>
                          {c.customer_type}
                        </span>
                        {c.rating >= 5 && <Star className="w-3 h-3 text-warning fill-warning" />}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className={`text-[10px] ${phase.color}`}>{phase.label}</span>
                        {activeVehicle && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Car className="w-2.5 h-2.5" />{activeVehicle.make} {activeVehicle.model}
                          </span>
                        )}
                        {c.phone && <span className="text-[10px] text-muted-foreground hidden md:flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{c.phone}</span>}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${selected?.id === c.id ? "rotate-90" : ""}`} />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-card border border-primary/30 rounded-xl p-5 space-y-4 h-fit sticky top-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-base text-foreground">{selected.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.customer_type}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {/* Contact */}
            <div className="space-y-1.5">
              {selected.phone && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{selected.phone}</div>}
              {selected.email && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{selected.email}</div>}
            </div>

            {/* Journey Stage */}
            <div>
              <p className="text-[9px] tracking-wider text-muted-foreground uppercase mb-1.5">JOURNEY-STUFE</p>
              <Select value={selected.journey_stage || "interessent"}
                onValueChange={v => {
                  updateMutation.mutate({ id: selected.id, data: { journey_stage: v, last_contact: new Date().toISOString().split("T")[0] } });
                  setSelected(p => ({ ...p, journey_stage: v }));
                }}>
                <SelectTrigger className="bg-secondary border-border text-sm h-8"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {PHASES.map(p => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Active Vehicles */}
            {getCustomerVehicles(selected.name).length > 0 && (
              <div>
                <p className="text-[9px] tracking-wider text-muted-foreground uppercase mb-1.5">FAHRZEUGE</p>
                {getCustomerVehicles(selected.name).map(v => (
                  <div key={v.id} className="flex justify-between items-center p-2 bg-secondary rounded-lg mb-1.5 text-xs">
                    <span className="text-foreground font-medium">{v.make} {v.model}</span>
                    <span className="text-muted-foreground font-mono">{v.license_plate}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Referral */}
            {selected.referral_source && (
              <div>
                <p className="text-[9px] tracking-wider text-muted-foreground uppercase mb-1">EMPFEHLUNG / KANAL</p>
                <span className="text-xs text-foreground bg-secondary px-2 py-1 rounded-lg inline-block">{selected.referral_source}</span>
              </div>
            )}

            {/* Notes */}
            {selected.special_wishes && (
              <div>
                <p className="text-[9px] tracking-wider text-muted-foreground uppercase mb-1">BESONDERE WÜNSCHE</p>
                <p className="text-xs text-foreground/80 leading-relaxed">{selected.special_wishes}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}