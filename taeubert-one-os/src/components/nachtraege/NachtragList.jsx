import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react";

const STATUS_CFG = {
  offen: { label: "Offen", color: "text-warning bg-warning/10", icon: AlertTriangle },
  genehmigt: { label: "Genehmigt", color: "text-success bg-success/10", icon: CheckCircle2 },
  abgelehnt: { label: "Abgelehnt", color: "text-destructive bg-destructive/10", icon: XCircle },
  rueckfrage: { label: "Rückfrage", color: "text-info bg-info/10", icon: MessageSquare },
};

const URGENCY_COLOR = { niedrig: "text-muted-foreground", normal: "text-foreground", dringend: "text-destructive font-semibold" };

export default function NachtragList({ vehicleId }) {
  const { data: nachtraege = [] } = useQuery({
    queryKey: ["nachtraege", vehicleId],
    queryFn: () => base44.entities.Nachtrag.filter({ vehicle_id: vehicleId }, "-created_date"),
  });

  if (nachtraege.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-6">
      <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-4 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-warning" />
        NACHTRÄGE ({nachtraege.length})
      </h3>
      <div className="space-y-3">
        {nachtraege.map((n) => {
          const cfg = STATUS_CFG[n.status] || STATUS_CFG.offen;
          const Icon = cfg.icon;
          return (
            <div key={n.id} className="flex items-start gap-3 p-3 bg-secondary rounded-xl">
              <div className={`mt-0.5 p-1.5 rounded-lg ${cfg.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{n.category?.charAt(0).toUpperCase() + n.category?.slice(1)}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md ${cfg.color}`}>{cfg.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">von {n.reported_by}</span>
                  {n.extra_time_hours && (
                    <span className="text-[10px] flex items-center gap-0.5 text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" /> +{n.extra_time_hours}h
                    </span>
                  )}
                  {n.estimated_cost && (
                    <span className="text-[10px] text-muted-foreground">+{n.estimated_cost}€</span>
                  )}
                  <span className={`text-[10px] ${URGENCY_COLOR[n.urgency]}`}>{n.urgency}</span>
                </div>
                {/* Photos preview */}
                {(n.photos_before?.length > 0 || n.photos_after?.length > 0) && (
                  <div className="flex gap-1.5 mt-2">
                    {[...(n.photos_before || []), ...(n.photos_after || [])].slice(0, 4).map((url, i) => (
                      <img key={i} src={url} alt="" className="w-10 h-10 object-cover rounded-md border border-border" />
                    ))}
                  </div>
                )}
                {n.manager_comment && (
                  <div className="mt-1.5 p-2 bg-card rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Toni: <span className="text-foreground">{n.manager_comment}</span></p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}