import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, ListTodo, CalendarDays, Menu, Timer, UserCheck, Target, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { EMPLOYEE_AREAS, PAGE_AREA_MAPPING } from "@/lib/employeePermissions";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const getTimedNavItems = (employeeName) => {
  const hour = new Date().getHours();
  
  let baseItems;
  if (hour >= 6 && hour < 17) {
    baseItems = [
      { path: "/timetracking", label: "Zeit", icon: Timer },
      { path: "/mein-tag", label: "Mein Tag", icon: Target },
      { path: "/vehicles", label: "Fahrzeugboard", icon: Car },
      { path: "/calendar", label: "Termine", icon: CalendarDays },
      { path: "/tasks", label: "Aufgaben", icon: ListTodo },
    ];
  } else {
    baseItems = [
      { path: "/", label: "Home", icon: LayoutDashboard },
      { path: "/vehicles", label: "Fahrzeugboard", icon: Car },
      { path: "/calendar", label: "Termine", icon: CalendarDays },
      { path: "/tasks", label: "Aufgaben", icon: ListTodo },
      { path: "/leave", label: "Urlaub", icon: UserCheck },
    ];
  }
  
  if (!employeeName) return baseItems;
  
  const employeeConfig = EMPLOYEE_AREAS[employeeName];
  if (!employeeConfig) return baseItems;
  
  const allowedAreas = employeeConfig.areas;
  
  return baseItems.filter(item => {
    const itemAreas = PAGE_AREA_MAPPING[item.path] || [];
    return itemAreas.length === 0 || itemAreas.some(area => allowedAreas.includes(area));
  });
};

export default function TopNav() {
  const location = useLocation();
  const { user } = useAuth();
  const navItems = getTimedNavItems(user?.full_name);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="hidden xl:flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isActive 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:block">{item.label}</span>
          </Link>
        );
      })}

      <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Menu className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Mehr</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {[
            { path: "/live", label: "Live Board", icon: LayoutDashboard },
            { path: "/kpi", label: "KPI-Dashboard", icon: Target },
            { path: "/dat-import", label: "DAT Import", icon: Target },
            { path: "/crm", label: "CRM", icon: Target },
            { path: "/standard", label: "Täubert Standard", icon: Target },
            { path: "/quality", label: "Qualitätskontrolle", icon: Target },
            { path: "/team", label: "Team", icon: Target },
            { path: "/performance", label: "Performance", icon: Target },
            { path: "/materials", label: "Material", icon: Target },
            { path: "/werkstatt", label: "Werkstatt", icon: Target },
          ].map((item) => (
            <DropdownMenuItem key={item.path} asChild>
              <Link to={item.path} className="flex items-center gap-2">
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}