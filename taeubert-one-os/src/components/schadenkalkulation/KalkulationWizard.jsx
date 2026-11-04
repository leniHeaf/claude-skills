import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Camera, Search, Trash2, Loader2, Check, Car, Wrench, Droplet, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { GEWERKE, GEWERK_LABEL, SCHADENBEREICHE, berechneKalkulation, formatEuro, formatStunden } from "@/lib/kalkulationUtils";
import ScheinUploader from "@/components/schadenkalkulation/ScheinUploader";
import SchadenAnalyse from "@/components/schadenkalkulation/SchadenAnalyse";

const HEUTIGE_DATUM = new Date().toISOString().slice(0, 10);

function PhotoUploader({ photos, onAdd, onRemove, label, multiple = true }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = React.useRef(null);

  const handleFiles = async (files) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setUploading(true);
    try {
      for (const file of arr) {
        const res = await base44.integrations.Core.UploadFile({ file });
        onAdd(res.file_url);
      }
    } catch (e) { /* ignore */ }
    setUploading(false);
  };

  return (
    <div>
      <Label className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</Label>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" multiple={multiple} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      <div className="grid grid-cols-3 gap-2 mt-2">
        {photos.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-secondary group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onRemove(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
          </div>
        ))}
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors disabled:opacity-50">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          <span className="text-[10px]">Foto</span>
        </button>
      </div>
    </div>
  );
}

