import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, Users, Euro, Clock, AlertTriangle, CheckCircle, Car, Calendar, Package, Inbox, ClipboardCheck, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { useAuth } from "@/lib/AuthContext";
import { EMPLOYEE_AREAS } from "@/lib/employeePermissions";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function ChefAnsicht() {
  const { user } = useAuth();

  // Hooks immer zuerst aufrufen - vor allen Returns
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles-chef"], queryFn: () => base44.entities.Vehicle.list("-created_date", 500) });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks-chef"], queryFn: () => base44.entities.Task.list("-created_date", 500) });
  const { data: errors = [] } = useQuery({ queryKey: ["errors-chef"], queryFn: () => base44.entities.ErrorReport.list("-created_date", 500) });
  const { data: timeEntries = [] } = useQuery({ queryKey: ["time-chef"], queryFn: () => base44.entities.TimeEntry.list("-created_date", 500) });
  const { data: materials = [] } = useQuery({ queryKey: ["materials-chef"], queryFn: () => base44.entities.MaterialUsage.list("-created_date", 500) });
  const { data: leaveRequests = [] } = useQuery({ queryKey: ["leave-chef"], queryFn: () => base44.entities.LeaveRequest.list("-created_date", 100) });
  const { data: workDays = [] } = useQuery({ queryKey: ["workdays-chef"], queryFn: () => base44.entities.WorkDay.list("-created_date", 200) });
  const { data: customers = [] } = useQuery({ queryKey: ["customers-chef"], queryFn: () => base44.entities.Customer.list("-created_date", 200) });

  // Nur für Geschäftsführung (Rolle "master" oder Bereich "geschaeftsleitung")
  const employeeConfig = EMPLOYEE_AREAS[user?.full_name];
  const hasAccess = employeeConfig?.areas?.includes("geschaeftsleitung") || employeeConfig?.role === "master";

  if (!hasAccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h1 className="font-heading text-xl text-foreground mb-2">Zugriff verweigert</h1>
          <p className="text-sm text-muted-foreground">Dieser Bereich ist nur für die Geschäftsführung.</p>
        </div>
      </div>
    );
  }

  // KPIs
  const activeVehicles = vehicles.filter(v => v.status !== "uebergabe").length;
  const completedToday = vehicles.filter(v => {
    if (v.status !== "uebergabe") return false;
    return new Date(v.updated_date).toDateString() === new Date().toDateString();
  }).length;
  const problems = vehicles.filter(v => v.condition === "problem").length;
  const reworks = errors.filter(e => !e.resolved).length;
  
  const totalMinutes = timeEntries.filter(e => e.status === "beendet").reduce((s, e) => s + (e.duration_minutes || 0), 0);
  const totalHours = Math.round(totalMinutes / 60);
  const materialCost = materials.reduce((s, m) => s + (m.cost || 0), 0);
  
  const pendingLeave = leaveRequests.filter(r => r.status === "eingereicht").length;
  const absentToday = leaveRequests.filter(r => 
    r.status === "genehmigt" && 
    r.start_date <= format(new Date(), "yyyy-MM-dd") && 
    r.end_date >= format(new Date(), "yyyy-MM-dd")
  ).length;

  // Employee performance
  const employeeHours = {};
  timeEntries.filter(e => e.status === "beendet").forEach(e => {
    employeeHours[e.employee] = (employeeHours[e.employee] || 0) + (e.duration_minutes || 0);
  });
  const employeeChartData = Object.entries(employeeHours)
    .map(([name, minutes]) => ({ name, hours: Math.round(minutes / 60) }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);

  // Revenue estimation (average per vehicle)
  const avgRevenuePerVehicle = 2500;
  const estimatedRevenue = vehicles.filter(v => v.status === "uebergabe").length * avgRevenuePerVehicle;
  const activeRevenue = activeVehicles * avgRevenuePerVehicle;

  // Status distribution
  const statusDist = [
    { name: "Annahme", value: vehicles.filter(v => v.status === "annahme").length },
    { name: "Demo", value: vehicles.filter(v => v.status === "demontage").length },
    { name: "Karosserie", value: vehicles.filter(v => v.status === "karosserie").length },
    { name: "Lack", value: vehicles.filter(v => v.status === "lackierung").length },
    { name: "Finish", value: vehicles.filter(v => v.status === "finish").length },
  ].filter(s => s.value > 0);

  const KPI_CARDS = [
    { label: "Umsatz (aktiv)", value: `${activeRevenue.toLocaleString()} €`, icon: Euro, color: "text-chart-1", sub: `${activeVehicles} Fahrzeuge in Arbeit` },
    { label: "Umsatz (abgeschlossen)", value: `${estimatedRevenue.toLocaleString()} €`, icon: TrendingUp, color: "text-success", sub: `${vehicles.filter(v => v.status === "uebergabe").length} abgeschlossen` },
    { label: "Produktivität", value: `${totalHours}h`, icon: Clock, color: "text-chart-2", sub: "Gesamtstunden gebucht" },
    { label: "Materialkosten", value: `${materialCost.toLocaleString()} €`, icon: Package, color: "text-chart-3", sub: "Gesamtverbrauch" },
    { label: "Probleme", value: problems, icon: AlertTriangle, color: problems > 0 ? "text-destructive" : "text-success", sub: `${reworks} Nacharbeiten offen` },
    { label: "Kunden", value: customers.length, icon: Users, color: "text-chart-4", sub: `${customers.filter(c => c.customer_type === "stammkunde").length} Stammkunden` },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">CHEF-ANSICHT</h1>
            <p className="text-sm text-muted-foreground mt-1">Geschäftsleitung · Echtzeit-Überblick · {format(new Date(), "dd. MMMM yyyy")}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs font-medium text-success">Geschäftsleitung</span>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {KPI_CARDS.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
            </div>
            <p className={`font-heading text-xl ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {(pendingLeave > 0 || absentToday > 0 || problems > 0) && (
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          {pendingLeave > 0 && (
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-warning" />
                <p className="text-xs font-semibold text-warning">Urlaubsanträge</p>
              </div>
              <p className="text-sm text-muted-foreground">{pendingLeave} Anträge warten auf Genehmigung</p>
            </div>
          )}
          {absentToday > 0 && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-destructive" />
                <p className="text-xs font-semibold text-destructive">Abwesend heute</p>
              </div>
              <p className="text-sm text-muted-foreground">{absentToday} Mitarbeiter im Urlaub</p>
            </div>
          )}
          {problems > 0 && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <p className="text-xs font-semibold text-destructive">Probleme</p>
              </div>
              <p className="text-sm text-muted-foreground">{problems} Fahrzeuge mit Problemen</p>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Employee Hours */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">MITARBEITER · STUNDEN</p>
          {employeeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={employeeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                <Bar dataKey="hours" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Keine Daten</p>
            </div>
          )}
        </div>

        {/* Vehicle Status Distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">FAHRZEUGE · STATUS</p>
          {statusDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" outerRadius={60} labelLine={false} label={({ name, value }) => `${name}: ${value}`}>
                  {statusDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Keine Fahrzeuge</p>
            </div>
          )}
        </div>

        {/* Recent Vehicles */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">AKTUELLE FAHRZEUGE</p>
          <div className="space-y-2 max-h-44 overflow-y-auto">
            {vehicles.slice(0, 6).map(v => (
              <div key={v.id} className="flex items-center justify-between text-xs py-1">
                <div className="flex-1">
                  <span className="text-foreground font-medium">{v.make} {v.model}</span>
                  <span className="text-muted-foreground ml-2">{v.license_plate}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                  ${v.condition === "fertig" ? "bg-success/10 text-success" :
                    v.condition === "problem" ? "bg-destructive/10 text-destructive" :
                    "bg-secondary text-muted-foreground"}`}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">SCHNELLZUGRIFFE</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { path: "/employees", label: "Mitarbeiter", icon: Users },
            { path: "/performance-hub", label: "Performance", icon: TrendingUp },
            { path: "/kpi", label: "KPI-Dashboard", icon: BarChart2 },
            { path: "/nachtraege", label: "Nachträge", icon: Inbox },
            { path: "/auftragsverteilung", label: "Aufträge", icon: ClipboardCheck },
            { path: "/werkstatt", label: "Werkstatt", icon: Car },
          ].map(action => (
            <Link key={action.path} to={action.path}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary hover:bg-accent transition-colors">
              <action.icon className="w-5 h-5 text-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}