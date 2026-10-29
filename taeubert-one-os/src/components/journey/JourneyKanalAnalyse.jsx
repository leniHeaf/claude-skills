import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Crown, Gift } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const REFERRAL_SOURCES = [
  "Google", "Instagram", "Empfehlung", "Autohaus", "Versicherung", "Vorbeifahrt", "TikTok", "Bewertungsplattform", "Sonstiges",
];

const SOURCE_COLORS = {
  Google: "#4285F4", Instagram: "#E1306C", Empfehlung: "#F59E0B",
  Autohaus: "#6366F1", Versicherung: "#10B981", Vorbeifahrt: "#8B5CF6",
  TikTok: "#EC4899", Bewertungsplattform: "#14B8A6", Sonstiges: "#6B7280",
};

function getCustomerScore(c, cvehicles) {
  let score = 0;
  score += cvehicles.length * 15;
  if (c.customer_type === "premium") score += 30;
  if (c.customer_type === "stammkunde") score += 20;
  if (c.customer_type === "autohaus") score += 25;
  if (c.rating >= 5) score += 20;
  if (c.tags?.includes("empfehlung")) score += 15;
  if (c.journey_stage === "stammkunde") score += 15;
  return Math.min(100, Math.max(0, score));
}

export default function JourneyKanalAnalyse({ customers, vehicles }) {
  const getCustomerVehicles = (name) =>
    vehicles.filter(v => v.customer_name?.toLowerCase() === name?.toLowerCase());

  // Referral source breakdown
  const sourceData = REFERRAL_SOURCES.map(src => {
    const group = customers.filter(c => c.referral_source === src);
    const avgScore = group.length
      ? Math.round(group.reduce((acc, c) => acc + getCustomerScore(c, getCustomerVehicles(c.name)), 0) / group.length)
      : 0;
    return { name: src, count: group.length, avgScore };
  }).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

  const noSource = customers.filter(c => !c.referral_source).length;

  // Journey stage breakdown
  const stageBreakdown = [
    { key: "interessent", label: "Interessent" }, { key: "erstkontakt", label: "Erstkontakt" },
    { key: "annahme", label: "Annahme" }, { key: "aktiv", label: "Aktiv" },
    { key: "uebergabe", label: "Übergabe" }, { key: "nachkontakt", label: "Nachkontakt" },
    { key: "stammkunde", label: "Stammkunde" },
  ].map(s => ({ ...s, count: customers.filter(c => c.journey_stage === s.key).length }));

  // Top referrers
  const referrers = customers.filter(c => c.tags?.includes("empfehlung"));

  // VIP customers
  const vipCustomers = customers
    .map(c => ({ ...c, score: getCustomerScore(c, getCustomerVehicles(c.name)) }))
    .filter(c => c.score >= 60)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const conversionRate = customers.length
    ? Math.round((customers.filter(c => c.journey_stage === "stammkunde").length / customers.length) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Kunden gesamt", value: customers.length, icon: Users, color: "text-foreground" },
          { label: "Stammkunden", value: customers.filter(c => c.journey_stage === "stammkunde").length, icon: Crown, color: "text-warning" },
          { label: "Empfehler", value: referrers.length, icon: Gift, color: "text-success" },
          { label: "Konversionsrate", value: `${conversionRate}%`, icon: TrendingUp, color: "text-chart-1" },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <Icon className={`w-4 h-4 mx-auto mb-1.5 ${kpi.color}`} />
              <p className={`font-heading text-2xl ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Kanal-Herkunft Chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-4">KUNDENHERKUNFT</p>
          {sourceData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Noch keine Kanalzuordnungen.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={sourceData} margin={{ left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#6B7280" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#6B7280" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Kunden">
                    {sourceData.map((entry) => (
                      <Cell key={entry.name} fill={SOURCE_COLORS[entry.name] || "#6B7280"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {noSource > 0 && (
                <p className="text-[10px] text-muted-foreground text-center mt-1">{noSource} Kunden ohne Kanalzuordnung</p>
              )}
            </>
          )}
        </div>

        {/* Journey Stage Funnel */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-4">JOURNEY-FUNNEL</p>
          <div className="space-y-2">
            {stageBreakdown.map((s, i) => {
              const maxCount = Math.max(...stageBreakdown.map(x => x.count), 1);
              const pct = Math.round((s.count / maxCount) * 100);
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20 text-right flex-shrink-0">{s.label}</span>
                  <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      className="h-full bg-primary/60 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground w-5 text-right">{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top VIP Customers */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-4">TOP KUNDEN · HÖCHSTER KUNDENWERT</p>
        {vipCustomers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Keine VIP-Kunden identifiziert.</p>
        ) : (
          <div className="space-y-2">
            {vipCustomers.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                <span className="w-6 text-center text-xs font-semibold text-muted-foreground">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {c.referral_source && <span className="text-[9px] text-muted-foreground bg-card px-1.5 py-0.5 rounded">{c.referral_source}</span>}
                    <span className="text-[9px] text-muted-foreground">{c.customer_type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading text-lg text-warning">{c.score}</p>
                  <p className="text-[9px] text-muted-foreground">Score</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}