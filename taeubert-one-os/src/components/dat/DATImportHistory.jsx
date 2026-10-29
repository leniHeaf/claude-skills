import React from "react";
import { FileText, Clock, Package, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function DATImportHistory({ imports, vehicles }) {
  if (imports.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Noch keine Importe</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {imports.map(imp => (
        <div key={imp.id} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {imp.vehicle_info || "Fahrzeug unbekannt"}
              </p>
              <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                {imp.customer_name && <span>{imp.customer_name}</span>}
                {imp.damage_number && <span>· {imp.damage_number}</span>}
                {imp.insurance && <span>· {imp.insurance}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-[10px] text-success font-medium">{imp.status || "freigegeben"}</span>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground mt-3">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{imp.task_count || 0} Aufgaben</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{imp.total_hours?.toFixed(1) || "–"}h geplant</span>
            </div>
            {imp.total_parts_cost > 0 && (
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span>{imp.total_parts_cost.toFixed(0)} € Teile</span>
              </div>
            )}
            <span className="ml-auto">
              {imp.created_date ? format(new Date(imp.created_date), "dd.MM.yyyy", { locale: de }) : ""}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}