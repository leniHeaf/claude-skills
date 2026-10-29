import React, { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

const isDesktop = () => window.innerWidth >= 1024;

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop());
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    
    const handleResize = () => {
      setSidebarOpen(isDesktop());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Backdrop overlay – closes sidebar on tablet/mobile tap */}
      {sidebarOpen && !isDesktop() && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuToggle={toggleSidebar} user={user} />
        <main className="flex-1 overflow-y-auto pb-16 xl:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav onMenuPress={toggleSidebar} />
    </div>
  );
}