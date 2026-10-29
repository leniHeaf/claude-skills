import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertTriangle,
  Users, Target, Shield, FileText, Star
} from "lucide-react";

const SOPS = [
  {
    id: 1,
    title: "Fahrzeugannahme",
    category: "Annahme",
    responsible: ["Lena", "Toni"],
    goal: "Vertrauen schaffen · Informationen sichern · Zusatzarbeiten erkennen · Fehler vermeiden",
    steps: [
      "Kunde begrüßen — freundlich, ruhig, professionell",
      "Fahrzeug gemeinsam prüfen: Schaden, Vorschäden, Felgen, Scheiben, Innenraum, Kilometerstand",
      "Pflichtfotos aufnehmen: vorne, hinten, links, rechts, Schaden, Innenraum",
      "Kundenwünsche dokumentieren: Zusatzarbeiten, Zeitwünsche, Besonderheiten",
      "Fahrzeug digital anlegen: Kennzeichen, VIN, Kunde, Versicherung, Status",
    ],
    qualityStandard: "Vollständige Dokumentation · keine offenen Fragen · klare Kommunikation",
    errorSources: [
      "Kundenwünsche vergessen",
      "Vorschäden nicht dokumentiert",
      "Schlechte Fotos",
      "Falsche Daten",
    ],
    mandatoryChecks: ["vorne", "hinten", "links", "rechts", "Schaden", "Innenraum"],
    color: "text-chart-2",
    bg: "bg-chart-2/10 border-chart-2/20",
  },
  {
    id: 2,
    title: "Teileprüfung",
    category: "Teile",
    responsible: ["Toni", "Karosserie"],
    goal: "Standzeiten vermeiden · Fehlteile vermeiden · Chaos reduzieren",
    steps: [
      "Lieferung prüfen",
      "Teile auf Schäden prüfen",
      "Teilenummer prüfen",
      "Fahrzeugzuordnung sicherstellen",
      "Teileplatz markieren",
    ],
    qualityStandard: "Jedes Teil geprüft und korrekt zugeordnet",
    errorSources: [
      "Falsche Teile",
      "Beschädigte Teile",
      "Teile falsch gelagert",
    ],
    mandatoryChecks: ["Lieferung", "Schäden", "Teilenummer", "Fahrzeugzuordnung", "Teileplatz"],
    color: "text-chart-5",
    bg: "bg-chart-5/10 border-chart-5/20",
  },
  {
    id: 3,
    title: "Karosseriearbeit",
    category: "Karosserie",
    responsible: ["Maik", "Marco"],
    goal: "Saubere Instandsetzung · präzise Passungen · stabile Qualität",
    steps: [
      "Schaden analysieren",
      "Demontage durchführen",
      "Richtarbeiten",
      "Entrosten",
      "Schweißarbeiten",
      "Spaltmaße prüfen",
      "Oberflächen prüfen",
    ],
    qualityStandard: "Saubere Spaltmaße · keine Spannungen · präzise Übergänge",
    errorSources: [
      "Schlechte Passungen",
      "Fehlender Rostschutz",
      "Unruhige Flächen",
    ],
    mandatoryChecks: ["Schaden", "Demontage", "Richtarbeiten", "Entrostung", "Schweißen", "Spaltmaße", "Oberflächen"],
    color: "text-chart-4",
    bg: "bg-chart-4/10 border-chart-4/20",
  },
  {
    id: 4,
    title: "Vorbereitung",
    category: "Vorbereitung",
    responsible: ["Fanny", "Pascal", "Adrian"],
    goal: "Perfekte Grundlage für Lackierung — WICHTIGSTE SOP überhaupt",
    steps: [
      "Reinigen",
      "Schleifen",
      "Übergänge weich auslaufen",
      "Oberfläche kontrollieren",
      "Füllern",
      "Trocknen",
      "Kontrollieren",
      "Abkleben",
    ],
    qualityStandard: "Gleichmäßiges Schleifbild · keine Kanten · saubere Übergänge · staubfrei",
    errorSources: [
      "Zu große Flächen",
      "Schlechte Übergänge",
      "Staub",
      "Unsaubere Abklebung",
    ],
    mandatoryChecks: ["Schleifbild", "Lichtkontrolle", "Staubfreiheit", "Übergänge", "Abklebung"],
    isPrimary: true,
    color: "text-chart-3",
    bg: "bg-chart-3/10 border-chart-3/20",
  },
  {
    id: 5,
    title: "Lackierung",
    category: "Lackierung",
    responsible: ["Toni"],
    goal: "Perfekte Oberfläche · Farbtongenauigkeit · Premiumwirkung",
    steps: [
      "Fahrzeug reinigen",
      "Farbton prüfen",
      "Material vorbereiten",
      "Kabine kontrollieren",
      "Lackieren",
      "Oberfläche prüfen",
    ],
    qualityStandard: "Perfekte Oberfläche ohne Kompromisse",
    errorSources: [
      "Staub",
      "Läufer",
      "Farbtonfehler",
      "Schlechte Übergänge",
    ],
    mandatoryChecks: ["Farbton", "Staub", "Übergänge", "Klarlackruhe"],
    color: "text-chart-1",
    bg: "bg-chart-1/10 border-chart-1/20",
  },
  {
    id: 6,
    title: "Finish",
    category: "Finish",
    responsible: ["Pascal", "Toni"],
    goal: "Perfekter letzter Eindruck",
    steps: [
      "Lack kontrollieren",
      "Staubeinschlüsse entfernen",
      "Polieren",
      "Hologramme prüfen",
      "Lichtkontrolle",
      "Kunststoff reinigen",
      "Innenraum prüfen",
    ],
    qualityStandard: "Keine Hologramme · keine Durchpolierer · saubere Spiegelung",
    errorSources: [
      "Durchpolieren",
      "Hologramme",
      "Vergessene Stellen",
    ],
    mandatoryChecks: ["Lack", "Staubeinschlüsse", "Hologramme", "Lichtkontrolle", "Kunststoff", "Innenraum"],
    color: "text-chart-2",
    bg: "bg-chart-2/10 border-chart-2/20",
  },
  {
    id: 7,
    title: "Endkontrolle",
    category: "Kontrolle",
    responsible: ["Toni"],
    goal: "Nur perfekte Fahrzeuge freigeben",
    steps: [
      "Außenkontrolle",
      "Lichtkontrolle",
      "Innenraum prüfen",
      "Spaltmaße prüfen",
      "Fehlersuche",
      "Dokumentation",
    ],
    qualityStandard: "Ohne Freigabe: keine Übergabe",
    errorSources: [
      "Unvollständige Kontrolle",
      "Fehlende Dokumentation",
      "Fahrzeug vor Freigabe übergeben",
    ],
    mandatoryChecks: ["Außen", "Licht", "Innenraum", "Spaltmaße", "Fehler", "Dokumentation"],
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
  },
  {
    id: 8,
    title: "Kundenübergabe",
    category: "Übergabe",
    responsible: ["Toni", "Lena"],
    goal: "Premiumgefühl erzeugen",
    steps: [
      "Fahrzeug sauber positionieren",
      "Schlüssel vorbereiten",
      "Rechnung erklären",
      "Arbeiten erklären",
      "Pflegehinweise geben",
      "Kunden verabschieden",
    ],
    qualityStandard: "Ruhige Übergabe · professionelle Erklärung · Wertschätzung",
    errorSources: [
      "Hektische Übergabe",
      "Fehlende Erklärungen",
      "Schmutziges Fahrzeug",
    ],
    mandatoryChecks: ["Positionierung", "Schlüssel", "Rechnung", "Erklärung", "Pflegehinweise"],
    color: "text-success",
    bg: "bg-success/10 border-success/20",
  },
  {
    id: 9,
    title: "Reklamationen",
    category: "Service",
    responsible: ["Toni", "Lena"],
    goal: "Probleme professionell lösen",
    steps: [
      "Kunden anhören — nie diskutieren",
      "Dokumentieren",
      "Fotos aufnehmen",
      "Ursache analysieren",
      "Lösung definieren",
      "Nachkontrolle durchführen",
    ],
    qualityStandard: "Nie diskutieren — immer lösungsorientiert",
    errorSources: [
      "Nicht dokumentiert",
      "Keine Fotos",
      "Ursache nicht analysiert",
    ],
    mandatoryChecks: ["Dokumentation", "Fotos", "Ursachenanalyse", "Lösung", "Nachkontrolle"],
    color: "text-warning",
    bg: "bg-warning/10 border-warning/20",
  },
  {
    id: 10,
    title: "Hallenordnung",
    category: "Ordnung",
    responsible: ["Alle"],
    goal: "Premiumwirkung & Effizienz",
    steps: [
      "TÄGLICH: Werkzeugwagen aufräumen, Müll entsorgen, Boden reinigen",
      "TÄGLICH: Materialien ordnen, Laufwege freihalten",
      "WÖCHENTLICH: Lager prüfen, Regale ordnen",
      "WÖCHENTLICH: Licht prüfen, Maschinen kontrollieren",
    ],
    qualityStandard: "Premium-Erscheinungsbild zu jeder Zeit",
    errorSources: [
      "Unordnung",
      "Blockierte Laufwege",
      "Schmutzige Maschinen",
    ],
    mandatoryChecks: ["Werkzeugwagen", "Müll", "Boden", "Lager", "Maschinen"],
    color: "text-muted-foreground",
    bg: "bg-secondary border-border",
  },
];

