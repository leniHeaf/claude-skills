import React from "react";
import { ArrowRight } from "lucide-react";

const STAGES = [
  { key: "annahme", label: "Annahme", short: "An" },
  { key: "demontage", label: "Demontage", short: "De" },
  { key: "karosserie", label: "Karosserie", short: "Ka" },
  { key: "vorbereitung", label: "Vorbereitung", short: "Vo" },
  { key: "lackierung", label: "Lackierung", short: "La" },
  { key: "finish", label: "Finish", short: "Fi" },
  { key: "uebergabe", label: "Übergabe", short: "Üb" },
];

export default function VehiclePipeline({ vehicle }) {
  if (!vehicle) return null;

  const currentIdx = STAGES.findIndex(s => s.key === vehicle.status);
  const isDone = vehicle.condition === "fertig";

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {STAGES.map((stage, idx) => {
        const reached = idx <= currentIdx || isDone;
        const isCurrent = idx === currentIdx && !isDone;
        return (
          <React.Fragment key={stage.key}>
            <div className="flex items-center gap-0.5">
              <div
                className={`flex items-center justify-center px-1.5 py-0.5 rounded text-[8px] font-medium tracking-wide transition-all
                  ${isCurrent
                    ? "bg-primary text-primary-foreground"
                    : reached
                    ? "bg-foreground/10 text-foreground"
                    : "bg-secondary text-muted-foreground/40"}`}
              >
                {stage.short}
              </div>
              {idx < STAGES.length - 1 && (
                <ArrowRight className={`w-2 h-2 ${reached ? "text-foreground/30" : "text-muted-foreground/20"}`} />
              )}
            </div>
          </React.Fragment>
        );
      })}
      {vehicle.progress > 0 && (
        <span className="ml-1.5 text-[8px] text-muted-foreground font-heading">{vehicle.progress}%</span>
      )}
    </div>
  );
}