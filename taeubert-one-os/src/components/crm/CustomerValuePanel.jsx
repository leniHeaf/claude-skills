import React from "react";
import { motion } from "framer-motion";
import { Crown, Star, TrendingUp, Users, Gift } from "lucide-react";

function getCustomerScore(customer, customerVehicles, errors) {
  let score = 0;
  const reasons = [];

  // Fahrzeuganzahl
  const vehicleCount = customerVehicles.length;
  score += vehicleCount * 15;
  if (vehicleCount > 1) reasons.push(`${vehicleCount} Fahrzeuge`);

  // Kundenstatus
  if (customer.customer_type === "premium") { score += 30; reasons.push("Premium"); }
  if (customer.customer_type === "stammkunde") { score += 20; reasons.push("Stammkunde"); }
  if (customer.customer_type === "autohaus") { score += 25; reasons.push("Autohaus"); }
  if (customer.customer_type === "flotte") { score += 20; reasons.push("Flotte"); }

  // Rating
  if (customer.rating >= 5) { score += 20; reasons.push("Top-Bewertung"); }
  else if (customer.rating >= 4) { score += 10; }

  // Empfehlungen
  if (customer.referral_source) { score += 10; }
  if (customer.tags?.includes("empfehlung")) { score += 15; reasons.push("Empfehler"); }
  if (customer.tags?.includes("vip")) { score += 25; reasons.push("VIP"); }

  // Journey-Stufe
  if (customer.journey_stage === "stammkunde") { score += 15; }

  // Reklamationen (negativ)
  const customerErrors = errors.filter(e =>
    customerVehicles.some(v => v.id === e.vehicle_id)
  );
  if (customerErrors.length > 0) { score -= customerErrors.length * 5; }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

function getVIPClass(score) {
  if (score >= 70) return { label: "VIP", color: "text-warning", bg: "bg-warning/10 border-warning/30", icon: Crown };
  if (score >= 45) return { label: "Premium", color: "text-chart-2", bg: "bg-chart-2/10 border-chart-2/30", icon: Star };
  if (score >= 20) return { label: "Aktiv", color: "text-chart-1", bg: "bg-chart-1/10 border-chart-1/30", icon: TrendingUp };
  return { label: "Standard", color: "text-muted-foreground", bg: "bg-secondary border-border", icon: Users };
}

export default function CustomerValuePanel({ customers, vehicles, errors }) {
  const scoredCustomers = customers
    .map(c => {
      const cv = vehicles.filter(v => v.customer_name?.toLowerCase() === c.name?.toLowerCase());
      const { score, reasons } = getCustomerScore(c, cv, errors);
      return { ...c, _score: score, _reasons: reasons, _vehicles: cv.length };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, 10);

  const vipCount = scoredCustomers.filter(c => c._score >= 70).length;
  const premiumCount = scoredCustomers.filter(c => c._score >= 45 && c._score < 70).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "VIP-Kunden", value: vipCount, icon: Crown, color: "text-warning" },
          { label: "Premium", value: premiumCount, icon: Star, color: "text-chart-2" },
          { label: "Empfehler", value: customers.filter(c => c.tags?.includes("empfehlung")).length, icon: Gift, color: "text-chart-2" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-secondary rounded-xl p-3 text-center">
            <kpi.icon className={`w-4 h-4 mx-auto mb-1 ${kpi.color}`} />
            <p className={`font-heading text-xl ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Top Customers */}
      <div className="space-y-2">
        {scoredCustomers.map((c, i) => {
          const cls = getVIPClass(c._score);
          const Icon = cls.icon;
          return (
            <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${cls.bg}`}>
              <div className="flex-shrink-0 w-7 text-center">
                <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${cls.bg} ${cls.color}`}>
                    {cls.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {c._reasons.slice(0, 3).map(r => (
                    <span key={r} className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{r}</span>
                  ))}
                  {c._vehicles > 0 && <span className="text-[9px] text-muted-foreground">🚗 {c._vehicles}</span>}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className={`font-heading text-lg ${cls.color}`}>{c._score}</p>
                <p className="text-[9px] text-muted-foreground">Score</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}