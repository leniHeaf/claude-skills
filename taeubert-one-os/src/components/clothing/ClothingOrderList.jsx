import React, { useState } from "react";
import { CheckCircle2, X, Package, ChevronDown, ChevronUp, Truck, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ITEM_OPTIONS = [
  { value: "t-shirt", label: "T-Shirt" }, { value: "hoodie", label: "Hoodie" },
  { value: "softshell", label: "Softshelljacke" }, { value: "arbeitshose", label: "Arbeitshose" },
  { value: "sicherheitsschuhe", label: "Sicherheitsschuhe" }, { value: "cap", label: "Cap" },
  { value: "uebergabekleidung", label: "Übergabekleidung" }, { value: "sonstiges", label: "Sonstiges" },
];
const REASON_OPTIONS = [
  { value: "neu", label: "Neu" }, { value: "beschaedigt", label: "Beschädigt" },
  { value: "verschlissen", label: "Verschlissen" }, { value: "zusaetzlich", label: "Zusätzlich" },
];
const COST_ESTIMATES = { "t-shirt": 25, "hoodie": 55, "softshell": 80, "arbeitshose": 60, "sicherheitsschuhe": 90, "cap": 20, "uebergabekleidung": 70, "sonstiges": 30 };

const STATUS_CONFIG = {
  eingereicht: { label: "Offen", dot: "bg-warning animate-pulse", text: "text-warning" },
  genehmigt: { label: "Genehmigt", dot: "bg-success", text: "text-success" },
  abgelehnt: { label: "Abgelehnt", dot: "bg-destructive", text: "text-destructive" },
  bestellt: { label: "Bestellt", dot: "bg-info", text: "text-info" },
  ausgegeben: { label: "Ausgegeben", dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

const ITEM_LABELS = {
  "t-shirt": "T-Shirt", "hoodie": "Hoodie", "softshell": "Softshelljacke",
  "arbeitshose": "Arbeitshose", "sicherheitsschuhe": "Sicherheitsschuhe",
  "cap": "Cap", "uebergabekleidung": "Übergabekleidung", "sonstiges": "Sonstiges"
};

const REASON_LABELS = {
  "neu": "Neu", "beschaedigt": "Beschädigt", "verschlissen": "Verschlissen", "zusaetzlich": "Zusätzlich"
};

export default function ClothingOrderList({ orders, onApprove, onReject, onMarkOrdered, onMarkIssued, onEdit }) {
  const [filter, setFilter] = useState("eingereicht");
  const [expanded, setExpanded] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  const filtered = orders.filter(o => filter === "alle" ? true : o.status === filter);

  const FILTERS = [
    { key: "eingereicht", label: "Offen" },
    { key: "genehmigt", label: "Genehmigt" },
    { key: "bestellt", label: "Bestellt" },
    { key: "ausgegeben", label: "Ausgegeben" },
    { key: "alle", label: "Alle" },
  ];

  // Costs by employee
  const costByEmployee = orders
    .filter(o => o.status !== "abgelehnt")
    .reduce((acc, o) => {
      acc[o.employee] = (acc[o.employee] || 0) + (o.estimated_cost || 0);
      return acc;
    }, {});

  return (
    <div className="space-y-4">
      {/* Cost overview */}
      {Object.keys(costByEmployee).length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">KOSTEN JE MITARBEITER</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(costByEmployee).sort((a, b) => b[1] - a[1]).map(([emp, cost]) => (
              <div key={emp} className="text-center px-3 py-2 bg-secondary rounded-lg">
                <p className="text-sm font-heading text-foreground">{cost} €</p>
                <p className="text-[10px] text-muted-foreground">{emp}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
              ${filter === f.key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {f.label}
            {f.key !== "alle" && (
              <span className="ml-1.5 opacity-70">{orders.filter(o => o.status === f.key).length}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Keine Einträge</p>
        </div>
      )}

      {filtered.map(order => {
        const stat = STATUS_CONFIG[order.status] || STATUS_CONFIG.eingereicht;
        const isExp = expanded === order.id;

        return (
          <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 cursor-pointer" onClick={() => setExpanded(isExp ? null : order.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">
                      {order.employee} · {ITEM_LABELS[order.item] || order.item}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />
                      <span className={`text-[10px] font-medium ${stat.text}`}>{stat.label}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Größe: {order.size}</span>
                    <span>· {order.quantity}x</span>
                    <span>· {REASON_LABELS[order.reason] || order.reason}</span>
                    {order.estimated_cost && <span>· ~{order.estimated_cost} €</span>}
                  </div>
                </div>
                {isExp ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </div>
            </div>

            {isExp && (
              <div className="border-t border-border p-4 bg-secondary/30 space-y-3">
                {order.notes && <p className="text-xs text-muted-foreground">{order.notes}</p>}
                {order.manager_note && (
                  <p className="text-xs text-destructive">Ablehnungsgrund: {order.manager_note}</p>
                )}

                {editing === order.id ? (
                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">ANTRAG KORRIGIEREN</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Artikel</label>
                        <Select value={editForm.item} onValueChange={v => setEditForm(f => ({ ...f, item: v }))}>
                          <SelectTrigger className="bg-card border-border h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{ITEM_OPTIONS.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Größe</label>
                        <Input value={editForm.size || ""} onChange={e => setEditForm(f => ({ ...f, size: e.target.value }))} className="bg-card border-border h-8 text-xs" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Menge</label>
                        <Input type="number" min={1} max={5} value={editForm.quantity || 1} onChange={e => setEditForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} className="bg-card border-border h-8 text-xs" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Grund</label>
                        <Select value={editForm.reason} onValueChange={v => setEditForm(f => ({ ...f, reason: v }))}>
                          <SelectTrigger className="bg-card border-border h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{REASON_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Notiz</label>
                      <Textarea value={editForm.notes || ""} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} className="bg-card border-border h-16 text-xs" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => {
                        const cost = (COST_ESTIMATES[editForm.item] || 30) * (editForm.quantity || 1);
                        onEdit(order.id, { ...editForm, estimated_cost: cost });
                        setEditing(null);
                      }} className="h-7 text-xs bg-success/10 hover:bg-success/20 text-success border border-success/20">
                        Speichern
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(null)} className="h-7 text-xs">Abbrechen</Button>
                    </div>
                  </div>
                ) : rejecting === order.id ? (
                  <div className="space-y-2">
                    <input
                      value={rejectNote}
                      onChange={e => setRejectNote(e.target.value)}
                      placeholder="Ablehnungsgrund..."
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { onReject(order.id, rejectNote); setRejecting(null); setRejectNote(""); }}
                        className="h-7 text-xs bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20">
                        Ablehnen
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRejecting(null)} className="h-7 text-xs">Abbrechen</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {order.status === "eingereicht" && (
                      <>
                        <Button size="sm" onClick={() => onApprove(order.id)}
                          className="h-7 text-xs bg-success/10 hover:bg-success/20 text-success border border-success/20 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Genehmigen
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setRejecting(order.id)}
                          className="h-7 text-xs text-destructive gap-1">
                          <X className="w-3 h-3" /> Ablehnen
                        </Button>
                        {onEdit && (
                          <Button size="sm" variant="ghost" onClick={() => {
                            setEditing(order.id);
                            setEditForm({ item: order.item, size: order.size, quantity: order.quantity, reason: order.reason, notes: order.notes || "" });
                          }} className="h-7 text-xs gap-1">
                            <Pencil className="w-3 h-3" /> Korrigieren
                          </Button>
                        )}
                      </>
                    )}
                    {order.status === "genehmigt" && (
                      <Button size="sm" onClick={() => onMarkOrdered(order.id)}
                        className="h-7 text-xs bg-info/10 hover:bg-info/20 text-info border border-info/20 gap-1">
                        <Truck className="w-3 h-3" /> Als bestellt markieren
                      </Button>
                    )}
                    {order.status === "bestellt" && (
                      <Button size="sm" onClick={() => onMarkIssued(order.id)}
                        className="h-7 text-xs bg-success/10 hover:bg-success/20 text-success border border-success/20 gap-1">
                        <Package className="w-3 h-3" /> Ausgegeben
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}