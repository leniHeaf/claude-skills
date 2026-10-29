import React, { useState, useEffect } from "react";
import { differenceInMinutes } from "date-fns";

const ACTIVITIES = {
  demontage: { label: "Demontage", color: "bg-warning/20 text-warning" },
  karosserie: { label: "Karosserie", color: "bg-info/20 text-info" },
  schleifen: { label: "Schleifen", color: "bg-muted text-muted-foreground" },
  fuellern: { label: "Füllern", color: "bg-chart-2/20 text-chart-2" },
  abkleben: { label: "Abkleben", color: "bg-muted text-muted-foreground" },
  lackierung: { label: "Lackierung", color: "bg-primary/20 text-primary" },
  finish: { label: "Finish", color: "bg-success/20 text-success" },
  reinigung: { label: "Reinigung", color: "bg-muted text-muted-foreground" },
  nacharbeit: { label: "⚠ Nacharbeit", color: "bg-destructive/20 text-destructive" },
  sonstiges: { label: "Sonstiges", color: "bg-muted text-muted-foreground" },
};

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return "–";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function LiveElapsed({ startTime, pauseMinutes = 0, isPaused = false, pauseStart = null }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const tick = () => {
      if (isPaused && pauseStart) {
        // Während Pause: Timer einfrieren zum Zeitpunkt des Pausenbeginns
        const mins = differenceInMinutes(new Date(pauseStart), new Date(startTime)) - (pauseMinutes || 0);
        setElapsed(Math.max(0, mins));
      } else {
        const mins = differenceInMinutes(new Date(), new Date(startTime)) - (pauseMinutes || 0);
        setElapsed(Math.max(0, mins));
      }
    };
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, [startTime, pauseMinutes, isPaused, pauseStart]);
  return <span>{formatDuration(elapsed)}</span>;
}

export default function LiveHalle({ entries, bookings }) {
  const activeEntries = entries.filter(e => e.status !== "beendet");

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">
        HALLE — LIVE STATUS
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {TEAM.map(name => {
          const active = activeEntries.find(e => e.employee === name);
          const empBookings = bookings.filter(b => b.employee === name);
          const isPresent = empBookings.length > 0;

          return (
            <div
              key={name}
              className={`rounded-xl p-4 border transition-all
                ${active
                  ? active.activity === "nacharbeit"
                    ? "bg-destructive/5 border-destructive/30"
                    : "bg-success/5 border-success/30"
                  : isPresent
                    ? "bg-warning/5 border-warning/20"
                    : "bg-card border-border opacity-60"
                }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0
                  ${active ? active.status === "pausiert" ? "bg-warning" : "bg-success animate-pulse"
                    : isPresent ? "bg-warning" : "bg-muted-foreground"}`}
                />
                <p className="text-sm font-semibold text-foreground">{name}</p>
              </div>

              {active ? (
                <>
                  <p className={`text-[10px] px-2 py-0.5 rounded-md inline-block mb-1.5 ${ACTIVITIES[active.activity]?.color || "bg-muted text-muted-foreground"}`}>
                    {ACTIVITIES[active.activity]?.label || active.activity}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mb-1">{active.vehicle_info?.split(" - ")[0]}</p>
                  <p className="font-heading text-base text-foreground">
                    <LiveElapsed
                      startTime={active.start_time}
                      pauseMinutes={active.pause_minutes || 0}
                      isPaused={active.status === "pausiert"}
                      pauseStart={active.pause_start}
                    />
                  </p>
                  {active.status === "pausiert" && (
                    <p className="text-[10px] text-warning mt-0.5">PAUSE</p>
                  )}
                </>
              ) : isPresent ? (
                <p className="text-xs text-warning">Keine aktive Aufgabe</p>
              ) : (
                <p className="text-xs text-muted-foreground">Nicht eingestempelt</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}