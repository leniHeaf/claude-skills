// DAT-Exchange (DEX) Export für Kalkulationen
// Erzeugt eine vereinfachte DEX/XML-Datei, die in gängige DAT-Software
// (Variosoft / Kalkulation) importiert werden kann.

const esc = (val) =>
  String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const num = (v, d = 2) => {
  const n = Number(v) || 0;
  return n.toFixed(d);
};

const TRADE_CODE = { Mechanik: "MEC", Karosserie: "KAR", Lackierung: "LAC" };

/**
 * Erzeugt eine DAT-Exchange (DEX) XML-Zeichenkette.
 * @param {object} kalk - Kalkulation-Datensatz
 * @param {object} bericht - Schadensbericht-Datensatz
 * @param {object} vehicle - Fahrzeug-Datensatz (optional)
 */
export function generateDEX(kalk, bericht, vehicle) {
  const now = new Date().toISOString();
  const pos = kalk.positionen || [];
  const vehInfo = bericht?.vehicle_info || "";
  const vehParts = vehInfo.split(" - ");
  const make = vehicle?.make || vehParts[0]?.trim() || "";
  const model = vehicle?.model || vehParts.slice(1, -1).join(" ").trim() || "";
  const plate = vehicle?.license_plate || vehParts[vehParts.length - 1]?.trim() || "";

  const lines = pos
    .map((p, i) => {
      const trade = TRADE_CODE[p.gewerk] || "SON";
      const type =
        p.positionstyp === "Ersatzteil"
          ? "PART"
          : p.positionstyp === "Lackmaterial"
          ? "PAINT"
          : p.positionstyp === "Pauschale"
          ? "MISC"
          : "LAB";
      const hours = p.positionstyp === "Arbeitszeit" ? num(p.richtzeit_ah) : "0";
      const qty = num(p.menge || 1, 0);
      const unit = num(p.einzelpreis);
      const total = num(p.gesamtpreis);
      return `    <Position PositionNumber="${i + 1}">
      <Type>${type}</Type>
      <Trade>${trade}</Trade>
      <Description>${esc(p.bezeichnung)}</Description>
      <Hours>${hours}</Hours>
      <Quantity>${qty}</Quantity>
      <UnitPrice>${unit}</UnitPrice>
      <Total>${total}</Total>
    </Position>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<DEX xmlns="http://www.dat.de/exchange/2014">
  <Header>
    <Sender>Taeubert Karosserie &amp; Lack</Sender>
    <Receiver>DAT</Receiver>
    <Created>${now}</Created>
    <Software>Taeubert One OS</Software>
  </Header>
  <Claim>
    <ClaimNumber>${esc(vehicle?.insurance_case_number) || ""}</ClaimNumber>
    <Insurance>${esc(vehicle?.insurance) || ""}</Insurance>
  </Claim>
  <Vehicle>
    <Make>${esc(make)}</Make>
    <Model>${esc(model)}</Model>
    <RegistrationNumber>${esc(plate)}</RegistrationNumber>
    <VIN>${esc(vehicle?.vin) || ""}</VIN>
    <HSN>${esc(vehicle?.hsn) || ""}</HSN>
    <TSN>${esc(vehicle?.tsn) || ""}</TSN>
  </Vehicle>
  <Estimate>
    <EstimateDate>${esc(kalk.date) || now.slice(0, 10)}</EstimateDate>
    <Customer>${esc(bericht?.customer_name) || ""}</Customer>
    <LabourRate Mechanik="${num(kalk.stundenlohn_mechanik)}" Karosserie="${num(kalk.stundenlohn_karosserie)}" Lackierung="${num(kalk.stundenlohn_lackierung)}"/>
    <PaintMaterialPercent>${num(kalk.lackmaterial_prozent ?? 45)}</PaintMaterialPercent>
${lines}
    <Summary>
      <LabourTotal>${num(kalk.summe_arbeitslohn)}</LabourTotal>
      <LabourKarosserie>${num(kalk.summe_arbeitslohn_karosserie)}</LabourKarosserie>
      <LabourMechanik>${num(kalk.summe_arbeitslohn_mechanik)}</LabourMechanik>
      <LabourLackierung>${num(kalk.summe_arbeitslohn_lack)}</LabourLackierung>
      <PartsTotal>${num(kalk.summe_ersatzteile)}</PartsTotal>
      <PaintMaterialTotal>${num(kalk.summe_lackmaterial)}</PaintMaterialTotal>
      <SubtotalNet>${num(kalk.zwischensumme_netto)}</SubtotalNet>
      <VATRate>${num(kalk.mwst_satz ?? 19)}</VATRate>
      <VATAmount>${num(kalk.mwst_betrag)}</VATAmount>
      <TotalGross>${num(kalk.gesamtbetrag_brutto)}</TotalGross>
    </Summary>
  </Estimate>
</DEX>
`;
}

/**
 * Löst einen Browser-Download der DEX-Datei aus.
 */
export function downloadDEX(kalk, bericht, vehicle) {
  const xml = generateDEX(kalk, bericht, vehicle);
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const name = (bericht?.customer_name || "Kunde").replace(/\s+/g, "_");
  a.href = url;
  a.download = `DAT_Kalkulation_${name}_${kalk.date || ""}.dex.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}