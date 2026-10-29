import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ─── ROLLEN ──────────────────────────────────────────────────────────────────

const ROLES = [
  { key: "master", label: "Geschäftsleitung", icon: "👑", desc: "Vollzugriff auf ALLE Module" },
  { key: "karosserie_lack", label: "Karosserie & Lack", icon: "🔧", desc: "Facharbeiter Werkstatt" },
  { key: "buerro", label: "Büro & Kunden", icon: "💼", desc: "Verwaltung und Kundenbetreuung" },
  { key: "azubi", label: "Azubi", icon: "🎓", desc: "Ausbildung – eingeschränkter Zugriff" },
  { key: "mitarbeiter", label: "Mitarbeiter (Standard)", icon: "👤", desc: "Basiszugriff für neue Mitarbeiter" },
];

// ─── MODULE ──────────────────────────────────────────────────────────────────

const MODULES = [
  {
    key: "betrieb",
    label: "Betrieb",
    icon: "🏭",
    description: "Dashboard, Fahrzeuge, Liveboard, Tasks, Kalender, KPI, Checklisten, Import",
  },
  {
    key: "kunden",
    label: "Kunden & CRM",
    icon: "👥",
    description: "Kundendatenbank, Customer Journey, Kundenkommunikation",
  },
  {
    key: "nachtraege",
    label: "Nachträge",
    icon: "📋",
    description: "Nachträge melden, prüfen und freigeben",
  },
  {
    key: "qualitaet",
    label: "Qualitätssicherung",
    icon: "✅",
    description: "Qualitätschecks, Täubert Standard, Fehlerdatenbank",
  },
  {
    key: "premium",
    label: "Premium & Übergabe",
    icon: "✨",
    description: "Fahrzeugübergabe, Schadenanalyse, Assistent",
  },
  {
    key: "team",
    label: "Team & Zeiterfassung",
    icon: "🕐",
    description: "Team-Übersicht, Zeiterfassung, Urlaub, Stimmung, SOPs",
  },
  {
    key: "werkstatt",
    label: "Werkstatt & Material",
    icon: "🏗️",
    description: "Werkstatt-Control, Tagesstart, Material, Kleidung, Reifen",
  },
  {
    key: "geschaeftsleitung",
    label: "Geschäftsleitung",
    icon: "📊",
    description: "Performance, Mitarbeiterverwaltung, Chef-Ansicht, KPI-Dashboard",
  },
  {
    key: "lohn",
    label: "Lohnabrechnung",
    icon: "💰",
    description: "Lohnvorbereitung, Arbeitszeit-Auswertung, Gehaltsdaten",
  },
  {
    key: "academy",
    label: "Täubert Academy",
    icon: "📚",
    description: "Brandbook, Schulungsmodule, Quiz, Onboarding",
  },
  {
    key: "schichtplan",
    label: "Schichtplan",
    icon: "📅",
    description: "Wochenplanung, Kapazitätsübersicht, Schichteinteilung",
  },
];

// ─── DEFAULT-WERTE (aus aktuellem employeePermissions.js abgeleitet) ──────────

const DEFAULTS = {
  master: ["betrieb","kunden","nachtraege","qualitaet","premium","team","werkstatt","geschaeftsleitung","lohn","academy","schichtplan"],
  karosserie_lack: ["betrieb","kunden","nachtraege","qualitaet","team","werkstatt"],
  buerro: ["betrieb","kunden","nachtraege","team","werkstatt"],
  azubi: ["betrieb","team","werkstatt","academy"],
  mitarbeiter: ["betrieb","kunden","team","werkstatt"],
};

