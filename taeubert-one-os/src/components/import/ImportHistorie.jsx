import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText, Users, Car, CheckCircle2, History } from "lucide-react";

export default function ImportHistorie() {
  const { data: imports = [] } = useQuery({
    queryKey: ["dat-imports"],
    queryFn: () => base44.entities.DATImport.list("-created_date", 100),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("-created_date", 500),
  });

  // Stats
  const autoImported = customers.filter(c => c.notes?.includes("Import via")).length;
  const scanImported = customers.filter(c => c.notes?.includes("Fahrzeugschein-Scan")).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <FileText className="w-4 h-4 text-primary mx-auto mb-1.5" />
          <p className="font-heading text-2xl text-foreground">{imports.length}</p>
          <p className="text-[10px] text-muted-foreground">DAT-Importe</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Users className="w-4 h-4 text-chart-2 mx-auto mb-1.5" />
          <p className="font-heading text-2xl text-foreground">{autoImported}</p>
          <p className="text-[10px] text-muted-foreground">Kunden importiert</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Car className="w-4 h-4 text-warning mx-auto mb-1.5" />
          <p className="font-heading text-2xl text-foreground">{scanImported}</p>
          <p className="text-[10px] text-muted-foreground">via Scan angelegt</p>
        </div>
      </div>

      {/* DAT Import History */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-4">DAT-IMPORT PROTOKOLL</p>
        {imports.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Noch keine DAT-Importe.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {imports.map(imp => (
              <div key={imp.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{imp.vehicle_info || "Unbekanntes Fahrzeug"}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {imp.customer_name && `${imp.customer_name} · `}
                      {imp.task_count > 0 && `${imp.task_count} Aufgaben · `}
                      {imp.total_hours > 0 && `${imp.total_hours.toFixed(1)}h · `}
                      {imp.created_date && format(new Date(imp.created_date), "dd.MM.yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                  imp.status === "freigegeben" ? "bg-success/20 text-success" :
                  imp.status === "abgeschlossen" ? "bg-muted text-muted-foreground" : "bg-warning/20 text-warning"
                }`}>{imp.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently imported customers */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-4">KÜRZLICH IMPORTIERTE KUNDEN</p>
        {autoImported === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Noch keine Kunden via Import angelegt.</p>
        ) : (
          <div className="space-y-2">
            {customers
              .filter(c => c.notes?.includes("Import") || c.notes?.includes("Scan"))
              .slice(0, 10)
              .map(c => (
                <div key={c.id} className="flex items-center justify-between p-2.5 bg-secondary rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.notes?.split(" · ").slice(-1)[0]}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-card rounded-md text-muted-foreground">{c.customer_type}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}