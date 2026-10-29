import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, AlertTriangle, Clock, BarChart2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddTaskDialog from "@/components/tasks/AddTaskDialog";
import VerteilungsWizard from "@/components/auftragsverteilung/VerteilungsWizard";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

export default function Auftragsverteilung() {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks-verteilung"],
    queryFn: () => base44.entities.Task.list("-created_date", 200),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-verteilung"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 100),
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["timeEntries-verteilung"],
    queryFn: () => base44.entities.TimeEntry.list("-created_date", 500),
  });

  const { data: errorReports = [] } = useQuery({
    queryKey: ["errorReports-verteilung"],
    queryFn: () => base44.entities.ErrorReport.list("-created_date", 200),
  });

  const { data: scores = [] } = useQuery({
    queryKey: ["scores-verteilung"],
    queryFn: () => base44.entities.PerformanceScore.list("-month", 100),
  });

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ["leave-verteilung"],
    queryFn: () => base44.entities.LeaveRequest.filter({ status: "genehmigt" }),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks-verteilung"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const createTask = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks-verteilung"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleCreateTask = (formData) => {
    const matchedVehicle = vehicles.find(v =>
      formData.vehicle_info && `${v.make} ${v.model} - ${v.license_plate}` === formData.vehicle_info
    );
    createTask.mutate({
      ...formData,
      vehicle_id: matchedVehicle?.id || "",
      status: "offen",
    });
    setShowAddDialog(false);
  };

  const unassignedTasks = tasks.filter(t => !t.assigned_to && t.status === "offen");
  const vehiclesWithTasks = vehicles.filter(v =>
    tasks.some(t => t.vehicle_id === v.id && t.status !== "erledigt")
  );
  const today = new Date().toISOString().split("T")[0];
  const teamAvailable = TEAM.filter(e =>
    !leaveRequests.some(l => l.employee === e && l.start_date <= today && l.end_date >= today)
  ).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">AUFTRAGSVERTEILUNG</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schnelle Verteilung · Zeitaufwand kalkulieren · Qualität optimieren
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Neue Aufgabe
        </Button>
      </motion.div>

      <AddTaskDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleCreateTask}
        isLoading={createTask.isPending}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Unzugewiesen", value: unassignedTasks.length, color: unassignedTasks.length > 5 ? "text-destructive" : "text-warning", icon: AlertTriangle },
          { label: "In Arbeit", value: tasks.filter(t => t.status === "in_arbeit").length, color: "text-chart-1", icon: Clock },
          { label: "Team verfügbar", value: teamAvailable, color: "text-success", icon: Users },
          { label: "Fahrzeuge aktiv", value: vehiclesWithTasks.length, color: "text-chart-2", icon: BarChart2 },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className={`font-heading text-2xl ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Verteilungs-Wizard */}
      <VerteilungsWizard
        tasks={tasks}
        vehicles={vehicles}
        timeEntries={timeEntries}
        errorReports={errorReports}
        scores={scores}
        leaveRequests={leaveRequests}
        onAssign={async (taskId, employee) => {
          await base44.entities.Task.update(taskId, { assigned_to: employee });
          queryClient.invalidateQueries({ queryKey: ["tasks-verteilung"] });
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }}
        onUpdateHours={(taskId, hours) => {
          updateTask.mutate({ id: taskId, data: { estimated_hours: hours } });
        }}
      />
    </div>
  );
}