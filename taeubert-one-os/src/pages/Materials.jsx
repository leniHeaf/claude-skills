import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays } from "date-fns";
import { de } from "date-fns/locale";
import {
  ShoppingCart, Package, AlertTriangle, TrendingUp, Plus, Zap, Mail, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PurchaseRequestList from "../components/materials/PurchaseRequestList";
import MaterialCatalog from "../components/materials/MaterialCatalog";
import UsageAnalysis from "../components/materials/UsageAnalysis";
import AddPurchaseDialog from "../components/materials/AddPurchaseDialog";

const URGENCY_CONFIG = {
  sofort: { label: "Sofort", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
  dringend: { label: "Dringend", color: "text-warning", bg: "bg-warning/10 border-warning/30" },
  normal: { label: "Normal", color: "text-info", bg: "bg-info/10 border-info/30" },
  niedrig: { label: "Niedrig", color: "text-muted-foreground", bg: "bg-secondary border-border" },
};

export default function Materials() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("einkauf");
  const [showAdd, setShowAdd] = useState(false);

  const { data: requests = [] } = useQuery({
    queryKey: ["purchaseRequests"],
    queryFn: () => base44.entities.PurchaseRequest.list("-created_date", 200),
  });

  const { data: materials = [] } = useQuery({
    queryKey: ["materials"],
    queryFn: () => base44.entities.Material.list("name", 200),
  });

  const { data: usages = [] } = useQuery({
    queryKey: ["materialUsages"],
    queryFn: () => base44.entities.MaterialUsage.list("-created_date", 500),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 100),
  });

  const createRequest = useMutation({
    mutationFn: (data) => base44.entities.PurchaseRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseRequests"] });
      toast({ title: "Anfrage erstellt", description: "Anfrage zur Einkaufsliste hinzugefügt." });
    },
    onError: (err) => {
      toast({ title: "Anfrage fehlgeschlagen", description: err?.message || "Anfrage konnte nicht gespeichert werden.", variant: "destructive" });
    },
  });

  const updateRequest = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PurchaseRequest.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchaseRequests"] }),
  });

  const createMaterial = useMutation({
    mutationFn: (data) => base44.entities.Material.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["materials"] }),
  });

  const updateMaterial = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Material.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["materials"] }),
  });

  const [sendingMail, setSendingMail] = useState(false);
  const { toast } = useToast();

  const sendMaterialListMail = async () => {
    setSendingMail(true);
    try {
      const lines = materials.map(m => {
        const low = (m.current_stock !== undefined && m.min_stock !== undefined && m.current_stock <= m.min_stock);
        const status = low ? "⚠ NACHBESTELLEN" : "OK";
        return `${m.name || "—"}\t${m.category || "—"}\tBestand: ${m.current_stock ?? "—"} ${m.unit || ""}\tMin: ${m.min_stock ?? "—"}\tBestellmenge: ${m.preferred_order_qty ?? "—"}\t${status}`;
      }).join("\n");

      const body = `Materialliste – Täubert Karosserie & Lack\n` +
        `Stand: ${format(new Date(), "dd.MM.yyyy 'um' HH:mm", { locale: de })}\n` +
        `Gesamt: ${materials.length} Artikel · ${lowStockMaterials.length} unter Mindestbestand\n\n` +
        `ARTIKEL | KATEGORIE | BESTAND | MIN | BESTELLMENGE | STATUS\n` +
        `${"-".repeat(70)}\n` +
        lines + `\n\n` +
        `Automatisch generiert durch Täubert One Plattform`;

      await base44.integrations.Core.SendEmail({
        to: "hello@taeubert-karosserie-lack.de",
        subject: `Materialliste – ${format(new Date(), "dd.MM.yyyy", { locale: de })} (${lowStockMaterials.length} Nachbestellungen)`,
        body,
      });
      toast({ title: "Materialliste gesendet", description: "E-Mail an hello@taeubert-karosserie-lack.de verschickt." });
    } catch (err) {
      toast({ title: "Fehler beim Senden", description: err?.message || "E-Mail konnte nicht gesendet werden.", variant: "destructive" });
    } finally {
      setSendingMail(false);
    }
  };

  // KPIs
  const openRequests = requests.filter(r => r.status === "offen");
  const urgentRequests = openRequests.filter(r => r.urgency === "sofort" || r.urgency === "dringend");
  const lowStockMaterials = materials.filter(m => m.current_stock !== undefined && m.min_stock !== undefined && m.current_stock <= m.min_stock);

  // Usage last 30 days
  const cutoff = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const recentUsages = usages.filter(u => u.date >= cutoff);
  const totalCostThisMonth = recentUsages.reduce((s, u) => s + (u.cost || 0), 0);

  const TABS = [
    { key: "einkauf", label: "Einkaufsliste", icon: ShoppingCart, badge: openRequests.length },
    { key: "lager", label: "Materialien", icon: Package },
    { key: "analyse", label: "Verbrauch", icon: TrendingUp },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">MATERIAL & EINKAUF</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={sendMaterialListMail} disabled={sendingMail || materials.length === 0}
              variant="outline" className="gap-2 h-9 border-border">
              {sendingMail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Per Mail
            </Button>
            <Button onClick={() => setShowAdd(true)} className="gap-2 h-9">
              <Plus className="w-4 h-4" /> Anfrage
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Offen", value: openRequests.length, icon: ShoppingCart, color: "text-info" },
          { label: "Dringend", value: urgentRequests.length, icon: Zap, color: "text-warning" },
          { label: "Mindestbestand", value: lowStockMaterials.length, icon: AlertTriangle, color: "text-destructive" },
          { label: "Kosten (30 Tage)", value: `${totalCostThisMonth.toFixed(0)} €`, icon: TrendingUp, color: "text-success" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
            </div>
            <p className={`font-heading text-xl ${kpi.color}`}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Low-stock warnings */}
      {lowStockMaterials.length > 0 && (
        <div className="mb-4 space-y-2">
          {lowStockMaterials.map(m => (
            <div key={m.id} className="flex items-center gap-2 px-4 py-2.5 bg-destructive/5 border border-destructive/20 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
              <span className="text-destructive font-medium">{m.name}</span>
              <span className="text-muted-foreground">· Bestand: {m.current_stock} {m.unit || "Stk"} (Minimum: {m.min_stock})</span>
              {m.lead_time_days && (
                <span className="ml-auto text-xs text-muted-foreground">Lieferzeit: {m.lead_time_days}d</span>
              )}
            </div>
          ))}
        </div>
      )}

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
            {t.badge > 0 && (
              <span className="w-4 h-4 rounded-full bg-info text-white text-[9px] flex items-center justify-center font-bold">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* EINKAUFSLISTE */}
      {tab === "einkauf" && (
        <PurchaseRequestList
          requests={requests}
          urgencyConfig={URGENCY_CONFIG}
          onStatusChange={(id, status) => updateRequest.mutate({ id, data: { status, ...(status === "bestellt" ? { ordered_at: new Date().toISOString() } : status === "geliefert" ? { delivered_at: new Date().toISOString() } : {}) } })}
        />
      )}

      {/* LAGER / MATERIALIEN */}
      {tab === "lager" && (
        <MaterialCatalog
          materials={materials}
          onSave={(id, data) => id ? updateMaterial.mutate({ id, data }) : createMaterial.mutate(data)}
        />
      )}

      {/* VERBRAUCHSANALYSE */}
      {tab === "analyse" && (
        <UsageAnalysis usages={usages} materials={materials} vehicles={vehicles} />
      )}

      {/* Add Dialog */}
      <AnimatePresence>
        {showAdd && (
          <AddPurchaseDialog
            materials={materials}
            vehicles={vehicles}
            onSave={(data) => { createRequest.mutate(data); setShowAdd(false); }}
            onClose={() => setShowAdd(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}