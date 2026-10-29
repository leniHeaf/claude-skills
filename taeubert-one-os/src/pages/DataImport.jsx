import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine, Car, Users, History
} from "lucide-react";
import KennzeichenLookup from "../components/import/KennzeichenLookup";
import FahrzeugscheinScan from "../components/import/FahrzeugscheinScan";
import KundenImport from "../components/import/KundenImport";
import ImportHistorie from "../components/import/ImportHistorie";

const TABS = [
  { key: "kennzeichen", label: "Kennzeichen / VIN", icon: Car, desc: "Fahrzeugdaten automatisch erkennen" },
  { key: "scan", label: "Fahrzeugschein scannen", icon: ScanLine, desc: "OCR · Foto → Daten" },
  { key: "kunden", label: "Kunden importieren", icon: Users, desc: "CSV · Excel · Autohausliste" },
  { key: "historie", label: "Import-Historie", icon: History, desc: "Alle bisherigen Importe" },
];

export default function DataImport() {
  const [tab, setTab] = useState("kennzeichen");

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">DATEN-IMPORT</h1>
        <p className="text-sm text-muted-foreground mt-1">Kunden & Fahrzeuge automatisch importieren · Keine Doppeleingabe</p>
      </motion.div>

      {/* Tab Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`p-3 rounded-xl border text-left transition-all
                ${tab === t.key ? "bg-primary/10 border-primary/40 text-primary" : "bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"}`}>
              <Icon className={`w-4 h-4 mb-2 ${tab === t.key ? "text-primary" : ""}`} />
              <p className={`text-xs font-semibold ${tab === t.key ? "text-primary" : "text-foreground"}`}>{t.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {tab === "kennzeichen" && <KennzeichenLookup />}
          {tab === "scan" && <FahrzeugscheinScan />}
          {tab === "kunden" && <KundenImport />}
          {tab === "historie" && <ImportHistorie />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}