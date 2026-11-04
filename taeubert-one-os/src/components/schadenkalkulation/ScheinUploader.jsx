import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Check, FileText, Upload, RotateCw, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/**
 * ScheinUploader
 * Akzeptiert Bilder (JPEG, PNG) und PDFs. Nach Upload wird die
 * Backend-Funktion "extractFahrzeugschein" aufgerufen und die erkannten
 * Fahrzeugdaten per onRecognized(data) zurückgegeben.
 */
export default function ScheinUploader({ onRecognized, scheinUrl, onSetScheinUrl }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [recognized, setRecognized] = useState(false);
  const [preview, setPreview] = useState(scheinUrl || null);
  const inputRef = React.useRef(null);

  const isPdf = preview ? preview.toLowerCase().endsWith(".pdf") : false;

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setRecognized(false);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      const url = res.file_url;
      setPreview(url);
      onSetScheinUrl(url);

      // Erkennung starten
      setAnalyzing(true);
      try {
        const response = await base44.functions.invoke("extractFahrzeugschein", { fileUrl: url });
        const payload = response?.data ?? response;
        if (payload?.success && payload?.data) {
          setRecognized(true);
          onRecognized(payload.data);
          toast({ title: "Fahrzeugschein erkannt", description: "Daten wurden automatisch übernommen." });
        } else {
          toast({
            title: "Fahrzeugschein konnte nicht automatisch erkannt werden",
            description: "Bitte Daten manuell eingeben.",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "Fahrzeugschein konnte nicht automatisch erkannt werden",
          description: "Bitte Daten manuell eingeben.",
          variant: "destructive",
        });
      } finally {
        setAnalyzing(false);
      }
    } catch (err) {
      toast({ title: "Upload fehlgeschlagen", description: "Datei konnte nicht hochgeladen werden.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRescan = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Upload-Vorschau */}
      {preview ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-secondary flex items-center justify-center shrink-0">
            {isPdf ? (
              <FileText className="w-7 h-7 text-muted-foreground" />
            ) : (
              <img src={preview} alt="Fahrzeugschein" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {analyzing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fahrzeugschein wird analysiert...</span>
              </div>
            ) : recognized ? (
              <div className="flex items-center gap-2 text-sm text-success">
                <Check className="w-4 h-4" />
                <span className="font-medium">Daten erkannt</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>Erkennung nicht möglich – manuell eingeben</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleRescan}
            disabled={uploading || analyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Erneut scannen
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || analyzing}
          className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-foreground hover:text-foreground text-muted-foreground transition-colors disabled:opacity-50"
        >
          {uploading || analyzing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          <div className="text-left">
            <p className="text-sm font-medium">Fahrzeugschein (Foto oder PDF)</p>
            <p className="text-[10px] text-muted-foreground">
              {analyzing ? "Fahrzeugschein wird analysiert..." : "JPEG, PNG oder PDF hochladen"}
            </p>
          </div>
        </button>
      )}
    </div>
  );
}