export default function Berechtigungen() {
  const queryClient = useQueryClient();
  const [localMatrix, setLocalMatrix] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["rolePermissions"],
    queryFn: () => base44.entities.RolePermission.list("-created_date", 500),
  });

  // Baue Matrix: { "master_betrieb": true, ... }
  const matrixFromDB = useMemo(() => {
    const m = {};
    permissions.forEach(p => {
      m[`${p.role}_${p.module}`] = p;
    });
    return m;
  }, [permissions]);

  const isAllowed = (role, module) => {
    const key = `${role}_${module}`;
    // Lokale Änderung hat Vorrang
    if (localMatrix.hasOwnProperty(key)) return localMatrix[key];
    // Sonst aus DB
    const perm = matrixFromDB[key];
    if (perm) return perm.has_access;
    // Sonst Default
    return (DEFAULTS[role] || []).includes(module);
  };

  const toggle = (role, module) => {
    const key = `${role}_${module}`;
    setLocalMatrix(prev => ({
      ...prev,
      [key]: !isAllowed(role, module),
    }));
    setSaveMsg(null);
  };

  const hasChanges = Object.keys(localMatrix).length > 0;

  const changedKeys = Object.entries(localMatrix).filter(([_, v]) => v !== undefined);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);

    for (const [key, value] of changedKeys) {
      const [role, ...moduleParts] = key.split("_");
      const module = moduleParts.join("_"); // weil keys wie "karosserie_lack" selbst underscores haben
      const existing = matrixFromDB[key];
      if (existing) {
        await base44.entities.RolePermission.update(existing.id, { has_access: value });
      } else {
        await base44.entities.RolePermission.create({ role, module, has_access: value });
      }
    }

    setLocalMatrix({});
    setSaving(false);
    setSaveMsg("Gespeichert ✓");
    queryClient.invalidateQueries({ queryKey: ["rolePermissions"] });
    setTimeout(() => setSaveMsg(null), 2000);
  };

  const handleReset = () => {
    setLocalMatrix({});
    setSaveMsg(null);
  };

  // Stats
  const stats = useMemo(() => {
    return ROLES.map(role => {
      const granted = MODULES.filter(mod => isAllowed(role.key, mod.key)).length;
      return { ...role, granted, total: MODULES.length };
    });
  }, [matrixFromDB, localMatrix]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">BERECHTIGUNGEN</h1>
          <p className="text-sm text-muted-foreground mt-1">Rollenbasierte Modulzugriffe · Klick zum Ändern</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <>
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs border-border">
                <RotateCcw className="w-3.5 h-3.5" /> Zurücksetzen
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 text-xs">
                <Save className="w-3.5 h-3.5" /> {saving ? "Speichert..." : "Speichern"}
              </Button>
            </>
          )}
          {saveMsg && <span className="text-xs text-success font-semibold">{saveMsg}</span>}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Role Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {stats.map(role => (
              <div key={role.key} className="bg-card border border-border rounded-xl p-4">
                <p className="text-lg mb-1">{role.icon}</p>
                <p className="text-sm font-semibold text-foreground">{role.label}</p>
                <p className="text-[10px] text-muted-foreground mb-2">{role.desc}</p>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.round((role.granted / role.total) * 100)}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{role.granted}/{role.total} Module</p>
              </div>
            ))}
          </div>

          {/* Matrix Table */}
          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left text-[10px] font-semibold tracking-wider text-muted-foreground uppercase sticky left-0 bg-card z-10">
                    Modul
                  </th>
                  {ROLES.map(role => (
                    <th key={role.key} className="p-3 text-center text-[10px] font-semibold tracking-wider text-muted-foreground uppercase min-w-[90px]">
                      {role.icon} {role.label.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((mod, i) => (
                  <tr key={mod.key} className={`border-b border-border/50 ${i % 2 === 0 ? "" : "bg-secondary/10"}`}>
                    <td className="p-3 sticky left-0 bg-card z-10" style={{ backgroundColor: i % 2 === 0 ? "hsl(var(--card))" : undefined }}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{mod.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{mod.label}</p>
                          <p className="text-[9px] text-muted-foreground hidden md:block">{mod.description}</p>
                        </div>
                      </div>
                    </td>
                    {ROLES.map(role => {
                      const allowed = isAllowed(role.key, mod.key);
                      const changed = localMatrix.hasOwnProperty(`${role.key}_${mod.key}`);
                      return (
                        <td key={role.key} className="p-3 text-center">
                          <button
                            onClick={() => toggle(role.key, mod.key)}
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold transition-all active:scale-90
                              ${allowed
                                ? "bg-primary text-primary-foreground hover:bg-primary/80"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                              }
                              ${changed ? "ring-2 ring-warning ring-offset-1" : ""}
                            `}
                          >
                            {allowed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-primary flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>
              Zugriff erlaubt
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center"><X className="w-3 h-3" /></div>
              Kein Zugriff
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded ring-2 ring-warning bg-primary"></div>
              Geändert (ungespeichert)
            </div>
          </div>
        </>
      )}
    </div>
  );
}