import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ScanSearch, Loader2, Check, AlertTriangle, Sparkles, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { GEWERK_LABEL, formatStunden, formatEuro } from "@/lib/kalkulationUtils";

/**
 * SchadenAnalyse
 * Analysiert hochgeladene Schadensfotos per KI und schlägt passende
 * Reparaturpositionen aus dem Richtzeiten-Katalog vor (Teile-Auswahl
 * wie beim DAT-Import).
 */
export default function SchadenAnalyse({ photos, positionen, onApply, stundenloehne }) {
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [chosen, setChosen] = useState({});

  const analyze = async () => {
    if (!photos || photos.length === 0) {
      toast({ title: "Keine Fotos", description: "Bitte zuerst Schadensfotos hochladen.", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    setResult(null);
    setChosen({});
    try {
      const katalog = positionen
        .map(p => `${p.id}|${p.bezeichnung}|${p.gewerk}|${p.positionstyp || "Arbeitszeit"}|${p.richtzeit_ah || 0}AH|lack${p.lackmaterial_kosten || 0}`)
        .join("\n");

      const prompt = `Du bist Kfz-Schadengutachter in einer Karosserie- & Lackiererei. Du analysierst Schadensfotos präzise und kennst die fachlichen Arbeitsabläufe.

SCHRITT 1 — Sorgfältige Foto-Analyse (gehe in dieser Reihenfolge vor):
Betrachte jedes Foto genau. Bestimme zuerst:
- Fahrzeug-Seite (links/rechts) und Ansicht (vorn/hinten/seitlich/drauf).
- Jedes einzeln betroffene Bauteil (Stoßfänger, Kotflügel, Tür, Motorhaube, Kofferraumdeckel, Spiegel, Scheinwerfer, Heckklappe, Schweller, Dach …).
- Schadensart pro Bauteil: Delle/Beule, Kratzer, Riss, Bruch, verbeult, lackbeschädigt, eingedrückt.
- Ob LACKIERUNG nötig ist (Lackschaden/Neulackierung) oder NUR Karosserie/Behebung.
- Ob ein Teil AUSGETAUSCHT (Ersatzteil) oder INSTANDSETZT (repariert) werden muss.
Leite daraus die betroffenen Bauteile und die Schadensart ab. Nicht raten — nur was auf den Fotos sichtbar ist.

SCHRITT 2 — Zuordnung zum Katalog.
Wähle aus dem Katalog passend zu JEDEM erkannten Bauteil & Schaden die richtige Position. Pro Bauteil: 1 Arbeits-Position (Karosserie-Richten ODER Lackieren), plus Ersatzteil falls Teil getauscht wird.

RICHTZEITEN-KATALOG (id|bezeichnung|gewerk|positionstyp|richtzeit|lackmaterial):
${katalog}

FACHWISSEN LACKIERUNG — zwingende Vorarbeiten:
- Jedes zu lackierende Bauteil muss vorher ausgebaut/zerlegt werden. Zu jeder Lackier-Position (LK-…) MUSS die zugehörige DM-Ausbau-Position in gleicher Menge mit vorgeschlagen werden:
  · LK-003 Tür lackieren → DM-001 + DM-007 + DM-008 + DM-009
  · LK-002 Kotflügel lackieren → DM-002 + DM-012
  · LK-004 Motorhaube lackieren → DM-003 + DM-013
  · LK-005 Kofferraumdeckel lackieren → DM-004 + DM-014
  · LK-001 Stoßstange lackieren → DM-005
  · LK-006 Dach lackieren → DM-013 ggf. + DM-014
  · Spiegel/Umfeld → DM-006
- Angrenzend an Scheinwerfer/Rücklicht zusätzlich DM-010.
- Ablendung (AB-001) NICHT vorschlagen — wird automatisch ergänzt.
- Niemals Lackier-Position ohne zugehörige DM-Vorarbeiten.

Antworte NUR als JSON:
- bereich: "front"|"heck"|"seite_links"|"seite_rechts"|"dach"|"motorraum"|"innenraum"
- schadenbereiche: betroffene Bauteile als Freitext, pro Bauteil mit Seite (z.B. "Kotflügel vorne links")
- beschreibung: präzise Schadensbeschreibung (welche Bauteile, welche Schadensart, ob Lack/Teiletausch nötig)
- vorschlaege: [{ position_id (aus Katalog), menge, bemerkung }]

REGELN:
- NUR position_id-Werte aus dem Katalog verwenden.
- Menge = Anzahl betroffener Bauteile (min. 1).
- Bei jeder Lackier-Position alle zugehörigen DM-Vorarbeiten in gleicher Menge.
- Bei reinen Karosserie-Beulen OHNE Lackschaden KEINE Lackier-/DM-Positionen vorschlagen.
- Bei unklaren Fotos: nur erkennen, was sicher sichtbar ist, Rest weglassen.`;

      const schema = {
        type: "object",
        properties: {
          bereich: { type: "string", enum: ["front", "heck", "seite_links", "seite_rechts", "dach", "motorraum", "innenraum"] },
          schadenbereiche: { type: "array", items: { type: "string" } },
          beschreibung: { type: "string" },
          vorschlaege: {
            type: "array",
            items: {
              type: "object",
              properties: {
                position_id: { type: "string" },
                menge: { type: "number" },
                bemerkung: { type: "string" },
              },
            },
          },
        },
      };

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: photos,
        response_json_schema: schema,
        model: "gemini_3_flash",
      });

      const data = res?.data ?? res;

      const vorschlaege = (data.vorschlaege || [])
        .map(v => {
          const pos = positionen.find(p => p.id === v.position_id);
          if (!pos) return null;
          return {
            position_id: pos.id,
            bezeichnung: pos.bezeichnung,
            gewerk: pos.gewerk,
            positionstyp: pos.positionstyp || "Arbeitszeit",
            richtzeit_ah: pos.richtzeit_ah || 0,
            ersatzteil_kosten: pos.ersatzteil_kosten || 0,
            lackmaterial_kosten: pos.lackmaterial_kosten || 0,
            menge: Math.max(1, Number(v.menge) || 1),
            bemerkung: v.bemerkung || "",
          };
        })
        .filter(Boolean);

      const enriched = { ...data, vorschlaege };
      const pre = {};
      vorschlaege.forEach(v => { pre[v.position_id] = v; });
      setChosen(pre);
      setResult(enriched);
    } catch (err) {
      toast({ title: "Analyse fehlgeschlagen", description: "Schadensfotos konnten nicht analysiert werden.", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleVorschlag = (v) => {
    setChosen(prev => {
      const next = { ...prev };
      if (next[v.position_id]) delete next[v.position_id];
      else next[v.position_id] = v;
      return next;
    });
  };

  const updateMenge = (id, menge) => {
    setChosen(prev => prev[id] ? { ...prev, [id]: { ...prev[id], menge: Math.max(1, Number(menge) || 1) } } : prev);
  };

  const apply = () => {
    const selected = Object.values(chosen);
    if (selected.length === 0) {
      toast({ title: "Nichts ausgewählt", description: "Bitte mindestens einen Vorschlag auswählen.", variant: "destructive" });
      return;
    }
    onApply({
      positionen: selected,
      beschreibung: result.beschreibung || "",
      bereich: result.bereich || "",
      schadenbereiche: result.schadenbereiche || [],
    });
    toast({ title: "Vorschläge übernommen", description: `${selected.length} Positionen in die Kalkulation übernommen.` });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanSearch className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-semibold text-foreground">Schadenfoto-Analyse</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={analyze} disabled={analyzing || !photos || photos.length === 0} className="gap-1.5">
          {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {result ? "Neu analysieren" : "Schaden analysieren"}
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground -mt-1 flex items-center gap-1">
        <Droplet className="w-3 h-3" />
        Bei Lackierungen werden Ausbau & Demontage (Tür, Verkleidung, Griffe etc.) automatisch als Vorarbeiten berücksichtigt.
      </p>

      <AnimatePresence>
        {analyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Schadensfotos werden analysiert…</p>
          </motion.div>
        )}

        {result && !analyzing && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {result.schadenbereiche?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.schadenbereiche.map((b, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{b}</span>
                ))}
              </div>
            )}

            {result.beschreibung && (
              <p className="text-xs text-muted-foreground p-2.5 rounded-lg bg-secondary/40 border border-border/50">{result.beschreibung}</p>
            )}

            <div className="space-y-1.5">
              {result.vorschlaege.length === 0 ? (
                <div className="flex items-start gap-2 p-2.5 bg-warning/5 border border-warning/20 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-warning/90">Keine passenden Katalog-Positionen erkannt. Bitte manuell in Schritt 3 auswählen.</p>
                </div>
              ) : (
                result.vorschlaege.map(v => {
                  const isChosen = !!chosen[v.position_id];
                  return (
                    <div key={v.position_id} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${isChosen ? "border-primary bg-primary/5" : "border-border"}`}>
                      <button type="button" onClick={() => toggleVorschlag(v)} className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${isChosen ? "bg-primary border-primary" : "border-border"}`}>
                        {isChosen && <Check className="w-3 h-3 text-primary-foreground" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{v.bezeichnung}</p>
                        <p className="text-[10px] text-muted-foreground">{GEWERK_LABEL[v.gewerk]} · {formatStunden(v.richtzeit_ah)}{v.lackmaterial_kosten ? ` · ${formatEuro(v.lackmaterial_kosten)}` : ""}</p>
                        {v.bemerkung && <p className="text-[10px] text-muted-foreground italic mt-0.5">{v.bemerkung}</p>}
                      </div>
                      {isChosen && <Input type="number" min={1} value={v.menge} onChange={e => updateMenge(v.position_id, e.target.value)} className="w-14 h-8 text-xs px-2" />}
                    </div>
                  );
                })
              )}
            </div>

            {result.vorschlaege.length > 0 && (
              <Button type="button" onClick={apply} className="w-full gap-1.5">
                <Check className="w-4 h-4" /> {Object.keys(chosen).length} Vorschläge übernehmen
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}