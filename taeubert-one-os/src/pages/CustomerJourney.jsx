import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin, MessageSquare,
  Gift,
  TrendingUp, Coffee
} from "lucide-react";
import { Input } from "@/components/ui/input";
import JourneyPhaseBoard from "../components/journey/JourneyPhaseBoard";
import EmpfangsModus from "../components/journey/EmpfangsModus";
import UebergabeLeitfaden from "../components/journey/UebergabeLeitfaden";
import NachkontaktPanel from "../components/journey/NachkontaktPanel";
import JourneyKanalAnalyse from "../components/journey/JourneyKanalAnalyse";

const TABS = [
  { key: "board", label: "Journey Board", icon: MapPin },
  { key: "empfang", label: "Empfangs-Modus", icon: Coffee },
  { key: "uebergabe", label: "Übergabe-Modus", icon: Gift },
  { key: "nachkontakt", label: "Nachkontakt", icon: MessageSquare },
  { key: "analyse", label: "Kanal-Analyse", icon: TrendingUp },
];

export default function CustomerJourney() {
  const [tab, setTab] = useState("board");
  const [search, setSearch] = useState("");

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("-created_date", 200),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 200),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => base44.entities.Appointment.list("-created_date", 100),
  });

  const filtered = customers.filter(c => {
    const t = search.toLowerCase();
    return !t || c.name?.toLowerCase().includes(t) || c.phone?.includes(t);
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">CUSTOMER JOURNEY</h1>
            <p className="text-sm text-muted-foreground mt-1">Premium-Kundenerlebnis · Vollständig digitalisiert in Täubert One</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kunde suchen..." className="pl-9 bg-secondary border-border text-sm" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary rounded-xl mt-5 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0
                ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {tab === "board" && <JourneyPhaseBoard customers={filtered} vehicles={vehicles} appointments={appointments} />}
          {tab === "empfang" && <EmpfangsModus customers={filtered} vehicles={vehicles} appointments={appointments} />}
          {tab === "uebergabe" && <UebergabeLeitfaden vehicles={vehicles} />}
          {tab === "nachkontakt" && <NachkontaktPanel customers={filtered} vehicles={vehicles} />}
          {tab === "analyse" && <JourneyKanalAnalyse customers={customers} vehicles={vehicles} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}