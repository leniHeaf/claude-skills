import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInMinutes } from "date-fns";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

// Known employee accounts beyond first-name team members
const EXTRA_EMPLOYEES = ["lackdesign.taeubert", "lscksdesign.taeubert"];

export function resolveEmployeeFromUser(user) {
  if (!user?.full_name) return null;
  const name = user.full_name;
  // 1. Match against team first names
  const teamMatch = TEAM.find(t => name.toLowerCase().includes(t.toLowerCase()));
  if (teamMatch) return teamMatch;
  // 2. Match against known extra employee accounts
  const extraMatch = EXTRA_EMPLOYEES.find(e => name.toLowerCase().includes(e.toLowerCase()));
  if (extraMatch) return extraMatch;
  // 3. Fall back to full_name if it exists
  return name;
}

/**
 * Shared hook that links task status changes to time entries.
 * Starting a task → creates a TimeEntry (and stops any existing active entry).
 * Completing a task → stops the active entry.
 */
export function useTaskTimer() {
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
    queryClient.invalidateQueries({ queryKey: ["time-entries-mein"] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
  };

  const stopEntry = useMutation({
    mutationFn: async ({ id }) => {
      const entry = await base44.entities.TimeEntry.get(id);
      const duration = differenceInMinutes(new Date(), new Date(entry.start_time)) - (entry.pause_minutes || 0);
      return base44.entities.TimeEntry.update(id, {
        status: "beendet",
        end_time: new Date().toISOString(),
        duration_minutes: Math.max(0, duration),
      });
    },
    onSuccess: invalidateAll,
  });

  const createEntry = useMutation({
    mutationFn: async (data) => base44.entities.TimeEntry.create(data),
    onSuccess: invalidateAll,
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: invalidateAll,
  });

  /**
   * Start a task: stop any active entry for the employee, create a new TimeEntry,
   * and set the task to "in_arbeit".
   */
  const startTask = useCallback(async (task, employee, activeEntry) => {
    if (!employee || !task) return;
    setError(null);
    try {
      // Stop existing active entry for this employee
      if (activeEntry) {
        await stopEntry.mutateAsync({ id: activeEntry.id });
      }
      // Create new time entry linked to the task's vehicle/project
      await createEntry.mutateAsync({
        vehicle_id: task.vehicle_id || "",
        vehicle_info: task.vehicle_info || "",
        employee,
        activity: task.category || "sonstiges",
        start_time: new Date().toISOString(),
        status: "aktiv",
        pause_minutes: 0,
      });
      // Update task status
      await updateTask.mutateAsync({ id: task.id, data: { status: "in_arbeit" } });
    } catch (err) {
      setError(err.message);
    }
  }, [stopEntry, createEntry, updateTask]);

  /**
   * Complete a task: stop the active entry and mark task as done.
   */
  const completeTask = useCallback(async (task, employee, activeEntry) => {
    if (!task) return;
    setError(null);
    try {
      if (activeEntry) {
        await stopEntry.mutateAsync({ id: activeEntry.id });
      }
      await updateTask.mutateAsync({ id: task.id, data: { status: "erledigt" } });
    } catch (err) {
      setError(err.message);
    }
  }, [stopEntry, updateTask]);

  /**
   * Pause the active entry.
   */
  const pauseTask = useCallback(async (activeEntry) => {
    if (!activeEntry) return;
    setError(null);
    try {
      await base44.entities.TimeEntry.update(activeEntry.id, { status: "pausiert" });
      invalidateAll();
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return { startTask, completeTask, pauseTask, error, isPending: createEntry.isPending || updateTask.isPending || stopEntry.isPending };
}