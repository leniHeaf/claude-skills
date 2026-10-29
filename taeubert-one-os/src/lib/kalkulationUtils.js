export const GEWERKE = [
  { value: "Mechanik", label: "Mechanik", default: 150 },
  { value: "Karosserie", label: "Karosserie", default: 150 },
  { value: "Lackierung", label: "Lackierung", default: 155 },
];

export const GEWERK_LABEL = GEWERKE.reduce((acc, g) => { acc[g.value] = g.label; return acc; }, {});

export const DEFAULT_STUNDENLOHN = GEWERKE.reduce((acc, g) => { acc[g.value] = g.default; return acc; }, {});

export const POSITIONSTYPEN = [
  { value: "Arbeitszeit", label: "Arbeitszeit" },
  { value: "Ersatzteil", label: "Ersatzteil" },
  { value: "Lackmaterial", label: "Lackmaterial" },
  { value: "Pauschale", label: "Pauschale" },
];

export const POSITIONSTYP_LABEL = POSITIONSTYPEN.reduce((acc, t) => { acc[t.value] = t.label; return acc; }, {});

export const SCHADENBEREICHE = [
  { value: "front", label: "Front" },
  { value: "heck", label: "Heck" },
  { value: "seite_links", label: "Seite links" },
  { value: "seite_rechts", label: "Seite rechts" },
  { value: "dach", label: "Dach" },
  { value: "motorraum", label: "Motorraum" },
  { value: "innenraum", label: "Innenraum" },
];

export const SCHADENBEREICH_LABEL = SCHADENBEREICHE.reduce((acc, b) => { acc[b.value] = b.label; return acc; }, {});

export const KALKULATION_STATUS = [
  { value: "Entwurf", label: "Entwurf" },
  { value: "Kalkuliert", label: "Kalkuliert" },
  { value: "Kunde informiert", label: "Kunde informiert" },
  { value: "Auftrag erteilt", label: "Auftrag erteilt" },
];

