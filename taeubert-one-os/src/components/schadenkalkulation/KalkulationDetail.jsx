import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X, Printer, Download, Loader2, Car, User, Wrench, ListChecks, CheckCircle2, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { GEWERK_LABEL, SCHADENBEREICH_LABEL, POSITIONSTYP_LABEL, formatEuro, formatStunden } from "@/lib/kalkulationUtils";
import { downloadDEX } from "@/lib/datExport";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function KalkulationDetail({ kalkulationId, onClose }) {
  const { toast } = useToast();
  const contentRef = React.useRef(null);
  const [exporting, setExporting] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const queryClient = useQueryClient();
  const { data: kalk, isLoading } = useQuery({
    queryKey: ["kalkulation", kalkulationId],
    queryFn: () => base44.entities.Kalkulation.get(kalkulationId),
    enabled: !!kalkulationId,
  });

  const { data: bericht } = useQuery({
    queryKey: ["schadensbericht", kalk?.schadensbericht_id],
    queryFn: () => base44.entities.Schadensbericht.get(kalk.schadensbericht_id),
    enabled: !!kalk?.schadensbericht_id,
  });

  if (isLoading || !kalk) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const positionen = kalk.positionen || [];
  const stundenloehne = {
    Mechanik: kalk.stundenlohn_mechanik ?? 150,
    Karosserie: kalk.stundenlohn_karosserie ?? 150,
    Lackierung: kalk.stundenlohn_lackierung ?? 155,
  };

  const handlePrint = () => window.print();

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 10;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 10;
      }
      const fname = `Kostenschaetzung_${bericht?.customer_name || "Kunde"}_${kalk.date || ""}.pdf`.replace(/\s+/g, "_");
      pdf.save(fname);
      toast({ title: "PDF gespeichert", description: "Die Kostenschätzung wurde als PDF heruntergeladen." });
    } catch (err) {
      toast({ title: "PDF-Export fehlgeschlagen", description: "Bitte erneut versuchen.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleTransferToDAT = async () => {
    if (!kalk || !bericht) return;
    setTransferring(true);
    try {
      const vehicleId = bericht.vehicle_id;
      const vehicleInfo = bericht.vehicle_info || "";
      const customerName = bericht.customer_name || "";
      let vehicle = null;
      let damageNumber = "";
      let insurance = "";
      if (vehicleId) {
        try {
          vehicle = await base44.entities.Vehicle.get(vehicleId);
          damageNumber = vehicle.insurance_case_number || "";
          insurance = vehicle.insurance || "";
        } catch { /* ignore */ }
      }
      const GEWERK_CATEGORY = { Karosserie: "karosserie", Lackierung: "lackierung", Mechanik: "sonstiges" };
      const arbeitspositionen = positionen.filter(p => p.positionstyp === "Arbeitszeit" && (p.richtzeit_ah || 0) > 0);
      const tasks = arbeitspositionen.map(p => ({
        title: p.bezeichnung,
        description: `Aus Kalkulation ${kalk.date} übernommen · Gewerk: ${p.gewerk} · Richtzeit: ${formatStunden(p.richtzeit_ah)} · Menge: ${p.menge || 1}`,
        vehicle_id: vehicleId,
        vehicle_info: vehicleInfo,
        category: GEWERK_CATEGORY[p.gewerk] || "sonstiges",
        priority: "mittel",
        status: "offen",
        assigned_to: p.gewerk === "Lackierung" ? "Toni" : "",
        estimated_hours: (p.richtzeit_ah || 0) * (p.menge || 1),
        comments: `DAT-Transfer | Kalkulation ${kalk.date} | Positionstyp: ${p.positionstyp}`,
      }));
      const totalHours = arbeitspositionen.reduce((s, p) => s + (p.richtzeit_ah || 0) * (p.menge || 1), 0);
      const totalParts = positionen.filter(p => p.positionstyp === "Ersatzteil").reduce((s, p) => s + (p.gesamtpreis || 0), 0);
      await Promise.all([
        tasks.length ? base44.entities.Task.bulkCreate(tasks) : Promise.resolve(),
        base44.entities.DATImport.create({
          vehicle_id: vehicleId, vehicle_info: vehicleInfo, customer_name: customerName,
          damage_number: damageNumber, insurance: insurance,
          total_hours: totalHours, total_parts_cost: totalParts,
          task_count: tasks.length, status: "freigegeben", raw_data: JSON.stringify(kalk),
        }),
      ]);
      // Kalkulation über DAT-Schnittstelle an DAT übermitteln
      let datResult = null;
      try {
        const res = await base44.functions.invoke("datApiIntegration", {
          action: "submitCalculation",
          calculation: {
            estimateDate: kalk.date,
            customer: { name: customerName },
            vehicle: {
              make: vehicle?.make,
              model: vehicle?.model,
              licensePlate: vehicle?.license_plate,
              vin: vehicle?.vin,
              hsn: vehicle?.hsn,
              tsn: vehicle?.tsn,
            },
            claim: { number: damageNumber, insurance },
            labourRates: {
              mechanik: kalk.stundenlohn_mechanik,
              karosserie: kalk.stundenlohn_karosserie,
              lackierung: kalk.stundenlohn_lackierung,
            },
            paintMaterialPercent: kalk.lackmaterial_prozent ?? 45,
            positions: positionen.map((p) => ({
              type: p.positionstyp,
              trade: p.gewerk,
              description: p.bezeichnung,
              hours: p.richtzeit_ah,
              quantity: p.menge || 1,
              unitPrice: p.einzelpreis,
              total: p.gesamtpreis,
            })),
            summary: {
              labourTotal: kalk.summe_arbeitslohn,
              partsTotal: kalk.summe_ersatzteile,
              paintMaterialTotal: kalk.summe_lackmaterial,
              subtotalNet: kalk.zwischensumme_netto,
              vatRate: kalk.mwst_satz ?? 19,
              vatAmount: kalk.mwst_betrag,
              totalGross: kalk.gesamtbetrag_brutto,
            },
          },
        });
        datResult = res?.data || res;
      } catch (apiErr) {
        // Fallback: DEX-Datei herunterladen, falls Schnittstelle fehlschlägt
        try { downloadDEX(kalk, bericht, vehicle); } catch { /* ignore */ }
        toast({
          title: "Schnittstelle nicht erreichbar",
          description: `DAT-API fehlgeschlagen (${apiErr.message || "Fehler"}). DEX-Datei als Fallback heruntergeladen.`,
          variant: "destructive",
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["kalkulationen"] });
      queryClient.invalidateQueries({ queryKey: ["kalkulation", kalk.id] });
      queryClient.invalidateQueries({ queryKey: ["dat-imports"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "In DAT übertragen",
        description: `${tasks.length} Aufgaben erstellt · DAT-Import angelegt · Schnittstelle gesendet${datResult?.datEstimateId ? ` (DAT-ID: ${datResult.datEstimateId})` : ""}.`,
      });
    } catch (err) {
      toast({ title: "Übertragung fehlgeschlagen", description: err.message || "Unbekannter Fehler", variant: "destructive" });
    } finally {
      setTransferring(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!kalk || !bericht) return;
    setOrdering(true);
    try {
      const vehicleId = bericht.vehicle_id;
      const vehicleInfo = bericht.vehicle_info || "";
      const customerName = bericht.customer_name || "";
      let customerId = bericht.customer_id || "";
      if (!customerId && customerName) {
        try {
          const matches = await base44.entities.Customer.filter({ name: customerName });
          if (matches.length) customerId = matches[0].id;
        } catch { /* ignore */ }
      }
      const posText = positionen.map((p, i) => `${i + 1}. ${p.bezeichnung} (${GEWERK_LABEL[p.gewerk] || p.gewerk}) — ${formatStunden(p.richtzeit_ah)} × ${p.menge || 1} = ${formatEuro(p.gesamtpreis)}`).join("\n");
      const orderDesc = [
        bericht.description ? `Schaden: ${bericht.description}` : "",
        bericht.schadenbereich ? `Bereich: ${SCHADENBEREICH_LABEL[bericht.schadenbereich]}` : "",
        "Positionen:",
        posText,
      ].filter(Boolean).join("\n");
      await base44.entities.CustomerOrder.create({
        customer_id: customerId,
        customer_name: customerName,
        vehicle_id: vehicleId,
        vehicle_info: vehicleInfo,
        order_type: "reparatur",
        title: `Reparaturauftrag ${vehicleInfo}`.trim(),
        description: orderDesc,
        status: "offen",
        priority: "normal",
        estimated_cost: kalk.gesamtbetrag_brutto || 0,
        notes: `Übernommen aus Kalkulation ${kalk.id} vom ${kalk.date}`,
      });
      await base44.entities.Kalkulation.update(kalk.id, { status: "Auftrag erteilt" });
      queryClient.invalidateQueries({ queryKey: ["kalkulationen"] });
      queryClient.invalidateQueries({ queryKey: ["kalkulation", kalk.id] });
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Auftrag übernommen", description: "Der Reparaturauftrag wurde in der Fahrzeugakte angelegt." });
    } catch (err) {
      toast({ title: "Übernahme fehlgeschlagen", description: err.message || "Unbekannter Fehler", variant: "destructive" });
    } finally {
      setOrdering(false);
    }
  };

  const einzelpreisLabel = (p) => {
    if (p.positionstyp === "Arbeitszeit") return `${formatEuro(p.stundenlohn || stundenloehne[p.gewerk])}/h`;
    return formatEuro(p.einzelpreis);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between print:hidden">
        <div>
          <h2 className="font-heading text-lg text-foreground tracking-wide">KALKULATION</h2>
          <p className="text-xs text-muted-foreground">{kalk.date} · {kalk.status}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1"><Printer className="w-3.5 h-3.5" /> Drucken</Button>
          <Button variant="default" size="sm" onClick={handleExportPDF} disabled={exporting} className="gap-1">
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {exporting ? "Erstellt..." : "PDF speichern"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleTransferToDAT} disabled={transferring} className="gap-1">
            {transferring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ListChecks className="w-3.5 h-3.5" />}
            {transferring ? "Übertrage..." : "In DAT übertragen"}
          </Button>
          {kalk.status !== "Auftrag erteilt" ? (
            <Button variant="default" size="sm" onClick={handleCreateOrder} disabled={ordering} className="gap-1">
              {ordering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ClipboardCheck className="w-3.5 h-3.5" />}
              {ordering ? "Übernehme..." : "Als Auftrag übernehmen"}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-success px-2 py-1 rounded-full bg-success/10 border border-success/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Auftrag übernommen
            </span>
          )}
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div ref={contentRef} className="max-w-3xl mx-auto p-6 print:p-0">
        <div className="border-b border-border pb-4 mb-6">
          <h1 className="font-heading text-2xl text-foreground tracking-wider">TÄUBERT</h1>
          <p className="text-xs text-muted-foreground">Karosserie & Lack · Kostenschätzung</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground"><Car className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold tracking-wider uppercase">Fahrzeug</span></div>
            <p className="text-sm font-medium text-foreground">{bericht?.vehicle_info || "—"}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground"><User className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold tracking-wider uppercase">Kunde</span></div>
            <p className="text-sm font-medium text-foreground">{bericht?.customer_name || "—"}</p>
          </div>
        </div>

        {bericht?.photos && bericht.photos.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground"><Wrench className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold tracking-wider uppercase">Schadensfotos</span></div>
            <div className="grid grid-cols-4 gap-2">
              {bericht.photos.map((url, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border"><img src={url} alt={`Schaden ${i + 1}`} className="w-full h-full object-cover" /></div>
              ))}
            </div>
          </div>
        )}

        {bericht?.description && (
          <div className="mb-6 bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-1">Schadensbeschreibung</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{bericht.description}</p>
          </div>
        )}

        {bericht?.schadenbereich && (
          <div className="mb-6">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-1">Schadensbereich</p>
            <p className="text-sm text-foreground">{SCHADENBEREICH_LABEL[bericht.schadenbereich]}</p>
          </div>
        )}

        {/* Stundenlohnsätze */}
        <div className="flex flex-wrap gap-2 mb-3 text-[10px] text-muted-foreground">
          {Object.entries(stundenloehne).map(([g, r]) => (
            <span key={g} className="px-2 py-1 rounded-full bg-secondary border border-border">{g}: {formatEuro(r)}/h</span>
          ))}
        </div>

        {/* Positionstabelle */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-3 text-[10px] font-semibold text-muted-foreground uppercase">Pos.</th>
                <th className="text-left p-3 text-[10px] font-semibold text-muted-foreground uppercase">Bezeichnung</th>
                <th className="text-left p-3 text-[10px] font-semibold text-muted-foreground uppercase">Gewerk</th>
                <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">AH</th>
                <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Menge</th>
                <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Einzelpreis</th>
                <th className="text-right p-3 text-[10px] font-semibold text-muted-foreground uppercase">Gesamt</th>
              </tr>
            </thead>
            <tbody>
              {positionen.map((p, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="p-3 text-muted-foreground text-xs">{i + 1}</td>
                  <td className="p-3">
                    <p className="text-sm font-medium text-foreground">{p.bezeichnung}</p>
                    <p className="text-[10px] text-muted-foreground">{POSITIONSTYP_LABEL[p.positionstyp] || p.positionstyp}</p>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{GEWERK_LABEL[p.gewerk] || "—"}</td>
                  <td className="p-3 text-right text-muted-foreground text-xs">{p.positionstyp === "Arbeitszeit" ? formatStunden(p.richtzeit_ah) : "—"}</td>
                  <td className="p-3 text-right text-muted-foreground text-xs">{p.menge || 1}</td>
                  <td className="p-3 text-right text-muted-foreground text-xs">{einzelpreisLabel(p)}</td>
                  <td className="p-3 text-right font-medium">{formatEuro(p.gesamtpreis)}</td>
                </tr>
              ))}
              {positionen.length === 0 && (
                <tr><td colSpan={7} className="p-4 text-center text-sm text-muted-foreground">Keine Positionen</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Zusammenfassung — DAT-Struktur */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-2">
          {!!kalk.summe_arbeitslohn_karosserie && (
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Lohn Karosserie</span><span className="font-medium">{formatEuro(kalk.summe_arbeitslohn_karosserie)}</span></div>
          )}
          {!!kalk.summe_arbeitslohn_mechanik && (
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Lohn Mechanik</span><span className="font-medium">{formatEuro(kalk.summe_arbeitslohn_mechanik)}</span></div>
          )}
          {!!kalk.summe_arbeitslohn_lack && (
            <>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Lohn Lackierung</span><span className="font-medium">{formatEuro(kalk.summe_arbeitslohn_lack)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Lackmaterial pauschal ({kalk.lackmaterial_prozent ?? 45}% v. Lacklohn)</span><span className="font-medium">{formatEuro(kalk.summe_lackmaterial)}</span></div>
            </>
          )}
          {!!kalk.summe_ersatzteile && (
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ersatzteile</span><span className="font-medium">{formatEuro(kalk.summe_ersatzteile)}</span></div>
          )}
          {!!kalk.summe_pauschale && (
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Nebenkosten / Pauschalen</span><span className="font-medium">{formatEuro(kalk.summe_pauschale)}</span></div>
          )}
          <div className="border-t border-border pt-2 flex justify-between text-sm font-medium"><span>Reparaturkosten netto</span><span>{formatEuro(kalk.zwischensumme_netto)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">MwSt ({kalk.mwst_satz ?? 19}%){kalk.mwst_auf_arbeitslohn === false ? " o. Arbeitslohn" : ""}</span><span className="font-medium">{formatEuro(kalk.mwst_betrag)}</span></div>
          <div className="border-t border-border pt-2 flex justify-between items-center">
            <span className="text-sm font-semibold">Reparaturkosten brutto</span>
            <span className="font-heading text-2xl text-foreground">{formatEuro(kalk.gesamtbetrag_brutto)}</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 italic">
          {kalk.hinweis || "Unverbindliche Kostenschätzung"} · Erstellt am {kalk.date}
        </p>
      </div>
    </div>
  );
}