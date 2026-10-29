import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertTriangle, Users, X,
  FileSpreadsheet, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CUSTOMER_TYPE_HINTS = {
  autohaus: ["autohaus", "auto center", "car", "händler", "BMW", "Mercedes", "VW", "Audi"],
  versicherung: ["versicherung", "insurance", "allianz", "huk", "axa", "zurich"],
  flotte: ["flotte", "leasing", "fleet", "fuhrpark"],
  premium: ["premium", "VIP", "vorzug"],
};

function guessCustomerType(name = "", notes = "") {
  const combined = `${name} ${notes}`.toLowerCase();
  for (const [type, keywords] of Object.entries(CUSTOMER_TYPE_HINTS)) {
    if (keywords.some(k => combined.includes(k.toLowerCase()))) return type;
  }
  return "privat";
}

function findDuplicates(newCustomer, existing) {
  const dupes = [];
  if (newCustomer.email && existing.some(c => c.email?.toLowerCase() === newCustomer.email.toLowerCase())) {
    dupes.push("gleiche E-Mail");
  }
  if (newCustomer.phone && existing.some(c => c.phone?.replace(/\s/g, "") === newCustomer.phone?.replace(/\s/g, ""))) {
    dupes.push("gleiche Telefonnummer");
  }
  if (newCustomer.name && existing.some(c => c.name?.toLowerCase() === newCustomer.name.toLowerCase())) {
    dupes.push("gleicher Name");
  }
  return dupes;
}

