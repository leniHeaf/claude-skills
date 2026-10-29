import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, Loader2, Sparkles, AlertTriangle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function AISchadenAnalyse() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
  };

  const analyze = async () => {
    if (!imageFile) return;
    setIsAnalyzing(true);
    setResult(null);

    const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Du bist ein Experte für Karosserie- und Lackschäden in einer Premium-Werkstatt.

Analysiere dieses Schadensfoto eines Fahrzeugs und gib eine strukturierte Einschätzung zurück.

Antworte NUR im folgenden JSON-Format:
{
  "schadentyp": "kurze Bezeichnung des Schadens",
  "schwere": "niedrig | mittel | hoch | kritisch",
  "betroffene_bauteile": ["Bauteil 1", "Bauteil 2"],
  "empfohlene_arbeiten": ["Arbeit 1", "Arbeit 2", "Arbeit 3"],
  "zeitaufwand_stunden": Zahl,
  "besonderheiten": "wichtige Hinweise oder leerer String",
  "versicherungsfall": true oder false,
  "zusammenfassung": "ein Satz Zusammenfassung"
}`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          schadentyp: { type: "string" },
          schwere: { type: "string" },
          betroffene_bauteile: { type: "array", items: { type: "string" } },
          empfohlene_arbeiten: { type: "array", items: { type: "string" } },
          zeitaufwand_stunden: { type: "number" },
          besonderheiten: { type: "string" },
          versicherungsfall: { type: "boolean" },
          zusammenfassung: { type: "string" },
        },
      },
    });

    setResult(response);
    setIsAnalyzing(false);
  };

  const severityColors = {
    niedrig: "bg-success/20 text-success border-success/30",
    mittel: "bg-warning/20 text-warning border-warning/30",
    hoch: "bg-destructive/20 text-destructive border-destructive/30",
    kritisch: "bg-destructive/30 text-destructive border-destructive/50",
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">SCHADENANALYSE</h1>
            <p className="text-sm text-muted-foreground">Foto → sofortige Einschätzung</p>
          </div>
        </div>
      </motion.div>

      {/* Upload Zone */}
      <div className="mb-6">
        <label className="block cursor-pointer">
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
          <div className={`border-2 border-dashed rounded-xl transition-all
            ${imagePreview ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-primary/30 hover:bg-secondary/50"}`}
          >
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Schadensfoto" className="w-full max-h-80 object-cover rounded-xl" />
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">Anderes Foto wählen</p>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Schadensfoto aufnehmen oder hochladen</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG · Kamera oder Galerie</p>
              </div>
            )}
          </div>
        </label>
      </div>

      {imagePreview && !isAnalyzing && !result && (
        <Button onClick={analyze} className="w-full bg-primary hover:bg-primary/80 gap-2 mb-6">
          <Sparkles className="w-4 h-4" />
          Analyse starten
        </Button>
      )}

      {/* Loading */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Analysiere den Schaden...</p>
            <p className="text-xs text-muted-foreground mt-1">Bauteile · Arbeiten · Zeitaufwand</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Summary */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading text-lg text-foreground">{result.schadentyp}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${severityColors[result.schwere] || severityColors.mittel}`}>
                      {result.schwere?.toUpperCase()}
                    </span>
                    {result.versicherungsfall && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-info/20 text-info border-info/30 border">
                        VERSICHERUNG
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{result.zusammenfassung}</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-xl">
                  <p className="font-heading text-xl text-foreground">{result.zeitaufwand_stunden}h</p>
                  <p className="text-[10px] text-muted-foreground">Aufwand</p>
                </div>
              </div>
            </div>

            {/* Affected Parts */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> BETROFFENE BAUTEILE
              </p>
              <div className="flex flex-wrap gap-2">
                {result.betroffene_bauteile?.map(part => (
                  <span key={part} className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                    {part}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Work */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-3 flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5" /> EMPFOHLENE ARBEITEN
              </p>
              <div className="space-y-2">
                {result.empfohlene_arbeiten?.map((work, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-secondary rounded-lg">
                    <span className="text-[10px] font-heading text-muted-foreground w-5 text-center">{i + 1}</span>
                    <span className="text-sm text-foreground">{work}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {result.besonderheiten && (
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-5">
                <p className="text-[11px] font-semibold tracking-wider text-warning uppercase mb-2">BESONDERHEITEN</p>
                <p className="text-sm text-foreground/80">{result.besonderheiten}</p>
              </div>
            )}

            <Button
              onClick={() => { setResult(null); setImagePreview(null); setImageFile(null); }}
              variant="outline"
              className="w-full border-border"
            >
              Neue Analyse
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}