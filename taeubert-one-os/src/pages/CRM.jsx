import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Star, Phone, Mail, Car, ChevronRight, Crown, BarChart2, ClipboardCheck, MessageCircle, Calendar, CheckCircle2 } from "lucide-react";
import CustomerValuePanel from "../components/crm/CustomerValuePanel";
import CustomerIntelligencePanel from "../components/crm/CustomerIntelligencePanel";
import VehicleLifestyleProfile from "../components/crm/VehicleLifestyleProfile";
import SmartRecommendations from "../components/crm/SmartRecommendations";
import MoodTracker from "../components/crm/MoodTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

const CUSTOMER_TYPES = {
  privat: { label: "Privat", color: "bg-muted text-muted-foreground" },
  autohaus: { label: "Autohaus", color: "bg-info/20 text-info" },
  versicherung: { label: "Versicherung", color: "bg-chart-2/20 text-chart-2" },
  flotte: { label: "Flotte", color: "bg-primary/20 text-primary" },
  premium: { label: "Premium ★", color: "bg-warning/20 text-warning" },
  interessent: { label: "Interessent", color: "bg-muted text-muted-foreground" },
  stammkunde: { label: "Stammkunde", color: "bg-success/20 text-success" },
};

const JOURNEY_STAGES = {
  interessent: "Interessent",
  erstkontakt: "Erstkontakt",
  annahme: "Annahme",
  kalkulation: "Kalkulation",
  aktiv: "Aktiv",
  fertigstellung: "Fertigstellung",
  uebergabe: "Übergabe",
  nachkontakt: "Nachkontakt",
  stammkunde: "Stammkunde",
};

