import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { TEAM_MEMBERS } from "@/api/seedData";
import { EMPLOYEE_AREAS } from "@/lib/employeePermissions";

export default function LoginScreen() {
  const { login } = useAuth();
  const [members, setMembers] = useState(TEAM_MEMBERS);

  useEffect(() => {
    base44.entities.User.list("full_name").then((users) => {
      if (users.length) setMembers(users);
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl text-foreground tracking-[0.2em]">TÄUBERT</h1>
          <p className="text-[10px] text-muted-foreground tracking-[0.3em] mt-2">KAROSSERIE & LACK · ONE OS</p>
        </div>
        <div className="bg-card border border-border">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-xs font-semibold tracking-[0.15em] text-foreground">WER BIST DU?</p>
            <p className="text-xs text-muted-foreground mt-1">Mitarbeiter auswählen, um dich anzumelden.</p>
          </div>
          <ul className="divide-y divide-border">
            {members.map((m) => {
              const cfg = EMPLOYEE_AREAS[m.full_name] || EMPLOYEE_AREAS[m.email];
              return (
                <li key={m.email}>
                  <button
                    onClick={() => login(m)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-secondary transition-colors group"
                  >
                    <span className="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground font-heading text-sm">
                      {m.full_name?.[0]}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-foreground">{m.full_name}</span>
                      <span className="block text-xs text-muted-foreground truncate">{cfg?.label || m.email}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Lokaler Modus · Daten werden nur in diesem Browser gespeichert
        </p>
      </div>
    </div>
  );
}
