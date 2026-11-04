import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { hasPageAccess } from "@/lib/employeePermissions";


export default function ProtectedRoute({ children, path }) {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [hasAccess, setHasAccess] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoadingAuth) return;
    
    if (!isAuthenticated || !user) {
      setHasAccess(false);
      setChecking(false);
      return;
    }
    
    // Prüfen ob Mitarbeiter Zugriff auf diese Seite hat
    const userName = user.full_name || user.email || '';
    const canAccess = hasPageAccess(userName, path) || (user.email && hasPageAccess(user.email, path));
    setHasAccess(canAccess);
    setChecking(false);
  }, [user, isAuthenticated, isLoadingAuth, path]);

  if (checking || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
}