export function formatEuro(value) {
  if (!value) return "0,00 €";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

export function formatStunden(value) {
  if (!value) return "0,0 AH";
  return `${Number(value).toFixed(1).replace(".", ",")} AH`;
}

function round2(n) { return Math.round((n || 0) * 100) / 100; }

/**
 * Erzeugt aus einer kompakten Katalog-Position die einzelnen Kalkulationszeilen.
 * Eine Lackier-Position (Arbeitszeit + Lackmaterial-Pauschale) liefert z.B.
 * eine Arbeitszeit- und eine Lackmaterial-Zeile.
 */
export function expandPosition(pos, stundenloehne, options = {}) {
  const menge = pos.menge || 1;
  const rate = stundenloehne?.[pos.gewerk] ?? DEFAULT_STUNDENLOHN[pos.gewerk] ?? 0;
  const typ = pos.positionstyp || "Arbeitszeit";
  const kleinteile = options.kleinteileAktiv ? 1 + (options.kleinteileProzent || 0) / 100 : 1;
  const lines = [];

  const baseLine = (positionstyp, richtzeit_ah, einzelpreis, bezeichnung, position_id) => ({
    position_id: position_id ?? pos.position_id,
    bezeichnung: bezeichnung ?? pos.bezeichnung,
    gewerk: pos.gewerk,
    positionstyp,
    richtzeit_ah: richtzeit_ah || 0,
    menge,
    einzelpreis: round2(einzelpreis),
    gesamtpreis: round2(einzelpreis * menge),
    stundenlohn: rate,
  });

  if (typ === "Ersatzteil") {
    lines.push(baseLine("Ersatzteil", 0, (pos.ersatzteil_kosten || 0) * kleinteile));
    return lines;
  }
  if (typ === "Lackmaterial") {
    lines.push(baseLine("Lackmaterial", 0, pos.lackmaterial_kosten || 0));
    return lines;
  }
  if (typ === "Pauschale") {
    const preis = Number(pos.ersatzteil_kosten || pos.lackmaterial_kosten || 0);
    lines.push(baseLine("Pauschale", 0, preis));
    return lines;
  }

  // Arbeitszeit (Standard)
  if ((pos.richtzeit_ah || 0) > 0) {
    lines.push(baseLine("Arbeitszeit", pos.richtzeit_ah, pos.richtzeit_ah * rate));
  }
  if ((pos.ersatzteil_kosten || 0) > 0) {
    lines.push(baseLine("Ersatzteil", 0, pos.ersatzteil_kosten * kleinteile, `Ersatzteil – ${pos.bezeichnung}`, `${pos.position_id}#teil`));
  }
  if ((pos.lackmaterial_kosten || 0) > 0) {
    lines.push(baseLine("Lackmaterial", 0, pos.lackmaterial_kosten, `Lackmaterial – ${pos.bezeichnung}`, `${pos.position_id}#lack`));
  }
  return lines;
}

export function expandPositionen(positionen, stundenloehne, options = {}) {
  const all = [];
  (positionen || []).forEach(p => { all.push(...expandPosition(p, stundenloehne, options)); });
  return all.map((l, i) => ({ ...l, pos: i + 1 }));
}

/**
 * Professionelle KFZ-Kalkulation nach echter DAT-Logik:
 *
 * LACKIERUNG:
 *   - Lohn Lackierung = Summe aller Lackier-AH × Stundenlohn Lackierung
 *   - Lackmaterial = lackmaterial_prozent % des Lacklohns (DAT-Standard: 45%)
 *   → Keine Einzel-Lackmaterialpreise pro Position, sondern eine Gesamtpauschale
 *
 * KAROSSERIE / MECHANIK:
 *   - Arbeitslohn = AH × jeweiliger Stundenlohn
 *   - Ersatzteile mit optionalem Kleinteile-Aufschlag (%)
 *
 * NEBENKOSTEN (Pauschale):
 *   - Separat als "Pauschale" ausgewiesen (z.B. Dichtmaterial, UBS-Material)
 *
 * MwSt konfigurierbar (Standard: auf alles; Versicherungsfall: ohne Arbeitslohn)
 */
export function berechneKalkulation(positionen, stundenloehne, options = {}) {
  const lines = expandPositionen(positionen, stundenloehne, options);
  const lackmaterial_prozent = options.lackmaterial_prozent ?? 45;

  let summe_arbeitslohn_lack = 0;
  let summe_arbeitslohn_karosserie = 0;
  let summe_arbeitslohn_mechanik = 0;
  let summe_ersatzteile = 0;
  let summe_pauschale = 0;

  lines.forEach(l => {
    if (l.positionstyp === "Arbeitszeit") {
      if (l.gewerk === "Lackierung") summe_arbeitslohn_lack += l.gesamtpreis;
      else if (l.gewerk === "Karosserie") summe_arbeitslohn_karosserie += l.gesamtpreis;
      else summe_arbeitslohn_mechanik += l.gesamtpreis;
    } else if (l.positionstyp === "Ersatzteil") {
      summe_ersatzteile += l.gesamtpreis;
    } else if (l.positionstyp === "Pauschale" || l.positionstyp === "Lackmaterial") {
      summe_pauschale += l.gesamtpreis;
    }
  });

  // DAT: Lackmaterial = 45% des Lacklohns (Pauschale, nicht Einzelpreise)
  const summe_lackmaterial = round2(summe_arbeitslohn_lack * lackmaterial_prozent / 100);
  const summe_arbeitslohn = round2(summe_arbeitslohn_lack + summe_arbeitslohn_karosserie + summe_arbeitslohn_mechanik);

  const mwst_satz = options.mwst_satz ?? 19;
  const mwst_auf_arbeitslohn = options.mwst_auf_arbeitslohn ?? true;
  const mwst_basis = summe_ersatzteile + summe_lackmaterial + summe_pauschale + (mwst_auf_arbeitslohn ? summe_arbeitslohn : 0);

  const zwischensumme_netto = round2(summe_arbeitslohn + summe_ersatzteile + summe_lackmaterial + summe_pauschale);
  const mwst_betrag = round2(mwst_basis * mwst_satz / 100);
  const gesamtbetrag_brutto = round2(zwischensumme_netto + mwst_betrag);

  return {
    lines,
    summe_arbeitslohn: round2(summe_arbeitslohn),
    summe_arbeitslohn_lack: round2(summe_arbeitslohn_lack),
    summe_arbeitslohn_karosserie: round2(summe_arbeitslohn_karosserie),
    summe_arbeitslohn_mechanik: round2(summe_arbeitslohn_mechanik),
    summe_ersatzteile: round2(summe_ersatzteile),
    summe_lackmaterial,
    lackmaterial_prozent,
    summe_pauschale: round2(summe_pauschale),
    zwischensumme_netto,
    mwst_satz,
    mwst_betrag,
    gesamtbetrag_brutto,
  };
}