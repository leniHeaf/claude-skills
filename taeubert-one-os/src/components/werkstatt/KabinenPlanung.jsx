import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { differenceInMinutes, parseISO } from "date-fns";

const CABINS = [
  { id: 1, name: "Kabine 1", type: "Premium", capacity: "GT3, RS6" },
  { id: 2, name: "Kabine 2", type: "Standard", capacity: "Alle Fahrzeuge" },
  { id: 3, name: "Kabine 3", type: "Standard", capacity: "Alle Fahrzeuge" },
];

const DRYING_TIMES = {
  lack: 120,
  fueller: 60,
  kleber: 90,
  spachtel: 45,
};

export default function KabinenPlanung({ vehicles, lifts }) {
  const [selectedCabin, setSelectedCabin] = useState(null);

  const cabinStatus = CABINS.map(cabin => {
    const occupiedLift = lifts.find(l => 
      l.area === "lackierung" && l.vehicle_id && l.status === "belegt"
    );
    
    const vehicle = occupiedLift ? vehicles.find(v => v.id === occupiedLift.vehicle_id) : null;
    const isOccupied = !!occupiedLift;
    
    let dryingProgress = 0;
    let dryingReady = false;
    
    if (vehicle && vehicle.status === "lackierung") {
      const entryTime = parseISO(occupiedLift.occupied_since || new Date());
      const minsElapsed = differenceInMinutes(new Date(), entryTime);
      dryingProgress = Math.min(100, (minsElapsed / 120) * 100);
      dryingReady = minsElapsed >= 120;
    }

    return {
      ...cabin,
      isOccupied,
      vehicle,
      dryingProgress,
      dryingReady,
      nextVehicle: null // Could be planned
    };
  });

  const waitingVehicles = vehicles.filter(v => 
    v.status === "vorbereitung" && v.condition !== "problem"
  ).slice(0, 3);

  const handleMarkDryReady = (cabinId) => {
    // Would trigger notification to team
    console.log(`Kabine ${cabinId}: Trocknung bereit`);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-heading text-sm text-foreground">KABINEN-PLANUNG</p>
          <p className="text-xs text-muted-foreground">Lackierung & Trocknungszeiten</p>
        </div>
        <Zap className="w-5 h-5 text-warning" />
      </div>

      {/* Kabinen Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {cabinStatus.map(cabin => (
          <motion.div
            key={cabin.id}
            className={`rounded-xl border p-4 ${
              cabin.isOccupied ? "bg-primary/5 border-primary/30" : "bg-secondary border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">{cabin.name}</p>
                <p className="text-[10px] text-muted-foreground">{cabin.type}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                cabin.isOccupied ? "bg-primary" : "bg-success"
              }`} />
            </div>

            {cabin.isOccupied && cabin.vehicle ? (
              <>
                <div className="mb-3">
                  <p className="text-xs font-medium text-foreground truncate">
                    {cabin.vehicle.make} {cabin.vehicle.model}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {cabin.vehicle.license_plate}
                  </p>
                </div>

                {/* Drying Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Trocknung</span>
                    <span className="text-[10px] text-muted-foreground">
                      {Math.round(cabin.dryingProgress)}%
                    </span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cabin.dryingProgress}%` }}
                      className={`h-full ${
                        cabin.dryingReady ? "bg-success" : "bg-warning"
                      }`}
                    />
                  </div>
                </div>

                {cabin.dryingReady ? (
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs bg-success hover:bg-success/90"
                    onClick={() => handleMarkDryReady(cabin.id)}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Trocknung bereit
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <Timer className="w-3 h-3" />
                    {Math.max(0, 120 - Math.round(cabin.dryingProgress))} min verbleibend
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">Frei</p>
                {waitingVehicles.length > 0 && (
                  <p className="text-[10px] text-success mt-1">
                    ✓ Bereit für {waitingVehicles[0]?.make} {waitingVehicles[0]?.model}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Warteschlange */}
      {waitingVehicles.length > 0 && (
        <div className="bg-secondary rounded-xl p-4">
          <p className="text-xs font-medium text-foreground mb-3">Nächste Fahrzeuge</p>
          <div className="space-y-2">
            {waitingVehicles.map(v => (
              <div key={v.id} className="flex items-center gap-3 p-2 bg-background rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {v.make} {v.model}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{v.license_plate}</p>
                </div>
                <AlertTriangle className="w-3 h-3 text-warning" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trocknungszeiten Info */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {Object.entries(DRYING_TIMES).map(([type, mins]) => (
          <div key={type} className="text-center p-2 bg-background rounded-lg">
            <p className="text-[9px] text-muted-foreground capitalize">{type}</p>
            <p className="text-xs font-heading text-foreground">{mins} min</p>
          </div>
        ))}
      </div>
    </div>
  );
}