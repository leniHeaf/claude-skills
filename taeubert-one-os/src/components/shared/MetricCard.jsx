import React from "react";
import { motion } from "framer-motion";

export default function MetricCard({ label, value, icon: Icon, trend, accentColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            {label}
          </p>
          <p className="text-2xl md:text-3xl font-heading mt-2 text-foreground">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1.5">{trend}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${accentColor || "bg-primary/10"}`}>
            <Icon className={`w-4 h-4 ${accentColor ? "text-foreground" : "text-primary"}`} />
          </div>
        )}
      </div>
    </motion.div>
  );
}