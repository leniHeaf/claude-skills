import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Plus, FileText, Layers, Search, Loader2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import KalkulationWizard from "@/components/schadenkalkulation/KalkulationWizard";
import KalkulationDetail from "@/components/schadenkalkulation/KalkulationDetail";
import RichtzeitenKatalog from "@/components/schadenkalkulation/RichtzeitenKatalog";
import { formatEuro } from "@/lib/kalkulationUtils";

const STATUS_BADGE = {
  Entwurf: "bg-secondary text-muted-foreground",
  Kalkuliert: "bg-success/10 text-success",
  "Kunde informiert": "bg-info/10 text-info",
  "Auftrag erteilt": "bg-primary/10 text-foreground",
};

const STATUS_LABEL = {
  Entwurf: "Entwurf",
  Kalkuliert: "Kalkuliert",
  "Kunde informiert": "Kunde informiert",
  "Auftrag erteilt": "Auftrag erteilt",
};

export default function Schadenkalkulation() {
  const [tab, setTab] = useState("uebersicht");
  const [showWizard, setShowWizard] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [search, setSearch] = useState("");

  const { data: kalkulationen = [], isLoading } = useQuery({
    queryKey: ["kalkulationen"],
    queryFn: () => base44.entities.Kalkulation.list("-created_date", 200),
  });

  const filtered = kalkulationen.filter(k => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (k.date || "").includes(s) || String(k.gesamtbetrag_brutto || "").includes(s);
  });

  if (showWizard) {
    return <KalkulationWizard onClose={() => setShowWizard(false)} onSaved={() => { setShowWizard(false); setTab("uebersicht"); }} />;
  }

  if (detailId) {
    return <KalkulationDetail kalkulationId={detailId} onClose={() => setDetailId(null)} />;
  }

  const TABS = [
    { key: "uebersicht", label: "Kalkulationen", icon: FileText },
    { key: "katalog", label: "Richtzeiten-Katalog", icon: Layers },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">SCHADENKALKULATION</h1>
          <p className="text-sm text-muted-foreground mt-1">Reparaturkostenschätzung nach DAT-Richtzeiten</p>
        </div>
        {tab === "uebersicht" && (
          <Button onClick={() => setShowWizard(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Neue Kalkulation
          </Button>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "katalog" ? (
        <RichtzeitenKatalog />
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kalkulation suchen (Datum, Betrag)..." className="pl-9" />
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Calculator className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground mb-4">Noch keine Kalkulationen vorhanden</p>
              <Button onClick={() => setShowWizard(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Erste Kalkulation erstellen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(k => (
                <motion.button
                  key={k.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setDetailId(k.id)}
                  className="text-left bg-card border border-border rounded-xl p-4 hover:border-foreground/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{k.date}</p>
                      <p className="text-[10px] text-muted-foreground">{k.positionen?.length || 0} Positionen</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[k.status] || "bg-secondary"}`}>
                      {STATUS_LABEL[k.status] || k.status}
                    </span>
                  </div>
                  <div className="flex items-end justify-between pt-2 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Gesamt Brutto</span>
                    <span className="font-heading text-xl text-foreground">{formatEuro(k.gesamtbetrag_brutto)}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}