export default function KalkulationWizard({ onClose, onSaved }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  // Step 1
  const [fahrzeug, setFahrzeug] = useState({ hsn: "", tsn: "", make: "", model: "", baureihe: "", fahrzeugklasse: "", baujahr: "", license_plate: "", vin: "", erstzulassung: "", kraftstoff: "", leistung_kw: "", leistung_ps: "", hubraum: "", schadstoffklasse: "", anzahl_sitze: "" });
  const [scheinPhoto, setScheinPhoto] = useState(null);
  const handleScheinRecognized = (data) => {
    setFahrzeug(prev => ({
      ...prev,
      license_plate: data.kennzeichen || prev.license_plate,
      hsn: data.hsn || prev.hsn, tsn: data.tsn || prev.tsn,
      make: data.hersteller || prev.make, model: data.modell || prev.model,
      baureihe: data.baureihe || prev.baureihe, fahrzeugklasse: data.fahrzeugklasse || prev.fahrzeugklasse,
      vin: data.vin || prev.vin, hubraum: data.hubraum || prev.hubraum,
      leistung_kw: data.leistung_kw || prev.leistung_kw, leistung_ps: data.leistung_ps || prev.leistung_ps,
      erstzulassung: data.erstzulassung || prev.erstzulassung, anzahl_sitze: data.anzahl_sitze || prev.anzahl_sitze,
      schadstoffklasse: data.schadstoffklasse || prev.schadstoffklasse, kraftstoff: data.kraftstoff || prev.kraftstoff,
      baujahr: data.erstzulassung ? data.erstzulassung.slice(0, 4) : prev.baujahr,
    }));
  };
  const [customerMode, setCustomerMode] = useState("existing");
  const [customerId, setCustomerId] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "", address: "" });

  // Step 2
  const [schadenFotos, setSchadenFotos] = useState([]);
  const [beschreibung, setBeschreibung] = useState("");
  const [bereich, setBereich] = useState("");

  // Step 3
  const [search, setSearch] = useState("");
  const [gewerkFilter, setGewerkFilter] = useState("all");
  const [selected, setSelected] = useState([]); // compact: {position_id, bezeichnung, gewerk, positionstyp, richtzeit_ah, ersatzteil_kosten, lackmaterial_kosten, menge}
  const [stundenloehne, setStundenloehne] = useState({ Mechanik: 150, Karosserie: 150, Lackierung: 155 });
  const [mwstSatz, setMwstSatz] = useState(19);
  const [mwstAufArbeitslohn, setMwstAufArbeitslohn] = useState(true);
  const [kleinteileAktiv, setKleinteileAktiv] = useState(false);
  const [kleinteileProzent, setKleinteileProzent] = useState(15);
  const [lackmaterialProzent, setLackmaterialProzent] = useState(45); // DAT-Standard: 45% des Lacklohns

  const { data: customers = [] } = useQuery({ queryKey: ["customers-kalk"], queryFn: () => base44.entities.Customer.list("-created_date", 200) });
  const { data: positionen = [], isLoading: posLoading } = useQuery({ queryKey: ["reparaturpositionen"], queryFn: () => base44.entities.Reparaturposition.list("positionsnummer", 500) });

  const filteredPositionen = positionen.filter(p => {
    if ((p.positionsnummer || "").startsWith("AB-")) return false;
    const matchSearch = !search || p.bezeichnung.toLowerCase().includes(search.toLowerCase()) || (p.positionsnummer || "").toLowerCase().includes(search.toLowerCase());
    const matchGewerk = gewerkFilter === "all" || p.gewerk === gewerkFilter;
    return matchSearch && matchGewerk;
  });

  const NO_BLEND = new Set(["LK-007", "LK-008", "LK-009", "LK-010", "LK-011", "LK-012"]);
  // Sichert realistische Lackierung: jedes lackierte Bauteil braucht eine Ablendung
  // (Farbübergang) ins angrenzende Teil — isoliertes Lackieren einzelner Teile ist nicht möglich.
  const syncAblendung = (list) => {
    const ab = positionen.find(x => (x.positionsnummer || "").startsWith("AB-"));
    if (!ab) return list;
    const panelMenge = list.filter(x => {
      const nr = (positionen.find(c => c.id === x.position_id)?.positionsnummer) || "";
      return x.gewerk === "Lackierung" && (x.positionstyp || "Arbeitszeit") === "Arbeitszeit" && !!nr && !nr.startsWith("AB-") && !NO_BLEND.has(nr);
    }).reduce((s, x) => s + (Number(x.menge) || 0), 0);
    const idx = list.findIndex(x => x.position_id === ab.id);
    if (panelMenge <= 0) return idx >= 0 ? list.filter((_, i) => i !== idx) : list;
    const entry = { position_id: ab.id, bezeichnung: ab.bezeichnung, gewerk: ab.gewerk, positionstyp: ab.positionstyp || "Arbeitszeit", richtzeit_ah: ab.richtzeit_ah || 0, ersatzteil_kosten: ab.ersatzteil_kosten || 0, lackmaterial_kosten: ab.lackmaterial_kosten || 0, menge: panelMenge };
    if (idx >= 0) { const copy = [...list]; copy[idx] = entry; return copy; }
    return [...list, entry];
  };

  const togglePosition = (p) => {
    if ((p.positionsnummer || "").startsWith("AB-")) return; // automatisch verwaltet
    setSelected(prev => {
      const exists = prev.find(x => x.position_id === p.id);
      const next = exists
        ? prev.filter(x => x.position_id !== p.id)
        : [...prev, {
            position_id: p.id, bezeichnung: p.bezeichnung, gewerk: p.gewerk,
            positionstyp: p.positionstyp || "Arbeitszeit",
            richtzeit_ah: p.richtzeit_ah || 0,
            ersatzteil_kosten: p.ersatzteil_kosten || 0,
            lackmaterial_kosten: p.lackmaterial_kosten || 0,
            menge: 1,
          }];
      return syncAblendung(next);
    });
  };

  const updateField = (id, field, value) => {
    setSelected(prev => {
      const next = prev.map(x => x.position_id === id ? { ...x, [field]: field === "menge" ? Math.max(1, Number(value) || 1) : (Number(value) || 0) } : x);
      return syncAblendung(next);
    });
  };

  const ergebnis = berechneKalkulation(selected, stundenloehne, { mwst_satz: Number(mwstSatz), mwst_auf_arbeitslohn: mwstAufArbeitslohn, kleinteileAktiv, kleinteileProzent: Number(kleinteileProzent), lackmaterial_prozent: Number(lackmaterialProzent) });
  const abId = positionen.find(x => (x.positionsnummer || "").startsWith("AB-"))?.id;

  const handleSchadenAnalyseApply = ({ positionen: pos, beschreibung: b, bereich: be }) => {
    setSelected(prev => {
      const map = new Map(prev.map(p => [p.position_id, p]));
      pos.forEach(p => {
        const cat = positionen.find(c => c.id === p.position_id);
        const entry = {
          position_id: p.position_id, bezeichnung: cat?.bezeichnung || p.bezeichnung, gewerk: cat?.gewerk || p.gewerk,
          positionstyp: cat?.positionstyp || p.positionstyp || "Arbeitszeit",
          richtzeit_ah: cat?.richtzeit_ah || p.richtzeit_ah || 0,
          ersatzteil_kosten: cat?.ersatzteil_kosten || p.ersatzteil_kosten || 0,
          lackmaterial_kosten: cat?.lackmaterial_kosten || p.lackmaterial_kosten || 0,
          menge: p.menge || 1,
        };
        if (map.has(p.position_id)) map.set(p.position_id, { ...map.get(p.position_id), menge: entry.menge });
        else map.set(p.position_id, entry);
      });
      return syncAblendung(Array.from(map.values()));
    });
    if (b) setBeschreibung(prev => prev || b);
    if (be) setBereich(prev => prev || be);
  };

  const validateStep1 = () => {
    if (!fahrzeug.make || !fahrzeug.model || !fahrzeug.license_plate) { toast({ title: "Fahrzeugdaten unvollständig", description: "Hersteller, Modell und Kennzeichen sind erforderlich.", variant: "destructive" }); return false; }
    if (customerMode === "existing" && !customerId) { toast({ title: "Kunde fehlt", description: "Bitte einen Kunden auswählen.", variant: "destructive" }); return false; }
    if (customerMode === "new" && (!newCustomer.name || !newCustomer.phone)) { toast({ title: "Kunde unvollständig", description: "Name und Telefon sind erforderlich.", variant: "destructive" }); return false; }
    return true;
  };
  const validateStep2 = () => {
    if (schadenFotos.length === 0 && !beschreibung) { toast({ title: "Schaden dokumentieren", description: "Mindestens ein Foto oder eine Beschreibung erforderlich.", variant: "destructive" }); return false; }
    return true;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let custId = customerId;
      let custName = customerMode === "existing" ? (customers.find(c => c.id === customerId)?.name || "") : newCustomer.name;
      if (customerMode === "new") {
        const cust = await base44.entities.Customer.create({ name: newCustomer.name, phone: newCustomer.phone, email: newCustomer.email, address: newCustomer.address });
        custId = cust.id; custName = cust.name;
      }
      const veh = await base44.entities.Vehicle.create({
        customer_name: custName, license_plate: fahrzeug.license_plate, make: fahrzeug.make, model: fahrzeug.model,
        baureihe: fahrzeug.baureihe || undefined, fahrzeugklasse: fahrzeug.fahrzeugklasse || undefined, hsn: fahrzeug.hsn, tsn: fahrzeug.tsn,
        baujahr: fahrzeug.baujahr ? Number(fahrzeug.baujahr) : undefined, erstzulassung: fahrzeug.erstzulassung || undefined, vin: fahrzeug.vin || undefined,
        hubraum: fahrzeug.hubraum || undefined, leistung_kw: fahrzeug.leistung_kw || undefined, leistung_ps: fahrzeug.leistung_ps || undefined,
        anzahl_sitze: fahrzeug.anzahl_sitze || undefined, schadstoffklasse: fahrzeug.schadstoffklasse || undefined, kraftstoff: fahrzeug.kraftstoff || undefined,
        status: "annahme",
      });
      const bericht = await base44.entities.Schadensbericht.create({
        date: HEUTIGE_DATUM, vehicle_id: veh.id, vehicle_info: `${fahrzeug.make} ${fahrzeug.model} - ${fahrzeug.license_plate}`,
        customer_id: custId, customer_name: custName, photos: schadenFotos, schein_photo: scheinPhoto || undefined,
        description: beschreibung || undefined, schadenbereich: bereich || undefined, status: "kalkuliert",
      });
      const kalk = await base44.entities.Kalkulation.create({
        schadensbericht_id: bericht.id, date: HEUTIGE_DATUM,
        positionen: ergebnis.lines.map(l => ({
          position_id: l.position_id, bezeichnung: l.bezeichnung, gewerk: l.gewerk, positionstyp: l.positionstyp,
          richtzeit_ah: l.richtzeit_ah, menge: l.menge, einzelpreis: l.einzelpreis, gesamtpreis: l.gesamtpreis,
        })),
        stundenlohn_mechanik: Number(stundenloehne.Mechanik), stundenlohn_karosserie: Number(stundenloehne.Karosserie), stundenlohn_lackierung: Number(stundenloehne.Lackierung),
        kleinteile_aufschlag_aktiv: kleinteileAktiv, kleinteile_prozent: Number(kleinteileProzent),
        lackmaterial_prozent: Number(lackmaterialProzent),
        summe_arbeitslohn: ergebnis.summe_arbeitslohn,
        summe_arbeitslohn_lack: ergebnis.summe_arbeitslohn_lack,
        summe_arbeitslohn_karosserie: ergebnis.summe_arbeitslohn_karosserie,
        summe_arbeitslohn_mechanik: ergebnis.summe_arbeitslohn_mechanik,
        summe_ersatzteile: ergebnis.summe_ersatzteile, summe_lackmaterial: ergebnis.summe_lackmaterial, summe_pauschale: ergebnis.summe_pauschale,
        zwischensumme_netto: ergebnis.zwischensumme_netto, mwst_satz: Number(mwstSatz), mwst_auf_arbeitslohn: mwstAufArbeitslohn, mwst_betrag: ergebnis.mwst_betrag, gesamtbetrag_brutto: ergebnis.gesamtbetrag_brutto,
        status: "Kalkuliert", hinweis: "Unverbindliche Kostenschätzung. Änderungen vorbehalten.",
      });
      return kalk;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kalkulationen"] });
      queryClient.invalidateQueries({ queryKey: ["schadensberichte"] });
      toast({ title: "Kalkulation gespeichert", description: "Die Kostenschätzung wurde erstellt." });
      onSaved?.();
    },
    onError: () => { toast({ title: "Fehler beim Speichern", description: "Die Kalkulation konnte nicht gespeichert werden.", variant: "destructive" }); },
  });

  const steps = [{ nr: 1, label: "Fahrzeug", icon: Car }, { nr: 2, label: "Schaden", icon: Wrench }, { nr: 3, label: "Kalkulation", icon: Check }];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="font-heading text-lg text-foreground tracking-wide">NEUE KALKULATION</h2>
          <p className="text-xs text-muted-foreground">Schritt {step} von 3</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        {steps.map((s, i) => (
          <React.Fragment key={s.nr}>
            <div className={`flex items-center gap-2 ${step >= s.nr ? "text-foreground" : "text-muted-foreground"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s.nr ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{step > s.nr ? <Check className="w-3.5 h-3.5" /> : s.nr}</div>
              <span className="text-xs font-medium hidden sm:block">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${step > s.nr ? "bg-primary" : "bg-border"}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto space-y-6">
              <div>
                <Label className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Fahrzeugschein (Foto oder PDF)</Label>
                <div className="mt-2"><ScheinUploader scheinUrl={scheinPhoto} onSetScheinUrl={setScheinPhoto} onRecognized={handleScheinRecognized} /></div>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">Fahrzeugdaten</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { k: "hsn", l: "HSN", p: "0002", max: 4 }, { k: "tsn", l: "TSN", p: "ABC", max: 3 },
                    { k: "make", l: "Hersteller *", p: "VW" }, { k: "model", l: "Modell *", p: "Golf" },
                    { k: "baujahr", l: "Baujahr", p: "2020", num: true }, { k: "erstzulassung", l: "Erstzulassung", date: true },
                    { k: "license_plate", l: "Kennzeichen *", p: "M-AB 1234" }, { k: "vin", l: "VIN (optional)", p: "WVW..." },
                    { k: "baureihe", l: "Baureihe", p: "Variante" }, { k: "fahrzeugklasse", l: "Fahrzeugklasse", p: "PKW" },
                    { k: "kraftstoff", l: "Kraftstoff", p: "Benzin" }, { k: "leistung_kw", l: "Leistung (kW)", p: "90" },
                    { k: "leistung_ps", l: "Leistung (PS)", p: "122" }, { k: "hubraum", l: "Hubraum (ccm)", p: "1390" }, { k: "schadstoffklasse", l: "Schadstoffklasse", p: "Euro 6" },
                  ].map(f => (
                    <div key={f.k}>
                      <Label className="text-xs">{f.l}</Label>
                      <Input type={f.date ? "date" : f.num ? "number" : "text"} value={fahrzeug[f.k]} maxLength={f.max} onChange={e => setFahrzeug({ ...fahrzeug, [f.k]: e.target.value })} placeholder={f.p} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">Kunde</p>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setCustomerMode("existing")} className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border ${customerMode === "existing" ? "border-primary bg-primary/5" : "border-border"}`}>Bestehender Kunde</button>
                  <button onClick={() => setCustomerMode("new")} className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border ${customerMode === "new" ? "border-primary bg-primary/5" : "border-border"}`}>Neuer Kunde</button>
                </div>
                {customerMode === "existing" ? (
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-transparent text-sm">
                      <option value="">— Kunde auswählen —</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `· ${c.phone}` : ""}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Name *</Label><Input value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} placeholder="Max Mustermann" /></div>
                    <div><Label className="text-xs">Telefon *</Label><Input value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder="0170..." /></div>
                    <div><Label className="text-xs">E-Mail (optional)</Label><Input type="email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} placeholder="max@..." /></div>
                    <div><Label className="text-xs">Adresse (optional)</Label><Input value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} placeholder="Musterstr. 1" /></div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto space-y-6">
              <PhotoUploader label="Schadensfotos" photos={schadenFotos} onAdd={(url) => setSchadenFotos(prev => [...prev, url])} onRemove={(i) => setSchadenFotos(prev => prev.filter((_, idx) => idx !== i))} />
              <SchadenAnalyse photos={schadenFotos} positionen={positionen} stundenloehne={stundenloehne} onApply={handleSchadenAnalyseApply} />
              <div>
                <Label className="text-xs">Schadensbeschreibung</Label>
                <Textarea value={beschreibung} onChange={e => setBeschreibung(e.target.value)} rows={4} placeholder="Beschreiben Sie den Schaden..." className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Bereich am Fahrzeug</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {SCHADENBEREICHE.map(b => (
                    <button key={b.value} onClick={() => setBereich(bereich === b.value ? "" : b.value)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${bereich === b.value ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"}`}>{b.label}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Position suchen..." className="pl-9" /></div>
                <select value={gewerkFilter} onChange={e => setGewerkFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-transparent text-sm">
                  <option value="all">Alle Gewerke</option>
                  {GEWERKE.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                  {posLoading && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
                  {!posLoading && filteredPositionen.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">Keine Positionen gefunden</p>}
                  {filteredPositionen.map(p => {
                    const isSel = selected.some(x => x.position_id === p.id);
                    return (
                      <button key={p.id} onClick={() => togglePosition(p)} className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${isSel ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.bezeichnung}</p>
                          <p className="text-[10px] text-muted-foreground">{p.positionsnummer} · {GEWERK_LABEL[p.gewerk]} · {formatStunden(p.richtzeit_ah)}{p.lackmaterial_kosten ? ` · Lack ${formatEuro(p.lackmaterial_kosten)}` : ""}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSel ? "bg-primary border-primary" : "border-border"}`}>{isSel && <Check className="w-3 h-3 text-primary-foreground" />}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Gewählt ({selected.length})</p>
                  <p className="text-[9px] text-muted-foreground -mt-1 mb-1">Ablendung wird je lackiertem Bauteil automatisch hinzugefügt.</p>
                  {selected.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-8 text-center">Noch keine Positionen gewählt</p>
                  ) : (
                    <div className="space-y-2 max-h-[28vh] overflow-y-auto">
                      {selected.map(p => (
                        <div key={p.position_id} className="p-2.5 rounded-lg bg-secondary/50 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{p.bezeichnung}</p>
              <p className="text-[10px] text-muted-foreground">{GEWERK_LABEL[p.gewerk]} · {formatStunden(p.richtzeit_ah)}</p>
            </div>
            <Input type="number" min={1} value={p.menge} disabled={p.position_id === abId} onChange={e => updateField(p.position_id, "menge", e.target.value)} className="w-14 h-8 text-xs px-2" />
            {p.position_id === abId ? <span className="text-[9px] text-muted-foreground px-1">Auto</span> : <button onClick={() => togglePosition({ id: p.position_id })} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>}
                          </div>
                          {p.position_id !== abId && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 w-1/2"><Package className="w-3 h-3" /> Ersatzteil €</span>
                            <Input type="number" value={p.ersatzteil_kosten || ""} onChange={e => updateField(p.position_id, "ersatzteil_kosten", e.target.value)} placeholder="0" className="h-8 text-xs px-2 flex-1" />
                          </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stundenlohn-Sätze */}
                  <div className="border-t border-border pt-3 space-y-2">
                    <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Stundenlohnsätze</p>
                    {GEWERKE.map(g => (
                      <div key={g.value} className="flex items-center gap-2">
                        <span className="text-xs flex-1">{g.label}</span>
                        <Input type="number" value={stundenloehne[g.value]} onChange={e => setStundenloehne({ ...stundenloehne, [g.value]: Number(e.target.value) })} className="w-20 h-8 text-xs px-2" />
                        <span className="text-[10px] text-muted-foreground">€/h</span>
                      </div>
                    ))}
                  </div>

                  {/* Lackmaterial-Pauschale */}
                  <div className="flex items-center gap-2 border-t border-border pt-3">
                    <span className="text-[10px] text-muted-foreground flex-1"><Droplet className="w-3 h-3 inline mr-1" />Lackmaterial (DAT-Pauschale)</span>
                    <Input type="number" min={0} max={100} value={lackmaterialProzent} onChange={e => setLackmaterialProzent(e.target.value)} className="w-16 h-8 text-xs px-2" />
                    <span className="text-[10px] text-muted-foreground">% v. Lacklohn</span>
                  </div>

                  {/* MwSt & Kleinteile */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px]">MwSt %</Label>
                      <Input type="number" value={mwstSatz} onChange={e => setMwstSatz(e.target.value)} className="h-8 text-xs px-2" />
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                      <button onClick={() => setMwstAufArbeitslohn(v => !v)} className={`w-9 h-5 rounded-full transition-colors relative ${mwstAufArbeitslohn ? "bg-primary" : "bg-border"}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card transition-all ${mwstAufArbeitslohn ? "left-4" : "left-0.5"}`} /></button>
                      <span className="text-[10px] text-muted-foreground">MwSt auf Arbeitslohn</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setKleinteileAktiv(v => !v)} className={`w-9 h-5 rounded-full transition-colors relative ${kleinteileAktiv ? "bg-primary" : "bg-border"}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card transition-all ${kleinteileAktiv ? "left-4" : "left-0.5"}`} /></button>
                    <span className="text-[10px] text-muted-foreground flex-1">Kleinteile-Aufschlag</span>
                    {kleinteileAktiv && <Input type="number" value={kleinteileProzent} onChange={e => setKleinteileProzent(e.target.value)} className="w-16 h-8 text-xs px-2" />}
                    {kleinteileAktiv && <span className="text-[10px] text-muted-foreground">%</span>}
                  </div>

                  {/* Live calc — DAT-Struktur */}
                  <div className="bg-card border border-border rounded-xl p-4 space-y-1.5">
                    {!!ergebnis.summe_arbeitslohn_karosserie && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Lohn Karosserie</span><span className="font-medium">{formatEuro(ergebnis.summe_arbeitslohn_karosserie)}</span></div>}
                    {!!ergebnis.summe_arbeitslohn_mechanik && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Lohn Mechanik</span><span className="font-medium">{formatEuro(ergebnis.summe_arbeitslohn_mechanik)}</span></div>}
                    {!!ergebnis.summe_arbeitslohn_lack && (
                      <>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Lohn Lackierung</span><span className="font-medium">{formatEuro(ergebnis.summe_arbeitslohn_lack)}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Lackmaterial pauschal ({lackmaterialProzent}%)</span><span className="font-medium">{formatEuro(ergebnis.summe_lackmaterial)}</span></div>
                      </>
                    )}
                    {!!ergebnis.summe_ersatzteile && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Ersatzteile</span><span className="font-medium">{formatEuro(ergebnis.summe_ersatzteile)}</span></div>}
                    {!!ergebnis.summe_pauschale && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Nebenkosten / Pauschalen</span><span className="font-medium">{formatEuro(ergebnis.summe_pauschale)}</span></div>}
                    <div className="flex justify-between text-xs border-t border-border pt-1.5"><span className="text-muted-foreground">Reparaturkosten netto</span><span className="font-medium">{formatEuro(ergebnis.zwischensumme_netto)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">MwSt ({mwstSatz}%)</span><span className="font-medium">{formatEuro(ergebnis.mwst_betrag)}</span></div>
                    <div className="border-t border-border pt-1.5 flex justify-between">
                      <span className="text-sm font-semibold">Reparaturkosten brutto</span>
                      <span className="font-heading text-lg text-foreground">{formatEuro(ergebnis.gesamtbetrag_brutto)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center pt-1">Unverbindliche Kostenschätzung</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border">
        <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="gap-1"><ChevronLeft className="w-4 h-4" /> {step > 1 ? "Zurück" : "Abbrechen"}</Button>
        {step < 3 ? (
          <Button onClick={() => { if (step === 1 && !validateStep1()) return; if (step === 2 && !validateStep2()) return; setStep(step + 1); }} className="gap-1">Weiter <ChevronRight className="w-4 h-4" /></Button>
        ) : (
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || selected.length === 0} className="gap-1">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Kalkulation speichern
          </Button>
        )}
      </div>
    </div>
  );
}