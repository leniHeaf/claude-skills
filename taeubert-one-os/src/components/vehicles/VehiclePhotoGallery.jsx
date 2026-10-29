import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const AREAS = [
  { key: "annahme", label: "Annahme" }, { key: "schaden", label: "Schaden" },
  { key: "vorschaden", label: "Vorschaden" }, { key: "demontage", label: "Demontage" },
  { key: "teile", label: "Teile" }, { key: "vorbereitung", label: "Vorbereitung" },
  { key: "lackierung", label: "Lackierung" }, { key: "finish", label: "Finish" },
  { key: "endkontrolle", label: "Endkontrolle" }, { key: "uebergabe", label: "Übergabe" },
  { key: "reklamation", label: "Reklamation" }, { key: "nacharbeit", label: "Nacharbeit" },
  { key: "sonstiges", label: "Sonstiges" },
];

const TEAM = ["Toni", "Maik", "Marco", "Fanny", "Pascal", "Adrian", "Lena"];

const AREA_COLORS = {
  annahme: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  schaden: "bg-destructive/10 text-destructive border-destructive/20",
  vorschaden: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  demontage: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  teile: "bg-muted text-muted-foreground border-border",
  vorbereitung: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  lackierung: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  finish: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  endkontrolle: "bg-success/10 text-success border-success/20",
  uebergabe: "bg-primary/10 text-primary border-primary/20",
  reklamation: "bg-destructive/10 text-destructive border-destructive/20",
  nacharbeit: "bg-warning/10 text-warning border-warning/20",
  sonstiges: "bg-muted text-muted-foreground border-border",
};

export default function VehiclePhotoGallery({ vehicleId, vehicleInfo, vehicleStatus }) {
  const queryClient = useQueryClient();
  const [filterArea, setFilterArea] = useState("alle");
  const [uploading, setUploading] = useState(false);
  const [selectedArea, setSelectedArea] = useState("schaden");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [comment, setComment] = useState("");
  const [lightbox, setLightbox] = useState(null);

  const { data: photos = [] } = useQuery({
    queryKey: ["vehicle-photos", vehicleId],
    queryFn: () => base44.entities.VehiclePhoto.filter({ vehicle_id: vehicleId }),
  });

  const createPhoto = useMutation({
    mutationFn: (d) => base44.entities.VehiclePhoto.create(d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicle-photos", vehicleId] }),
  });

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await createPhoto.mutateAsync({
        vehicle_id: vehicleId,
        vehicle_info: vehicleInfo,
        photo_url: file_url,
        area: selectedArea,
        employee: selectedEmployee || "Unbekannt",
        vehicle_status: vehicleStatus || "",
        comment,
        timestamp: new Date().toISOString(),
      });
    }
    setComment("");
    setUploading(false);
  };

  const filtered = filterArea === "alle" ? photos : photos.filter(p => p.area === filterArea);
  const grouped = AREAS.reduce((acc, a) => {
    const items = filtered.filter(p => p.area === a.key);
    if (items.length) acc[a.key] = { label: a.label, items };
    return acc;
  }, {});

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          FAHRZEUGAKTE FOTOS ({photos.length})
        </h3>
      </div>

      {/* Upload Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="bg-secondary border-border h-8 text-xs col-span-2 md:col-span-1">
            <SelectValue placeholder="Bereich" />
          </SelectTrigger>
          <SelectContent>
            {AREAS.map(a => <SelectItem key={a.key} value={a.key}>{a.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
          <SelectTrigger className="bg-secondary border-border h-8 text-xs">
            <SelectValue placeholder="Mitarbeiter" />
          </SelectTrigger>
          <SelectContent>
            {TEAM.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
        <input
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Kommentar..."
          className="bg-secondary border border-border rounded-md px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <label className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all
          ${uploading ? "opacity-50 pointer-events-none" : "border-primary/30 text-primary hover:bg-primary/10"}`}>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          Foto(s) hinzufügen
        </label>
      </div>

      {/* Filter Tabs */}
      {photos.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-4">
          <button
            onClick={() => setFilterArea("alle")}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border
              ${filterArea === "alle" ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
            Alle ({photos.length})
          </button>
          {AREAS.map(a => {
            const count = photos.filter(p => p.area === a.key).length;
            if (!count) return null;
            return (
              <button key={a.key} onClick={() => setFilterArea(a.key)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border
                  ${filterArea === a.key ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
                {a.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Gallery by area */}
      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-5">
          {Object.entries(grouped).map(([area, { label, items }]) => (
            <div key={area}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${AREA_COLORS[area]}`}>{label}</span>
                <span className="text-[10px] text-muted-foreground">{items.length} Foto{items.length > 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {items.map((p, i) => (
                  <button key={i} onClick={() => setLightbox(p)} className="group relative aspect-square rounded-lg overflow-hidden bg-secondary">
                    <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-1 gap-0.5">
                      <p className="text-[8px] text-white font-medium">{p.employee}</p>
                      {p.timestamp && <p className="text-[7px] text-white/70">{format(new Date(p.timestamp), "dd.MM. HH:mm")}</p>}
                      {p.comment && <p className="text-[7px] text-white/70 text-center line-clamp-2">{p.comment}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">Noch keine Fotos hinterlegt</p>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <img src={lightbox.photo_url} alt="" className="w-full rounded-xl" />
            <div className="mt-3 flex gap-3 text-sm text-white/70">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${AREA_COLORS[lightbox.area]}`}>
                {AREAS.find(a => a.key === lightbox.area)?.label}
              </span>
              <span>{lightbox.employee}</span>
              {lightbox.timestamp && <span>{format(new Date(lightbox.timestamp), "dd.MM.yyyy HH:mm")}</span>}
              {lightbox.comment && <span className="text-white">· {lightbox.comment}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}