export default function KundenImport() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [skipped, setSkipped] = useState(new Set());

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("-created_date", 500),
  });

  const createCustomer = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
  });

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setParsed(null);
    setImportResult(null);
    setSkipped(new Set());
  };

  const analyzeFile = async () => {
    if (!file) return;
    setAnalyzing(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const prompt = `Du bist ein Datenimport-Experte. Analysiere die hochgeladene Datei (Excel, CSV, DAT-Export oder Autohausliste) und extrahiere alle Kundendatensätze.

Felder pro Kunde: Name/Firma, Telefon, E-Mail, Adresse, Kundennummer, Notizen, Fahrzeugkennzeichen falls vorhanden.

Falls Vor- und Nachname getrennt sind, kombiniere sie zu "Vorname Nachname".
Gib maximal 100 Datensätze zurück.

Antworte NUR mit dem JSON.`;

    const schema = {
      type: "object",
      properties: {
        customers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              phone: { type: "string" },
              email: { type: "string" },
              address: { type: "string" },
              customer_number: { type: "string" },
              notes: { type: "string" },
              license_plate: { type: "string" },
            }
          }
        },
        source_type: { type: "string", description: "Erkannte Quelle: excel, csv, dat, autohaus, versicherung, sonstiges" },
        total_rows: { type: "number" },
        notes: { type: "string" },
      }
    };

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [file_url],
      response_json_schema: schema,
    });

    // Enrich with duplicate detection and type guessing
    const enriched = (res.customers || []).map(c => ({
      ...c,
      _type: guessCustomerType(c.name, c.notes),
      _duplicates: findDuplicates(c, customers),
    }));

    setParsed({ ...res, customers: enriched });
    setAnalyzing(false);
  };

  const toggleSkip = (idx) => {
    setSkipped(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const doImport = async () => {
    if (!parsed) return;
    setImporting(true);

    const toImport = parsed.customers.filter((_, i) => !skipped.has(i));
    let created = 0;
    let failed = 0;

    for (const c of toImport) {
      if (!c.name?.trim()) { failed++; continue; }
      await createCustomer.mutateAsync({
        name: c.name.trim(),
        phone: c.phone || "",
        email: c.email || "",
        address: c.address || "",
        notes: [c.notes, c.customer_number ? `KdNr: ${c.customer_number}` : ""].filter(Boolean).join(" · "),
        customer_type: c._type,
        journey_stage: "erstkontakt",
        last_contact: new Date().toISOString().split("T")[0],
      });
      created++;
    }

    setImportResult({ created, skipped: skipped.size, failed });
    setImporting(false);
    queryClient.invalidateQueries({ queryKey: ["customers"] });
  };

  const dupeCount = parsed?.customers.filter(c => c._duplicates.length > 0).length || 0;
  const toImportCount = parsed ? parsed.customers.length - skipped.size : 0;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-1">KUNDENDATEN IMPORTIEREN</p>
        <p className="text-xs text-muted-foreground mb-4">Excel · CSV · DAT-Export · Autohausliste · Versicherungsimport</p>

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById("kunden-input").click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${dragOver ? "border-primary bg-primary/5" : file ? "border-success/40 bg-success/5" : "border-border hover:border-primary/30"}`}>
          <input id="kunden-input" type="file" accept=".xlsx,.xls,.csv,.txt,.pdf,.xml,.dat" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-success" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button onClick={e => { e.stopPropagation(); setFile(null); setParsed(null); }}
                className="ml-2 p-1 hover:bg-secondary rounded"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
            </div>
          ) : (
            <>
              <FileSpreadsheet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-foreground font-medium">Datei hochladen</p>
              <p className="text-xs text-muted-foreground mt-1">Excel, CSV, DAT oder PDF-Liste</p>
            </>
          )}
        </div>

        {file && !parsed && (
          <Button onClick={analyzeFile} disabled={analyzing} className="w-full mt-4 gap-2 font-heading tracking-wide">
            {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysiert Kundendaten...</> : <><Users className="w-4 h-4" /> KUNDENLISTE ANALYSIEREN</>}
          </Button>
        )}
      </div>

      {analyzing && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Loader2 className="w-7 h-7 text-primary animate-spin mx-auto mb-2" />
          <p className="text-sm text-foreground font-medium">Analysiert Kundendaten...</p>
          <p className="text-xs text-muted-foreground mt-1">Namen, Telefon, E-Mail, Adressen werden erkannt</p>
        </div>
      )}

      <AnimatePresence>
        {parsed && !importResult && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="font-heading text-2xl text-foreground">{parsed.customers.length}</p>
                <p className="text-[10px] text-muted-foreground">Erkannte Kunden</p>
              </div>
              <div className={`rounded-xl p-3 text-center border ${dupeCount > 0 ? "bg-warning/10 border-warning/30" : "bg-card border-border"}`}>
                <p className={`font-heading text-2xl ${dupeCount > 0 ? "text-warning" : "text-foreground"}`}>{dupeCount}</p>
                <p className="text-[10px] text-muted-foreground">Mögliche Dubletten</p>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
                <p className="font-heading text-2xl text-primary">{toImportCount}</p>
                <p className="text-[10px] text-muted-foreground">Werden importiert</p>
              </div>
            </div>

            {parsed.source_type && (
              <p className="text-xs text-muted-foreground">Erkannte Quelle: <span className="text-foreground">{parsed.source_type}</span>
                {parsed.total_rows && ` · ${parsed.total_rows} Zeilen in Datei`}
              </p>
            )}

            {/* Customer List */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-3">
                VORSCHAU · {toImportCount} werden importiert
              </p>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {parsed.customers.map((c, i) => {
                  const isSkipped = skipped.has(i);
                  const hasDupe = c._duplicates.length > 0;
                  return (
                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all
                      ${isSkipped ? "opacity-40 border-border bg-secondary" : hasDupe ? "border-warning/30 bg-warning/5" : "border-border bg-secondary"}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium text-foreground truncate">{c.name || "—"}</p>
                          <span className="text-[9px] px-1.5 py-0.5 bg-card rounded text-muted-foreground">{c._type}</span>
                          {hasDupe && !isSkipped && (
                            <span className="text-[9px] text-warning flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> {c._duplicates.join(", ")}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {[c.phone, c.email].filter(Boolean).join(" · ") || "Keine Kontaktdaten"}
                        </p>
                      </div>
                      <button onClick={() => toggleSkip(i)}
                        className={`text-[10px] px-2 py-1 rounded-lg border flex-shrink-0 transition-all
                          ${isSkipped ? "border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-destructive hover:border-destructive/30"}`}>
                        {isSkipped ? "+ Import" : "Überspringen"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button onClick={doImport} disabled={importing || toImportCount === 0} className="w-full gap-2 font-heading tracking-wide h-10">
              {importing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Importiere...</>
                : <><Plus className="w-4 h-4" /> {toImportCount} KUNDEN IMPORTIEREN</>}
            </Button>
          </motion.div>
        )}

        {importResult && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-success/10 border border-success/20 rounded-xl p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-3" />
            <p className="text-lg font-heading text-success">{importResult.created} Kunden importiert</p>
            <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
              {importResult.skipped > 0 && <span>{importResult.skipped} übersprungen</span>}
              {importResult.failed > 0 && <span className="text-destructive">{importResult.failed} fehlgeschlagen</span>}
            </div>
            <Button variant="outline" className="mt-4 border-border" onClick={() => { setParsed(null); setFile(null); setImportResult(null); }}>
              Weiteren Import starten
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}