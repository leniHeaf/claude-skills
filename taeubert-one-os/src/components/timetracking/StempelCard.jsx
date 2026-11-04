import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { LogIn, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { differenceInMinutes, format } from "date-fns";

function formatDuration(minutes) {
  if (!minutes) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function LiveTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const tick = () => {
      const mins = differenceInMinutes(new Date(), new Date(startTime));
      setElapsed(Math.max(0, mins));
    };
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, [startTime]);
  return <span>{formatDuration(elapsed)}</span>;
}

export default function StempelCard({ fixedEmployee }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");

  // Heutige TimeBookings für diesen Mitarbeiter — staleTime 0 sorgt für frische Daten bei jedem Mount
  const { data: myBookings = [], isLoading } = useQuery({
    queryKey: ["timeBookings", today, fixedEmployee],
    queryFn: () => fixedEmployee
      ? base44.entities.TimeBooking.filter({ date: today, employee: fixedEmployee })
      : Promise.resolve([]),
    enabled: !!fixedEmployee,
    refetchInterval: 15000,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Aktive Buchung = heutige Buchung ohne end_time (die neueste, falls mehrere existieren)
  const activeBookings = myBookings.filter(b => !b.end_time);
  const activeBooking = activeBookings.length > 0
    ? activeBookings.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))[0]
    : null;

  // Alle timeBookings-Queries invalidieren (LiveHalle, Lohn, Monat etc.)
  const invalidateAll = () => queryClient.invalidateQueries({ queryKey: ["timeBookings"] });

  const createBooking = useMutation({
    mutationFn: (data) => base44.entities.TimeBooking.create(data),
    onSuccess: () => { invalidateAll(); },
    onError: (err) => {
      toast({
        title: "Einstempeln fehlgeschlagen",
        description: "Die Zeit wurde nicht gespeichert. Bitte erneut versuchen.",
        variant: "destructive",
      });
    },
  });

  const updateBooking = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TimeBooking.update(id, data),
    onSuccess: () => { invalidateAll(); },
    onError: (err) => {
      toast({
        title: "Ausstempeln fehlgeschlagen",
        description: "Die Zeit wurde nicht gespeichert. Bitte erneut versuchen.",
        variant: "destructive",
      });
    },
  });

  // Verwaiste aktive Buchungen schließen (falls durch Fehler mehrere entstanden sind)
  const cleanupOrphaned = useMutation({
    mutationFn: async (orphanIds) => {
      const now = new Date().toISOString();
      for (const id of orphanIds) {
        await base44.entities.TimeBooking.update(id, { end_time: now });
      }
    },
    onSuccess: () => { invalidateAll(); },
  });

  useEffect(() => {
    if (activeBookings.length > 1) {
      const orphanIds = activeBookings
        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
        .slice(1)
        .map(b => b.id);
      cleanupOrphaned.mutate(orphanIds);
    }
  }, [activeBookings.length]);

  if (!fixedEmployee) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Dein Benutzerkonto ist keinem Mitarbeiter zugeordnet. Stempeln ist nur für angemeldete Mitarbeiter möglich.
        </p>
      </div>
    );
  }

  const handleStampIn = () => {
    // Verhindern, dass bei schnellem Doppelklick zwei Buchungen entstehen
    if (activeBooking || createBooking.isPending) return;
    createBooking.mutate({
      employee: fixedEmployee,
      date: today,
      start_time: new Date().toISOString(),
    });
  };

  const handleStampOut = () => {
    if (!activeBooking || updateBooking.isPending) return;
    updateBooking.mutate({
      id: activeBooking.id,
      data: { end_time: new Date().toISOString() },
    });
  };

  // Ladezustand: Daten werden gerade geladen
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted-foreground">Lade Stempeldaten...</p>
      </div>
    );
  }

  // Fehlerzustand: Mutation fehlgeschlagen
  if (createBooking.isError || updateBooking.isError) {
    return (
      <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-8 text-center">
        <AlertTriangle className="w-5 h-5 text-destructive mx-auto mb-3" />
        <p className="text-xs text-destructive font-semibold mb-1">Speichern fehlgeschlagen</p>
        <p className="text-xs text-muted-foreground mb-4">Deine Zeit konnte nicht gespeichert werden.</p>
        <Button
          onClick={() => {
            createBooking.reset();
            updateBooking.reset();
          }}
          variant="outline"
          size="sm"
        >
          Erneut versuchen
        </Button>
      </div>
    );
  }

  // Buchungsliste für heute (kompakt, read-only)
  const sortedBookings = [...myBookings].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  const completedBookings = sortedBookings.filter(b => b.end_time);

  const BookingSummary = () => (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">HEUTIGE BUCHUNGEN</p>
      {completedBookings.length === 0 && activeBookings.length <= 1 ? (
        <p className="text-xs text-muted-foreground">Noch keine Buchungen heute.</p>
      ) : (
        <div className="space-y-1">
          {sortedBookings.map((b, i) => {
            const start = b.start_time ? format(new Date(b.start_time), "HH:mm") : "—";
            const end = b.end_time ? format(new Date(b.end_time), "HH:mm") : null;
            const isActive = !b.end_time;
            return (
              <div key={b.id || i} className="flex items-center justify-between text-xs py-1.5 px-2 bg-secondary/50 rounded-md">
                <span className="text-muted-foreground">
                  {i + 1}. {start}{end ? ` – ${end}` : isActive ? " – läuft" : ""}
                </span>
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                ) : (
                  <span className="text-muted-foreground">
                    {b.start_time && b.end_time
                      ? formatDuration(differenceInMinutes(new Date(b.end_time), new Date(b.start_time)))
                      : ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Gestempelt: großer AUS-Button
  if (activeBooking) {
    return (
      <div className="space-y-4">
        <motion.button
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleStampOut}
          disabled={updateBooking.isPending}
          whileTap={{ scale: 0.97 }}
          className="w-full h-64 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-destructive/40 bg-destructive/5 hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          {updateBooking.isPending ? (
            <Loader2 className="w-8 h-8 text-destructive animate-spin" />
          ) : (
            <>
              <span className="w-4 h-4 rounded-full bg-destructive animate-pulse" />
              <span className="font-heading text-7xl text-destructive tracking-tight">AUS</span>
              <span className="text-sm text-muted-foreground">
                seit {format(new Date(activeBooking.start_time), "HH:mm")} Uhr · <LiveTimer startTime={activeBooking.start_time} />
              </span>
            </>
          )}
        </motion.button>

        <div className="bg-card border border-border rounded-xl p-4">
          <BookingSummary />
        </div>
      </div>
    );
  }

  // Nicht gestempelt: großer EIN-Button
  return (
    <div className="space-y-4">
      <motion.button
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={handleStampIn}
        disabled={createBooking.isPending}
        whileTap={{ scale: 0.97 }}
        className="w-full h-64 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-success/40 bg-success/5 hover:bg-success/10 transition-colors disabled:opacity-50"
      >
        {createBooking.isPending ? (
          <Loader2 className="w-8 h-8 text-success animate-spin" />
        ) : (
          <>
            <LogIn className="w-8 h-8 text-success" />
            <span className="font-heading text-7xl text-success tracking-tight">EIN</span>
            <span className="text-sm text-muted-foreground">
              {format(new Date(), "dd.MM.yyyy")}
            </span>
          </>
        )}
      </motion.button>

      <div className="bg-card border border-border rounded-xl p-4">
        <BookingSummary />
      </div>
    </div>
  );
}