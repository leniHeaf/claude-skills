import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, AlertTriangle, Plus, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PREMIUM_BRANDS = ["Porsche", "BMW M", "Mercedes AMG", "Audi RS", "Lamborghini", "Ferrari", "Maserati", "Bentley", "Rolls-Royce", "McLaren", "Aston Martin"];

function isPremium(make, model) {
  if (!make) return false;
  const combo = `${make} ${model || ""}`;
  return PREMIUM_BRANDS.some(b => combo.toLowerCase().includes(b.toLowerCase())) ||
    make.toLowerCase().includes("porsche") ||
    (make.toLowerCase().includes("bmw") && model?.toUpperCase().includes("M")) ||
    (make.toLowerCase().includes("mercedes") && model?.toLowerCase().includes("amg"));
}

export default function KennzeichenLookup() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState("kennzeichen");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [existingVehicle, setExistingVehicle] = useState(null);
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);

  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: () => base44.entities.Vehicle.list("-created_date", 200) });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: () => base44.entities.Customer.list("-created_date", 200) });

  const createVehicle = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });
  const createCustomer = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  const checkExisting = (licensePlate, vin, make, model) => {
    const plate = licensePlate?.replace(/\s/g, "").toUpperCase();
    const existV = vehicles.find(v =>
      (plate && v.license_plate?.replace(/\s/g, "").toUpperCase() === plate) ||
      (vin && v.vin === vin)
    );
    setExistingVehicle(existV || null);
  };

  const lookup = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setExistingVehicle(null);
    setExistingCustomer(null);
    setCreated(null);

    const prompt = inputType === "kennzeichen"
      ? `Du bist ein KFZ-Experte. Basierend auf dem deutschen Kennzeichen "${input.trim()}" (oder internationalen Kennzeichen):
Gib mir die wahrscheinlichsten Fahrzeugdaten aus. Antworte NUR mit dem JSON-Objekt.
Wichtig: Das Kennzeichen liefert keine exakten Fahrzeugdaten - gib plausible Schätzungen oder leere Felder.`
      : `Du bist ein KFZ-Experte. Analysiere diese Fahrgestellnummer (VIN): "${input.trim()}"
Dekodiere die VIN und extrahiere alle verfügbaren Fahrzeugdaten. Antworte NUR mit dem JSON-Objekt.`;

    const schema = {
      type: "object",
      properties: {
        make: { type: "string", description: "Fahrzeughersteller" },
        model: { type: "string", description: "Modell" },
        year: { type: "string", description: "Baujahr" },
        color: { type: "string", description: "Farbe falls erkennbar" },
        engine: { type: "string", description: "Motortyp" },
        vin: { type: "string", description: "VIN/FIN" },
        fuel_type: { type: "string", description: "Kraftstoff" },
        body_type: { type: "string", description: "Karosserietyp" },
        paint_code: { type: "string", description: "Lackcode falls bekannt" },
        notes: { type: "string", description: "Besonderheiten oder Hinweis" },
      }
    };

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
    });

    setResult(res);
    if (inputType === "kennzeichen") {
      checkExisting(input.trim(), null, res.make, res.model);
    } else {
      checkExisting(null, input.trim(), res.make, res.model);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!result) return;
    setCreating(true);

    const licensePlate = inputType === "kennzeichen" ? input.trim().toUpperCase() : "";
    const vin = inputType === "vin" ? input.trim() : result.vin || "";

    // Check if customer exists or create
    let cust = customers.find(c => c.name?.toLowerCase() === customerName.toLowerCase());
    if (!cust && customerName.trim()) {
      const isPrem = isPremium(result.make, result.model);
      cust = await createCustomer.mutateAsync({
        name: customerName.trim(),
        customer_type: isPrem ? "premium" : "privat",
        journey_stage: "annahme",
        last_contact: new Date().toISOString().split("T")[0],
        notes: `Import via ${inputType === "kennzeichen" ? "Kennzeichen" : "VIN"} am ${new Date().toLocaleDateString("de-DE")}`,
      });
    }

    const isPrem = isPremium(result.make, result.model);
    const vehicle = await createVehicle.mutateAsync({
      make: result.make || "",
      model: result.model || "",
      license_plate: licensePlate,
      vin: vin,
      color: result.color || "",
      customer_name: customerName.trim() || "",
      status: "annahme",
      condition: "in_arbeit",
      progress: 0,
      notes: [
        result.engine ? `Motor: ${result.engine}` : "",
        result.year ? `Baujahr: ${result.year}` : "",
        result.fuel_type ? `Kraftstoff: ${result.fuel_type}` : "",
        result.paint_code ? `Lackcode: ${result.paint_code}` : "",
        isPrem ? "⭐ PREMIUM-FAHRZEUG" : "",
      ].filter(Boolean).join(" · "),
    });

    setCreated({ vehicle, customer: cust });
    setCreating(false);
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
  };

  const premium = result && isPremium(result.make, result.model);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex gap-2 mb-4">
          {[{ key: "kennzeichen", label: "Kennzeichen" }, { key: "vin", label: "VIN / FIN" }].map(o => (
            <button key={o.key} onClick={() => { setInputType(o.key); setResult(null); setInput(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${inputType === o.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && lookup()}
            placeholder={inputType === "kennzeichen" ? "z.B. SON-AB-911 oder KA-TI-2024" : "z.B. WP0ZZZ99ZTS392124"}
            className="bg-secondary border-border font-mono text-sm flex-1"
          />
          <Button onClick={lookup} disabled={loading || !input.trim()} className="gap-2 shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Suchen
          </Button>
        </div>
      </div>

      {loading && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Loader2 className="w-7 h-7 text-primary animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Analysiert Fahrzeugdaten...</p>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Existing Vehicle Warning */}
            {existingVehicle && (
              <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-warning">Fahrzeug bereits bekannt!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {existingVehicle.make} {existingVehicle.model} · {existingVehicle.customer_name} · Status: {existingVehicle.status}
                  </p>
                  {existingVehicle.notes && <p className="text-xs text-foreground/70 mt-1">📋 {existingVehicle.notes}</p>}
                </div>
              </div>
            )}

            {/* Premium Badge */}
            {premium && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-xl">
                <Crown className="w-4 h-4 text-warning" />
                <p className="text-sm font-semibold text-warning">PREMIUM-FAHRZEUG erkannt — erhöhte Sorgfalt</p>
              </div>
            )}

            {/* Vehicle Data */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-3">ERKANNTE FAHRZEUGDATEN</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Hersteller", value: result.make },
                  { label: "Modell", value: result.model },
                  { label: "Baujahr", value: result.year },
                  { label: "Farbe", value: result.color },
                  { label: "Motor", value: result.engine },
                  { label: "Kraftstoff", value: result.fuel_type },
                  { label: "Karosserie", value: result.body_type },
                  { label: "Lackcode", value: result.paint_code },
                  { label: "VIN", value: result.vin },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} className="p-2.5 bg-secondary rounded-lg">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">{f.label}</p>
                    <p className="text-xs font-medium text-foreground">{f.value}</p>
                  </div>
                ))}
              </div>
              {result.notes && (
                <p className="text-xs text-muted-foreground italic">{result.notes}</p>
              )}

              {/* Customer + Create */}
              {!created && !existingVehicle && (
                <div className="border-t border-border pt-4 mt-2 space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Kunde (optional — für Fahrzeuganlage)</Label>
                    <Input value={customerName} onChange={e => setCustomerName(e.target.value)}
                      placeholder="Name des Kunden" className="bg-secondary border-border mt-1 text-sm" />
                  </div>
                  <Button onClick={handleCreate} disabled={creating} className="w-full gap-2 font-heading tracking-wide">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {creating ? "Wird angelegt..." : "FAHRZEUG & KUNDE ANLEGEN"}
                  </Button>
                </div>
              )}

              {created && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-success/10 border border-success/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-success mb-1.5" />
                  <p className="text-sm font-semibold text-success">Erfolgreich angelegt</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {created.vehicle.make} {created.vehicle.model} · {created.vehicle.license_plate || created.vehicle.vin}
                    {created.customer && ` · Kunde: ${created.customer.name}`}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}