import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, CheckCircle2, ScanLine, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FahrzeugscheinScan() {
  const queryClient = useQueryClient();
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const createVehicle = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });
  const createCustomer = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  const handleFile = async (file) => {
    if (!file) return;
    setImage(file);
    setResult(null);
    setCreated(false);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const scan = async () => {
    if (!image) return;
    setScanning(true);
    setResult(null);

    const { file_url } = await base44.integrations.Core.UploadFile({ file: image });

    const prompt = `Du bist ein OCR-Experte für Kfz-Zulassungsdokumente.

Analysiere dieses Bild eines deutschen Fahrzeugscheins (Zulassungsbescheinigung Teil I oder Teil II) und extrahiere alle erkennbaren Daten.

Felder im deutschen Fahrzeugschein:
- A = Kennzeichen
- B = Erstzulassung
- C = Halter (Name, Adresse)
- D.1 = Fabrikmarke (Hersteller)
- D.2 = Typ
- D.3 = Handelsname
- E = FIN/VIN
- F = Gesamtgewicht
- J = Fahrzeugklasse
- K = Typschlüsselnummer
- P.1 = Hubraum
- P.2 = Leistung (kW)
- S.1 = Sitzplätze
- Falls Fahrzeugbrief: alle verfügbaren Daten extrahieren

Antworte NUR mit dem JSON.`;

    const schema = {
      type: "object",
      properties: {
        license_plate: { type: "string", description: "Kennzeichen (Feld A)" },
        first_registration: { type: "string", description: "Erstzulassung (Feld B)" },
        holder_name: { type: "string", description: "Name des Halters (Feld C)" },
        holder_address: { type: "string", description: "Adresse des Halters" },
        make: { type: "string", description: "Hersteller/Fabrikmarke (D.1)" },
        type_model: { type: "string", description: "Typ/Modell (D.2)" },
        trade_name: { type: "string", description: "Handelsname (D.3)" },
        vin: { type: "string", description: "FIN/VIN (Feld E)" },
        vehicle_class: { type: "string", description: "Fahrzeugklasse (Feld J)" },
        displacement_cc: { type: "string", description: "Hubraum ccm (P.1)" },
        power_kw: { type: "string", description: "Leistung kW (P.2)" },
        color: { type: "string", description: "Farbe falls sichtbar" },
        confidence: { type: "string", enum: ["hoch", "mittel", "niedrig"], description: "Erkennungsqualität" },
        notes: { type: "string", description: "Hinweise oder unleserliche Felder" },
      }
    };

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [file_url],
      response_json_schema: schema,
    });

    setResult(res);
    setScanning(false);
  };

  const handleCreate = async () => {
    if (!result) return;
    setCreating(true);

    let customer = null;
    if (result.holder_name?.trim()) {
      customer = await createCustomer.mutateAsync({
        name: result.holder_name.trim(),
        address: result.holder_address || "",
        customer_type: "privat",
        journey_stage: "annahme",
        last_contact: new Date().toISOString().split("T")[0],
        notes: `Import via Fahrzeugschein-Scan am ${new Date().toLocaleDateString("de-DE")}`,
      });
    }

    await createVehicle.mutateAsync({
      make: result.make || "",
      model: result.trade_name || result.type_model || "",
      license_plate: result.license_plate || "",
      vin: result.vin || "",
      color: result.color || "",
      customer_name: result.holder_name || "",
      status: "annahme",
      condition: "in_arbeit",
      progress: 0,
      notes: [
        result.first_registration ? `Erstzulassung: ${result.first_registration}` : "",
        result.power_kw ? `${result.power_kw} kW` : "",
        result.displacement_cc ? `${result.displacement_cc} ccm` : "",
        `Scan am ${new Date().toLocaleDateString("de-DE")}`,
      ].filter(Boolean).join(" · "),
    });

    setCreated(true);
    setCreating(false);
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ScanLine className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Fahrzeugschein fotografieren oder hochladen</p>
        </div>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById("scan-input").click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${dragOver ? "border-primary bg-primary/5" : imageUrl ? "border-success/40 bg-success/5" : "border-border hover:border-primary/30"}`}>
          <input id="scan-input" type="file" accept="image/*,.pdf" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
          {imageUrl ? (
            <div className="flex flex-col items-center gap-3">
              <img src={imageUrl} alt="Fahrzeugschein" className="max-h-40 rounded-lg border border-border object-contain" />
              <p className="text-xs text-muted-foreground">{image?.name}</p>
            </div>
          ) : (
            <>
              <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-foreground font-medium">Fahrzeugschein-Foto hochladen</p>
              <p className="text-xs text-muted-foreground mt-1">Foto, Scan oder PDF · Automatische Felderkennung</p>
            </>
          )}
        </div>
        {image && !result && (
          <Button onClick={scan} disabled={scanning} className="w-full mt-4 gap-2 font-heading tracking-wide">
            {scanning ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanne Fahrzeugschein...</> : <><ScanLine className="w-4 h-4" /> FAHRZEUGSCHEIN SCANNEN</>}
          </Button>
        )}
      </div>

      {scanning && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Loader2 className="w-7 h-7 text-primary animate-spin mx-auto mb-2" />
          <p className="text-sm text-foreground font-medium">OCR · Automatische Texterkennung...</p>
          <p className="text-xs text-muted-foreground mt-1">Kennzeichen, Halter, VIN, Baujahr werden erkannt</p>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Confidence */}
            {result.confidence === "niedrig" && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-xl text-xs text-warning">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                Niedrige Erkennungsqualität — bitte erkannte Daten prüfen. {result.notes}
              </div>
            )}

            {/* Extracted Data */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] tracking-wider text-muted-foreground uppercase">AUSGELESENE DATEN</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  result.confidence === "hoch" ? "bg-success/20 text-success" :
                  result.confidence === "mittel" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"
                }`}>Qualität: {result.confidence}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: "Kennzeichen (A)", value: result.license_plate },
                  { label: "Erstzulassung (B)", value: result.first_registration },
                  { label: "Halter (C)", value: result.holder_name },
                  { label: "Adresse", value: result.holder_address },
                  { label: "Hersteller (D.1)", value: result.make },
                  { label: "Handelsname (D.3)", value: result.trade_name || result.type_model },
                  { label: "FIN/VIN (E)", value: result.vin },
                  { label: "Fahrzeugklasse", value: result.vehicle_class },
                  { label: "Hubraum", value: result.displacement_cc ? `${result.displacement_cc} ccm` : null },
                  { label: "Leistung", value: result.power_kw ? `${result.power_kw} kW` : null },
                  { label: "Farbe", value: result.color },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} className="p-2.5 bg-secondary rounded-lg">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">{f.label}</p>
                    <p className="text-xs font-medium text-foreground">{f.value}</p>
                  </div>
                ))}
              </div>

              {!created ? (
                <Button onClick={handleCreate} disabled={creating} className="w-full gap-2 font-heading tracking-wide">
                  {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird angelegt...</> : <><Plus className="w-4 h-4" /> FAHRZEUG + KUNDE ANLEGEN</>}
                </Button>
              ) : (
                <div className="p-3 bg-success/10 border border-success/20 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <p className="text-sm text-success font-semibold">Fahrzeug & Kunde erfolgreich angelegt</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}