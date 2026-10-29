import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageSquare, Phone, Star, CheckCircle2, AlertCircle, RefreshCw, ThumbsUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseISO } from "date-fns";

const NACHKONTAKT_TEMPLATES = [
  {
    id: "zufriedenheit",
    label: "Zufriedenheits-Check",
    icon: ThumbsUp,
    color: "text-success",
    bg: "bg-success/10",
    message: (name) => `Hallo ${name},\n\nwir hoffen, Sie sind mit Ihrem Fahrzeug vollständig zufrieden.\n\nFalls Sie Fragen oder Anmerkungen haben, stehen wir Ihnen jederzeit zur Verfügung.\n\nBeste Grüße\nIhr Täubert Team`,
  },
  {
    id: "bewertung",
    label: "Google-Bewertung",
    icon: Star,
    color: "text-warning",
    bg: "bg-warning/10",
    message: (name) => `Hallo ${name},\n\nwir würden uns sehr freuen, wenn Sie Ihre Erfahrung mit uns teilen würden.\n\nEine kurze Google-Bewertung hilft anderen Kunden und unterstützt unser Team enorm.\n\nVielen Dank!\nTäubert Karosserie & Lack`,
  },
  {
    id: "reaktivierung",
    label: "Reaktivierung",
    icon: RefreshCw,
    color: "text-info",
    bg: "bg-info/10",
    message: (name) => `Hallo ${name},\n\nIhr letzter Besuch bei uns liegt bereits eine Weile zurück.\n\nMöchten Sie einen Termin für eine Fahrzeugaufbereitung, Reifenwechsel oder einen Pflegecheck vereinbaren?\n\nWir freuen uns auf Ihren Besuch.\nTäubert Team`,
  },
];

export default function NachkontaktPanel({ customers, vehicles }) {
  const [selected, setSelected] = useState(null);
  const [template, setTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  // Customers that need follow-up: handed over 3-7 days ago, no recent contact
  const today = new Date();
  const needsFollowUp = customers.filter(c => {
    if (c.journey_stage !== "nachkontakt" && c.journey_stage !== "uebergabe") return false;
    if (!c.last_contact) return true;
    const lastContact = parseISO(c.last_contact);
    const daysSince = (today - lastContact) / (1000 * 60 * 60 * 24);
    return daysSince >= 3;
  });

  const allContacted = customers.filter(c => c.journey_stage === "stammkunde");

  const getCustomerVehicles = (name) =>
    vehicles.filter(v => v.customer_name?.toLowerCase() === name?.toLowerCase());

  const handleTemplateSelect = (tmpl) => {
    setTemplate(tmpl);
    setCustomMessage(tmpl.message(selected?.name || "Kunde"));
  };

  const handleMarkContacted = (customer) => {
    updateMutation.mutate({
      id: customer.id,
      data: { last_contact: new Date().toISOString().split("T")[0], journey_stage: "stammkunde" },
    });
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Nachkontakt fällig", value: needsFollowUp.length, color: "text-warning", bg: "bg-warning/10 border-warning/20", icon: AlertCircle },
          { label: "Kontaktiert heute", value: customers.filter(c => c.last_contact === today.toISOString().split("T")[0]).length, color: "text-success", bg: "bg-success/10 border-success/20", icon: CheckCircle2 },
          { label: "Stammkunden", value: allContacted.length, color: "text-primary", bg: "bg-primary/10 border-primary/20", icon: Star },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-xl p-3 border ${stat.bg} text-center`}>
              <Icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className={`font-heading text-2xl ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className={selected ? "grid grid-cols-1 lg:grid-cols-2 gap-5" : ""}>
        {/* Follow-up List */}
        <div>
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-3">NACHKONTAKT FÄLLIG</p>
          {needsFollowUp.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Alle Kunden wurden kontaktiert.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {needsFollowUp.map((c, i) => {
                const cvehicles = getCustomerVehicles(c.name);
                const lastVehicle = cvehicles[cvehicles.length - 1];
                const daysSince = c.last_contact
                  ? Math.round((today - parseISO(c.last_contact)) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => setSelected(selected?.id === c.id ? null : c)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all
                      ${selected?.id === c.id ? "border-primary/50 bg-primary/5" : "border-border bg-card hover:border-primary/20"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lastVehicle && (
                            <span className="text-[10px] text-muted-foreground">{lastVehicle.make} {lastVehicle.model}</span>
                          )}
                          {daysSince !== null && (
                            <span className={`text-[10px] ${daysSince > 7 ? "text-destructive" : "text-warning"}`}>
                              vor {daysSince} Tagen
                            </span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline"
                        onClick={(e) => { e.stopPropagation(); handleMarkContacted(c); }}
                        className="text-[10px] h-7 border-success/30 text-success hover:bg-success/10">
                        Kontaktiert ✓
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Panel */}
        {selected && (
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-card border border-primary/30 rounded-xl p-4">
              <p className="text-[9px] tracking-wider text-muted-foreground uppercase mb-3">NACHRICHT AN: {selected.name}</p>

              {/* Templates */}
              <div className="space-y-2 mb-4">
                {NACHKONTAKT_TEMPLATES.map(tmpl => {
                  const Icon = tmpl.icon;
                  return (
                    <button key={tmpl.id} onClick={() => handleTemplateSelect(tmpl)}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all text-sm
                        ${template?.id === tmpl.id ? `${tmpl.bg} border-current ${tmpl.color}` : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${template?.id === tmpl.id ? tmpl.color : ""}`} />
                      {tmpl.label}
                    </button>
                  );
                })}
              </div>

              {template && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <Textarea
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    className="bg-secondary border-border h-40 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" className="border-chart-2/30 text-chart-2 hover:bg-chart-2/10 gap-1.5 text-xs">
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5 text-xs">
                      <Phone className="w-3.5 h-3.5" /> Anruf notieren
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Google review link */}
              <div className="mt-3 p-2.5 bg-warning/10 border border-warning/20 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-warning uppercase tracking-wider">Google Bewertung</p>
                  <p className="text-xs text-foreground mt-0.5">Link nach positivem Feedback senden</p>
                </div>
                <ExternalLink className="w-4 h-4 text-warning" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}