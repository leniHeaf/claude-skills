import React from "react";
import { Car, ClipboardCheck, ListTodo } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function RecentActivity({ vehicles, tasks, qualityChecks }) {
  const activities = [
    ...vehicles.slice(0, 3).map((v) => ({
      type: "vehicle",
      icon: Car,
      title: `${v.make} ${v.model}`,
      subtitle: v.license_plate,
      date: v.updated_date || v.created_date,
    })),
    ...tasks.slice(0, 3).map((t) => ({
      type: "task",
      icon: ListTodo,
      title: t.title,
      subtitle: t.assigned_to,
      date: t.updated_date || t.created_date,
    })),
    ...qualityChecks.slice(0, 3).map((q) => ({
      type: "quality",
      icon: ClipboardCheck,
      title: `Qualitätsprüfung`,
      subtitle: q.vehicle_info || q.stage,
      date: q.updated_date || q.created_date,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase mb-4">
        Letzte Aktivitäten
      </h3>
      <div className="space-y-3">
        {activities.map((a, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="p-2 rounded-lg bg-secondary">
              <a.icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.subtitle}</p>
            </div>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">
              {a.date ? format(new Date(a.date), "dd. MMM", { locale: de }) : ""}
            </p>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Noch keine Aktivitäten</p>
        )}
      </div>
    </div>
  );
}