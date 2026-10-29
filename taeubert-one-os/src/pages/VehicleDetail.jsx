import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { StatusBadge, ConditionDot } from "../components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2, Clock, PlusCircle } from "lucide-react";
import VehiclePhotoGallery from "../components/vehicles/VehiclePhotoGallery";
import VehicleTasks from "../components/vehicles/VehicleTasks";
import KundenKommunikation from "../components/vehicles/KundenKommunikation";
import NachtragDialog from "../components/nachtraege/NachtragDialog";
import NachtragList from "../components/nachtraege/NachtragList";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const STAGES = [
  { key: "annahme", label: "Annahme", progress: 0 },
  { key: "teile_bestellt", label: "Teile bestellt", progress: 10 },
  { key: "demontage", label: "Demontage", progress: 20 },
  { key: "karosserie", label: "Karosserie", progress: 35 },
  { key: "vorbereitung", label: "Vorbereitung", progress: 50 },
  { key: "lackierung", label: "Lackierung", progress: 65 },
  { key: "finish", label: "Finish", progress: 80 },
  { key: "endkontrolle", label: "Endkontrolle", progress: 90 },
  { key: "uebergabe", label: "Übergabe", progress: 100 },
];

const CONDITIONS = [
  { key: "fertig", label: "Fertig" },
  { key: "in_arbeit", label: "In Arbeit" },
  { key: "problem", label: "Problem" },
  { key: "wartet_auf_teile", label: "Wartet auf Teile" },
  { key: "lackierung", label: "Lackierung" },
];

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNachtrag, setShowNachtrag] = useState(false);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const list = await base44.entities.Vehicle.filter({ id });
      return list[0];
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle", id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Vehicle.delete(id),
    onSuccess: () => navigate("/vehicles"),
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const photos = [...(vehicle.photos || []), file_url];
    updateMutation.mutate({ photos });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Fahrzeug nicht gefunden.
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === vehicle.status);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate("/vehicles")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück zum Board
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-muted-foreground mt-1">{vehicle.license_plate} · {vehicle.customer_name}</p>
            <div className="flex items-center gap-3 mt-3">
              <StatusBadge status={vehicle.status} />
              <ConditionDot condition={vehicle.condition} />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="border-border gap-1.5 text-xs"
              onClick={() => navigate(`/vehicles/${id}/timeline`)}
            >
              <Clock className="w-3.5 h-3.5" /> Zeitleiste
            </Button>
            <Button
              size="sm"
              className="bg-warning/80 hover:bg-warning text-black gap-1.5 text-xs font-semibold"
              onClick={() => setShowNachtrag(true)}
            >
              <PlusCircle className="w-3.5 h-3.5" /> Nachtrag melden
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Fahrzeug löschen?</AlertDialogTitle>
                  <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border">Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive hover:bg-destructive/80">
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </motion.div>

      {/* Production Pipeline */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-4">
          PRODUKTIONSPIPELINE
        </h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STAGES.map((stage, i) => (
            <button
              key={stage.key}
              onClick={() => updateMutation.mutate({ status: stage.key, progress: stage.progress })}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-[11px] font-medium transition-all
                ${i <= currentStageIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
            >
              {stage.label}
            </button>
          ))}
        </div>
        <div className="w-full h-1 bg-secondary rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${vehicle.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Status Controls */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-4">
            STEUERUNG
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Zustand</label>
              <Select value={vehicle.condition} onValueChange={(v) => updateMutation.mutate({ condition: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Verantwortlicher</label>
              <Select value={vehicle.responsible || ""} onValueChange={(v) => updateMutation.mutate({ responsible: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"].map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-4">
            FAHRZEUGDATEN
          </h3>
          <div className="space-y-2 text-sm">
            {vehicle.color && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Farbe</span>
                <span className="text-foreground">{vehicle.color}</span>
              </div>
            )}
            {vehicle.vin && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">FIN</span>
                <span className="text-foreground font-mono text-xs">{vehicle.vin}</span>
              </div>
            )}
            {vehicle.insurance && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versicherung</span>
                <span className="text-foreground">{vehicle.insurance}</span>
              </div>
            )}
            {vehicle.insurance_case_number && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Schadensnr.</span>
                <span className="text-foreground">{vehicle.insurance_case_number}</span>
              </div>
            )}
            {vehicle.estimated_completion && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fertigstellung</span>
                <span className="text-foreground">{format(new Date(vehicle.estimated_completion), "dd.MM.yyyy")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {vehicle.damage_description && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">
              SCHADENSBESCHREIBUNG
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{vehicle.damage_description}</p>
          </div>
        )}
        {vehicle.customer_wishes && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">
              KUNDENWÜNSCHE
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{vehicle.customer_wishes}</p>
          </div>
        )}
      </div>

      {/* Aufgaben mit Zeiterfassung */}
      <div className="mb-6">
        <VehicleTasks vehicleId={id} vehicleInfo={`${vehicle.make} ${vehicle.model} - ${vehicle.license_plate}`} />
      </div>

      {/* Kundenkommunikation */}
      <div className="mb-6">
        <KundenKommunikation vehicleId={id} customerName={vehicle.customer_name} />
      </div>

      {/* Nachträge */}
      <NachtragList vehicleId={id} />

      {/* Photo Gallery */}
      <VehiclePhotoGallery
        vehicleId={id}
        vehicleInfo={`${vehicle.make} ${vehicle.model} - ${vehicle.license_plate}`}
        vehicleStatus={vehicle.status}
      />

      <NachtragDialog
        open={showNachtrag}
        onClose={() => setShowNachtrag(false)}
        vehicleId={id}
        vehicleInfo={`${vehicle.make} ${vehicle.model} - ${vehicle.license_plate}`}
      />
    </div>
  );
}