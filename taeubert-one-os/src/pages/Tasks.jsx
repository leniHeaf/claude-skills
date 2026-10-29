import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import AddTaskDialog from "../components/tasks/AddTaskDialog";
import TaskItem from "../components/tasks/TaskItem";
import EmptyState from "../components/shared/EmptyState";
import { ListTodo } from "lucide-react";

export default function Tasks() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("alle");
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowAdd(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const filtered = tasks.filter((t) => {
    const term = search.toLowerCase();
    const matchSearch = !term || t.title?.toLowerCase().includes(term) || t.assigned_to?.toLowerCase().includes(term);
    const matchFilter = filter === "alle" || t.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    alle: tasks.length,
    offen: tasks.filter((t) => t.status === "offen").length,
    in_arbeit: tasks.filter((t) => t.status === "in_arbeit").length,
    erledigt: tasks.filter((t) => t.status === "erledigt").length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground tracking-wide">
            AUFGABEN
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{counts.offen} offen · {counts.in_arbeit} in Arbeit</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Suche..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-primary hover:bg-primary/80 gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Aufgabe</span>
          </Button>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="alle">Alle ({counts.alle})</TabsTrigger>
          <TabsTrigger value="offen">Offen ({counts.offen})</TabsTrigger>
          <TabsTrigger value="in_arbeit">In Arbeit ({counts.in_arbeit})</TabsTrigger>
          <TabsTrigger value="erledigt">Erledigt ({counts.erledigt})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Task List */}
      {filtered.length === 0 ? (
        <EmptyState icon={ListTodo} title="Keine Aufgaben" description="Erstelle eine neue Aufgabe, um loszulegen." />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <AnimatePresence>
            {filtered.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={(data) => updateMutation.mutate({ id: task.id, data })}
                onDelete={() => deleteMutation.mutate(task.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddTaskDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}