import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const fileUrl = body.fileUrl;
    if (!fileUrl) {
      return Response.json({ success: false, error: 'fileUrl fehlt' }, { status: 400 });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analysiere das hochgeladene Bild/das PDF eines deutschen Fahrzeugscheins (Zulassungsbescheinigung Teil I).
Extrahiere die folgenden Felder so genau wie möglich aus dem Dokument.
Wenn ein Feld nicht lesbar oder nicht vorhanden ist, gib einen leeren String zurück.
Antworte ausschließlich als strukturiertes JSON mit diesen Feldern:
- kennzeichen: amtliches Kennzeichen
- hsn: Herstellerschlüsselnummer (4-stellig)
- tsn: Typschlüsselnummer (3-stellig, ggf. mit Zeichen)
- hersteller: Fahrzeughersteller
- modell: Fahrzeugmodell / Handelsbezeichnung
- baureihe: Baureihe/Variante (falls angegeben)
- fahrzeugklasse: Fahrzeugklasse (z.B. PKW)
- vin: Fahrzeugidentifikationsnummer (Fahrgestellnummer)
- hubraum: Hubraum in ccm
- leistung_kw: Leistung in kW
- leistung_ps: Leistung in PS
- erstzulassung: Datum der Erstzulassung (Format YYYY-MM-DD)
- anzahl_sitze: Anzahl der Sitzplätze
- schadstoffklasse: Schadstoffklasse (z.B. Euro 6)
- kraftstoff: Kraftstoffart (z.B. Benzin, Diesel)`,
      file_urls: [fileUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          kennzeichen: { type: 'string' },
          hsn: { type: 'string' },
          tsn: { type: 'string' },
          hersteller: { type: 'string' },
          modell: { type: 'string' },
          baureihe: { type: 'string' },
          fahrzeugklasse: { type: 'string' },
          vin: { type: 'string' },
          hubraum: { type: 'string' },
          leistung_kw: { type: 'string' },
          leistung_ps: { type: 'string' },
          erstzulassung: { type: 'string' },
          anzahl_sitze: { type: 'string' },
          schadstoffklasse: { type: 'string' },
          kraftstoff: { type: 'string' },
        },
      },
    });

    // InvokeLLM returns an object when response_json_schema is set
    const data = result && result.data ? result.data : result;

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}