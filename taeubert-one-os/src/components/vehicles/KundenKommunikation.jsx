import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, CheckCircle, Clock, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTIONS = [
  {
    type: "fertig",
    label: "Fahrzeug ist fertig",
    desc: "E-Mail: Fahrzeug bereit zur Abholung",
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10 border-success/20 hover:bg-success/20",
  },
  {
    type: "erinnerung",
    label: "Abholtermin Erinnerung",
    desc: "E-Mail: Erinnerung an geplanten Termin",
    icon: Clock,
    color: "text-chart-2",
    bg: "bg-chart-2/10 border-chart-2/20 hover:bg-chart-2/20",
  },
  {
    type: "bewertung",
    label: "Bewertungsanfrage",
    desc: "E-Mail: Zufriedenheit & Google-Bewertung",
    icon: Star,
    color: "text-warning",
    bg: "bg-warning/10 border-warning/20 hover:bg-warning/20",
  },
];

export default function KundenKommunikation({ vehicleId, customerName }) {
  const [loading, setLoading] = useState(null);
  const [sent, setSent] = useState({});
  const [error, setError] = useState(null);

  const handleSend = async (type) => {
    setLoading(type);
    setError(null);
    const res = await base44.functions.invoke("sendVehicleNotification", {
      vehicle_id: vehicleId,
      type,
    });
    setLoading(null);
    if (res.data?.success) {
      setSent(p => ({ ...p, [type]: res.data.sent_to }));
    } else {
      setError(res.data?.error || "Fehler beim Senden");
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          KUNDENKOMMUNIKATION
        </h3>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {ACTIONS.map(action => {
          const Icon = action.icon;
          const isSent = !!sent[action.type];
          const isLoading = loading === action.type;

          return (
            <div key={action.type}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${action.bg}`}>
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 flex-shrink-0 ${action.color}`} />
                <div>
                  <p className="text-xs font-semibold text-foreground">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                  {isSent && (
                    <p className="text-[10px] text-success mt-0.5">✓ Gesendet an {sent[action.type]}</p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading || isSent}
                onClick={() => handleSend(action.type)}
                className="text-xs h-7 px-3 border-current ml-3 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isSent ? (
                  "Gesendet ✓"
                ) : (
                  "Senden"
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-[9px] text-muted-foreground mt-3">
        E-Mail-Adresse wird aus dem CRM geladen (Kundenname: {customerName})
      </p>
    </div>
  );
}