export default function CRM() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("alle");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [crmTab, setCrmTab] = useState("liste");
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("-created_date", 200),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => base44.entities.Vehicle.list("-created_date", 100),
  });

  const { data: errorsCRM = [] } = useQuery({
    queryKey: ["errors-crm"],
    queryFn: () => base44.entities.ErrorReport.list("-created_date", 200),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["customer-orders"],
    queryFn: () => base44.entities.CustomerOrder.list("-created_date", 500),
  });

  const sendNotificationMutation = useMutation({
    mutationFn: ({ customer_id, order_id, method }) => 
      base44.functions.invoke('sendCustomerNotification', { customer_id, order_id, method }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      if (selected) setSelected({...selected});
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customers"] }); setShowAdd(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  const filtered = customers.filter(c => {
    const term = search.toLowerCase();
    const matchSearch = !term || c.name?.toLowerCase().includes(term) || c.phone?.includes(term) || c.email?.toLowerCase().includes(term);
    const matchType = typeFilter === "alle" || c.customer_type === typeFilter;
    return matchSearch && matchType;
  });

  // Customer's vehicles
  const getCustomerVehicles = (customerName) =>
    vehicles.filter(v => v.customer_name?.toLowerCase() === customerName?.toLowerCase());

  const selectedVehicles = selected ? getCustomerVehicles(selected.name) : [];
  
  const getCustomerOrders = (customerId) =>
    orders.filter(o => o.customer_id === customerId);
  
  const selectedOrders = selected ? getCustomerOrders(selected.id) : [];
  
  const handleSendNotification = async (orderId, method) => {
    if (!selected) return;
    sendNotificationMutation.mutate({ 
      customer_id: selected.id, 
      order_id: orderId, 
      method 
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">CRM</h1>
            <p className="text-sm text-muted-foreground mt-1">{customers.length} Kunden · Täubert Kundenbasis</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1 p-1 bg-secondary rounded-xl">
              {[{ key: "liste", label: "Liste", icon: ChevronRight }, { key: "analyse", label: "Kundenwert", icon: BarChart2 }].map(t => (
                <button key={t.key} onClick={() => setCrmTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${crmTab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  <t.icon className="w-3 h-3" />{t.label}
                </button>
              ))}
            </div>
            {crmTab === "liste" && (
              <>
                <div className="relative w-44">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche..." className="pl-9 bg-secondary border-border" />
                </div>
                <Button onClick={() => setShowAdd(true)} className="bg-primary hover:bg-primary/80 gap-2">
                  <Plus className="w-4 h-4" /> Kunde
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Kundenwert Tab */}
      {crmTab === "analyse" && (
        <div className="mb-6">
          <CustomerValuePanel customers={customers} vehicles={vehicles} errors={errorsCRM} />
        </div>
      )}

      {crmTab === "liste" && (
        <>
        <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTypeFilter("alle")}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${typeFilter === "alle" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
        >
          Alle ({customers.length})
        </button>
        {Object.entries(CUSTOMER_TYPES).map(([k, v]) => {
          const count = customers.filter(c => c.customer_type === k).length;
          if (count === 0) return null;
          return (
            <button
              key={k}
              onClick={() => setTypeFilter(k)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${typeFilter === k ? "bg-primary text-primary-foreground border-primary" : `${v.color} border-border hover:border-primary/30`}`}
            >
              {v.label} ({count})
            </button>
          );
        })}
      </div>

      <div className={`${selected ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : ""}`}>
        {/* Customer List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Keine Kunden gefunden.</p>
          ) : (
            filtered.map((c, i) => {
              const typeCfg = CUSTOMER_TYPES[c.customer_type] || CUSTOMER_TYPES.privat;
              const cvehicles = getCustomerVehicles(c.name);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  className={`bg-card border rounded-xl p-4 cursor-pointer transition-all
                    ${selected?.id === c.id ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${typeCfg.color}`}>{typeCfg.label}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {c.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                        {c.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {cvehicles.length > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Car className="w-3 h-3" /> {cvehicles.length} Fz.
                          </span>
                        )}
                        {c.journey_stage && (
                          <span className="text-[10px] px-2 py-0.5 bg-secondary rounded-md text-muted-foreground">
                            {JOURNEY_STAGES[c.journey_stage]}
                          </span>
                        )}
                        {c.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-warning">
                            <Star className="w-3 h-3 fill-warning" />{c.rating}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${selected?.id === c.id ? "rotate-90" : ""}`} />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Customer Detail Panel */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-primary/30 rounded-xl p-5 space-y-5 h-fit"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-lg text-foreground">{selected.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-md mt-1 inline-block ${CUSTOMER_TYPES[selected.customer_type]?.color || ""}`}>
                  {CUSTOMER_TYPES[selected.customer_type]?.label}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </div>

            {/* Contact Info */}
            <div className="space-y-1.5 text-sm">
              {selected.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" />{selected.phone}</div>}
              {selected.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{selected.email}</div>}
              {selected.address && <div className="text-xs text-muted-foreground pl-5">{selected.address}</div>}
            </div>

            {/* Service Contract & Preferences */}
            <div className="grid grid-cols-2 gap-3">
              {selected.service_contract && (
                <div className="p-2.5 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span className="text-[10px] font-semibold text-success">SERVICE-VERTRAG</span>
                  </div>
                  {selected.service_contract_details && (
                    <p className="text-[10px] text-muted-foreground">{selected.service_contract_details}</p>
                  )}
                </div>
              )}
              {selected.preferred_contact && (selected.whatsapp_opt_in || selected.mail_opt_in) && (
                <div className="p-2.5 bg-info/5 border border-info/20 rounded-lg">
                  <p className="text-[9px] font-semibold text-info mb-1">KONTAKT-OPT-IN</p>
                  <div className="space-y-0.5 text-[10px] text-muted-foreground">
                    {selected.whatsapp_opt_in && <div className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />WhatsApp ✓</div>}
                    {selected.mail_opt_in && <div className="flex items-center gap-1"><Mail className="w-3 h-3" />E-Mail ✓</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Journey Stage */}
            <div>
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">JOURNEY-STUFE</p>
              <Select
                value={selected.journey_stage || "interessent"}
                onValueChange={v => {
                  updateMutation.mutate({ id: selected.id, data: { journey_stage: v } });
                  setSelected(prev => ({ ...prev, journey_stage: v }));
                }}
              >
                <SelectTrigger className="bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {Object.entries(JOURNEY_STAGES).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Vehicles with Lifestyle Profiles */}
            {selectedVehicles.length > 0 && (
              <div>
                <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">FAHRZEUGE ({selectedVehicles.length})</p>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedVehicles.map(v => (
                    <div key={v.id} className="border border-border rounded-xl p-3 bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-foreground">{v.make} {v.model}</span>
                          <span className="text-xs text-muted-foreground ml-2 font-mono">{v.license_plate}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${v.status === 'uebergabe' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                          {v.status}
                        </span>
                      </div>
                      <VehicleLifestyleProfile vehicle={v} orders={selectedOrders.filter(o => o.vehicle_id === v.id)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders / Aufträge */}
            <div>
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <ClipboardCheck className="w-3 h-3" /> AUFTRÄGE ({selectedOrders.length})
              </p>
              {selectedOrders.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Keine Aufträge vorhanden</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedOrders.map(o => (
                    <div key={o.id} className="border border-border rounded-lg p-3 bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{o.title}</p>
                          <p className="text-xs text-muted-foreground">{o.vehicle_info}</p>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium
                          ${o.status === 'abgeschlossen' ? 'bg-success/20 text-success' : 
                            o.status === 'in_arbeit' ? 'bg-primary/20 text-primary' :
                            o.status === 'fertig' ? 'bg-warning/20 text-warning' :
                            'bg-muted text-muted-foreground'}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Typ:</span>
                          <span className="text-foreground">{o.order_type}</span>
                        </div>
                        {o.appointment_date && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{o.appointment_date} {o.appointment_time}</span>
                          </div>
                        )}
                        {o.estimated_cost && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Kosten:</span>
                            <span className="text-foreground">{o.estimated_cost} €</span>
                          </div>
                        )}
                        {o.customer_notified ? (
                          <div className="flex items-center gap-1.5 text-success mt-2">
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="text-[10px]">Kunde informiert ({o.notification_method})</span>
                          </div>
                        ) : (
                          <div className="flex gap-1.5 mt-2">
                            <button
                              onClick={() => handleSendNotification(o.id, 'whatsapp')}
                              disabled={!selected.whatsapp_opt_in}
                              className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 ${selected.whatsapp_opt_in ? 'bg-success/20 text-success hover:bg-success/30' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                            >
                              <MessageCircle className="w-3 h-3" /> WhatsApp
                            </button>
                            <button
                              onClick={() => handleSendNotification(o.id, 'mail')}
                              disabled={!selected.mail_opt_in}
                              className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 ${selected.mail_opt_in ? 'bg-info/20 text-info hover:bg-info/30' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                            >
                              <Mail className="w-3 h-3" /> E-Mail
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Recommendations */}
            <div className="border-t border-border pt-4">
              <SmartRecommendations customerId={selected.id} />
            </div>

            {/* Mood Tracker */}
            <div className="mt-4">
              <MoodTracker customer={selected} />
            </div>

            {/* Customer Intelligence */}
            <div className="mt-4">
              <CustomerIntelligencePanel customer={selected} />
            </div>

            {/* Notes */}
            {selected.special_wishes && (
              <div>
                <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-1">BESONDERE WÜNSCHE</p>
                <p className="text-xs text-foreground/80">{selected.special_wishes}</p>
              </div>
            )}
            {selected.notes && (
              <div>
                <p className="text-[10px] tracking-wider text-muted-foreground uppercase mb-1">NOTIZEN</p>
                <p className="text-xs text-foreground/80">{selected.notes}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
      </>
      )}

      {/* Add Customer Dialog */}
      <AddCustomerDialog open={showAdd} onClose={() => setShowAdd(false)} onSubmit={createMutation.mutate} isLoading={createMutation.isPending} />
    </div>
  );
}

function AddCustomerDialog({ open, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState({ 
    name: "", phone: "", email: "", address: "", birthday: "", occupation: "", company: "",
    customer_type: "privat", journey_stage: "interessent", 
    notes: "", special_wishes: "", preferences: "", wishlist: "",
    service_contract: false, service_contract_details: "",
    preferred_contact: "telefon", communication_style: "formell",
    whatsapp_opt_in: false, mail_opt_in: false, vip_status: false,
    behavior_traits: [], favorite_brands: [], interests: []
  });
  const u = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); setForm({ name: "", phone: "", email: "", address: "", customer_type: "privat", journey_stage: "interessent", notes: "", special_wishes: "" }); };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-wide">NEUER KUNDE</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label className="text-xs text-muted-foreground">Name *</Label>
            <Input value={form.name} onChange={e => u("name", e.target.value)} required className="bg-secondary border-border mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Telefon</Label>
              <Input value={form.phone} onChange={e => u("phone", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">E-Mail</Label>
              <Input type="email" value={form.email} onChange={e => u("email", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Adresse</Label>
            <Input value={form.address} onChange={e => u("address", e.target.value)} className="bg-secondary border-border mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Kundentyp</Label>
              <Select value={form.customer_type} onValueChange={v => u("customer_type", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {Object.entries(CUSTOMER_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Journey-Stufe</Label>
              <Select value={form.journey_stage} onValueChange={v => u("journey_stage", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {Object.entries(JOURNEY_STAGES).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Besondere Wünsche</Label>
            <Textarea value={form.special_wishes} onChange={e => u("special_wishes", e.target.value)} className="bg-secondary border-border mt-1 h-16" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Notizen</Label>
            <Textarea value={form.notes} onChange={e => u("notes", e.target.value)} className="bg-secondary border-border mt-1 h-16" />
          </div>
          
          {/* Service Contract */}
          <div className="border border-border rounded-lg p-3 bg-secondary/50">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={form.service_contract}
                onChange={e => u("service_contract", e.target.checked)}
                className="rounded"
              />
              Hat Service-Vertrag
            </Label>
            {form.service_contract && (
              <Textarea 
                value={form.service_contract_details}
                onChange={e => u("service_contract_details", e.target.value)}
                placeholder="Details zum Service-Vertrag..."
                className="bg-secondary border-border mt-2 h-16 text-xs"
              />
            )}
          </div>

          {/* Kontakt-Präferenzen */}
          <div className="border border-border rounded-lg p-3 bg-secondary/50">
            <Label className="text-xs text-muted-foreground mb-2 block">Bevorzugter Kontaktweg</Label>
            <Select value={form.preferred_contact} onValueChange={v => u("preferred_contact", v)}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="telefon">Telefon</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="mail">E-Mail</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-4 mt-3">
              <Label className="text-xs flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={form.whatsapp_opt_in}
                  onChange={e => u("whatsapp_opt_in", e.target.checked)}
                  className="rounded"
                />
                <span className="text-muted-foreground">WhatsApp erlaubt</span>
              </Label>
              <Label className="text-xs flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={form.mail_opt_in}
                  onChange={e => u("mail_opt_in", e.target.checked)}
                  className="rounded"
                />
                <span className="text-muted-foreground">E-Mail erlaubt</span>
              </Label>
            </div>
          </div>

          {/* Premium Fields */}
          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold text-foreground mb-3">PREMIUM-DATEN</p>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs text-muted-foreground">Geburtstag</Label>
                <Input 
                  type="date"
                  value={form.birthday} 
                  onChange={e => u("birthday", e.target.value)} 
                  className="bg-secondary border-border mt-1 text-xs" 
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Beruf</Label>
                <Input 
                  value={form.occupation} 
                  onChange={e => u("occupation", e.target.value)} 
                  className="bg-secondary border-border mt-1 text-xs" 
                />
              </div>
            </div>
            
            <div className="mb-3">
              <Label className="text-xs text-muted-foreground">Firma</Label>
              <Input 
                value={form.company} 
                onChange={e => u("company", e.target.value)} 
                className="bg-secondary border-border mt-1 text-xs" 
              />
            </div>

            <div className="mb-3">
              <Label className="text-xs text-muted-foreground">Kommunikationsstil</Label>
              <Select value={form.communication_style} onValueChange={v => u("communication_style", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="kurz_praezise">Kurz & Präzise</SelectItem>
                  <SelectItem value="detailliert">Detailliert</SelectItem>
                  <SelectItem value="emotional">Emotional</SelectItem>
                  <SelectItem value="technisch">Technisch</SelectItem>
                  <SelectItem value="formell">Formell</SelectItem>
                  <SelectItem value="locker">Locker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-3">
              <Label className="text-xs text-muted-foreground">Verhaltensmerkmale</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {["preisorientiert", "qualitaetsorientiert", "emotional", "detailverliebt", "hektisch", "anspruchsvoll", "loyal", "empfehlungsgeber", "vip"].map(trait => (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => {
                      const exists = form.behavior_traits.includes(trait);
                      u("behavior_traits", exists ? form.behavior_traits.filter(t => t !== trait) : [...form.behavior_traits, trait]);
                    }}
                    className={`text-[9px] px-2 py-1 rounded border transition-all ${
                      form.behavior_traits.includes(trait)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {trait.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <Label className="text-xs text-muted-foreground">Interessen</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {["motorsport", "oldtimer", "performance", "pflege", "tuning", "nachhaltigkeit", "elektrisch"].map(int => (
                  <button
                    key={int}
                    type="button"
                    onClick={() => {
                      const exists = form.interests.includes(int);
                      u("interests", exists ? form.interests.filter(i => i !== int) : [...form.interests, int]);
                    }}
                    className={`text-[9px] px-2 py-1 rounded border transition-all ${
                      form.interests.includes(int)
                        ? "bg-chart-2 text-chart-2-foreground border-chart-2"
                        : "bg-secondary border-border text-muted-foreground hover:border-chart-2/30"
                    }`}
                  >
                    {int}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <Label className="text-xs text-muted-foreground">Persönliche Präferenzen</Label>
              <Textarea 
                value={form.preferences}
                onChange={e => u("preferences", e.target.value)}
                placeholder="z.B. trinkt Espresso, mag kurze Updates..."
                className="bg-secondary border-border mt-1 h-12 text-xs"
              />
            </div>

            <div className="mb-3">
              <Label className="text-xs text-muted-foreground">Wunschliste</Label>
              <Textarea 
                value={form.wishlist}
                onChange={e => u("wishlist", e.target.value)}
                placeholder="Zukünftige Arbeiten..."
                className="bg-secondary border-border mt-1 h-12 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="vip"
                checked={form.vip_status}
                onChange={e => u("vip_status", e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="vip" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
                <Crown className="w-3 h-3 text-warning" /> VIP-Status
              </Label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border">Abbrechen</Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/80">{isLoading ? "..." : "Anlegen"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}