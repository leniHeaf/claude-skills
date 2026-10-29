import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Target, LayoutDashboard, Car, ListTodo, CalendarDays, Menu, Sun, Inbox, Users, User, X, FileSearch, ClipboardCheck, History, TrendingUp, Shield, AlertTriangle, Gift, Zap, Sparkles, Timer, UserCheck, Trophy, Heart, BookOpen, GraduationCap, Layers, ShoppingCart, Shirt, CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { EMPLOYEE_AREAS, PAGE_AREA_MAPPING } from "@/lib/employeePermissions";

const getTimedNavItems = (employeeName) => {
  const hour = new Date().getHours();
  
  // Basis-Nav-Items je nach Uhrzeit
  let baseItems;
  if (hour >= 6 && hour < 17) {
    baseItems = [
      { path: "/mein-tag", label: "Mein Tag", icon: Target },
      { path: "/tasks", label: "Aufgaben", icon: ListTodo },
      { path: "/timetracking", label: "Zeiterfassung", icon: Timer },
    ];
  } else {
    baseItems = [
      { path: "/", label: "Home", icon: LayoutDashboard },
      { path: "/tasks", label: "Aufgaben", icon: ListTodo },
      { path: "/leave", label: "Urlaub", icon: UserCheck },
    ];
  }
  
  // Filtern basierend auf Mitarbeiter-Bereichen
  if (!employeeName) return baseItems;
  
  const employeeConfig = EMPLOYEE_AREAS[employeeName];
  if (!employeeConfig) return baseItems;
  
  const allowedAreas = employeeConfig.areas;
  
  return baseItems.filter(item => {
    const itemAreas = PAGE_AREA_MAPPING[item.path] || [];
    return itemAreas.length === 0 || itemAreas.some(area => allowedAreas.includes(area));
  });
};

const fullScreenNavGroups = [
  {
    label: "BETRIEB",
    items: [
      { path: "/mein-tag", label: "Mein Tag", icon: Target },
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/live", label: "Live Board", icon: LayoutDashboard },
      { path: "/vehicles", label: "Fahrzeuge", icon: Car },
      { path: "/tasks", label: "Aufgaben", icon: ListTodo },
      { path: "/calendar", label: "Kalender", icon: CalendarDays },
      { path: "/kpi", label: "KPI-Dashboard", icon: Target },
      { path: "/dat-import", label: "DAT Import", icon: FileSearch },
      { path: "/data-import", label: "Daten-Import", icon: Inbox },
      { path: "/auftragsverteilung", label: "Auftragsverteilung", icon: Users },
      { path: "/checklisten", label: "Checklisten", icon: ClipboardCheck },
      { path: "/vehicle-history", label: "Fahrzeughistorie", icon: History },
      { path: "/nachkalkulation", label: "Nachkalkulation", icon: TrendingUp },
    ],
  },
  {
    label: "KUNDEN",
    items: [
      { path: "/crm", label: "CRM", icon: Users },
      { path: "/customer-journey", label: "Customer Journey", icon: Target },
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
      { path: "/performance-hub", label: "Performance Hub", icon: Zap },
      { path: "/mood", label: "Stimmungsbarometer", icon: Heart },
      { path: "/sop", label: "SOPs", icon: BookOpen },
      { path: "/academy", label: "Academy", icon: GraduationCap },
      { path: "/employees", label: "Mitarbeiter", icon: User },
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
];

export default function BottomNav({ onMenuPress }) {
  const location = useLocation();
  const { user } = useAuth();
  const navItems = getTimedNavItems(user?.full_name);
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuPress = () => {
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  return (
    <>
      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background z-50 xl:hidden"
          >
            <div className="flex flex-col h-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-heading text-2xl text-foreground tracking-wider">
                  TÄUBERT
                </h2>
                <button
                  onClick={handleCloseMenu}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Grid — grouped by section */}
              <div className="overflow-y-auto pb-8 space-y-5">
                {fullScreenNavGroups.map((group) => {
                  const visibleItems = group.items.filter(item => {
                    if (!user?.full_name) return true;
                    const employeeConfig = EMPLOYEE_AREAS[user.full_name];
                    if (!employeeConfig) return true;
                    const allowedAreas = employeeConfig.areas;
                    const itemAreas = PAGE_AREA_MAPPING[item.path] || [];
                    return itemAreas.length === 0 || itemAreas.some(area => allowedAreas.includes(area));
                  });
                  if (visibleItems.length === 0) return null;
                  return (
                    <div key={group.label}>
                      <p className="text-[9px] font-semibold tracking-[0.2em] text-muted-foreground px-1 mb-2">
                        {group.label}
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {visibleItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleCloseMenu}
                            className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary hover:bg-accent transition-colors"
                          >
                            <item.icon className="w-6 h-6 mb-2 text-foreground" />
                            <span className="text-[10px] font-medium text-center text-muted-foreground">
                              {item.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border xl:hidden z-40 safe-area-bottom">
        <div className="flex items-center justify-around h-16 w-full">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full relative"
              >
                <div className="relative">
                  <item.icon className={`w-5 h-5 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-foreground" />
                  )}
                </div>
                <span className={`text-[9px] mt-0.5 font-medium text-center ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={handleMenuPress}
            className="flex flex-col items-center justify-center flex-1 h-full"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
            <span className="text-[9px] mt-0.5 font-medium text-muted-foreground">Mehr</span>
          </button>
        </div>
      </nav>
    </>
  );
}