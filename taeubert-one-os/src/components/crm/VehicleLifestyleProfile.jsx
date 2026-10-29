import React from "react";
import { motion } from "framer-motion";
import { Car, Sun, Home, Trophy, Calendar, Wrench, Shield, TrendingUp } from "lucide-react";

const VEHICLE_TYPES = {
  summer: { label: "Sommerfahrzeug", icon: Sun, color: "text-warning", bg: "bg-warning/10" },
  daily: { label: "Daily Driver", icon: Home, color: "text-chart-2", bg: "bg-chart-2/10" },
  enthusiast: { label: "Liebhaberfahrzeug", icon: Trophy, color: "text-success", bg: "bg-success/10" },
  track: { label: "Tracktool", icon: TrendingUp, color: "text-destructive", bg: "bg-destructive/10" },
  collector: { label: "Sammlerfahrzeug", icon: Shield, color: "text-primary", bg: "bg-primary/10" },
};

export default function VehicleLifestyleProfile({ vehicle, orders = [], events = [] }) {
  const getType = () => {
    if (!vehicle) return null;
    
    const make = vehicle.make?.toLowerCase() || "";
    const model = vehicle.model?.toLowerCase() || "";
    
    if (["porsche", "ferrari", "lamborghini", "mclaren", "aston martin"].includes(make)) {
      if (["gt3", "gt2", "sport", "spyder"].some(m => model.includes(m))) {
        return "track";
      }
      return "enthusiast";
    }
    
    if (vehicle.color && ["orange", "gelb", "grün"].includes(vehicle.color.toLowerCase())) {
      return "enthusiast";
    }
    
    if (orders.length > 5) {
      return "collector";
    }
    
    return "daily";
  };

  const typeKey = getType() || "daily";
  const typeConfig = VEHICLE_TYPES[typeKey];
  const TypeIcon = typeConfig.icon;

  const getVehicleHistory = () => {
    const history = [];
    
    orders.forEach(o => {
      if (o.created_date) {
        history.push({
          date: o.created_date.split("T")[0],
          type: "order",
          title: o.title,
          status: o.status
        });
      }
    });

    events?.forEach(e => {
      if (e.event_type === "handover") {
        history.push({
          date: e.created_date?.split("T")[0],
          type: "handover",
          title: "Übergabe",
        });
      }
    });

    return history.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  };

  const history = getVehicleHistory();

  return (
    <div className="space-y-4">
      {/* Vehicle Type Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`border rounded-xl p-4 ${typeConfig.bg} ${typeConfig.color.replace("text-", "border-").replace("text-", "border-")}`}
      >
        <div className="flex items-center gap-3">
          <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fahrzeug-Typ</p>
            <p className={`text-sm font-bold ${typeConfig.color}`}>{typeConfig.label}</p>
          </div>
        </div>
      </motion.div>

      {/* Vehicle Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Wrench className="w-3.5 h-3.5 text-chart-1" />
            <span className="text-[9px] text-muted-foreground">Aufträge</span>
          </div>
          <p className="text-lg font-heading text-foreground">{orders.length}</p>
        </div>
        <div className="bg-secondary rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-chart-2" />
            <span className="text-[9px] text-muted-foreground">Historie</span>
          </div>
          <p className="text-lg font-heading text-foreground">{history.length}</p>
        </div>
      </div>

      {/* Digital Vehicle Passport */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
          <Car className="w-3 h-3" /> Digitaler Fahrzeugpass
        </p>
        <div className="bg-card border border-border rounded-xl p-3 space-y-2">
          {vehicle.make && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Marke</span>
              <span className="text-foreground font-medium">{vehicle.make}</span>
            </div>
          )}
          {vehicle.model && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Modell</span>
              <span className="text-foreground font-medium">{vehicle.model}</span>
            </div>
          )}
          {vehicle.vin && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Fahrgestellnr.</span>
              <span className="text-foreground font-mono text-[10px]">{vehicle.vin}</span>
            </div>
          )}
          {vehicle.license_plate && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Kennzeichen</span>
              <span className="text-foreground font-mono">{vehicle.license_plate}</span>
            </div>
          )}
          {vehicle.color && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Farbe</span>
              <span className="text-foreground">{vehicle.color}</span>
            </div>
          )}
          {vehicle.insurance && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Versicherung</span>
              <span className="text-foreground">{vehicle.insurance}</span>
            </div>
          )}
        </div>
      </div>

      {/* Service History */}
      {history.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
            Service-Historie
          </p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs p-2 bg-secondary rounded-lg">
                <div className={`w-2 h-2 rounded-full ${h.type === "handover" ? "bg-success" : "bg-chart-1"}`} />
                <div className="flex-1">
                  <p className="text-foreground font-medium">{h.title}</p>
                  <p className="text-[9px] text-muted-foreground">{h.date}</p>
                </div>
                {h.status && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                    h.status === "abgeschlossen" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                  }`}>
                    {h.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Badges */}
      <div className="flex flex-wrap gap-1.5">
        {vehicle.quality_approved && (
          <span className="text-[9px] px-2 py-1 bg-success/10 text-success rounded-full flex items-center gap-1">
            <Shield className="w-3 h-3" /> Qualitätsgeprüft
          </span>
        )}
        {vehicle.insurance && (
          <span className="text-[9px] px-2 py-1 bg-info/10 text-info rounded-full">
            Versicherung
          </span>
        )}
        {orders.filter(o => o.status === "abgeschlossen").length > 3 && (
          <span className="text-[9px] px-2 py-1 bg-warning/10 text-warning rounded-full flex items-center gap-1">
            <Trophy className="w-3 h-3" /> Stammkunde
          </span>
        )}
      </div>
    </div>
  );
}