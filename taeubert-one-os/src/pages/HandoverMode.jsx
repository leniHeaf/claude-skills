import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Star, Car, FileSignature, ChevronRight, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

const HANDOVER_CHECKLIST = [
  "Fahrzeug gereinigt & poliert",
  "Alle Anbauteile montiert",
  "Innenraum gesaugt & gereinigt",
  "Fenster innen & außen",
  "Reifenglanz aufgetragen",
  "Fahrzeugpapiere vollständig",
  "Schlüssel bereitgelegt",
  "Kundenakte geprüft",
  "Fotos für Dokumentation gemacht",
];

const CARE_INSTRUCTIONS = `Pflegehinweise für Ihren frisch lackierten Bereich:

• Erste 30 Tage: Keine Waschstraße verwenden
• Handwäsche mit pH-neutralem Shampoo empfohlen
• Direkte Sonneneinstrahlung direkt nach Lackierung vermeiden
• Keine aggressiven Reinigungsmittel auf lackierten Flächen
• Bei Fragen steht Ihnen unser Team jederzeit zur Verfügung

Wir wünschen Ihnen viel Freude mit Ihrem Fahrzeug!
— Team Täubert`;

function StarRating({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)}>
          <Star className={`w-7 h-7 transition-colors ${n <= value ? "text-warning fill-warning" : "text-border hover:text-warning/50"}`} />
        </button>
      ))}
    </div>
  );
}

