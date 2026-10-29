import React from "react";
import { motion } from "framer-motion";
import { Crown, TrendingUp, TrendingDown, Star, AlertTriangle, Heart, Shield, Zap } from "lucide-react";

const BEHAVIOR_ICONS = {
  preisorientiert: { icon: TrendingDown, color: "text-warning", bg: "bg-warning/10" },
  qualitaetsorientiert: { icon: Star, color: "text-success", bg: "bg-success/10" },
  emotional: { icon: Heart, color: "text-chart-1", bg: "bg-chart-1/10" },
  detailverliebt: { icon: Zap, color: "text-info", bg: "bg-info/10" },
  hektisch: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  anspruchsvoll: { icon: Crown, color: "text-primary", bg: "bg-primary/10" },
  loyal: { icon: Shield, color: "text-success", bg: "bg-success/10" },
  empfehlungsgeber: { icon: TrendingUp, color: "text-chart-2", bg: "bg-chart-2/10" },
  vip: { icon: Crown, color: "text-warning", bg: "bg-warning/20" },
};

const BEHAVIOR_LABELS = {
  preisorientiert: "Preisbewusst",
  qualitaetsorientiert: "Qualitätsfokus",
  emotional: "Emotional",
  detailverliebt: "Detailverliebt",
  hektisch: "Hektisch",
  anspruchsvoll: "Anspruchsvoll",
  loyal: "Loyal",
  empfehlungsgeber: "Empfehler",
  vip: "VIP ★",
};

export default function CustomerIntelligencePanel({ customer }) {
  const behaviors = customer.behavior_traits || [];
  const moodConfig = {
    begeistert: { color: "text-success", bg: "bg-success/10", border: "border-success/30", label: "🟢 Begeistert" },
    neutral: { color: "text-muted-foreground", bg: "bg-secondary", border: "border-border", label: "🟡 Neutral" },
    kritisch: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", label: "🟠 Kritisch" },
    gefaehrdet: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "🔴 Gefährdet" },
  };

  const mood = moodConfig[customer.mood_status || "neutral"];

  const getCustomerArchetype = () => {
    if (customer.vip_status) return { name: "VIP Kunde", icon: "👑", desc: "Höchste Priorität" };
    if (behaviors.includes("vip")) return { name: "Premium Enthusiast", icon: "🏆", desc: "Liebt Perfektion" };
    if (behaviors.includes("qualitaetsorientiert") && behaviors.includes("detailverliebt")) 
      return { name: "Perfektionist", icon: "⭐", desc: "Detail + Qualität" };
    if (behaviors.includes("loyal") && behaviors.includes("empfehlungsgeber")) 
      return { name: "Stammkunde", icon: "🤝", desc: "Loyal + Empfiehlt" };
    if (behaviors.includes("emotional")) 
      return { name: "Enthusiast", icon: "❤️", desc: "Emotional verbunden" };
    if (behaviors.includes("preisorientiert")) 
      return { name: "Preisbewusst", icon: "💰", desc: "Preis im Fokus" };
    return { name: "Standard", icon: "👤", desc: "Regulärer Kunde" };
  };

  const archetype = getCustomerArchetype();

  return (
    <div className="space-y-4">
      {/* Archetype Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Kunden-Archetype</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{archetype.icon}</span>
              <div>
                <p className="text-sm font-bold text-foreground">{archetype.name}</p>
                <p className="text-[10px] text-muted-foreground">{archetype.desc}</p>
              </div>
            </div>
          </div>
          {customer.vip_status && (
            <Crown className="w-5 h-5 text-warning" />
          )}
        </div>
      </motion.div>

      {/* Mood Status */}
      <div className={`border rounded-xl p-3 ${mood.bg} ${mood.border}`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${mood.color}`}>{mood.label}</span>
          <span className="text-[10px] text-muted-foreground">Aktuelle Stimmung</span>
        </div>
      </div>

      {/* Behavior Traits */}
      {behaviors.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Verhaltensmerkmale</p>
          <div className="flex flex-wrap gap-1.5">
            {behaviors.map(b => {
              const cfg = BEHAVIOR_ICONS[b] || { icon: null, color: "text-muted-foreground", bg: "bg-secondary" };
              const Icon = cfg.icon;
              return (
                <span key={b} className={`text-[10px] px-2 py-1 rounded-md flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                  {Icon && <Icon className="w-3 h-3" />}
                  {BEHAVIOR_LABELS[b]}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Scores */}
      <div className="grid grid-cols-2 gap-2">
        {customer.loyalty_score > 0 && (
          <div className="bg-secondary rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Heart className="w-3.5 h-3.5 text-chart-1" />
              <span className="text-[9px] text-muted-foreground">Loyalität</span>
            </div>
            <p className={`text-lg font-heading ${customer.loyalty_score >= 80 ? "text-success" : customer.loyalty_score >= 50 ? "text-warning" : "text-destructive"}`}>
              {customer.loyalty_score}
            </p>
          </div>
        )}
        {customer.potential_score > 0 && (
          <div className="bg-secondary rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-chart-2" />
              <span className="text-[9px] text-muted-foreground">Potenzial</span>
            </div>
            <p className={`text-lg font-heading ${customer.potential_score >= 80 ? "text-success" : customer.potential_score >= 50 ? "text-warning" : "text-muted-foreground"}`}>
              {customer.potential_score}
            </p>
          </div>
        )}
        {customer.risk_score > 0 && (
          <div className="bg-secondary rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-[9px] text-muted-foreground">Risiko</span>
            </div>
            <p className={`text-lg font-heading ${customer.risk_score >= 70 ? "text-destructive" : customer.risk_score >= 40 ? "text-warning" : "text-success"}`}>
              {customer.risk_score}
            </p>
          </div>
        )}
      </div>

      {/* Lifetime Value */}
      {customer.lifetime_value > 0 && (
        <div className="bg-gradient-to-r from-chart-2/10 to-chart-2/5 border border-chart-2/30 rounded-xl p-3">
          <p className="text-[9px] text-muted-foreground uppercase mb-1">Lifetime Value</p>
          <p className="text-xl font-heading text-chart-2">{customer.lifetime_value.toLocaleString()} €</p>
          {customer.referral_value > 0 && (
            <p className="text-[10px] text-muted-foreground mt-1">
              + {customer.referral_value.toLocaleString()} € durch Empfehlungen
            </p>
          )}
        </div>
      )}

      {/* Communication Style */}
      {customer.communication_style && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Kommunikation</p>
          <span className="text-xs px-2 py-1 bg-secondary rounded-md text-foreground">
            {customer.communication_style.replace("_", " ")}
          </span>
        </div>
      )}

      {/* Preferences */}
      {customer.preferences && (
        <div className="bg-secondary/50 border border-border rounded-lg p-2.5">
          <p className="text-[9px] text-muted-foreground uppercase mb-1">Persönliches</p>
          <p className="text-xs text-foreground/80 italic">{customer.preferences}</p>
        </div>
      )}

      {/* Wishlist */}
      {customer.wishlist && (
        <div className="bg-info/5 border border-info/20 rounded-lg p-2.5">
          <p className="text-[9px] text-info uppercase mb-1">Wunschliste</p>
          <p className="text-xs text-muted-foreground">{customer.wishlist}</p>
        </div>
      )}
    </div>
  );
}