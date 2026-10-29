import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, X, Euro, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import DATTaskCard from "../components/dat/DATTaskCard";
import DATImportHistory from "../components/dat/DATImportHistory";
import SmartAssignPanel from "../components/dat/SmartAssignPanel";
import DATPartsLookup from "../components/dat/DATPartsLookup";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];
const HOURLY_RATE = 95; // € pro Stunde — Arbeitskostensatz

export default function DATImport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState("import");
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [vehicleId, setVehicleId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [approving, setApproving] = useState(false);
  const [taskAssignments, setTaskAssignments] = useState({});
  const [error, setError] = useState("");

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-dat"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 100),
  });

  const { data: imports = [] } = useQuery({
    queryKey: ["dat-imports"],
    queryFn: () => base44.entities.DATImport.list("-created_date", 50),
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["dat-time-entries"],
    queryFn: () => base44.entities.TimeEntry.list("-created_date", 300),
  });

  const { data: errorReports = [] } = useQuery({
    queryKey: ["dat-error-reports"],
    queryFn: () => base44.entities.ErrorReport.list("-created_date", 100),
  });

  const { data: scores = [] } = useQuery({
    queryKey: ["dat-scores"],
    queryFn: () => base44.entities.PerformanceScore.list("-month", 100),
  });

  const createImport = useMutation({
    mutationFn: (data) => base44.entities.DATImport.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dat-imports"] }),
  });

  const createTask = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setAnalysisResult(null);
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const analyzeFile = async () => {
    if (!file) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    setError("");

    let fileUrl = null;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      fileUrl = file_url;

      const prompt = `Du bist ein erfahrener Kfz-Sachbearbeiter und Kalkulationsexperte für eine Premium-Karosserie & Lackiererei (Täubert One).

Analysiere die hochgeladene Datei (DAT-Kalkulation, Kostenvoranschlag, Schadensgutachten oder Schadensprotokoll) und extrahiere:

1. FAHRZEUGDATEN:
   - Marke (z.B. BMW, Audi, Mercedes-Benz)
   - Modell (z.B. 320d, A4 Avant, C-Klasse)
   - Kennzeichen (Format: XX-XX-XXXX)
   - Kundenname (Privatperson oder Versicherung/Gutachter)
   - Schadennummer (falls vorhanden)
   - Versicherung (falls vorhanden)
   - FIN/Fahrgestellnummer (17 Stellen, falls erkennbar)

2. ARBEITSPOSITIONEN — Alle Arbeitsschritte als separate Aufgaben:
   - Bereich: demontage (Demontage/Zerlegen), karosserie (Blecharbeiten/Richten/Schweißen), vorbereitung (Spachteln/Schleifen/Abkleben), lackierung (Lackieren/Klarlack), finish (Polieren/Zusammenbau/Montage), reinigung (Reinigung/Aufbereitung), sonstiges
   - Geschätzte Zeit in Stunden (AW = Arbeitseinheit: 1 AW = 5 Minuten = 0.083h → z.B. 12 AW = 1.0h)
   - Priorität: kritisch (Rahmenteile/Sicherheit), hoch (Sichtteile/Hauptarbeiten), mittel (Standardarbeiten), niedrig (Nebenaufgaben)
   - DAT-Position (Originaltext aus der Kalkulation)

3. TEILE: Ersatzteile mit Teilenummer und Listenpreis in Euro (falls in der Datei enthalten)

4. ZUSAMMENFASSUNG:
   - total_hours: Summe aller Arbeitsstunden
   - total_parts_cost: Summe aller Teilekosten in Euro
   - damage_areas: Liste der Schadensbereiche (z.B. "Stoßfänger vorne", "Motorhaube", "Kotflügel links")
   - notes: Besondere Hinweise (z.B. "Rahmenschaden", "E-Teil erforderlich", "Mehrarbeit wahrscheinlich")

REGELN:
- Jede sinnvolle Arbeitsposition wird EINE eigene Aufgabe — nicht zusammenfassen
- Bei unklaren Zeiten: 1.0h als Standard annehmen
- Demontage immer VOR Karosseriearbeiten, Lackierung immer NACH Vorbereitung
- Reinigung/Finish immer als letzte Aufgabe
- Falls keine Daten erkennbar: leere Arrays zurückgeben, nicht erfinden

WICHTIG: Antworte NUR mit dem JSON-Objekt, keine Erklärungen, kein Markdown.`;

      const schema = {
        type: "object",
        properties: {
          vehicle: {
            type: "object",
            properties: {
              make: { type: "string" },
              model: { type: "string" },
              license_plate: { type: "string" },
              customer_name: { type: "string" },
              damage_number: { type: "string" },
              insurance: { type: "string" },
              vin: { type: "string" }
            }
          },
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                area: { type: "string", enum: ["demontage", "karosserie", "vorbereitung", "lackierung", "finish", "reinigung", "sonstiges"] },
                estimated_hours: { type: "number" },
                priority: { type: "string", enum: ["niedrig", "mittel", "hoch", "kritisch"] },
                category: { type: "string" },
                dat_position: { type: "string" }
              }
            }
          },
          parts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                part_number: { type: "string" },
                price: { type: "number" }
              }
            }
          },
          summary: {
            type: "object",
            properties: {
              total_hours: { type: "number" },
              total_parts_cost: { type: "number" },
              damage_areas: { type: "array", items: { type: "string" } },
              notes: { type: "string" }
            }
          }
        }
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [fileUrl],
        response_json_schema: schema,
        model: "gpt_5_mini",
      });

      setAnalysisResult(result);
      setAnalyzing(false);
    } catch (err) {
      console.error("DAT-Analyse fehlgeschlagen:", err);
      setError(`Analyse fehlgeschlagen: ${err.message || "Unbekannter Fehler"}. Bitte Datei prüfen und erneut versuchen.`);
      setAnalyzing(false);
    }
  };

  const approveAndCreateTasks = async () => {
    if (!analysisResult) return;
    setApproving(true);
    setError("");

    try {
      let vehicleIdToUse = vehicleId;
      let vehicleInfo = "";

      // Auto-create vehicle & customer if not selected
      if (!vehicleIdToUse && analysisResult.vehicle) {
        const v = analysisResult.vehicle;
        const customerName = v.customer_name || "Unbekannt";

        const existingCustomers = await base44.entities.Customer.filter({ name: customerName });

        const customerPromise = existingCustomers[0]?.id
          ? Promise.resolve()
          : base44.entities.Customer.create({
              name: customerName,
              phone: "",
              email: "",
              customer_type: v.insurance ? "versicherung" : "privat",
              notes: v.damage_number ? `Schadennummer: ${v.damage_number}` : "",
            });

        const vehiclePromise = base44.entities.Vehicle.create({
          customer_name: customerName,
          license_plate: v.license_plate || "",
          make: v.make || "",
          model: v.model || "",
          vin: v.vin || "",
          insurance: v.insurance || "",
          damage_description: "",
          status: "annahme",
          condition: "in_arbeit",
          notes: v.damage_number ? `Schadennummer: ${v.damage_number}, Versicherung: ${v.insurance}` : "",
        });

        const [, newVehicle] = await Promise.all([customerPromise, vehiclePromise]);
        vehicleIdToUse = newVehicle.id;
        vehicleInfo = `${newVehicle.make} ${newVehicle.model} - ${newVehicle.license_plate}`;
      } else {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        vehicleInfo = vehicle ? `${vehicle.make} ${vehicle.model} - ${vehicle.license_plate}` : "";
      }

      const categoryMap = {
        demontage: "karosserie", karosserie: "karosserie", vorbereitung: "vorbereitung",
        lackierung: "lackierung", finish: "finish", reinigung: "reinigung", sonstiges: "sonstiges"
      };

      const allTasks = [
        ...(analysisResult.tasks || []).map((t) => ({
          title: t.title,
          description: t.dat_position ? `DAT-Position: ${t.dat_position} | Geplant: ${t.estimated_hours?.toFixed(1) || "?"}h` : `Geplant: ${t.estimated_hours?.toFixed(1) || "?"}h`,
          vehicle_id: vehicleIdToUse,
          vehicle_info: vehicleInfo,
          category: categoryMap[t.area] || "sonstiges",
          priority: t.priority || "mittel",
          status: "offen",
          assigned_to: taskAssignments[t.title] || "",
          comments: `DAT-Import | Bereich: ${t.area} | Geplante Zeit: ${t.estimated_hours?.toFixed(1) || "?"}h`,
        })),
        {
          title: "Rechnung erstellen & prüfen",
          description: `Rechnung für DAT-Import: ${analysisResult.vehicle?.customer_name || ""} | ${analysisResult.vehicle?.make || ""} ${analysisResult.vehicle?.model || ""} | Schadennummer: ${analysisResult.vehicle?.damage_number || "–"}`,
          vehicle_id: vehicleIdToUse,
          vehicle_info: vehicleInfo,
          category: "sonstiges",
          priority: "hoch",
          status: "offen",
          assigned_to: "Toni, Lena",
          comments: "Automatisch erstellt bei DAT-Import | Rechnung prüfen und freigeben",
        },
      ];

      await Promise.all([
        createImport.mutateAsync({
          vehicle_id: vehicleIdToUse,
          vehicle_info: vehicleInfo,
          customer_name: analysisResult.vehicle?.customer_name || "",
          damage_number: analysisResult.vehicle?.damage_number || "",
          insurance: analysisResult.vehicle?.insurance || "",
          total_hours: analysisResult.summary?.total_hours || 0,
          total_parts_cost: analysisResult.summary?.total_parts_cost || 0,
          task_count: analysisResult.tasks?.length || 0,
          status: "freigegeben",
          raw_data: JSON.stringify(analysisResult),
        }),
        base44.entities.Task.bulkCreate(allTasks),
      ]);

      setApproving(false);
      setAnalysisResult(null);
      setFile(null);
      setVehicleId("");
      setTaskAssignments({});
      queryClient.invalidateQueries({ queryKey: ["dat-imports"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      const taskCount = (analysisResult.tasks || []).length + 1;
      const totalHours = analysisResult.summary?.total_hours || 0;
      toast({
        title: "Import freigegeben",
        description: `${taskCount} Aufgaben erstellt · ${totalHours.toFixed(1)}h geplant · ${vehicleInfo}`,
      });

      setTab("history");
    } catch (err) {
      console.error("DAT-Freigabe fehlgeschlagen:", err);
      setError(`Freigabe fehlgeschlagen: ${err.message || "Unbekannter Fehler"}`);
      setApproving(false);
    }
  };

  const AREA_COLORS = {
    demontage: "text-chart-5 bg-chart-5/10 border-chart-5/20",
    karosserie: "text-chart-4 bg-chart-4/10 border-chart-4/20",
    vorbereitung: "text-chart-3 bg-chart-3/10 border-chart-3/20",
    lackierung: "text-chart-1 bg-chart-1/10 border-chart-1/20",
    finish: "text-chart-2 bg-chart-2/10 border-chart-2/20",
    reinigung: "text-muted-foreground bg-secondary border-border",
    sonstiges: "text-muted-foreground bg-secondary border-border",
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">DAT IMPORT</h1>
        <p className="text-sm text-muted-foreground mt-1">Kalkulation hochladen · Analysiert · Aufgaben erstellen</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6 w-fit">
        {[
          { key: "import", label: "Neuer Import" },
          { key: "history", label: `Historie (${imports.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "import" && (
        <div className="space-y-5">
          {/* Step 1: Upload */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-heading">1</div>
              <p className="font-semibold text-sm text-foreground">DAT-Kalkulation hochladen</p>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${dragOver ? "border-primary bg-primary/5" : file ? "border-success/40 bg-success/5" : "border-border hover:border-primary/40"}`}
              onClick={() => document.getElementById("dat-file-input").click()}>
              <input id="dat-file-input" type="file" className="hidden"
                accept=".pdf,.xml,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.dat,.txt"
                onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setAnalysisResult(null); }}
                    className="ml-2 p-1 hover:bg-secondary rounded"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-foreground font-medium mb-1">Datei hierher ziehen oder klicken</p>
                  <p className="text-xs text-muted-foreground">PDF, XML, Excel, Foto/Scan, DAT-Datei</p>
                </>
              )}
            </div>

            {file && !analysisResult && !analyzing && (
              <Button onClick={analyzeFile} disabled={analyzing} className="w-full mt-4 h-10 font-heading tracking-wide gap-2">
                <FileText className="w-4 h-4" /> KALKULATION ANALYSIEREN
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Fehler aufgetreten</p>
                <p className="text-xs text-destructive/80 mt-0.5">{error}</p>
              </div>
              <button onClick={() => setError("")} className="p-1 hover:bg-secondary rounded">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Loading */}
          {analyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-card border border-border rounded-xl p-8 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Analysiert Kalkulation...</p>
              <p className="text-xs text-muted-foreground">Fahrzeugdaten, Arbeitspositionen und Zeiten werden erkannt</p>
            </motion.div>
          )}

          {/* Step 2+3: Results */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                {/* Vehicle Info */}
                {analysisResult.vehicle && Object.values(analysisResult.vehicle).some(Boolean) && (
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-heading">2</div>
                      <p className="font-semibold text-sm text-foreground">Erkannte Fahrzeugdaten</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { label: "Fahrzeug", value: `${analysisResult.vehicle.make || ""} ${analysisResult.vehicle.model || ""}`.trim() },
                        { label: "Kennzeichen", value: analysisResult.vehicle.license_plate },
                        { label: "Kunde", value: analysisResult.vehicle.customer_name },
                        { label: "Schadennummer", value: analysisResult.vehicle.damage_number },
                        { label: "Versicherung", value: analysisResult.vehicle.insurance },
                        { label: "FIN", value: analysisResult.vehicle.vin },
                      ].filter(f => f.value).map(f => (
                        <div key={f.label} className="p-3 bg-secondary rounded-lg">
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">{f.label}</p>
                          <p className="text-xs font-medium text-foreground truncate">{f.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {analysisResult.summary && (() => {
                  const totalHours = analysisResult.summary.total_hours || 0;
                  const partsCost = analysisResult.summary.total_parts_cost || 0;
                  const laborCost = totalHours * HOURLY_RATE;
                  const totalCost = laborCost + partsCost;

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-card border border-border rounded-xl p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Aufgaben</p>
                        <p className="font-heading text-2xl text-chart-1">{analysisResult.tasks?.length || 0}</p>
                      </div>
                      <div className="bg-card border border-border rounded-xl p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Geplante Std</p>
                        <p className="font-heading text-2xl text-chart-2">{totalHours.toFixed(1)}h</p>
                      </div>
                      <div className="bg-card border border-border rounded-xl p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Arbeitskosten</p>
                        <p className="font-heading text-xl text-chart-3 flex items-center justify-center gap-0.5">
                          <Euro className="w-3.5 h-3.5" />{laborCost.toFixed(0)}
                        </p>
                      </div>
                      <div className="bg-card border border-primary/20 rounded-xl p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Gesamt (ca.)</p>
                        <p className="font-heading text-xl text-primary flex items-center justify-center gap-0.5">
                          <Euro className="w-3.5 h-3.5" />{totalCost.toFixed(0)}
                        </p>
                        {partsCost > 0 && (
                          <p className="text-[9px] text-muted-foreground mt-0.5">+ {partsCost.toFixed(0)}€ Teile</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Task Preview */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-heading">3</div>
                    <p className="font-semibold text-sm text-foreground">Aufgabenvorschläge</p>
                    <span className="text-xs text-muted-foreground ml-auto">Klick zum Bearbeiten · Hover zum Löschen</span>
                  </div>

                  {analysisResult.summary?.damage_areas?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {analysisResult.summary.damage_areas.map((area, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{area}</span>
                      ))}
                    </div>
                  )}

                  {analysisResult.summary?.notes && (
                    <div className="flex items-start gap-2 p-2.5 bg-warning/5 border border-warning/20 rounded-lg mb-3">
                      <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-warning/90">{analysisResult.summary.notes}</p>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {(analysisResult.tasks || []).map((task, i) => (
                      <DATTaskCard
                        key={i}
                        task={task}
                        areaColors={AREA_COLORS}
                        onEdit={(updated) => {
                          setAnalysisResult(prev => ({
                            ...prev,
                            tasks: prev.tasks.map((t, idx) => idx === i ? updated : t),
                            summary: {
                              ...prev.summary,
                              total_hours: prev.tasks.reduce((s, t, idx) => s + (idx === i ? (updated.estimated_hours || 0) : (t.estimated_hours || 0)), 0)
                            }
                          }));
                        }}
                        onRemove={() => {
                          setAnalysisResult(prev => ({
                            ...prev,
                            tasks: prev.tasks.filter((_, idx) => idx !== i),
                            summary: {
                              ...prev.summary,
                              total_hours: prev.tasks.filter((_, idx) => idx !== i).reduce((s, t) => s + (t.estimated_hours || 0), 0)
                            }
                          }));
                        }}
                      />
                    ))}
                    {(!analysisResult.tasks || analysisResult.tasks.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">Keine Aufgaben erkannt. Bitte Datei prüfen oder neu analysieren.</p>
                    )}
                  </div>

                  {/* Re-analyze */}
                  <div className="flex justify-center pt-2">
                    <Button onClick={analyzeFile} disabled={analyzing} variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground">
                      <RotateCcw className="w-3 h-3" /> Neu analysieren
                    </Button>
                  </div>

                  {/* Parts */}
                  {analysisResult.parts && analysisResult.parts.length > 0 && (
                    <div className="border-t border-border pt-4 mt-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">ERKANNTE TEILE</p>
                      <div className="space-y-1">
                        {analysisResult.parts.map((part, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                            <span className="text-foreground">{part.name}</span>
                            <div className="flex gap-3 text-muted-foreground">
                              {part.part_number && <span className="font-mono">{part.part_number}</span>}
                              {part.price > 0 && <span className="text-chart-3">{part.price.toFixed(2)} €</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* DAT Parts Lookup (Hybrid) */}
                {vehicleId && (
                  <DATPartsLookup
                    vehicle={vehicles.find(v => v.id === vehicleId) || analysisResult.vehicle}
                    onPartsSelected={(parts) => {
                      // Merge with existing parts
                      setAnalysisResult(prev => ({
                        ...prev,
                        parts: parts,
                        summary: {
                          ...prev.summary,
                          total_parts_cost: parts.reduce((sum, p) => sum + (p.price || 0), 0)
                        }
                      }));
                    }}
                  />
                )}

                {/* Step 4b: Smart Assign */}
                {analysisResult.tasks && analysisResult.tasks.length > 0 && (
                  <SmartAssignPanel
                    tasks={analysisResult.tasks}
                    scores={scores}
                    timeEntries={timeEntries}
                    errorReports={errorReports}
                    vehicle={vehicles.find(v => v.id === vehicleId) || analysisResult.vehicle}
                    onAssign={(title, emp) => setTaskAssignments(prev => ({ ...prev, [title]: emp }))}
                  />
                )}

                {/* Step 5: Assign to vehicle & approve */}
                <div className="bg-card border border-primary/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-heading">4</div>
                    <p className="font-semibold text-sm text-foreground">Fahrzeug zuweisen & freigeben</p>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg mb-4 text-xs text-success">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {vehicleId ? `Fahrzeug gewählt: ${vehicles.find(v => v.id === vehicleId)?.license_plate || ""}` : "Automatisch: Fahrzeug & Kunde werden neu angelegt"}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Fahrzeug auswählen (optional)</label>
                      <Select value={vehicleId} onValueChange={setVehicleId}>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Bestehendes Fahrzeug wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map(v => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.make} {v.model} – {v.license_plate} ({v.customer_name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Leer lassen → Fahrzeug & Kunde werden automatisch angelegt
                      </p>
                    </div>

                    <Button
                      onClick={approveAndCreateTasks}
                      disabled={approving || (analysisResult.tasks || []).length === 0}
                      className="w-full h-10 font-heading tracking-wide gap-2">
                      {approving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Aufgaben werden erstellt...</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> {(analysisResult.tasks || []).length} AUFGABEN FREIGEBEN & ERSTELLEN</>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {tab === "history" && (
        <DATImportHistory imports={imports} vehicles={vehicles} />
      )}
    </div>
  );
}