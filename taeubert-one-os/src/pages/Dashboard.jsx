import React from "react";
import { useAuth } from "@/lib/AuthContext";
import { EMPLOYEE_AREAS } from "@/lib/employeePermissions";
import ChefCockpit from "./ChefCockpit";
import PersonalDashboard from "./PersonalDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const employeeConfig = EMPLOYEE_AREAS[user?.full_name];
  const isMaster = employeeConfig?.role === "master";

  if (isMaster) {
    return <ChefCockpit />;
  }

  return <PersonalDashboard userName={user?.full_name || "Team"} />;
}