const CATEGORY_ICON = {
  Annahme: "🚗", Teile: "📦", Karosserie: "🔧", Vorbereitung: "⚡",
  Lackierung: "🎨", Finish: "✨", Kontrolle: "🔍", Übergabe: "🏆",
  Service: "💬", Ordnung: "🧹"
};

export default function SOPLibrary() {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("alle");

  const categories = ["alle", ...new Set(SOPS.map(s => s.category))];
  const filtered = filter === "alle" ? SOPS : SOPS.filter(s => s.category === filter);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">SOP-BIBLIOTHEK</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Standard Operating Procedures · Premium-Performance · {SOPS.length} Prozesse
        </p>
      </motion.div>

      {/* Mission statement */}
      <div className="bg-card border border-primary/20 rounded-xl p-5 mb-6">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground font-semibold">Das Herzstück der Qualität.</span>{" "}
          Ziel: Wissen aus Tonis Kopf in reproduzierbare Standards übertragen.
          Qualität ist nicht personenabhängig — sie ist <span className="text-primary font-medium">reproduzierbarer Standard</span>.
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium capitalize
              ${filter === cat ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-border/80 bg-card"}`}>
            {cat === "alle" ? `Alle (${SOPS.length})` : `${CATEGORY_ICON[cat] || ""} ${cat}`}
          </button>
        ))}
      </div>

      {/* SOP Cards */}
      <div className="space-y-3">
        {filtered.map((sop, i) => {
          const isOpen = expandedId === sop.id;
          return (
            <motion.div key={sop.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`bg-card border rounded-xl overflow-hidden transition-all ${sop.isPrimary ? "border-warning/30" : "border-border"}`}>

              <button onClick={() => setExpandedId(isOpen ? null : sop.id)}
                className="w-full flex items-center gap-4 p-4 md:p-5 hover:bg-secondary/30 transition-all text-left">
                <div className="text-2xl leading-none flex-shrink-0">{CATEGORY_ICON[sop.category] || "📋"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading text-sm text-foreground">
                      {String(sop.id).padStart(2, "0")} · {sop.title}
                    </span>
                    {sop.isPrimary && (
                      <span className="text-[9px] bg-warning/20 text-warning border border-warning/30 px-2 py-0.5 rounded-full font-semibold">
                        WICHTIGSTE SOP
                      </span>
                    )}
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${sop.bg} ${sop.color}`}>
                      {sop.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{sop.goal.split("·")[0].trim()}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" />{sop.responsible.join(", ")}</span>
                    <span className="flex items-center gap-1"><FileText className="w-2.5 h-2.5" />{sop.steps.length} Schritte</span>
                    <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5" />{sop.mandatoryChecks.length} Pflichtkontrollen</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border/50">
                    <div className="p-4 md:p-5 grid md:grid-cols-2 gap-5">

                      {/* Left */}
                      <div className="space-y-4">
                        {/* Ziel */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                            <Target className="w-3 h-3" /> Ziel
                          </p>
                          <p className="text-xs text-foreground leading-relaxed">{sop.goal}</p>
                        </div>

                        {/* Verantwortlich */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Verantwortlich
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {sop.responsible.map(r => (
                              <span key={r} className="text-xs bg-secondary border border-border px-2 py-1 rounded-lg font-medium text-foreground">{r}</span>
                            ))}
                          </div>
                        </div>

                        {/* Ablauf */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Ablauf
                          </p>
                          <div className="space-y-1.5">
                            {sop.steps.map((step, si) => (
                              <div key={si} className="flex items-start gap-2 text-xs text-foreground">
                                <span className={`w-4 h-4 rounded-full ${sop.bg} ${sop.color} text-[9px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5`}>
                                  {si + 1}
                                </span>
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="space-y-4">
                        {/* Qualitätsstandard */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                            <Star className="w-3 h-3" /> Qualitätsstandard
                          </p>
                          <p className="text-xs text-foreground bg-success/10 border border-success/20 rounded-lg p-3 leading-relaxed">
                            {sop.qualityStandard}
                          </p>
                        </div>

                        {/* Pflichtkontrollen */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Pflichtkontrollen
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {sop.mandatoryChecks.map(c => (
                              <span key={c} className="flex items-center gap-1 text-[10px] bg-secondary border border-border px-2 py-1 rounded-lg text-foreground">
                                <CheckCircle2 className="w-2.5 h-2.5 text-success" />{c}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Fehlerquellen */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Häufige Fehlerquellen
                          </p>
                          <div className="space-y-1">
                            {sop.errorSources.map(e => (
                              <div key={e} className="flex items-center gap-2 text-xs text-foreground">
                                <XCircle className="w-3 h-3 text-destructive flex-shrink-0" />{e}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}