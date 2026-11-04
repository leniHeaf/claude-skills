import React from "react";

// Clickable hotspots on a top-down car silhouette
const HOTSPOTS = [
  { id: "Motorhaube",            x: 50,  y: 10,  label: "Motorhaube" },
  { id: "Frontstoßstange",       x: 50,  y: 3,   label: "Front" },
  { id: "Kotflügel vorne links", x: 22,  y: 15,  label: "KF vl" },
  { id: "Kotflügel vorne rechts",x: 78,  y: 15,  label: "KF vr" },
  { id: "Fahrertür",             x: 18,  y: 38,  label: "Tür FL" },
  { id: "Beifahrertür",          x: 82,  y: 38,  label: "Tür FR" },
  { id: "Hintertür links",       x: 18,  y: 55,  label: "Tür HL" },
  { id: "Hintertür rechts",      x: 82,  y: 55,  label: "Tür HR" },
  { id: "Seitenschweller links", x: 12,  y: 47,  label: "Schweller L" },
  { id: "Seitenschweller rechts",x: 88,  y: 47,  label: "Schweller R" },
  { id: "Kotflügel hinten links",x: 22,  y: 72,  label: "KF hl" },
  { id: "Kotflügel hinten rechts",x: 78, y: 72,  label: "KF hr" },
  { id: "Kofferraumdeckel",      x: 50,  y: 80,  label: "Kofferraum" },
  { id: "Heckstoßstange",        x: 50,  y: 88,  label: "Heck" },
  { id: "Dach",                  x: 50,  y: 47,  label: "Dach" },
  { id: "Spiegel links",         x: 8,   y: 28,  label: "Spiegel L" },
  { id: "Spiegel rechts",        x: 92,  y: 28,  label: "Spiegel R" },
];

export default function FahrzeugSkizze({ selected = [], onToggle }) {
  return (
    <div className="relative w-full max-w-xs mx-auto select-none">
      {/* Car silhouette SVG */}
      <svg viewBox="0 0 100 100" className="w-full opacity-20 pointer-events-none absolute inset-0">
        {/* Body */}
        <rect x="15" y="20" width="70" height="60" rx="8" fill="currentColor" className="text-foreground" />
        {/* Windscreen */}
        <rect x="22" y="22" width="56" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
        {/* Rear window */}
        <rect x="22" y="62" width="56" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
        {/* Wheels */}
        <circle cx="22" cy="25" r="5" fill="currentColor" className="text-foreground" />
        <circle cx="78" cy="25" r="5" fill="currentColor" className="text-foreground" />
        <circle cx="22" cy="75" r="5" fill="currentColor" className="text-foreground" />
        <circle cx="78" cy="75" r="5" fill="currentColor" className="text-foreground" />
      </svg>

      {/* Aspect ratio container */}
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        {HOTSPOTS.map(h => {
          const active = selected.includes(h.id);
          return (
            <button
              key={h.id}
              onClick={() => onToggle(h.id)}
              title={h.label}
              style={{ left: `${h.x}%`, top: `${h.y}%`, transform: "translate(-50%, -50%)" }}
              className={`absolute rounded-full transition-all flex items-center justify-center
                ${active
                  ? "w-5 h-5 bg-destructive border-2 border-destructive/80 shadow-lg z-10"
                  : "w-4 h-4 bg-secondary/80 border border-border hover:bg-primary/20 hover:border-primary/50"
                }`}
            >
              {active && <span className="text-[7px] text-white font-bold">✕</span>}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 justify-center mt-2">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-3 h-3 rounded-full bg-secondary border border-border inline-block" /> Anklicken
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-3 h-3 rounded-full bg-destructive inline-block" /> Schaden
        </span>
      </div>
    </div>
  );
}