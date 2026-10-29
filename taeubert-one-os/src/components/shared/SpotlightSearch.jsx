import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Car, Users, ListTodo, X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function normalize(str) {
  return (str || "").toLowerCase().replace(/\s/g, "");
}

function matches(query, ...fields) {
  const q = normalize(query);
  if (!q) return false;
  return fields.some(f => normalize(f).includes(q));
}

export default function SpotlightSearch({ onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: () => base44.entities.Vehicle.list("-created_date", 200) });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: () => base44.entities.Customer.list("-created_date", 200) });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => base44.entities.Task.list("-created_date", 200) });

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const matchedVehicles = query.length >= 2
    ? vehicles.filter(v => matches(query, v.make, v.model, v.license_plate, v.customer_name, v.color, v.vin)).slice(0, 4)
    : [];

  const matchedCustomers = query.length >= 2
    ? customers.filter(c => matches(query, c.name, c.phone, c.email, c.address)).slice(0, 3)
    : [];

  const matchedTasks = query.length >= 2
    ? tasks.filter(t => matches(query, t.title, t.vehicle_info, t.assigned_to, t.category) && t.status !== "erledigt").slice(0, 3)
    : [];

  const totalResults = matchedVehicles.length + matchedCustomers.length + matchedTasks.length;

  const go = (path) => { navigate(path); onClose(); };

  const ResultSection = ({ title, icon: Icon, items, renderItem }) => {
    if (!items.length) return null;
    return (
      <div className="mb-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5">
          <Icon className="w-3 h-3 text-muted-foreground" />
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">{title}</p>
        </div>
        {items.map(renderItem)}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Kunde, Kennzeichen, Fahrzeug, Aufgabe..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="text-[10px] px-1.5 py-0.5 bg-secondary border border-border rounded text-muted-foreground">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {query.length < 2 && (
            <div className="px-4 py-6 text-center">
              <Search className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Mindestens 2 Zeichen eingeben</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Suche nach Kennzeichen, Kunde, Farbe, VIN...</p>
            </div>
          )}

          {query.length >= 2 && totalResults === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-muted-foreground">Keine Ergebnisse für „{query}"</p>
            </div>
          )}

          <ResultSection title="Fahrzeuge" icon={Car} items={matchedVehicles} renderItem={v => (
            <button key={v.id} onClick={() => go(`/vehicles/${v.id}`)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-left">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Car className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{v.make} {v.model}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {v.license_plate} · {v.customer_name}{v.color ? ` · ${v.color}` : ""}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
          )} />

          <ResultSection title="Kunden" icon={Users} items={matchedCustomers} renderItem={c => (
            <button key={c.id} onClick={() => go(`/crm`)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-left">
              <div className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-chart-2" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {[c.phone, c.email].filter(Boolean).join(" · ")}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
          )} />

          <ResultSection title="Aufgaben" icon={ListTodo} items={matchedTasks} renderItem={t => (
            <button key={t.id} onClick={() => go(`/tasks`)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-left">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${t.priority === "kritisch" ? "bg-destructive/10" : t.priority === "hoch" ? "bg-warning/10" : "bg-secondary"}`}>
                <ListTodo className={`w-4 h-4 ${t.priority === "kritisch" ? "text-destructive" : t.priority === "hoch" ? "text-warning" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {t.vehicle_info} {t.assigned_to ? `· ${t.assigned_to}` : ""}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
          )} />
        </div>
      </motion.div>
    </div>
  );
}