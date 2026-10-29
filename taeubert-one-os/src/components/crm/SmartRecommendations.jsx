import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Lightbulb, Clock, TrendingUp, Crown, Camera, FileText, Gift, Star } from "lucide-react";

const ICONS = {
  reactivation: Clock,
  seasonal: Lightbulb,
  premium: Star,
  insurance: FileText,
  restoration: TrendingUp,
  behavior: Camera,
  vip: Crown,
  loyalty: Gift,
  upsell: TrendingUp,
};

const PRIORITY_COLORS = {
  high: "bg-destructive/10 border-destructive/30 text-destructive",
  medium: "bg-warning/10 border-warning/30 text-warning",
  low: "bg-info/10 border-info/30 text-info",
};

export default function SmartRecommendations({ customerId }) {
  const { data: recommendationsData, isLoading, error } = useQuery({
    queryKey: ["customer-recommendations", customerId],
    queryFn: () => base44.functions.invoke('getCustomerRecommendations', { customer_id: customerId }),
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Analysiere Kunden...</span>
        </div>
      </div>
    );
  }

  if (error || !recommendationsData?.recommendations?.length) {
    return null;
  }

  const recommendations = recommendationsData.recommendations;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-chart-2" />
        <p className="text-xs font-semibold text-foreground">SMART RECOMMENDATIONS</p>
        <span className="text-[10px] text-muted-foreground">({recommendations.length})</span>
      </div>

      <div className="space-y-2">
        {recommendations.map((rec, i) => {
          const Icon = ICONS[rec.type] || Lightbulb;
          const colors = PRIORITY_COLORS[rec.priority];

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`border rounded-xl p-3 ${colors}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-xl">{rec.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold">{rec.title}</p>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase ${
                      rec.priority === "high" ? "bg-destructive text-destructive-foreground" :
                      rec.priority === "medium" ? "bg-warning text-warning-foreground" :
                      "bg-info text-info-foreground"
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                  <p className="text-[10px] font-medium">
                    💡 {rec.action}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}