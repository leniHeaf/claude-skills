import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Wrench, Shirt, ShoppingCart, Check, X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";

const TYPE_CONFIG = {
  leave: {
    icon: Calendar,
    label: "Urlaub",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    approveStatus: "genehmigt",
    rejectStatus: "abgelehnt",
    entity: "LeaveRequest",
  },
  nachtrag: {
    icon: Wrench,
    label: "Nachtrag",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    approveStatus: "genehmigt",
    rejectStatus: "abgelehnt",
    entity: "Nachtrag",
  },
  clothing: {
    icon: Shirt,
    label: "Kleidung",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    approveStatus: "genehmigt",
    rejectStatus: "abgelehnt",
    entity: "ClothingOrder",
  },
  purchase: {
    icon: ShoppingCart,
    label: "Einkauf",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    approveStatus: "bestellt",
    rejectStatus: "abgebrochen",
    entity: "PurchaseRequest",
  },
};

function ApprovalCard({ item, onAction, loading }) {
  const cfg = TYPE_CONFIG[item.type];
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`border ${cfg.border} ${cfg.bg} rounded-xl p-3 flex items-center gap-3`}
    >
      <div className={`w-9 h-9 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-medium uppercase tracking-wider`}>
            {cfg.label}
          </span>
          {item.urgencyBadge && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
              {item.urgencyBadge}
            </span>
          )}
        </div>
        <p className="text-sm text-foreground font-medium truncate mt-0.5">{item.title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Button
          size="icon"
          onClick={() => onAction(item, "approve")}
          disabled={loading}
          className="h-8 w-8 bg-success/20 hover:bg-success/30 text-success border border-success/30"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => onAction(item, "reject")}
          disabled={loading}
          className="h-8 w-8 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function ApprovalInbox() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [actioningId, setActioningId] = useState(null);

  const buildPayload = (entity, action, newStatus) => {
    const payload = { status: newStatus };
    if (entity === "LeaveRequest") {
      payload.reviewed_by = "Toni";
      payload.manager_comment = action === "approve" ? "Genehmigt" : "Abgelehnt";
    } else if (entity === "Nachtrag") {
      payload.reviewed_by = "Toni";
    } else if (entity === "ClothingOrder") {
      payload.reviewed_by = "Toni";
    } else if (entity === "PurchaseRequest") {
      if (action === "approve") payload.ordered_at = new Date().toISOString();
    }
    return payload;
  };

  const { data: leaves = [] } = useQuery({
    queryKey: ["leave-pending"],
    queryFn: () => base44.entities.LeaveRequest.filter({ status: "eingereicht" }),
  });
  const { data: nachtraege = [] } = useQuery({
    queryKey: ["nachtrag-pending"],
    queryFn: () => base44.entities.Nachtrag.filter({ status: "offen" }),
  });
  const { data: clothing = [] } = useQuery({
    queryKey: ["clothing-pending"],
    queryFn: () => base44.entities.ClothingOrder.filter({ status: "eingereicht" }),
  });
  const { data: purchases = [] } = useQuery({
    queryKey: ["purchase-pending"],
    queryFn: () => base44.entities.PurchaseRequest.filter({ status: "offen" }),
  });

  // Normalize all items into a common shape
  const allItems = [
    ...leaves.map(l => {
      const days = l.start_date && l.end_date ? differenceInDays(new Date(l.end_date), new Date(l.start_date)) + 1 : 0;
      return {
        id: l.id, type: "leave",
        title: `Urlaub: ${l.employee}`,
        subtitle: `${l.start_date ? format(new Date(l.start_date), "dd.MM.yyyy", { locale: de }) : "?"} – ${l.end_date ? format(new Date(l.end_date), "dd.MM.yyyy", { locale: de }) : "?"} (${days} Tag${days !== 1 ? "e" : ""})`,
        urgencyBadge: l.reason || null,
        raw: l,
      };
    }),
    ...nachtraege.map(n => ({
      id: n.id, type: "nachtrag",
      title: n.vehicle_info || "Nachtrag",
      subtitle: n.description || "",
      urgencyBadge: n.urgency === "dringend" ? "Dringend" : null,
      raw: n,
    })),
    ...clothing.map(c => ({
      id: c.id, type: "clothing",
      title: `${c.employee}: ${c.item}`,
      subtitle: `Größe ${c.size} × ${c.quantity}${c.reason ? ` · ${c.reason}` : ""}`,
      raw: c,
    })),
    ...purchases.map(p => ({
      id: p.id, type: "purchase",
      title: p.material_name || "Einkauf",
      subtitle: `${p.quantity} ${p.unit || "Stk"}${p.requested_by ? ` · ${p.requested_by}` : ""}`,
      urgencyBadge: p.urgency === "sofort" ? "Sofort" : p.urgency === "dringend" ? "Dringend" : null,
      raw: p,
    })),
  ];

  const invalidateAll = () => {
    ["leave-pending", "nachtrag-pending", "clothing-pending", "purchase-pending",
     "leave", "leave-chef", "nachtraege", "clothing", "purchase"].forEach(k =>
      queryClient.invalidateQueries({ queryKey: [k] })
    );
  };

  const handleAction = async (item, action) => {
    const cfg = TYPE_CONFIG[item.type];
    const newStatus = action === "approve" ? cfg.approveStatus : cfg.rejectStatus;
    setActioningId(item.id);
    try {
      await base44.entities[cfg.entity].update(item.id, buildPayload(cfg.entity, action, newStatus));
      invalidateAll();
    } catch (err) {
      toast({ title: "Fehler", description: "Anfrage konnte nicht aktualisiert werden.", variant: "destructive" });
      console.error(err);
    }
    setActioningId(null);
  };

  const handleApproveAll = async () => {
    for (const item of allItems) {
      setActioningId(item.id);
      const cfg = TYPE_CONFIG[item.type];
      try {
        await base44.entities[cfg.entity].update(item.id, buildPayload(cfg.entity, "approve", cfg.approveStatus));
      } catch (err) { console.error(err); }
    }
    setActioningId(null);
    invalidateAll();
  };

  if (allItems.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <Check className="w-6 h-6 text-success mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Keine offenen Genehmigungen</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allItems.length > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{allItems.length} Anträge offen</p>
          <Button
            onClick={handleApproveAll}
            disabled={!!actioningId}
            variant="outline"
            size="sm"
            className="gap-1.5 h-7 text-xs border-success/30 text-success hover:bg-success/10"
          >
            <Check className="w-3 h-3" /> Alle genehmigen
          </Button>
        </div>
      )}
      <AnimatePresence mode="popLayout">
        {allItems.map(item => (
          <ApprovalCard
            key={`${item.type}-${item.id}`}
            item={item}
            onAction={handleAction}
            loading={actioningId === item.id}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}