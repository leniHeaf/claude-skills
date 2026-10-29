import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DATPartsLookup({ vehicle, onPartsSelected }) {
  const [vin, setVin] = useState(vehicle?.vin || "");
  const [partNumber, setPartNumber] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [partsResult, setPartsResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  const lookupParts = async () => {
    if (!vin && !partNumber) return;
    setLookingUp(true);
    try {
      const response = await base44.functions.invoke('datApiIntegration', {
        action: 'lookupParts',
        vin: vin,
        partNumber: partNumber,
      });
      setPartsResult(response.data);
    } catch (error) {
      console.error('Parts lookup failed:', error);
    }
    setLookingUp(false);
  };

  const validateVehicle = async () => {
    if (!vin) return;
    setLookingUp(true);
    try {
      const response = await base44.functions.invoke('datApiIntegration', {
        action: 'validateVehicle',
        vehicleData: { vin, ...vehicle },
      });
      setValidationResult(response.data);
    } catch (error) {
      console.error('Vehicle validation failed:', error);
    }
    setLookingUp(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-heading">DAT</div>
        <p className="font-semibold text-sm text-foreground">DAT TEILEKATALOG</p>
      </div>

      {/* VIN Validation */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">FIN / VIN</label>
        <div className="flex gap-2">
          <Input
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            placeholder="FIN eingeben"
            className="bg-secondary border-border flex-1 font-mono text-xs"
          />
          <Button
            onClick={validateVehicle}
            disabled={!vin || lookingUp}
            size="sm"
            variant="outline"
            className="border-border"
          >
            {lookingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div className={`p-3 rounded-lg border text-xs ${validationResult.validated ? "bg-success/10 border-success/30" : "bg-warning/10 border-warning/30"}`}>
          <div className="flex items-center gap-2 mb-2">
            {validationResult.validated ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
            <span className="font-medium">{validationResult.validated ? "Fahrzeug validiert" : "Validierung fehlgeschlagen"}</span>
          </div>
          {validationResult.vehicle && (
            <div className="space-y-1 text-muted-foreground">
              <p><span className="text-foreground">Marke:</span> {validationResult.vehicle.make}</p>
              <p><span className="text-foreground">Modell:</span> {validationResult.vehicle.model}</p>
              {validationResult.engineType && <p><span className="text-foreground">Motor:</span> {validationResult.engineType}</p>}
              {validationResult.equipment?.length > 0 && (
                <p><span className="text-foreground">Ausstattung:</span> {validationResult.equipment.slice(0, 3).join(", ")}...</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Part Number Lookup */}
      <div className="pt-3 border-t border-border">
        <label className="text-xs text-muted-foreground mb-1 block">Teilenummer suchen</label>
        <div className="flex gap-2">
          <Input
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value.toUpperCase())}
            placeholder="z.B. A123456789"
            className="bg-secondary border-border flex-1 font-mono text-xs"
          />
          <Button
            onClick={lookupParts}
            disabled={!partNumber || lookingUp}
            size="sm"
            variant="outline"
            className="border-border"
          >
            {lookingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Parts Result */}
      {partsResult && partsResult.parts && partsResult.parts.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {partsResult.parts.map((part, i) => (
            <div key={i} className="p-2 bg-secondary rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">{part.name || part.description}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{part.partNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-chart-3">{part.price?.toFixed(2) || "—"} €</p>
                  {part.availability && (
                    <p className={`text-[9px] ${part.availability === 'available' ? 'text-success' : 'text-warning'}`}>
                      {part.availability === 'available' ? '✓ Verfügbar' : '⚠ Lieferzeit'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {partsResult && partsResult.parts && partsResult.parts.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">Keine Teile gefunden.</p>
      )}
    </div>
  );
}