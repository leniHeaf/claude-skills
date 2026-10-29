import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInMinutes, format } from "date-fns";
import { de } from "date-fns/locale";
import { motion } from "framer-motion";
import { Monitor, Clock, BarChart2, LogIn, FileText, FileEdit, CalendarDays, Users } from "lucide-react";
import StempelCard from "../components/timetracking/StempelCard";
import AssignedTasks from "../components/timetracking/AssignedTasks";
import TeamStempelzeiten from "../components/timetracking/TeamStempelzeiten";
import LiveHalle from "../components/timetracking/LiveHalle";
import Auswertung from "../components/timetracking/Auswertung";
import Lohnabrechnung from "../components/timetracking/Lohnabrechnung";
import BookingList from "../components/timetracking/BookingList";
import ZeitKorrektur from "./ZeitKorrektur";
import MonthView from "../components/timetracking/MonthView";
import { useAuth } from "@/lib/AuthContext";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

function resolveEmployeeFromUser(user) {
  const name = user?.full_name || "";
  const email = user?.email || "";
  return TEAM.find(t =>
    name.toLowerCase().includes(t.toLowerCase()) ||
    email.toLowerCase().includes(t.toLowerCase())
  ) || name || null;
}

export default function TimeTracking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const currentEmployee = resolveEmployeeFromUser(user);
  const isChef = currentEmployee === "Toni";
  const [tab, setTab] = useState(isChef ? "halle" : "anwesenheit");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // --- Data ---
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 100),
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["timeEntries"],
    queryFn: () => base44.entities.TimeEntry.list("-created_date", 500),
    refetchInterval: 30000,
  });

  const today = format(new Date(), "yyyy-MM-dd");

  // TimeBookings for today (all employees) — for LiveHalle
  const { data: todayBookings = [] } = useQuery({
    queryKey: ["timeBookings", today],
    queryFn: () => base44.entities.TimeBooking.filter({ date: today }),
    refetchInterval: 30000,
  });

  // All TimeBookings for current employee — for Lohnabrechnung & Auswertung
  const { data: myBookings = [] } = useQuery({
    queryKey: ["timeBookings", "employee", currentEmployee],
    queryFn: () => currentEmployee
      ? base44.entities.TimeBooking.filter({ employee: currentEmployee })
      : Promise.resolve([]),
    enabled: !!currentEmployee,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // All TimeBookings (alle Mitarbeiter) — für Chef-Lohnvorbereitung & Auswertung
  const { data: allBookings = [] } = useQuery({
    queryKey: ["timeBookings", "all"],
    queryFn: () => base44.entities.TimeBooking.list("-created_date", 2000),
    enabled: isChef,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // --- Mutations: TimeEntry ---
  const createEntry = useMutation({
    mutationFn: (data) => base44.entities.TimeEntry.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timeEntries"] }),
  });

  const updateEntry = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TimeEntry.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timeEntries"] }),
  });

  const activeEntries = entries.filter(e => e.status !== "beendet");

  const handleStart = (data) => {
    const existing = activeEntries.find(e => e.employee === data.employee);
    if (existing) {
      let totalPause = existing.pause_minutes || 0;
      if (existing.status === "pausiert" && existing.pause_start) {
        totalPause += differenceInMinutes(new Date(), new Date(existing.pause_start));
      }
      const duration = differenceInMinutes(new Date(), new Date(existing.start_time)) - totalPause;
      updateEntry.mutate({
        id: existing.id,
        data: { status: "beendet", end_time: new Date().toISOString(), duration_minutes: Math.max(0, duration), pause_minutes: totalPause, pause_start: null },
      });
    }
    createEntry.mutate(data);
  };

  const handlePause = (entry) => {
    if (entry.status === "aktiv") {
      updateEntry.mutate({ id: entry.id, data: { status: "pausiert", pause_start: new Date().toISOString() } });
    } else {
      const pauseStart = entry.pause_start ? new Date(entry.pause_start) : new Date();
      const additionalPause = differenceInMinutes(new Date(), pauseStart);
      const newPauseMinutes = (entry.pause_minutes || 0) + Math.max(0, additionalPause);
      updateEntry.mutate({ id: entry.id, data: { status: "aktiv", pause_minutes: newPauseMinutes, pause_start: null } });
    }
  };

  const handleStop = (entry) => {
    let totalPause = entry.pause_minutes || 0;
    if (entry.status === "pausiert" && entry.pause_start) {
      totalPause += differenceInMinutes(new Date(), new Date(entry.pause_start));
    }
    const duration = differenceInMinutes(new Date(), new Date(entry.start_time)) - totalPause;
    updateEntry.mutate({
      id: entry.id,
      data: { status: "beendet", end_time: new Date().toISOString(), duration_minutes: Math.max(0, duration), pause_minutes: totalPause, pause_start: null },
    });
  };

  const TABS = [
    ...(isChef ? [{ key: "halle", label: "Live Halle", icon: Monitor }] : []),
    { key: "stempeln", label: "Stempeln", icon: Clock },
    ...(isChef ? [{ key: "team", label: "Team-Stempelzeiten", icon: Users }] : []),
    { key: "anwesenheit", label: "Anwesenheit", icon: LogIn },
    { key: "monat", label: "Monat", icon: CalendarDays },
    { key: "auswertung", label: "Auswertung", icon: BarChart2 },
    { key: "korrektur", label: "Korrektur", icon: FileEdit },
    { key: "lohn", label: "Lohnvorbereitung", icon: FileText },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">ZEITERFASSUNG</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeEntries.length > 0 ? (
            <span className="text-success">{activeEntries.length} Mitarbeiter aktiv · </span>
          ) : null}
          {format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })}
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.key === "stempeln" && activeEntries.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-success text-black text-[9px] flex items-center justify-center font-bold">
                {activeEntries.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* LIVE HALLE – nur für Toni */}
      {tab === "halle" && isChef && (
        <LiveHalle entries={entries} bookings={todayBookings} />
      )}

      {/* STEMPELN */}
      {tab === "stempeln" && (
        <div className="space-y-4">
          <StempelCard fixedEmployee={currentEmployee} />
          <AssignedTasks employee={currentEmployee} />
        </div>
      )}

      {/* TEAM-STEMPELZEITEN – nur für Toni */}
      {tab === "team" && isChef && (
        <TeamStempelzeiten />
      )}

      {/* ANWESENHEIT */}
      {tab === "anwesenheit" && (
        currentEmployee ? (
          <BookingList
            employee={selectedEmployee || currentEmployee}
            isChef={isChef}
            onSelectEmployee={setSelectedEmployee}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Mitarbeiter konnte nicht ermittelt werden.</p>
        )
      )}

      {/* MONAT */}
      {tab === "monat" && (
        currentEmployee ? <MonthView employee={currentEmployee} isChef={isChef} /> : (
          <p className="text-sm text-muted-foreground">Mitarbeiter konnte nicht ermittelt werden.</p>
        )
      )}

      {/* AUSWERTUNG */}
      {tab === "auswertung" && (
        <Auswertung
          entries={entries}
          bookings={isChef ? allBookings : myBookings}
          fixedEmployee={currentEmployee}
        />
      )}

      {/* KORREKTUR */}
      {tab === "korrektur" && (
        <ZeitKorrektur />
      )}

      {/* LOHNVORBEREITUNG */}
      {tab === "lohn" && (
        <Lohnabrechnung
          entries={entries}
          bookings={isChef ? allBookings : myBookings}
          fixedEmployee={isChef ? null : currentEmployee}
        />
      )}
    </div>
  );
}