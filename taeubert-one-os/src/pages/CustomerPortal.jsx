import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Car, Camera, Clock, CheckCircle2, Phone, MessageCircle, Calendar, Star, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const STATUS_CONFIG = {
  annahme: { label: "Annahme", color: "bg-muted text-muted-foreground", progress: 5 },
  teile_bestellt: { label: "Teile bestellt", color: "bg-info/20 text-info", progress: 15 },
  demontage: { label: "Demontage", color: "bg-chart-5/20 text-chart-5", progress: 25 },
  karosserie: { label: "Karosserie", color: "bg-chart-4/20 text-chart-4", progress: 40 },
  vorbereitung: { label: "Vorbereitung", color: "bg-chart-3/20 text-chart-3", progress: 55 },
  lackierung: { label: "Lackierung", color: "bg-chart-2/20 text-chart-2", progress: 70 },
  finish: { label: "Finish", color: "bg-warning/20 text-warning", progress: 85 },
  endkontrolle: { label: "Endkontrolle", color: "bg-primary/20 text-primary", progress: 95 },
  uebergabe: { label: "Übergabebereit", color: "bg-success/20 text-success", progress: 100 },
};

const NEXT_STEPS = {
  annahme: "Kalkulation & Freigabe",
  teile_bestellt: "Demontage startet",
  demontage: "Karosseriearbeiten",
  karosserie: "Lackvorbereitung",
  vorbereitung: "Lackierung",
  lackierung: "Finish & Politur",
  finish: "Endkontrolle",
  endkontrolle: "Übergabe",
  uebergabe: "Abholbereit",
};

export default function CustomerPortal() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [moodFeedback, setMoodFeedback] = useState(null);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["customer-vehicles"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 50),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["customer-orders-portal"],
    queryFn: () => base44.entities.CustomerOrder.list("-created_date", 100),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["vehicle-events-portal"],
    queryFn: () => base44.entities.VehicleEvent.list("-created_date", 200),
  });

  const { data: qualityChecks = [] } = useQuery({
    queryKey: ["quality-checks-portal"],
    queryFn: () => base44.entities.QualityCheck.list("-created_date", 100),
  });

  const activeVehicles = vehicles.filter(v => v.status !== 'uebergabe');
  const completedVehicles = vehicles.filter(v => v.status === 'uebergabe');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/90"
      >
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-xl md:text-2xl text-foreground tracking-wide">TÄUBERT ONE</h1>
              <p className="text-xs text-muted-foreground">Ihr Premium-Kundenportal</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 border-border">
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kontakt</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 border-border">
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chat</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Active Vehicles */}
        {activeVehicles.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-lg text-foreground">Aktuelle Fahrzeuge</h2>
            </div>
            
            <div className="grid gap-4">
              {activeVehicles.map((vehicle, i) => (
                <VehicleStatusCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  events={events.filter(e => e.vehicle_id === vehicle.id)}
                  qualityChecks={qualityChecks.filter(q => q.vehicle_id === vehicle.id)}
                  onSelect={() => setSelectedVehicle(selectedVehicle?.id === vehicle.id ? null : vehicle)}
                  isSelected={selectedVehicle?.id === vehicle.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed Vehicles */}
        {completedVehicles.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h2 className="font-heading text-lg text-foreground">Abgeschlossene Aufträge</h2>
            </div>
            
            <div className="grid gap-3">
              {completedVehicles.map((vehicle) => (
                <CompletedVehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {vehicles.length === 0 && (
          <div className="text-center py-16">
            <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading text-lg text-foreground mb-2">Keine Fahrzeuge</h3>
            <p className="text-sm text-muted-foreground">
              Aktuell sind keine Fahrzeuge in Bearbeitung.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function VehicleStatusCard({ vehicle, events, qualityChecks, onSelect, isSelected }) {
  const statusCfg = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.annahme;
  const nextStep = NEXT_STEPS[vehicle.status];
  const vehicleEvents = events.slice(0, 5);
  const photos = vehicle.photos || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border rounded-2xl overflow-hidden transition-all ${isSelected ? "border-primary/50 shadow-lg" : "border-border"}`}
    >
      {/* Header */}
      <div onClick={onSelect} className="p-4 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-heading text-lg text-foreground">{vehicle.make} {vehicle.model}</h3>
              {vehicle.customer_type === 'premium' && (
                <Badge className="bg-warning/20 text-warning gap-1">
                  <Star className="w-2.5 h-2.5 fill-warning" /> Premium
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono">{vehicle.license_plate}</p>
          </div>
          <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="font-medium text-foreground">{statusCfg.progress}%</span>
          </div>
          <Progress value={statusCfg.progress} className="h-2" />
        </div>

        {/* Next Step */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span>Nächster Schritt:</span>
          <span className="font-medium text-foreground">{nextStep}</span>
        </div>
      </div>

      {/* Expanded Details */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border"
        >
          <div className="p-4 space-y-4">
            {/* Photos */}
            {photos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Aktuelle Fotos ({photos.length})</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {photos.slice(0, 6).map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt="Fahrzeug"
                      className="w-full aspect-square object-cover rounded-lg border border-border"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {vehicleEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Verlauf</span>
                </div>
                <div className="space-y-2">
                  {vehicleEvents.map((event, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-foreground">{event.note || event.event_type}</p>
                        <p className="text-muted-foreground">{new Date(event.created_date).toLocaleString('de-DE')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Status */}
            {qualityChecks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Qualitätsstatus</span>
                </div>
                {qualityChecks.map((qc, i) => (
                  <Badge key={i} className={qc.approved ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}>
                    {qc.approved ? "Freigegeben" : "In Prüfung"}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-border">
              <Button variant="outline" className="flex-1 gap-1.5 border-border" size="sm">
                <Calendar className="w-3.5 h-3.5" />
                Termin buchen
              </Button>
              <Button variant="outline" className="flex-1 gap-1.5 border-border" size="sm">
                <Phone className="w-3.5 h-3.5" />
                Rückruf
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function CompletedVehicleCard({ vehicle }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card border border-success/30 rounded-xl p-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-base text-foreground">{vehicle.make} {vehicle.model}</h3>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{vehicle.license_plate}</p>
          {vehicle.estimated_completion && (
            <p className="text-xs text-muted-foreground mt-1">
              Fertig: {new Date(vehicle.estimated_completion).toLocaleDateString('de-DE')}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" className="border-border">
          Details
        </Button>
      </div>
    </motion.div>
  );
}