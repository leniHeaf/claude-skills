import React, { useState } from "react";
import { Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLlmKey, setLlmKey, resetLocalData } from "@/api/localBackend";

// Einstellungen des lokalen Modus: KI-Schlüssel und Demo-Daten.
export default function LocalSettings() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");

  const openDialog = () => {
    setKey(getLlmKey());
    setOpen(true);
  };

  const save = () => {
    setLlmKey(key.trim());
    setOpen(false);
  };

  const reset = () => {
    if (!window.confirm("Alle lokalen Daten löschen und Demo-Daten neu laden?")) return;
    resetLocalData();
    window.location.reload();
  };

  return (
    <>
      <button
        onClick={openDialog}
        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings2 className="w-3.5 h-3.5" />
        Einstellungen
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Einstellungen</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold">KI (Claude)</p>
              <p className="text-xs text-muted-foreground">
                Für KI-Assistent, Schadenanalyse und Fahrzeugschein-Scan. Der Schlüssel wird nur in diesem Browser gespeichert.
              </p>
              <Input
                type="password"
                placeholder="sk-ant-…"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <Button onClick={save} className="w-full">Speichern</Button>
            </div>
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm font-semibold">Daten</p>
              <p className="text-xs text-muted-foreground">
                Setzt alle Fahrzeuge, Aufgaben, Zeiten usw. auf die Demo-Daten zurück.
              </p>
              <Button variant="outline" onClick={reset} className="w-full">Demo-Daten zurücksetzen</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
