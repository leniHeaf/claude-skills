import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format, subMonths } from "date-fns";
import { de } from "date-fns/locale";
import { Trophy, Star, Users, ChevronRight } from "lucide-react";
import ScoreEditor from "../components/performance/ScoreEditor";
import RankingBoard from "../components/performance/RankingBoard";
import EmployeeScoreCard from "../components/performance/EmployeeScoreCard";

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];
const currentMonth = format(new Date(), "yyyy-MM");
const lastMonth = format(subMonths(new Date(), 1), "yyyy-MM");

export default function Performance() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("ranking");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editMonth, setEditMonth] = useState(currentMonth);
  const [showEditor, setShowEditor] = useState(false);
  const [editorEmployee, setEditorEmployee] = useState(null);

  const { data: scores = [] } = useQuery({
    queryKey: ["performanceScores"],
    queryFn: () => base44.entities.PerformanceScore.list("-month", 200),
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["timeEntries"],
    queryFn: () => base44.entities.TimeEntry.list("-created_date", 500),
  });

  const { data: errorReports = [] } = useQuery({
    queryKey: ["errorReports"],
    queryFn: () => base44.entities.ErrorReport.list("-created_date", 200),
  });

  const createScore = useMutation({
    mutationFn: (data) => base44.entities.PerformanceScore.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["performanceScores"] }),
  });

  const updateScore = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PerformanceScore.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["performanceScores"] }),
  });

  const monthScores = scores.filter(s => s.month === editMonth);

  // Auto-compute stats from time/error data
  const getAutoStats = (emp) => {
    const empEntries = timeEntries.filter(e => e.employee === emp && e.status === "beendet" && e.duration_minutes);
    const totalMins = empEntries.reduce((s, e) => s + e.duration_minutes, 0);
    const nacharbeitMins = empEntries.filter(e => e.activity === "nacharbeit").reduce((s, e) => s + e.duration_minutes, 0);
    const productiveMins = empEntries.filter(e => e.activity !== "nacharbeit" && e.activity !== "sonstiges").reduce((s, e) => s + e.duration_minutes, 0);
    const empErrors = errorReports.filter(e => e.responsible === emp).length;
    const productivityPct = totalMins > 0 ? Math.round((productiveMins / totalMins) * 100) : 0;
    const nacharbeitPct = totalMins > 0 ? Math.round((nacharbeitMins / totalMins) * 100) : 0;
    return { totalMins, nacharbeitMins, productiveMins, empErrors, productivityPct, nacharbeitPct };
  };

  const handleSaveScore = (data) => {
    const existing = monthScores.find(s => s.employee === data.employee);
    const total = Math.round(
      data.quality_score * 0.4 +
      data.productivity_score * 0.2 +
      data.responsibility_score * 0.2 +
      data.order_score * 0.1 +
      data.team_score * 0.1
    * 10) / 10;

    const payload = { ...data, total_score: total, month: editMonth };
    if (existing) {
      updateScore.mutate({ id: existing.id, data: payload });
    } else {
      createScore.mutate(payload);
    }
    setShowEditor(false);
  };

  const handleSetEmployeeOfMonth = (empId, scoreId) => {
    // Clear all for this month first
    monthScores.forEach(s => {
      if (s.employee_of_month) {
        updateScore.mutate({ id: s.id, data: { employee_of_month: false } });
      }
    });
    updateScore.mutate({ id: scoreId, data: { employee_of_month: true } });
  };

  const eomScore = monthScores.find(s => s.employee_of_month);
  const sortedScores = [...monthScores].sort((a, b) => (b.total_score || 0) - (a.total_score || 0));

  const TABS = [
    { key: "ranking", label: "Rangliste", icon: Trophy },
    { key: "details", label: "Mitarbeiter", icon: Users },
    { key: "bewertung", label: "Bewertung", icon: Star },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">PERFORMANCE</h1>
            <p className="text-sm text-muted-foreground mt-1">Täubert Standard · Qualität · Verantwortung · Leistung</p>
          </div>
          {/* Month Selector */}
          <select
            value={editMonth}
            onChange={e => setEditMonth(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground h-9"
          >
            {[0, 1, 2, 3].map(i => {
              const m = format(subMonths(new Date(), i), "yyyy-MM");
              const label = format(subMonths(new Date(), i), "MMMM yyyy", { locale: de });
              return <option key={m} value={m}>{label}</option>;
            })}
          </select>
        </div>
      </motion.div>

      {/* Employee of Month Banner */}
      {eomScore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden bg-gradient-to-r from-warning/10 via-warning/5 to-transparent border border-warning/30 rounded-xl p-5 mb-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/20 border border-warning/30 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] text-warning uppercase font-semibold">
                MITARBEITER DES MONATS · {format(subMonths(new Date(), editMonth === currentMonth ? 0 : 1), "MMMM yyyy", { locale: de }).toUpperCase()}
              </p>
              <p className="font-heading text-xl text-foreground mt-0.5">{eomScore.employee}</p>
              {eomScore.strengths && (
                <p className="text-xs text-muted-foreground mt-1">Stärken: {eomScore.strengths}</p>
              )}
              <p className="text-xs text-warning mt-1 font-semibold">Score: {eomScore.total_score?.toFixed(1)} / 10</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* RANKING */}
      {tab === "ranking" && (
        <RankingBoard
          scores={sortedScores}
          team={TEAM}
          onSetEOM={handleSetEmployeeOfMonth}
          onEdit={(emp) => { setEditorEmployee(emp); setShowEditor(true); }}
        />
      )}

      {/* DETAILS */}
      {tab === "details" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEAM.map(emp => {
            const score = monthScores.find(s => s.employee === emp);
            const stats = getAutoStats(emp);
            return (
              <EmployeeScoreCard
                key={emp}
                employee={emp}
                score={score}
                autoStats={stats}
                onEdit={() => { setEditorEmployee(emp); setShowEditor(true); }}
              />
            );
          })}
        </div>
      )}

      {/* BEWERTUNG (Manager) */}
      {tab === "bewertung" && (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-4">
            BEWERTUNGEN EINGEBEN — {format(new Date(editMonth + "-01"), "MMMM yyyy", { locale: de }).toUpperCase()}
          </p>
          {TEAM.map(emp => {
            const score = monthScores.find(s => s.employee === emp);
            const stats = getAutoStats(emp);
            return (
              <div
                key={emp}
                onClick={() => { setEditorEmployee(emp); setShowEditor(true); }}
                className="bg-card border border-border hover:border-primary/40 rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{emp}</p>
                  {score ? (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Score: <span className="text-foreground font-heading">{score.total_score?.toFixed(1)}</span> · Q:{score.quality_score} P:{score.productivity_score} V:{score.responsibility_score}
                    </p>
                  ) : (
                    <p className="text-xs text-warning mt-0.5">Noch keine Bewertung</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {score?.employee_of_month && <Trophy className="w-4 h-4 text-warning" />}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Score Editor Modal */}
      <AnimatePresence>
        {showEditor && editorEmployee && (
          <ScoreEditor
            employee={editorEmployee}
            existing={monthScores.find(s => s.employee === editorEmployee)}
            autoStats={getAutoStats(editorEmployee)}
            onSave={handleSaveScore}
            onClose={() => setShowEditor(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}