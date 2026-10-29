import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Inbox,
  Route,
  ScanLine,
  Flame,
  Target,
  LayoutDashboard,
  Car,
  ClipboardCheck,
  ListTodo,
  Users,
  User,
  BookOpen,
  X,
  ChevronDown,
  ChevronRight,
  Monitor,
  Shield,
  Gift,
  Clock,
  AlertTriangle,
  Heart,
  Sparkles,
  Zap,
  CalendarDays,
  FileEdit,
  UserCheck,
  ContactRound,
  Timer,
  Trophy,
  ShoppingCart,
  Shirt,
  GraduationCap,
  CircleDot,
  CalendarClock,
  BarChart2,
  Gauge,
  FileSearch,
  History,
  TrendingUp,
  Layers,
  Sun,
  Settings,
  Crown,
  Calculator,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LocalSettings from "@/components/LocalSettings";
import { useAuth } from "@/lib/AuthContext";
import { filterNavItems } from "@/lib/employeePermissions";

const navSections = [
  {
    label: "BETRIEB",
    items: [
      { path: "/mein-tag", label: "Mein Tag", icon: Target },
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/live", label: "Live Board", icon: Monitor },
      { path: "/vehicles", label: "Fahrzeugboard", icon: Car },
      { path: "/tasks", label: "Aufgaben", icon: ListTodo },
      { path: "/calendar", label: "Kalender", icon: CalendarDays },
    ],
  },
  {
    label: "PLANUNG & IMPORT",
    items: [
      { path: "/aufgabeneinplanung", label: "Aufgabe einplanen", icon: CalendarClock },
      { path: "/auftragsverteilung", label: "Auftragsverteilung", icon: Users },
      { path: "/dat-import", label: "DAT Import", icon: FileSearch },
      { path: "/data-import", label: "Daten-Import", icon: ScanLine },
    ],
  },
  {
    label: "AUSWERTUNG",
    items: [
      { path: "/kpi", label: "KPI-Dashboard", icon: BarChart2 },
      { path: "/live-dashboard", label: "Live Dashboard", icon: Gauge },
      { path: "/zeit-board", label: "Zeit-Board", icon: Clock },
      { path: "/zeit-korrektur", label: "Zeit-Korrektur", icon: FileEdit },
      { path: "/monatsauswertung", label: "Monatsauswertung", icon: FileSearch },
      { path: "/vehicle-history", label: "Fahrzeughistorie", icon: History },
      { path: "/nachkalkulation", label: "Nachkalkulation", icon: TrendingUp },
    ],
  },
  {
    label: "KUNDEN",
    items: [
      { path: "/crm", label: "CRM", icon: ContactRound },
      { path: "/customer-journey", label: "Customer Journey", icon: Route },
      { path: "/schadenkalkulation", label: "Schadenkalkulation", icon: Calculator },
    ],
  },
  {
    label: "NACHTRÄGE",
    items: [
      { path: "/nachtraege", label: "Nachtrag-Inbox", icon: Inbox },
    ],
  },
  {
    label: "QUALITÄT",
    items: [
      { path: "/standard", label: "Täubert Standard", icon: Shield },
      { path: "/quality", label: "Qualitätskontrolle", icon: ClipboardCheck },
      { path: "/errors", label: "Fehlerdatenbank", icon: AlertTriangle },
    ],
  },
  {
    label: "PREMIUM",
    items: [
      { path: "/handover", label: "Übergabemodus", icon: Gift },
      { path: "/ai-analyse", label: "Schadenanalyse", icon: Zap },
      { path: "/ai-assistant", label: "Assistent", icon: Sparkles },
    ],
  },
  {
    label: "TEAM",
    items: [
      { path: "/team", label: "Team", icon: Users },
      { path: "/timetracking", label: "Zeiterfassung", icon: Timer },
      { path: "/leave", label: "Urlaub", icon: UserCheck },
      { path: "/performance", label: "Performance", icon: Trophy },
      { path: "/performance-hub", label: "Performance Hub", icon: Flame },
      { path: "/mood", label: "Stimmungsbarometer", icon: Heart },
      { path: "/sop", label: "SOPs", icon: BookOpen },
      { path: "/academy", label: "Academy", icon: GraduationCap },
      { path: "/ausbildungsplan", label: "Ausbildungsplan", icon: GraduationCap },
      { path: "/employees", label: "Mitarbeiter", icon: User },
      { path: "/checklisten", label: "Checklisten", icon: ClipboardCheck },
    ],
  },
  {
    label: "WERKSTATT",
    items: [
      { path: "/werkstatt", label: "Werkstatt-Control", icon: Layers },
      { path: "/tagesstart", label: "Tagesstart", icon: Sun },
      { path: "/materials", label: "Material & Einkauf", icon: ShoppingCart },
      { path: "/clothing", label: "Arbeitskleidung", icon: Shirt },
      { path: "/tyres", label: "Reifenlager", icon: CircleDot },
    ],
  },
  {
    label: "GESCHÄFTSLEITUNG",
    items: [
      { path: "/cockpit", label: "Chef-Cockpit", icon: Crown },
      { path: "/chef", label: "Chef-Ansicht", icon: LayoutDashboard },
      { path: "/berechtigungen", label: "Berechtigungen", icon: Settings },
    ],
  },
];

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const { user } = useAuth();

  const userName = user ? (user.full_name || user.email || '') : '';
  const filteredSections = user
    ? (filterNavItems(userName, navSections).length > 0
        ? filterNavItems(userName, navSections)
        : (user.email ? filterNavItems(user.email, navSections) : navSections))
    : navSections;

  // Auto-expand the section containing the active route
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    const activeSection = filteredSections.find((section) =>
      section.items.some((item) => item.path === location.pathname)
    );
    if (activeSection) {
      setExpandedSection(activeSection.label);
    }
  }, [location.pathname]);

  const toggleSection = (label) => {
    setExpandedSection((prev) => (prev === label ? null : label));
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-sidebar border-r border-sidebar-border
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
          w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-lg text-foreground tracking-wider">
                  TÄUBERT
                </h1>
              </div>
              <button
                onClick={onToggle}
                className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation — collapsible sections */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {filteredSections.map((section) => {
              const isExpanded = expandedSection === section.label;
              const hasActive = section.items.some(
                (item) => item.path === location.pathname
              );

              return (
                <div key={section.label}>
                  <button
                    onClick={() => toggleSection(section.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-semibold tracking-[0.15em] transition-colors
                      ${hasActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <span className="flex items-center gap-2">
                      {hasActive && (
                        <span className="w-1 h-3 bg-primary rounded-full" />
                      )}
                      {section.label}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-0.5 mt-1 mb-2">
                          {section.items.map((item) => {
                            const isActive =
                              location.pathname === item.path;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => {
                                  if (window.innerWidth < 1024) onToggle();
                                }}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                  ${
                                    isActive
                                      ? "bg-primary text-primary-foreground"
                                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                                  }`}
                              >
                                <item.icon className="w-4 h-4 flex-shrink-0" />
                                <span>{item.label}</span>
                                {isActive && (
                                  <ChevronRight className="w-3 h-3 ml-auto" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <LocalSettings />
            <div className="px-4 py-2">
              <p className="text-[10px] text-muted-foreground tracking-widest">
                Karosserie & Lack
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}