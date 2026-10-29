import React, { useState } from "react";
import { CheckCircle2, Package, Clock, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG = {
  offen: { label: "Offen", dot: "bg-warning animate-pulse" },
  bestellt: { label: "Bestellt", dot: "bg-info" },
  geliefert: { label: "Geliefert", dot: "bg-success" },
  abgebrochen: { label: "Abgebrochen", dot: "bg-muted-foreground" },
};

const URGENCY_SORT = { sofort: 0, dringend: 1, normal: 2, niedrig: 3 };

const URGENCY_CONFIG = {
  sofort: { label: "Sofort", color: "text-destructive", bg: "border-l-destructive" },
  dringend: { label: "Dringend", color: "text-warning", bg: "border-l-warning" },
  normal: { label: "Normal", color: "text-info", bg: "border-l-info" },
  niedrig: { label: "Niedrig", color: "text-muted-foreground", bg: "border-l-border" },
};

export default function PurchaseRequestList({ requests, onStatusChange }) {
  const [filter, setFilter] = useState("offen");
  const [expanded, setExpanded] = useState(null);

  const filtered = requests
    .filter(r => filter === "alle" ? true : r.status === filter)
    .sort((a, b) => (URGENCY_SORT[a.urgency] ?? 3) - (URGENCY_SORT[b.urgency] ?? 3));

  const filters = [
    { key: "offen", label: "Offen" },
    { key: "bestellt", label: "Bestellt" },
    { key: "geliefert", label: "Geliefert" },
    { key: "alle", label: "Alle" },
  ];

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
              ${filter === f.key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {f.label}
            {f.key !== "alle" && (
              <span className="ml-1.5 opacity-70">{requests.filter(r => r.status === f.key).length}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Keine Einträge</p>
        </div>
      )}

      {filtered.map(req => {
        const urg = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.normal;
        const stat = STATUS_CONFIG[req.status] || STATUS_CONFIG.offen;
        const isExp = expanded === req.id;

        return (
          <div key={req.id} className={`bg-card border border-border border-l-4 ${urg.bg} rounded-xl overflow-hidden transition-all`}>
            <div className="p-4 cursor-pointer" onClick={() => setExpanded(isExp ? null : req.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{req.material_name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${urg.color}`}>{urg.label}</span>
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />
                      <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{req.quantity} {req.unit || "Stk"}</span>
                    {req.supplier && <span>· {req.supplier}</span>}
                    {req.vehicle_info && <span>· {req.vehicle_info}</span>}
                    {req.requested_by && <span>· {req.requested_by}</span>}
                  </div>
                </div>
                {isExp ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </div>
            </div>

            {isExp && (
              <div className="border-t border-border p-4 bg-secondary/30">
                {req.notes && <p className="text-xs text-muted-foreground mb-3">{req.notes}</p>}
                {req.photo && <img src={req.photo} alt="Produkt" className="w-24 h-24 object-cover rounded-lg mb-3" />}
                {req.price_total && <p className="text-xs text-muted-foreground mb-3">Geschätzter Preis: {req.price_total} €</p>}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {req.status === "offen" && (
                    <Button size="sm" onClick={() => onStatusChange(req.id, "bestellt")}
                      className="h-7 text-xs bg-info/10 hover:bg-info/20 text-info border border-info/20 gap-1">
                      <Clock className="w-3 h-3" /> Als Bestellt markieren
                    </Button>
                  )}
                  {req.status === "bestellt" && (
                    <Button size="sm" onClick={() => onStatusChange(req.id, "geliefert")}
                      className="h-7 text-xs bg-success/10 hover:bg-success/20 text-success border border-success/20 gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Geliefert
                    </Button>
                  )}
                  {req.status !== "geliefert" && req.status !== "abgebrochen" && (
                    <Button size="sm" variant="ghost" onClick={() => onStatusChange(req.id, "abgebrochen")}
                      className="h-7 text-xs text-muted-foreground gap-1">
                      <X className="w-3 h-3" /> Abbrechen
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}