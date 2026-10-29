import React from "react";
import { motion } from "framer-motion";
import { Star, Shield, Wrench, Paintbrush, Sparkles, GraduationCap, Phone } from "lucide-react";

const teamMembers = [
  {
    name: "Toni",
    role: "Geschäftsführer",
    areas: ["Lackierung", "Qualitätskontrolle"],
    level: "Lead",
    icon: Star,
  },
  {
    name: "Lena",
    role: "Büro & Organisation",
    areas: ["Kunden", "Social Media", "Kommunikation"],
    level: "Management",
    icon: Phone,
  },
  {
    name: "Maik",
    role: "Karosserie",
    areas: ["Problemlösung", "Verantwortung"],
    level: "Senior",
    icon: Wrench,
  },
  {
    name: "Marco",
    role: "Spotten & Entrosten",
    areas: ["Präzisionsarbeiten"],
    level: "Fachkraft",
    icon: Shield,
  },
  {
    name: "Fanny",
    role: "Vorbereitung",
    areas: ["Schleifen", "Füllern", "Abkleben"],
    level: "Fachkraft",
    icon: Paintbrush,
  },
  {
    name: "Pascal",
    role: "Vorbereitung & Finish",
    areas: ["Polieren"],
    level: "Fachkraft",
    icon: Sparkles,
  },
  {
    name: "Adrian",
    role: "Azubi",
    areas: ["Unterstützung", "Lernsystem"],
    level: "Academy",
    icon: GraduationCap,
  },
];

export default function Team() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">TEAM</h1>
        <p className="text-sm text-muted-foreground mt-1">Täubert Crew · {teamMembers.length} Mitarbeiter</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <member.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-sm text-foreground">{member.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{member.role}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {member.areas.map((area) => (
                    <span
                      key={area}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground"
                    >
                      {area}
                    </span>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-[10px] font-semibold tracking-wider text-primary uppercase">
                    {member.level}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}