import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import VehicleCard from "../components/vehicles/VehicleCard";
import AddVehicleDialog from "../components/vehicles/AddVehicleDialog";
import EmptyState from "../components/shared/EmptyState";
import { Car } from "lucide-react";

const PRODUCTION_STAGES = [
  { key: "annahme", label: "Annahme" },
  { key: "teile_bestellt", label: "Teile" },
  { key: "demontage", label: "Demontage" },
  { key: "karosserie", label: "Karosserie" },
  { key: "vorbereitung", label: "Vorbereitung" },
  { key: "lackierung", label: "Lackierung" },
  { key: "finish", label: "Finish" },
  { key: "endkontrolle", label: "Endkontrolle" },
  { key: "uebergabe", label: "Übergabe" },
];

export default function VehicleBoard() {
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewMode, setViewMode] = useState("board"); // board or list
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setShowAddDialog(false);
    },
  });

  const filtered = vehicles.filter((v) => {
    const term = search.toLowerCase();
    return (
      !term ||
      v.make?.toLowerCase().includes(term) ||
      v.model?.toLowerCase().includes(term) ||
      v.license_plate?.toLowerCase().includes(term) ||
      v.customer_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">
            FAHRZEUGBOARD
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {vehicles.length} Fahrzeuge · {filtered.length} angezeigt
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Suche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border"
            />
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-primary hover:bg-primary/80 gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Fahrzeug</span>
          </Button>
        </div>
      </motion.div>

      {/* Board view */}
      {vehicles.length === 0 && !isLoading ? (
        <EmptyState
          icon={Car}
          title="Noch keine Fahrzeuge"
          description="Erfasse dein erstes Fahrzeug, um die Produktionspipeline zu starten."
        />
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {PRODUCTION_STAGES.map((stage) => {
              const stageVehicles = filtered.filter((v) => v.status === stage.key);
              return (
                <div key={stage.key} className="w-64 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      {stage.label}
                    </h3>
                    <span className="text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                      {stageVehicles.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {stageVehicles.map((v, i) => (
                      <VehicleCard key={v.id} vehicle={v} index={i} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Vehicle Dialog */}
      <AddVehicleDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}