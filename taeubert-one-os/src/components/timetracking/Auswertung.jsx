import React, { useState } from "react";
import { BarChart2, TrendingDown, AlertTriangle, User, Clock } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";

const ACTIVITIES = [
  { key: "demontage", label: "Demontage", color: "bg-warning/20 text-warning" },
  { key: "karosserie", label: "Karosserie", color: "bg-info/20 text-info" },
  { key: "schleifen", label: "Schleifen", color: "bg-muted text-muted-foreground" },
  { key: "fuellern", label: "Füllern", color: "bg-chart-2/20 text-chart-2" },
  { key: "abkleben", label: "Abkleben", color: "bg-muted text-muted-foreground" },
  { key: "lackierung", label: "Lackierung", color: "bg-primary/20 text-primary" },
  { key: "finish", label: "Finish", color: "bg-success/20 text-success" },
  { key: "reinigung", label: "Reinigung", color: "bg-muted text-muted-foreground" },
  { key: "nacharbeit", label: "Nacharbeit", color: "bg-destructive/20 text-destructive" },
  { key: "sonstiges", label: "Sonstiges", color: "bg-muted text-muted-foreground" },
];

function formatDuration(minutes) {
  if (!minutes) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

export default function Auswertung({ entries, bookings = [], fixedEmployee }) {
  const [viewMode, setViewMode] = useState("fahrzeug"); // fahrzeug | mitarbeiter | nacharbeit

  const completed = entries.filter(e => e.status === "beendet" && e.duration_minutes);
  const filtered = fixedEmployee ? completed.filter(e => e.employee === fixedEmployee) : completed;

  // Anwesenheitszeiten aus TimeBookings
  const presenceBookings = fixedEmployee
    ? bookings.filter(b => b.employee === fixedEmployee)
    : bookings;
  const presenceMinutes = presenceBookings.reduce((s, b) => {
    if (!b.start_time || !b.end_time) return s;
    return s + Math.max(0, differenceInMinutes(new Date(b.end_time), new Date(b.start_time)));
  }, 0);

  // Per vehicle
  const vehicleTotals = {};
  filtered.forEach(e => {
    const key = e.vehicle_info || e.vehicle_id;
    if (!vehicleTotals[key]) vehicleTotals[key] = { total: 0, activities: {}, employees: new Set() };
    vehicleTotals[key].total += e.duration_minutes;
    vehicleTotals[key].activities[e.activity] = (vehicleTotals[key].activities[e.activity] || 0) + e.duration_minutes;
    vehicleTotals[key].employees.add(e.employee);
  });

  // Per employee
  const employeeTotals = {};
  filtered.forEach(e => {
    if (!employeeTotals[e.employee]) employeeTotals[e.employee] = { total: 0, activities: {}, productive: 0, presence: 0 };
    employeeTotals[e.employee].total += e.duration_minutes;
    employeeTotals[e.employee].activities[e.activity] = (employeeTotals[e.employee].activities[e.activity] || 0) + e.duration_minutes;
    if (e.activity !== "nacharbeit" && e.activity !== "sonstiges") {
      employeeTotals[e.employee].productive += e.duration_minutes;
    }
  });

  // Anwesenheit pro Mitarbeiter aus TimeBookings
  bookings.forEach(b => {
    if (!employeeTotals[b.employee]) employeeTotals[b.employee] = { total: 0, activities: {}, productive: 0, presence: 0 };
    if (employeeTotals[b.employee].presence === undefined) employeeTotals[b.employee].presence = 0;
    if (b.start_time && b.end_time) {
      employeeTotals[b.employee].presence += Math.max(0, differenceInMinutes(new Date(b.end_time), new Date(b.start_time)));
    }
  });

  // Nacharbeit entries
  const nacharbeitEntries = filtered.filter(e => e.activity === "nacharbeit");

  // Detect suspected nacharbeit (same vehicle + same activity done twice by same person)
  const activityMap = {};
  completed.forEach(e => {
    const key = `${e.employee}__${e.vehicle_id}__${e.activity}`;
    if (!activityMap[key]) activityMap[key] = [];
    activityMap[key].push(e);
  });
  const suspectedNacharbeit = Object.entries(activityMap)
    .filter(([k, arr]) => arr.length > 1 && !k.includes("__nacharbeit"))
    .map(([k, arr]) => ({ key: k, entries: arr, parts: k.split("__") }));

  // Today
  const today = format(new Date(), "yyyy-MM-dd");
  const todayEntries = filtered.filter(e => e.start_time?.startsWith(today));

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Anwesenheit", value: formatDuration(presenceMinutes), icon: Clock },
          { label: "Gebuchte Stunden (gesamt)", value: formatDuration(filtered.reduce((s, e) => s + e.duration_minutes, 0)), icon: BarChart2 },
          { label: "Produktiv", value: formatDuration(filtered.filter(e => e.activity !== "nacharbeit" && e.activity !== "sonstiges").reduce((s, e) => s + e.duration_minutes, 0)), icon: TrendingDown, green: true },
          { label: "Nacharbeit", value: formatDuration(nacharbeitEntries.reduce((s, e) => s + e.duration_minutes, 0)), icon: AlertTriangle, red: true },
          { label: "Einträge heute", value: todayEntries.length, icon: User },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <k.icon className={`w-3.5 h-3.5 ${k.green ? "text-success" : k.red ? "text-destructive" : "text-muted-foreground"}`} />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
            </div>
            <p className={`font-heading text-xl ${k.green ? "text-success" : k.red ? "text-destructive" : "text-foreground"}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {fixedEmployee && (
          <div className="bg-secondary border border-border rounded-md px-3 h-8 flex items-center text-sm text-muted-foreground">
            {fixedEmployee}
          </div>
        )}
        <div className="flex gap-1 p-0.5 bg-secondary rounded-lg">
          {[["fahrzeug", "Fahrzeuge"], ["mitarbeiter", "Mitarbeiter"], ["nacharbeit", "Nacharbeit"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setViewMode(k)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* FAHRZEUG VIEW */}
      {viewMode === "fahrzeug" && (
        <div className="space-y-3">
          {Object.keys(vehicleTotals).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Noch keine abgeschlossenen Einträge.</p>
          ) : (
            Object.entries(vehicleTotals)
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([vehicleInfo, data]) => {
                const nacharbeitMins = data.activities.nacharbeit || 0;
                const nacharbeitPct = data.total > 0 ? Math.round((nacharbeitMins / data.total) * 100) : 0;
                return (
                  <div key={vehicleInfo} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-sm font-medium text-foreground">{vehicleInfo}</p>
                      <p className="font-heading text-base text-foreground">{formatDuration(data.total)}</p>
                    </div>
                    {/* Activity bar */}
                    <div className="flex rounded-full overflow-hidden h-2 mb-3 bg-secondary">
                      {Object.entries(data.activities).map(([act, mins]) => {
                        const pct = Math.round((mins / data.total) * 100);
                        const colors = {
                          lackierung: "bg-primary", finish: "bg-success", nacharbeit: "bg-destructive",
                          karosserie: "bg-info", schleifen: "bg-muted-foreground", demontage: "bg-warning",
                        };
                        return <div key={act} style={{ width: `${pct}%` }} className={colors[act] || "bg-muted-foreground"} />;
                      })}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(data.activities).map(([act, mins]) => {
                        const cfg = ACTIVITIES.find(a => a.key === act);
                        return (
                          <span key={act} className={`text-[10px] px-2 py-0.5 rounded-md ${cfg?.color || "bg-muted text-muted-foreground"}`}>
                            {cfg?.label || act}: {formatDuration(mins)}
                          </span>
                        );
                      })}
                    </div>
                    {nacharbeitPct > 0 && (
                      <p className="text-[10px] text-destructive mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {nacharbeitPct}% Nacharbeit
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {Array.from(data.employees).join(", ")}
                    </p>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* MITARBEITER VIEW */}
      {viewMode === "mitarbeiter" && (
        <div className="space-y-3">
          {Object.keys(employeeTotals).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Keine Daten.</p>
          ) : (
            Object.entries(employeeTotals)
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([emp, data]) => {
                const productivePct = data.total > 0 ? Math.round((data.productive / data.total) * 100) : 0;
                const nacharbeitMins = data.activities.nacharbeit || 0;
                return (
                  <div key={emp} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-semibold text-foreground">{emp}</p>
                      <div className="text-right">
                        <p className="font-heading text-base text-foreground">{formatDuration(data.total)}</p>
                        {data.presence > 0 && (
                          <p className="text-[10px] text-muted-foreground">Anwesenheit: {formatDuration(data.presence)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex rounded-full overflow-hidden h-1.5 mb-2 bg-secondary">
                      <div style={{ width: `${productivePct}%` }} className="bg-success" />
                      {nacharbeitMins > 0 && <div style={{ width: `${Math.round((nacharbeitMins / data.total) * 100)}%` }} className="bg-destructive" />}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="text-success">{productivePct}% produktiv</span>
                      {nacharbeitMins > 0 && <span className="text-destructive">{formatDuration(nacharbeitMins)} Nacharbeit</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {Object.entries(data.activities).map(([act, mins]) => {
                        const cfg = ACTIVITIES.find(a => a.key === act);
                        return (
                          <span key={act} className={`text-[10px] px-2 py-0.5 rounded-md ${cfg?.color || "bg-muted text-muted-foreground"}`}>
                            {cfg?.label || act}: {formatDuration(mins)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* NACHARBEIT VIEW */}
      {viewMode === "nacharbeit" && (
        <div className="space-y-3">
          {/* Explicit nacharbeit */}
          {nacharbeitEntries.length > 0 && (
            <div>
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">Gebuchte Nacharbeit</p>
              {nacharbeitEntries.map(e => (
                <div key={e.id} className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 mb-2">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{e.employee}</p>
                      <p className="text-xs text-muted-foreground">{e.vehicle_info}</p>
                    </div>
                    <p className="text-sm text-destructive font-heading">{formatDuration(e.duration_minutes)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suspected (same activity repeated) */}
          {suspectedNacharbeit.length > 0 && (
            <div>
              <p className="text-[10px] tracking-wider text-warning uppercase mb-2">⚠ Mögliche Nacharbeit (Tätigkeit wiederholt)</p>
              {suspectedNacharbeit.map(({ key, entries: arr, parts }) => (
                <div key={key} className="bg-warning/5 border border-warning/20 rounded-lg p-3 mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-foreground">{parts[0]}</p>
                      <p className="text-xs text-muted-foreground">{ACTIVITIES.find(a => a.key === parts[2])?.label} · {arr[0].vehicle_info}</p>
                    </div>
                    <span className="text-[10px] bg-warning/20 text-warning px-2 py-0.5 rounded-md">{arr.length}x gebucht</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {nacharbeitEntries.length === 0 && suspectedNacharbeit.length === 0 && (
            <div className="text-center py-8">
              <p className="text-success text-sm">Keine Nacharbeit erkannt ✓</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}