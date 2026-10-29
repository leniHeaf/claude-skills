import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ShoppingBag, Users, Plus, CheckCircle2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClothingRequestForm from "../components/clothing/ClothingRequestForm";
import ClothingOrderList from "../components/clothing/ClothingOrderList";
import ClothingProfiles from "../components/clothing/ClothingProfiles";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

export default function Clothing() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("antraege");
  const [showForm, setShowForm] = useState(false);

  const { data: orders = [] } = useQuery({
    queryKey: ["clothingOrders"],
    queryFn: () => base44.entities.ClothingOrder.list("-created_date", 200),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["employeeProfiles"],
    queryFn: () => base44.entities.EmployeeProfile.list("employee", 50),
  });

  const createOrder = useMutation({
    mutationFn: (data) => base44.entities.ClothingOrder.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clothingOrders"] }),
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ClothingOrder.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clothingOrders"] }),
  });

  const createProfile = useMutation({
    mutationFn: (data) => base44.entities.EmployeeProfile.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employeeProfiles"] }),
  });

  const updateProfile = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmployeeProfile.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employeeProfiles"] }),
  });

  // KPIs
  const pending = orders.filter(o => o.status === "eingereicht");
  const approved = orders.filter(o => o.status === "genehmigt" || o.status === "bestellt");
  const totalCost = orders
    .filter(o => o.status !== "abgelehnt")
    .reduce((s, o) => s + (o.estimated_cost || 0), 0);

  const TABS = [
    { key: "antraege", label: "Anträge", icon: ShoppingBag, badge: pending.length },
    { key: "profile", label: "Mitarbeiterprofile", icon: Users },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">ARBEITSKLEIDUNG</h1>
            <p className="text-sm text-muted-foreground mt-1">Täubert Auftritt · Uniform · Bestellungen</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2 h-9">
            <Plus className="w-4 h-4" /> Antrag stellen
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Offen", value: pending.length, icon: ShoppingBag, color: "text-warning" },
          { label: "Genehmigt", value: approved.length, icon: CheckCircle2, color: "text-success" },
          { label: "Gesamtkosten", value: `${totalCost.toFixed(0)} €`, icon: Package, color: "text-info" },
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

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.badge > 0 && (
              <span className="w-4 h-4 rounded-full bg-warning text-black text-[9px] flex items-center justify-center font-bold">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "antraege" && (
        <ClothingOrderList
          orders={orders}
          onApprove={(id) => updateOrder.mutate({ id, data: { status: "genehmigt", approved_by: "Toni" } })}
          onReject={(id, note) => updateOrder.mutate({ id, data: { status: "abgelehnt", manager_note: note } })}
          onMarkOrdered={(id) => updateOrder.mutate({ id, data: { status: "bestellt" } })}
          onMarkIssued={(id) => updateOrder.mutate({ id, data: { status: "ausgegeben", issued_date: format(new Date(), "yyyy-MM-dd") } })}
          onEdit={(id, data) => updateOrder.mutate({ id, data })}
        />
      )}

      {tab === "profile" && (
        <ClothingProfiles
          team={TEAM}
          profiles={profiles}
          orders={orders}
          onSave={(emp, data, existingId) =>
            existingId
              ? updateProfile.mutate({ id: existingId, data })
              : createProfile.mutate({ ...data, employee: emp })
          }
        />
      )}

      <AnimatePresence>
        {showForm && (
          <ClothingRequestForm
            team={TEAM}
            profiles={profiles}
            onSave={(data) => { createOrder.mutate(data); setShowForm(false); }}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}