export default function HandoverMode() {
  const queryClient = useQueryClient();
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [step, setStep] = useState(0); // 0=select, 1=checklist, 2=photos, 3=care, 4=rating, 5=complete
  const [checks, setChecks] = useState(HANDOVER_CHECKLIST.reduce((a, c) => ({ ...a, [c]: false }), {}));
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [notes, setNotes] = useState("");

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 100),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Handover.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setStep(5);
    },
  });

  const readyVehicles = vehicles.filter(v => ["endkontrolle", "uebergabe"].includes(v.status));
  const selected = vehicles.find(v => v.id === selectedVehicleId);
  const allChecked = Object.values(checks).every(Boolean);

  const handleComplete = () => {
    saveMutation.mutate({
      vehicle_id: selectedVehicleId,
      vehicle_info: selected ? `${selected.make} ${selected.model} - ${selected.license_plate}` : "",
      customer_name: selected?.customer_name || "",
      checklist: HANDOVER_CHECKLIST.map(item => ({ item, checked: checks[item] })),
      care_instructions: CARE_INSTRUCTIONS,
      rating,
      rating_comment: ratingComment,
      notes,
      completed: true,
      completed_at: new Date().toISOString(),
    });
  };

  const STEPS = [
    { label: "Fahrzeug", icon: Car },
    { label: "Checkliste", icon: CheckCircle },
    { label: "Pflegehinweise", icon: FileSignature },
    { label: "Bewertung", icon: Star },
  ];

  if (step === 5) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-24 h-24 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-success" />
          </div>
          <h1 className="font-heading text-2xl text-foreground mb-2">ÜBERGABE ABGESCHLOSSEN</h1>
          <p className="text-muted-foreground mb-2">{selected?.make} {selected?.model}</p>
          <p className="text-sm text-muted-foreground mb-6">{selected?.customer_name}</p>
          {rating > 0 && (
            <div className="flex justify-center gap-1 mb-6">
              {[1,2,3,4,5].map(n => (
                <Star key={n} className={`w-6 h-6 ${n <= rating ? "text-warning fill-warning" : "text-border"}`} />
              ))}
            </div>
          )}
          <Button
            onClick={() => { setStep(0); setSelectedVehicleId(""); setChecks(HANDOVER_CHECKLIST.reduce((a,c) => ({...a,[c]:false}), {})); setRating(0); setRatingComment(""); }}
            className="bg-primary hover:bg-primary/80"
          >
            Neue Übergabe
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <div className="bg-card border-b border-border p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <h1 className="font-heading text-lg tracking-[0.3em] text-foreground">PREMIUM ÜBERGABE</h1>
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xs tracking-widest text-muted-foreground">TÄUBERT MANUFAKTUR</p>
      </div>

      {/* Step Indicator */}
      {step > 0 && (
        <div className="flex items-center justify-center gap-2 p-4 border-b border-border">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold
                ${i < step ? "bg-success text-white" : i === step - 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] tracking-wider hidden md:block ${i === step - 1 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                {s.label.toUpperCase()}
              </span>
              {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {/* Step 0: Select Vehicle */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="font-heading text-xl text-foreground mb-2">FAHRZEUG AUSWÄHLEN</h2>
              <p className="text-sm text-muted-foreground mb-6">Welches Fahrzeug wird übergeben?</p>
              <div className="space-y-3">
                {readyVehicles.map(v => (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedVehicleId(v.id); setStep(1); }}
                    className="w-full text-left p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-heading text-sm text-foreground">{v.make} {v.model}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{v.license_plate} · {v.customer_name}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </button>
                ))}
                {readyVehicles.length === 0 && (
                  <p className="text-center text-muted-foreground py-10 text-sm">Keine Fahrzeuge für Übergabe bereit.<br/>Status muss „Endkontrolle" oder „Übergabe" sein.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 1: Checklist */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="font-heading text-xl text-foreground mb-1">ÜBERGABE-CHECKLISTE</h2>
              <p className="text-sm text-muted-foreground mb-6">{selected?.make} {selected?.model} · {selected?.customer_name}</p>
              <div className="space-y-2 mb-6">
                {HANDOVER_CHECKLIST.map(item => (
                  <button
                    key={item}
                    onClick={() => setChecks(c => ({ ...c, [item]: !c[item] }))}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all border
                      ${checks[item] ? "bg-success/10 border-success/30" : "bg-card border-border hover:border-primary/30"}`}
                  >
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                      ${checks[item] ? "bg-success" : "bg-secondary border border-border"}`}>
                      {checks[item] && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className={`text-sm ${checks[item] ? "text-foreground" : "text-muted-foreground"}`}>{item}</span>
                  </button>
                ))}
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!allChecked}
                className="w-full bg-primary hover:bg-primary/80 gap-2"
              >
                Weiter → Pflegehinweise
                {!allChecked && <span className="text-xs opacity-60">({Object.values(checks).filter(Boolean).length}/{HANDOVER_CHECKLIST.length})</span>}
              </Button>
            </motion.div>
          )}

          {/* Step 2: Care Instructions */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="font-heading text-xl text-foreground mb-1">PFLEGEHINWEISE</h2>
              <p className="text-sm text-muted-foreground mb-6">Diese Information erhält der Kunde</p>
              <div className="bg-card border border-border rounded-xl p-5 mb-6">
                <pre className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed font-body">{CARE_INSTRUCTIONS}</pre>
              </div>
              <div className="mb-6">
                <label className="text-xs text-muted-foreground mb-2 block">Zusatznotizen</label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Individuelle Hinweise für diesen Kunden..."
                  className="bg-secondary border-border h-24"
                />
              </div>
              <Button onClick={() => setStep(3)} className="w-full bg-primary hover:bg-primary/80">
                Weiter → Bewertung
              </Button>
            </motion.div>
          )}

          {/* Step 3: Rating */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="font-heading text-xl text-foreground mb-1">KUNDENBEWERTUNG</h2>
              <p className="text-sm text-muted-foreground mb-8">Wie zufrieden war {selected?.customer_name}?</p>
              <div className="flex justify-center mb-6">
                <StarRating value={rating} onChange={setRating} />
              </div>
              <div className="mb-6">
                <label className="text-xs text-muted-foreground mb-2 block">Kommentar (optional)</label>
                <Textarea
                  value={ratingComment}
                  onChange={e => setRatingComment(e.target.value)}
                  placeholder="Was hat der Kunde gesagt?"
                  className="bg-secondary border-border h-24"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-border">Zurück</Button>
                <Button
                  onClick={handleComplete}
                  disabled={saveMutation.isPending}
                  className="flex-1 bg-success/20 hover:bg-success/30 text-success border border-success/30"
                >
                  {saveMutation.isPending ? "Speichern..." : "Übergabe abschließen"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}