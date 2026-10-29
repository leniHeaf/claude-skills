import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TagesBriefing from "@/components/chef/TagesBriefing";
import ApprovalInbox from "@/components/chef/ApprovalInbox";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function ChefCockpit() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">CHEF-COCKPIT</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })}
            </p>
          </div>
          <Link to="/auftragsverteilung">
            <Button className="gap-2">
              <Zap className="w-4 h-4" /> Aufträge verteilen
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Section 1: Tagesbriefing */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <h2 className="font-heading text-sm text-foreground tracking-wide">TAGESBRIEFING</h2>
        </div>
        <TagesBriefing />
      </div>

      {/* Section 2: Genehmigungen */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <h2 className="font-heading text-sm text-foreground tracking-wide">GENEHMIGUNGEN</h2>
        </div>
        <ApprovalInbox />
      </div>
    </div>
  );
}