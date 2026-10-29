import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, Car, Camera, FileText,
  CheckCircle2, ChevronRight, ChevronLeft, Euro, Calendar,
  Plus, X, AlertTriangle, UserPlus, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import FahrzeugSkizze from "@/components/schadenaufnahme/FahrzeugSkizze";
import SignaturPad from "@/components/schadenaufnahme/SignaturPad";

const STEPS = [
  { id: 1, label: "Kundendaten", icon: User },
  { id: 2, label: "Fahrzeug", icon: Car },
  { id: 3, label: "Schaden", icon: AlertTriangle },
  { id: 4, label: "Kalkulation", icon: Euro },
  { id: 5, label: "Unterschrift", icon: FileText },
  { id: 6, label: "Abschluss", icon: CheckCircle2 },
];

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

const STATUS_COLORS = {
  neu: "bg-info/10 text-info border-info/20",
  kalkulation_geplant: "bg-warning/10 text-warning border-warning/20",
  angebot_erstellt: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  auftrag_erteilt: "bg-success/10 text-success border-success/20",
  abgelehnt: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_LABELS = {
  neu: "Neu",
  kalkulation_geplant: "Kalkulation geplant",
  angebot_erstellt: "Angebot erstellt",
  auftrag_erteilt: "Auftrag erteilt",
  abgelehnt: "Abgelehnt",
};

const EMPTY_FORM = {
  customer_name: "", customer_phone: "", customer_email: "", customer_address: "",
  vehicle_make: "", vehicle_model: "", vehicle_license_plate: "", vehicle_color: "", vehicle_vin: "",
  insurance: "", insurance_case_number: "",
  damage_location: [], damage_description: "", damage_photos: [],
  kalkulation_gewuenscht: false, kalkulation_termin: "", kalkulation_uhrzeit: "",
  reparatur_termin: "", notes: "", aufgenommen_von: "", status: "neu",
  customer_signature: "",
};

// ─── Step Indicator ───────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done ? "bg-success text-white" : active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-3.5 h-3.5" />}
              </div>
              <span className={`text-[9px] hidden md:block tracking-wide ${active ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-6 md:w-10 rounded-full mb-4 transition-all ${done ? "bg-success" : "bg-secondary"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Photo Uploader ───────────────────────────────────────────
function PhotoUploader({ photos, onChange }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFiles = async (files) => {
    setUploading(true);
    const newUrls = [];
    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newUrls.push(file_url);
    }
    onChange([...photos, ...newUrls]);
    setUploading(false);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {photos.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button onClick={() => onChange(photos.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary/40 hover:bg-secondary/30 transition-all">
          {uploading
            ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            : <><Camera className="w-5 h-5 text-muted-foreground" /><span className="text-[9px] text-muted-foreground">Foto</span></>}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" className="hidden"
        onChange={e => e.target.files && handleFiles(e.target.files)} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function SchadenAufnahme() {
  const [view, setView] = useState("list");
  const [step, setStep] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [crmCreating, setCrmCreating] = useState(false);
  const [crmCreated, setCrmCreated] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const u = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const { data: aufnahmen = [] } = useQuery({
    queryKey: ["schadensaufnahmen"],
    queryFn: () => base44.entities.SchadenAufnahme.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const aufnahme = await base44.entities.SchadenAufnahme.create(data);

      // Auto: CRM Customer anlegen
      await base44.entities.Customer.create({
        name: data.customer_name,
        phone: data.customer_phone,
        email: data.customer_email,
        address: data.customer_address,
        customer_type: "privat",
        journey_stage: "erstkontakt",
        notes: `Schadenaufnahme am ${format(new Date(), "dd.MM.yyyy")} — ${data.damage_description || ""}`,
      });

      // Auto: Bestätigungsmail wenn E-Mail vorhanden
      if (data.customer_email) {
        await base44.integrations.Core.SendEmail({
          to: data.customer_email,
          subject: `Schadenaufnahme bestätigt – ${data.vehicle_license_plate}`,
          body: `Sehr geehrte/r ${data.customer_name},\n\nvielen Dank für Ihren Besuch bei Täubert Karosserie & Lack.\n\nWir haben folgende Schadensaufnahme für Sie erfasst:\n\nFahrzeug: ${data.vehicle_make || ""} ${data.vehicle_model || ""} – ${data.vehicle_license_plate}\nSchadensstelle: ${Array.isArray(data.damage_location) ? data.damage_location.join(", ") : data.damage_location}\nBeschreibung: ${data.damage_description}\n${data.kalkulation_gewuenscht ? `\nKalkulation gewünscht (90 €)\nTermin: ${data.kalkulation_termin || "wird noch abgestimmt"} ${data.kalkulation_uhrzeit || ""}` : ""}\n\nWir melden uns in Kürze bei Ihnen.\n\nMit freundlichen Grüßen\nIhr Täubert Team`,
        });
      }

      return aufnahme;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schadensaufnahmen"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setView("list");
      setStep(1);
      setForm({ ...EMPTY_FORM });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SchadenAufnahme.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schadensaufnahmen"] }),
  });

  const toggleDamageLocation = (loc) => {
    const curr = form.damage_location || [];
    if (curr.includes(loc)) u("damage_location", curr.filter(l => l !== loc));
    else u("damage_location", [...curr, loc]);
  };

  const canProceed = () => {
    if (step === 1) return form.customer_name && form.customer_phone;
    if (step === 2) return form.vehicle_license_plate;
    if (step === 3) return form.damage_location.length > 0 && form.damage_description;
    return true;
  };

  const handleSubmit = () => {
    createMutation.mutate({
      ...form,
      damage_location: Array.isArray(form.damage_location) ? form.damage_location.join(", ") : form.damage_location,
    });
  };

  // Detail: send email manually
  const sendEmail = async (a) => {
    if (!a.customer_email) return;
    setEmailSending(true);
    await base44.integrations.Core.SendEmail({
      to: a.customer_email,
      subject: `Schadenaufnahme bestätigt – ${a.vehicle_license_plate}`,
      body: `Sehr geehrte/r ${a.customer_name},\n\nIhre Schadenaufnahme bei Täubert Karosserie & Lack wurde erfasst.\n\nFahrzeug: ${a.vehicle_make || ""} ${a.vehicle_model || ""} – ${a.vehicle_license_plate}\nSchadensstelle: ${a.damage_location}\n\nWir melden uns in Kürze.\n\nMit freundlichen Grüßen\nTäubert Team`,
    });
    setEmailSending(false);
    setEmailSent(true);
  };

  // Detail: CRM anlegen
  const createCrmEntry = async (a) => {
    setCrmCreating(true);
    await base44.entities.Customer.create({
      name: a.customer_name,
      phone: a.customer_phone,
      email: a.customer_email,
      address: a.customer_address,
      customer_type: "privat",
      journey_stage: "erstkontakt",
      notes: `Schadenaufnahme am ${format(new Date(a.created_date), "dd.MM.yyyy")}`,
    });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    setCrmCreating(false);
    setCrmCreated(true);
  };

  const selected = aufnahmen.find(a => a.id === selectedId);

  // ─── LIST VIEW ────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">SCHADENAUFNAHME</h1>
            <p className="text-sm text-muted-foreground mt-1">Kundenerfassung · Schadendokumentation · Kalkulationsanfrage</p>
          </div>
          <Button onClick={() => setView("new")} className="bg-primary gap-2">
            <Plus className="w-4 h-4" /> Neue Aufnahme
          </Button>
        </motion.div>

        {aufnahmen.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Noch keine Aufnahmen. Starte mit einer neuen Schadenaufnahme.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {aufnahmen.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => { setSelectedId(a.id); setEmailSent(false); setCrmCreated(false); setView("detail"); }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-foreground">{a.customer_name}</p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[a.status]}`}>
                        {STATUS_LABELS[a.status]}
                      </span>
                      {a.kalkulation_gewuenscht && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 font-medium">
                          Kalkulation 90€
                        </span>
                      )}
                      {a.customer_signature && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 font-medium">
                          ✍️ Unterschrift
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Car className="w-3 h-3" />{a.vehicle_license_plate} · {a.vehicle_make} {a.vehicle_model}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{a.customer_phone}</span>
                      {a.kalkulation_termin && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Kalk. {a.kalkulation_termin}</span>}
                    </div>
                    {a.damage_location && <p className="text-[10px] text-muted-foreground mt-1 truncate">📍 {a.damage_location}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-muted-foreground">{format(new Date(a.created_date), "dd.MM.yy")}</p>
                    {a.damage_photos?.length > 0 && <p className="text-[9px] text-muted-foreground mt-0.5">{a.damage_photos.length} Fotos</p>}
                    <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 ml-auto" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── DETAIL VIEW ──────────────────────────────────────────────
  if (view === "detail" && selected) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView("list")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-heading text-xl text-foreground">{selected.customer_name}</h1>
            <p className="text-xs text-muted-foreground">{selected.vehicle_license_plate} · {selected.vehicle_make} {selected.vehicle_model}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${STATUS_COLORS[selected.status]}`}>
            {STATUS_LABELS[selected.status]}
          </span>
        </div>

        <div className="space-y-4">
          {/* Aktionen */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">Aktionen</p>
            <div className="flex flex-wrap gap-2">
              {selected.customer_email && (
                <button onClick={() => sendEmail(selected)} disabled={emailSending || emailSent}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all font-medium
                    ${emailSent ? "bg-success/10 text-success border-success/20" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
                  <Send className="w-3 h-3" />
                  {emailSending ? "Sende..." : emailSent ? "✓ E-Mail gesendet" : "Bestätigungsmail senden"}
                </button>
              )}
              <button onClick={() => createCrmEntry(selected)} disabled={crmCreating || crmCreated}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all font-medium
                  ${crmCreated ? "bg-success/10 text-success border-success/20" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
                <UserPlus className="w-3 h-3" />
                {crmCreating ? "Anlegen..." : crmCreated ? "✓ Im CRM angelegt" : "Im CRM anlegen"}
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">Status ändern</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <button key={k} onClick={() => updateMutation.mutate({ id: selected.id, data: { status: k } })}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${selected.status === k ? STATUS_COLORS[k] : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Kundendaten */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">Kundendaten</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[10px] text-muted-foreground">Name</p><p className="font-medium">{selected.customer_name}</p></div>
              <div><p className="text-[10px] text-muted-foreground">Telefon</p><p className="font-medium">{selected.customer_phone}</p></div>
              {selected.customer_email && <div><p className="text-[10px] text-muted-foreground">E-Mail</p><p className="font-medium">{selected.customer_email}</p></div>}
              {selected.customer_address && <div><p className="text-[10px] text-muted-foreground">Adresse</p><p className="font-medium">{selected.customer_address}</p></div>}
            </div>
          </div>

          {/* Fahrzeug */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">Fahrzeug</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[10px] text-muted-foreground">Kennzeichen</p><p className="font-heading">{selected.vehicle_license_plate}</p></div>
              <div><p className="text-[10px] text-muted-foreground">Fahrzeug</p><p className="font-medium">{selected.vehicle_make} {selected.vehicle_model}</p></div>
              {selected.vehicle_color && <div><p className="text-[10px] text-muted-foreground">Farbe</p><p className="font-medium">{selected.vehicle_color}</p></div>}
              {selected.insurance && <div><p className="text-[10px] text-muted-foreground">Versicherung</p><p className="font-medium">{selected.insurance}</p></div>}
              {selected.insurance_case_number && <div><p className="text-[10px] text-muted-foreground">Schadennummer</p><p className="font-medium">{selected.insurance_case_number}</p></div>}
            </div>
          </div>

          {/* Schaden */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">Schaden</p>
            {selected.damage_location && <p className="text-xs font-semibold text-foreground mb-2">📍 {selected.damage_location}</p>}
            {selected.damage_description && <p className="text-sm text-muted-foreground mb-3">{selected.damage_description}</p>}
            {selected.damage_photos?.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {selected.damage_photos.map((url, i) => (
                  <img key={i} src={url} alt="" className="aspect-square rounded-xl object-cover border border-border" />
                ))}
              </div>
            )}
          </div>

          {/* Kalkulation */}
          {selected.kalkulation_gewuenscht && (
            <div className="bg-card border border-warning/20 rounded-xl p-4">
              <p className="text-[10px] font-semibold tracking-wider text-warning uppercase mb-3">Kalkulation gewünscht · 90 €</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selected.kalkulation_termin && <div><p className="text-[10px] text-muted-foreground">Datum</p><p className="font-medium">{selected.kalkulation_termin}</p></div>}
                {selected.kalkulation_uhrzeit && <div><p className="text-[10px] text-muted-foreground">Uhrzeit</p><p className="font-medium">{selected.kalkulation_uhrzeit}</p></div>}
              </div>
            </div>
          )}

          {/* Unterschrift */}
          {selected.customer_signature && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">Kundenunterschrift</p>
              <img src={selected.customer_signature} alt="Unterschrift" className="border border-border rounded-xl bg-white h-20 w-full object-contain" />
            </div>
          )}

          {selected.notes && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-1">Notizen</p>
              <p className="text-sm text-muted-foreground">{selected.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── WIZARD VIEW ──────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => { setView("list"); setStep(1); }} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="font-heading text-xl text-foreground tracking-wide">NEUE SCHADENAUFNAHME</h1>
          <p className="text-xs text-muted-foreground">Schritt {step} von {STEPS.length}</p>
        </div>
      </div>

      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="bg-card border border-border rounded-xl p-5 mb-5">

          {/* STEP 1: Kundendaten */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="font-heading text-sm text-foreground tracking-wide">KUNDENDATEN</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Name *</Label>
                <Input value={form.customer_name} onChange={e => u("customer_name", e.target.value)} placeholder="Max Mustermann" className="bg-secondary border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Telefon *</Label>
                <Input value={form.customer_phone} onChange={e => u("customer_phone", e.target.value)} placeholder="+49 170 123456" className="bg-secondary border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">E-Mail</Label>
                <Input value={form.customer_email} onChange={e => u("customer_email", e.target.value)} placeholder="max@mail.de" className="bg-secondary border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Adresse</Label>
                <Input value={form.customer_address} onChange={e => u("customer_address", e.target.value)} placeholder="Musterstraße 1, 12345 Musterstadt" className="bg-secondary border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Aufgenommen von</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {TEAM.map(emp => (
                    <button key={emp} onClick={() => u("aufgenommen_von", emp)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${form.aufgenommen_von === emp ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground"}`}>
                      {emp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Fahrzeugdaten */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-4 h-4 text-muted-foreground" />
                <p className="font-heading text-sm text-foreground tracking-wide">FAHRZEUGDATEN</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Kennzeichen *</Label>
                <Input value={form.vehicle_license_plate} onChange={e => u("vehicle_license_plate", e.target.value.toUpperCase())}
                  placeholder="SON-TM 420" className="bg-secondary border-border mt-1 font-heading tracking-widest" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Marke</Label>
                  <Input value={form.vehicle_make} onChange={e => u("vehicle_make", e.target.value)} placeholder="BMW" className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Modell</Label>
                  <Input value={form.vehicle_model} onChange={e => u("vehicle_model", e.target.value)} placeholder="M3 Competition" className="bg-secondary border-border mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Farbe</Label>
                <Input value={form.vehicle_color} onChange={e => u("vehicle_color", e.target.value)} placeholder="Lagunengrün metallic" className="bg-secondary border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Fahrgestellnummer (VIN)</Label>
                <Input value={form.vehicle_vin} onChange={e => u("vehicle_vin", e.target.value.toUpperCase())} placeholder="WBA..." className="bg-secondary border-border mt-1 font-mono text-xs" />
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">Versicherung (optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Versicherung</Label>
                    <Input value={form.insurance} onChange={e => u("insurance", e.target.value)} placeholder="Allianz" className="bg-secondary border-border mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Schadennummer</Label>
                    <Input value={form.insurance_case_number} onChange={e => u("insurance_case_number", e.target.value)} placeholder="1234567890" className="bg-secondary border-border mt-1" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Schaden + Fahrzeugskizze */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <p className="font-heading text-sm text-foreground tracking-wide">SCHADENERFASSUNG</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Schadensstelle auf Skizze markieren *</Label>
                <FahrzeugSkizze selected={form.damage_location} onToggle={toggleDamageLocation} />
              </div>

              {form.damage_location.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.damage_location.map(loc => (
                    <span key={loc} className="flex items-center gap-1 text-xs bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full">
                      {loc}
                      <button onClick={() => toggleDamageLocation(loc)}><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground">Schadensbeschreibung *</Label>
                <Textarea value={form.damage_description} onChange={e => u("damage_description", e.target.value)}
                  placeholder="Detaillierte Beschreibung des Schadens..." className="bg-secondary border-border mt-1 h-20" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Schadensfotos</Label>
                <PhotoUploader photos={form.damage_photos} onChange={v => u("damage_photos", v)} />
              </div>
            </div>
          )}

          {/* STEP 4: Kalkulation & Termin */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <Euro className="w-4 h-4 text-muted-foreground" />
                <p className="font-heading text-sm text-foreground tracking-wide">KALKULATION & TERMIN</p>
              </div>
              <div className={`rounded-xl border p-4 transition-all ${form.kalkulation_gewuenscht ? "border-warning/40 bg-warning/5" : "border-border bg-secondary/30"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Kalkulation gewünscht</p>
                    <p className="text-xs text-muted-foreground">Kostenpflichtig · 90,00 €</p>
                  </div>
                  <button onClick={() => u("kalkulation_gewuenscht", !form.kalkulation_gewuenscht)}
                    className={`w-12 h-6 rounded-full transition-all relative ${form.kalkulation_gewuenscht ? "bg-warning" : "bg-secondary border border-border"}`}>
                    <span className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${form.kalkulation_gewuenscht ? "left-6" : "left-0.5"}`} />
                  </button>
                </div>
                {form.kalkulation_gewuenscht && (
                  <div className="grid grid-cols-2 gap-3 border-t border-warning/20 pt-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Wunschtermin Datum</Label>
                      <Input type="date" value={form.kalkulation_termin} onChange={e => u("kalkulation_termin", e.target.value)} className="bg-background border-border mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Uhrzeit</Label>
                      <Input type="time" value={form.kalkulation_uhrzeit} onChange={e => u("kalkulation_uhrzeit", e.target.value)} className="bg-background border-border mt-1" />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Wunschtermin Reparatur</Label>
                <Input type="date" value={form.reparatur_termin} onChange={e => u("reparatur_termin", e.target.value)} className="bg-secondary border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Zusätzliche Notizen</Label>
                <Textarea value={form.notes} onChange={e => u("notes", e.target.value)} placeholder="z.B. Besondere Wünsche..." className="bg-secondary border-border mt-1 h-20" />
              </div>
            </div>
          )}

          {/* STEP 5: Unterschrift */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <p className="font-heading text-sm text-foreground tracking-wide">KUNDENUNTERSCHRIFT</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Ich bestätige die Richtigkeit meiner Angaben und stimme der Schadensdokumentation zu.
              </p>
              <SignaturPad
                onSave={(dataUrl) => u("customer_signature", dataUrl)}
                existingUrl={form.customer_signature}
              />
              <p className="text-[10px] text-muted-foreground text-center">Unterschrift ist optional – kann übersprungen werden.</p>
            </div>
          )}

          {/* STEP 6: Zusammenfassung */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <p className="font-heading text-sm text-foreground tracking-wide">ZUSAMMENFASSUNG</p>
              </div>
              <div className="space-y-3">
                {[
                  ["Kunde", form.customer_name],
                  ["Telefon", form.customer_phone],
                  ["E-Mail", form.customer_email || "–"],
                  ["Fahrzeug", `${form.vehicle_license_plate}${form.vehicle_make ? ` · ${form.vehicle_make} ${form.vehicle_model}` : ""}`],
                  ["Schadensstelle", (form.damage_location || []).join(", ")],
                  ["Fotos", `${form.damage_photos.length} Fotos`],
                  ["Kalkulation", form.kalkulation_gewuenscht ? `Ja · 90 € · ${form.kalkulation_termin || "Termin offen"}` : "Nein"],
                  ["Reparatur", form.reparatur_termin || "–"],
                  ["Unterschrift", form.customer_signature ? "✅ Vorhanden" : "Nicht erfasst"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm border-b border-border pb-2">
                    <span className="text-muted-foreground">{k}</span>
                    <span className={`font-medium text-right max-w-[60%] ${k === "Kalkulation" && form.kalkulation_gewuenscht ? "text-warning" : ""}`}>{v}</span>
                  </div>
                ))}
              </div>
              {form.customer_email && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-secondary/50 rounded-xl text-xs text-muted-foreground">
                  <Send className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Bestätigungsmail wird automatisch an <strong className="text-foreground">{form.customer_email}</strong> gesendet. Kunde wird auch im CRM angelegt.</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 border-border gap-2">
            <ChevronLeft className="w-4 h-4" /> Zurück
          </Button>
        )}
        {step < STEPS.length ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="flex-1 bg-primary gap-2">
            Weiter <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={createMutation.isPending} className="flex-1 bg-primary gap-2">
            {createMutation.isPending ? "Wird gespeichert..." : <><CheckCircle2 className="w-4 h-4" /> Aufnahme abschließen</>}
          </Button>
        )}
      </div>
    </div>
  );
}