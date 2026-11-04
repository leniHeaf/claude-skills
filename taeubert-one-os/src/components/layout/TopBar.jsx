import React, { useState, useEffect } from "react";
import { Menu, Search, User, LogOut } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SmartAlerts from "../shared/SmartAlerts";
import SpotlightSearch from "../shared/SpotlightSearch";
import TopNav from "./TopNav";

export default function TopBar({ user, onMenuToggle }) {
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = () => {
    base44.auth.logout();
  };

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center h-14 px-4 md:px-6 gap-2">
          {/* Menu Toggle - Mobile Only */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Top Navigation */}
          <TopNav />

          <div className="flex-1" />
          {/* Spotlight Search Button */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Suche</span>
            <kbd className="hidden sm:block text-[9px] px-1 py-0.5 bg-background border border-border rounded">⌘K</kbd>
          </button>

          {/* Smart Alerts Bell */}
          <SmartAlerts />

          {/* User */}
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-foreground" />
            </div>
            <span className="text-sm font-medium hidden md:block">
              {user?.full_name?.split(" ")[0] || "User"}
            </span>
            <button
              onClick={handleLogout}
              title="Abmelden"
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Spotlight Overlay */}
      <AnimatePresence>
        {showSearch && <SpotlightSearch onClose={() => setShowSearch(false)} />}
      </AnimatePresence>
    </>
  );
}