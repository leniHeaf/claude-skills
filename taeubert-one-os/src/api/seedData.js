// Demo-Daten, die beim ersten Start in den lokalen Speicher geschrieben werden.

export const TEAM_MEMBERS = [
  { full_name: 'Lena', email: 'lena-0705@web.de', role: 'admin', label: 'Geschäftsleitung' },
  { full_name: 'Toni', email: 'toni@taeubert.gmbh', role: 'admin', label: 'Geschäftsleitung' },
  { full_name: 'Maik', email: 'maik@taeubert.gmbh', role: 'user', label: 'Karosserie & Lackierung' },
  { full_name: 'Marco', email: 'marco@taeubert.gmbh', role: 'user', label: 'Karosserie & Lackierung' },
  { full_name: 'Pascal', email: 'pascal@taeubert.gmbh', role: 'user', label: 'Karosserie & Lackierung' },
  { full_name: 'Fanny', email: 'fanny@taeubert.gmbh', role: 'user', label: 'Büro & Kunden' },
  { full_name: 'Selina', email: 'selina@taeubert-karosserie-lack.de', role: 'user', label: 'Büro – Kalkulation & Bestellung' },
  { full_name: 'Fabian', email: 'fabian@taeubert.gmbh', role: 'user', label: 'Werkstatt – Kostenvoranschläge' },
  { full_name: 'Adrian', email: 'adrian@taeubert.gmbh', role: 'user', label: 'Azubi' },
];

const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const at = (offset, h, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const monthStr = (offset) => {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
};
const mondayOf = (offsetWeeks = 0) => {
  const d = new Date();
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff + offsetWeeks * 7);
  return d.toISOString().slice(0, 10);
};

export function buildSeedData() {
  // Feste IDs, damit sich Datensätze gegenseitig referenzieren können.
  const v = [
    { id: 'veh_g', customer_name: 'Andreas Müller', license_plate: 'SON-TK 911', make: 'Mercedes-Benz', model: 'G 63 AMG', color: 'Obsidianschwarz', baujahr: 2021, status: 'lackierung', condition: 'lackierung', responsible: 'Maik', estimated_completion: day(2), damage_description: 'Kratzer Fahrertür + Kotflügel vorne links', customer_wishes: 'Keramikversiegelung nach Lackierung', insurance: 'HUK-Coburg', progress: 60, created_date: at(-5, 8) },
    { id: 'veh_911', customer_name: 'Julia Schneider', license_plate: 'CO-JS 993', make: 'Porsche', model: '911 Carrera S', color: 'Schwarz Metallic', baujahr: 2019, status: 'karosserie', condition: 'in_arbeit', responsible: 'Marco', estimated_completion: day(4), damage_description: 'Parkrempler Stoßstange hinten', insurance: 'Allianz', progress: 35, created_date: at(-3, 9) },
    { id: 'veh_oldie', customer_name: 'Heinz Bauer', license_plate: 'NEC-H 64H', make: 'Ford', model: 'Mustang Fastback (1966)', color: 'Pink Champagne', baujahr: 1966, status: 'vorbereitung', condition: 'wartet_auf_teile', responsible: 'Pascal', estimated_completion: day(14), damage_description: 'Komplettlackierung, Rostbehandlung Schweller', customer_wishes: 'Originalfarbton beibehalten', progress: 25, created_date: at(-12, 10) },
    { id: 'veh_c', customer_name: 'Sabine Wolf', license_plate: 'SON-SW 220', make: 'Mercedes-Benz', model: 'C 220 d T-Modell', color: 'Polarweiß', baujahr: 2022, status: 'finish', condition: 'in_arbeit', responsible: 'Maik', estimated_completion: day(1), damage_description: 'Hagelschaden Dach + Motorhaube', insurance: 'DEVK', progress: 85, created_date: at(-8, 8) },
    { id: 'veh_e', customer_name: 'Thomas Richter', license_plate: 'CO-TR 350', make: 'Mercedes-Benz', model: 'E 350 Coupé', color: 'Brillantblau', baujahr: 2020, status: 'endkontrolle', condition: 'fertig', responsible: 'Toni', estimated_completion: day(0), damage_description: 'Smart Repair Felgen + Spotrepair Heck', progress: 95, quality_approved: false, created_date: at(-6, 11) },
    { id: 'veh_golf', customer_name: 'Autohaus Sonneberg', license_plate: 'SON-AH 77', make: 'VW', model: 'Golf 8 GTI', color: 'Kings Red', baujahr: 2023, status: 'annahme', condition: 'in_arbeit', responsible: 'Fabian', estimated_completion: day(6), damage_description: 'Unfallschaden Front, Scheinwerfer defekt', insurance: 'R+V', progress: 5, created_date: at(-1, 14) },
    { id: 'veh_bmw', customer_name: 'Markus Klein', license_plate: 'NEC-MK 5', make: 'BMW', model: 'M5 Competition', color: 'Frozen Grey', baujahr: 2021, status: 'teile_bestellt', condition: 'wartet_auf_teile', responsible: 'Marco', estimated_completion: day(9), damage_description: 'Seitenschaden rechts, Spiegel + Tür', progress: 15, created_date: at(-2, 10) },
    { id: 'veh_done', customer_name: 'Claudia Hoffmann', license_plate: 'SON-CH 12', make: 'Audi', model: 'A6 Avant', color: 'Daytonagrau', baujahr: 2020, status: 'uebergabe', condition: 'fertig', responsible: 'Fanny', estimated_completion: day(-1), damage_description: 'Lackschaden Heckklappe', progress: 100, quality_approved: true, created_date: at(-10, 9) },
  ];
  const info = (veh) => `${veh.make} ${veh.model} - ${veh.license_plate}`;
  const byId = Object.fromEntries(v.map((x) => [x.id, x]));

  const customers = [
    { name: 'Andreas Müller', phone: '0171 2345678', email: 'a.mueller@example.de', customer_type: 'premium', journey_stage: 'aktiv', vip_status: true, lifetime_value: 18400, loyalty_score: 88, mood_status: 'begeistert', preferred_contact: 'whatsapp', favorite_brands: ['Mercedes-Benz', 'AMG'] },
    { name: 'Julia Schneider', phone: '0160 9876543', email: 'julia.schneider@example.de', customer_type: 'enthusiast', journey_stage: 'aktiv', lifetime_value: 7200, loyalty_score: 72, mood_status: 'neutral', preferred_contact: 'mail' },
    { name: 'Heinz Bauer', phone: '09561 12345', customer_type: 'stammkunde', journey_stage: 'stammkunde', lifetime_value: 23900, loyalty_score: 95, mood_status: 'begeistert', preferred_contact: 'telefon', interests: ['Oldtimer', 'US-Cars'] },
    { name: 'Sabine Wolf', phone: '0151 4433221', email: 's.wolf@example.de', customer_type: 'versicherung', journey_stage: 'fertigstellung', lifetime_value: 3100, loyalty_score: 60, mood_status: 'neutral', preferred_contact: 'sms' },
    { name: 'Thomas Richter', phone: '0172 5566778', email: 'richter@example.de', customer_type: 'privat', journey_stage: 'uebergabe', lifetime_value: 4600, loyalty_score: 70, mood_status: 'begeistert' },
    { name: 'Autohaus Sonneberg', phone: '03675 998877', email: 'service@autohaus-son.example', customer_type: 'autohaus', journey_stage: 'kalkulation', lifetime_value: 52000, loyalty_score: 80, mood_status: 'neutral', company: 'Autohaus Sonneberg GmbH' },
    { name: 'Markus Klein', phone: '0176 1122334', customer_type: 'kritisch', journey_stage: 'aktiv', lifetime_value: 2900, loyalty_score: 40, mood_status: 'kritisch', risk_score: 70 },
    { name: 'Claudia Hoffmann', phone: '0157 6677889', email: 'c.hoffmann@example.de', customer_type: 'stammkunde', journey_stage: 'nachkontakt', lifetime_value: 9800, loyalty_score: 85, mood_status: 'begeistert' },
  ];

  const tasks = [
    { title: 'Tür FL lackieren', vehicle_id: 'veh_g', assigned_to: 'Maik', category: 'lackierung', priority: 'hoch', status: 'in_arbeit', estimated_hours: 4, deadline: day(1) },
    { title: 'Keramikversiegelung vorbereiten', vehicle_id: 'veh_g', assigned_to: 'Pascal', category: 'finish', priority: 'mittel', status: 'offen', estimated_hours: 3, deadline: day(2) },
    { title: 'Stoßstange hinten ausbeulen', vehicle_id: 'veh_911', assigned_to: 'Marco', category: 'karosserie', priority: 'hoch', status: 'in_arbeit', estimated_hours: 5, deadline: day(2) },
    { title: 'Schweller entrosten', vehicle_id: 'veh_oldie', assigned_to: 'Pascal', category: 'vorbereitung', priority: 'mittel', status: 'offen', estimated_hours: 8, deadline: day(7) },
    { title: 'Originalteile Mustang bestellen', vehicle_id: 'veh_oldie', assigned_to: 'Selina', category: 'teile', priority: 'hoch', status: 'offen', estimated_hours: 1, deadline: day(1) },
    { title: 'Dach polieren', vehicle_id: 'veh_c', assigned_to: 'Maik', category: 'finish', priority: 'mittel', status: 'erledigt', estimated_hours: 2 },
    { title: 'Endreinigung C-Klasse', vehicle_id: 'veh_c', assigned_to: 'Adrian', category: 'reinigung', priority: 'niedrig', status: 'offen', estimated_hours: 1.5, deadline: day(1) },
    { title: 'Endkontrolle E-Klasse', vehicle_id: 'veh_e', assigned_to: 'Toni', category: 'finish', priority: 'kritisch', status: 'offen', estimated_hours: 1, deadline: day(0) },
    { title: 'Kunde Richter Übergabetermin vereinbaren', vehicle_id: 'veh_e', assigned_to: 'Fanny', category: 'kunde', priority: 'hoch', status: 'offen', estimated_hours: 0.5, deadline: day(0) },
    { title: 'Kostenvoranschlag Golf GTI', vehicle_id: 'veh_golf', assigned_to: 'Fabian', category: 'sonstiges', priority: 'hoch', status: 'in_arbeit', estimated_hours: 2, deadline: day(1) },
    { title: 'Spiegel + Tür BMW bestellen', vehicle_id: 'veh_bmw', category: 'teile', priority: 'mittel', status: 'offen', estimated_hours: 0.5, deadline: day(1) },
    { title: 'Lager aufräumen', category: 'lager', priority: 'niedrig', status: 'offen', estimated_hours: 2 },
  ].map((t) => ({ ...t, vehicle_info: t.vehicle_id ? info(byId[t.vehicle_id]) : '' }));

  const timeEntries = [
    { vehicle_id: 'veh_g', employee: 'Maik', activity: 'lackierung', start_time: at(0, 7, 30), status: 'aktiv' },
    { vehicle_id: 'veh_911', employee: 'Marco', activity: 'karosserie', start_time: at(0, 7, 15), status: 'aktiv' },
    { vehicle_id: 'veh_c', employee: 'Maik', activity: 'finish', start_time: at(-1, 8), end_time: at(-1, 11, 30), duration_minutes: 210, status: 'beendet' },
    { vehicle_id: 'veh_oldie', employee: 'Pascal', activity: 'schleifen', start_time: at(-1, 7), end_time: at(-1, 12), duration_minutes: 300, status: 'beendet' },
    { vehicle_id: 'veh_e', employee: 'Toni', activity: 'nacharbeit', start_time: at(-2, 13), end_time: at(-2, 14, 30), duration_minutes: 90, status: 'beendet' },
    { vehicle_id: 'veh_911', employee: 'Marco', activity: 'demontage', start_time: at(-2, 8), end_time: at(-2, 10), duration_minutes: 120, status: 'beendet' },
    { vehicle_id: 'veh_g', employee: 'Pascal', activity: 'abkleben', start_time: at(-3, 8), end_time: at(-3, 10, 15), duration_minutes: 135, status: 'beendet' },
    { vehicle_id: 'veh_done', employee: 'Adrian', activity: 'reinigung', start_time: at(-3, 13), end_time: at(-3, 14), duration_minutes: 60, status: 'beendet' },
  ].map((t) => ({ ...t, vehicle_info: info(byId[t.vehicle_id]), pause_minutes: 0 }));

  const team = ['Toni', 'Maik', 'Marco', 'Fanny', 'Pascal', 'Adrian', 'Lena'];
  const bookings = [];
  for (let offset = -4; offset <= 0; offset++) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    team.forEach((emp, i) => {
      bookings.push({
        employee: emp,
        date: day(offset),
        start_time: at(offset, 7, i * 5),
        end_time: offset === 0 ? undefined : at(offset, 16, i * 3),
      });
    });
  }

  return {
    User: TEAM_MEMBERS.map(({ label, ...u }) => u),
    Vehicle: v,
    Customer: customers,
    Task: tasks,
    TimeEntry: timeEntries,
    TimeBooking: bookings,
    Appointment: [
      { title: 'Übergabe E-Klasse', type: 'abholung', date: day(0), start_time: '16:00', vehicle_id: 'veh_e', vehicle_info: info(byId.veh_e), customer_name: 'Thomas Richter', employee: 'Fanny', status: 'bestaetigt' },
      { title: 'Annahme Tesla Model 3', type: 'annahme', date: day(1), start_time: '08:30', customer_name: 'Petra Lang', employee: 'Fabian', status: 'geplant' },
      { title: 'Kalkulation Hagelschaden', type: 'kundentermin', date: day(2), start_time: '10:00', customer_name: 'Autohaus Sonneberg', employee: 'Selina', status: 'geplant' },
      { title: 'TÜV Mustang', type: 'tuev', date: day(15), start_time: '09:00', vehicle_id: 'veh_oldie', vehicle_info: info(byId.veh_oldie), customer_name: 'Heinz Bauer', employee: 'Pascal', status: 'geplant' },
    ],
    QualityCheck: [
      { vehicle_id: 'veh_e', vehicle_info: info(byId.veh_e), stage: 'endkontrolle', status: 'offen', inspector: 'Toni' },
      { vehicle_id: 'veh_done', vehicle_info: info(byId.veh_done), stage: 'uebergabe', status: 'bestanden', inspector: 'Toni', approved: true },
      { vehicle_id: 'veh_c', vehicle_info: info(byId.veh_c), stage: 'lackierung', status: 'nacharbeit', inspector: 'Lena', comments: 'Leichter Läufer an der Motorhaube' },
    ],
    ErrorReport: [
      { vehicle_id: 'veh_c', vehicle_info: info(byId.veh_c), category: 'laeufer', description: 'Läufer Motorhaube Mitte', responsible: 'Maik', stage: 'lackierung', severity: 'mittel', root_cause: 'Zu viel Material im 2. Gang', solution: 'Anschleifen und polieren', resolved: false },
      { vehicle_id: 'veh_done', vehicle_info: info(byId.veh_done), category: 'staub', description: 'Staubeinschluss Heckklappe', responsible: 'Pascal', stage: 'lackierung', severity: 'niedrig', resolved: true, solution: 'Ausgeschliffen und poliert' },
      { vehicle_id: 'veh_e', vehicle_info: info(byId.veh_e), category: 'hologramme', description: 'Hologramme nach Politur sichtbar', responsible: 'Adrian', stage: 'finish', severity: 'niedrig', resolved: false },
    ],
    Material: [
      { name: 'Klarlack HS 2K', category: 'lackierung', supplier_main: 'Standox', unit: 'Liter', price_per_unit: 48.5, current_stock: 6, min_stock: 10, preferred_order_qty: 20, lead_time_days: 2 },
      { name: 'Füller grau', category: 'vorbereitung', supplier_main: 'Standox', unit: 'Liter', price_per_unit: 32, current_stock: 14, min_stock: 8, preferred_order_qty: 10, lead_time_days: 2 },
      { name: 'Schleifpapier P800', category: 'vorbereitung', supplier_main: 'Mirka', unit: 'Pack', price_per_unit: 19.9, current_stock: 3, min_stock: 5, preferred_order_qty: 10, lead_time_days: 3 },
      { name: 'Abklebeband 19mm', category: 'vorbereitung', supplier_main: '3M', unit: 'Rolle', price_per_unit: 4.2, current_stock: 40, min_stock: 20, preferred_order_qty: 48, lead_time_days: 2 },
      { name: 'Polierpaste fein', category: 'finish', supplier_main: 'Menzerna', unit: 'Flasche', price_per_unit: 24, current_stock: 5, min_stock: 4, preferred_order_qty: 6, lead_time_days: 4 },
      { name: 'Keramikversiegelung', category: 'schutz', supplier_main: 'Gtechniq', unit: 'Set', price_per_unit: 89, current_stock: 2, min_stock: 3, preferred_order_qty: 5, lead_time_days: 5 },
    ],
    MaterialUsage: [
      { material_name: 'Klarlack HS 2K', category: 'lackierung', quantity_used: 1.5, unit: 'Liter', vehicle_id: 'veh_g', vehicle_info: info(byId.veh_g), employee: 'Maik', area: 'lackierung', cost: 72.75, date: day(-1) },
      { material_name: 'Füller grau', category: 'vorbereitung', quantity_used: 1, unit: 'Liter', vehicle_id: 'veh_oldie', vehicle_info: info(byId.veh_oldie), employee: 'Pascal', area: 'vorbereitung', cost: 32, date: day(-2) },
    ],
    PurchaseRequest: [
      { material_name: 'Klarlack HS 2K', quantity: 20, unit: 'Liter', urgency: 'dringend', requested_by: 'Maik', supplier: 'Standox', status: 'offen' },
    ],
    LeaveRequest: [
      { employee: 'Marco', start_date: day(20), end_date: day(24), days: 5, reason: 'Familienurlaub', status: 'eingereicht' },
      { employee: 'Fanny', start_date: day(-14), end_date: day(-12), days: 3, reason: 'Kurzurlaub', status: 'genehmigt', reviewed_by: 'Lena' },
    ],
    Nachtrag: [
      { vehicle_id: 'veh_911', vehicle_info: info(byId.veh_911), reported_by: 'Marco', category: 'karosserie', description: 'Halter Stoßstange gebrochen – muss ersetzt werden', extra_time_hours: 1.5, estimated_cost: 180, urgency: 'normal', status: 'offen' },
    ],
    MoodEntry: team.map((e, i) => ({ employee: e, mood: ['motiviert', 'neutral', 'motiviert', 'gestresst', 'motiviert', 'neutral', 'motiviert'][i], date: day(0) })),
    PerformanceScore: ['Maik', 'Marco', 'Pascal', 'Adrian'].map((e, i) => ({
      employee: e, month: monthStr(-1),
      quality_score: [92, 85, 88, 74][i], productivity_score: [90, 88, 80, 70][i], responsibility_score: [95, 80, 85, 78][i],
      order_score: [85, 75, 90, 80][i], team_score: [90, 92, 88, 85][i],
      total_score: [90, 84, 86, 77][i], employee_of_month: i === 0, reviewed_by: 'Lena',
    })),
    Schichtplan: team.map((e) => ({ week_start: mondayOf(0), employee: e, monday: 'frueh', tuesday: 'frueh', wednesday: 'frueh', thursday: 'frueh', friday: 'frueh', saturday: 'frei' })),
    TyreStorage: [
      { customer_name: 'Andreas Müller', license_plate: 'SON-TK 911', brand: 'Pirelli Scorpion', size: '295/40 R22', season: 'winter', tread_depth: 6.5, condition: 'gut', storage_location: 'Regal A-03' },
      { customer_name: 'Claudia Hoffmann', license_plate: 'SON-CH 12', brand: 'Continental WinterContact', size: '245/45 R19', season: 'winter', tread_depth: 5, condition: 'ok', storage_location: 'Regal B-11' },
    ],
    RentalCar: [
      { customer_name: 'Julia Schneider', vehicle_info: info(byId.veh_911), rental_car_info: 'VW Polo – SON-LW 1', start_date: day(-3), end_date: day(4), start_km: 45210, status: 'ausgegeben' },
    ],
    Lift: [
      { name: 'Bühne 1', area: 'karosserie', vehicle_id: 'veh_911', vehicle_info: info(byId.veh_911), employee: 'Marco', status: 'belegt', occupied_since: at(0, 7, 15) },
      { name: 'Kabine 1', area: 'lackierung', vehicle_id: 'veh_g', vehicle_info: info(byId.veh_g), employee: 'Maik', status: 'belegt', occupied_since: at(0, 7, 30) },
      { name: 'Bühne 2', area: 'vorbereitung', status: 'frei' },
      { name: 'Finish-Platz', area: 'finish', vehicle_id: 'veh_c', vehicle_info: info(byId.veh_c), status: 'belegt' },
    ],
    VehicleEvent: [
      { vehicle_id: 'veh_g', vehicle_info: info(byId.veh_g), event_type: 'status_change', from_status: 'vorbereitung', to_status: 'lackierung', actor: 'Maik' },
      { vehicle_id: 'veh_e', vehicle_info: info(byId.veh_e), event_type: 'status_change', from_status: 'finish', to_status: 'endkontrolle', actor: 'Toni' },
    ],
    WorkshopNote: [
      { vehicle_id: 'veh_bmw', vehicle_info: info(byId.veh_bmw), author: 'Selina', message: 'Spiegel kommt erst Donnerstag', type: 'nachricht', resolved: false },
    ],
    Reparaturposition: [
      { positionsnummer: '0101', bezeichnung: 'Stoßfänger vorne aus- und einbauen', gewerk: 'Mechanik', richtzeit_ah: 1.2, positionstyp: 'Arbeitszeit' },
      { positionsnummer: '0102', bezeichnung: 'Kotflügel vorne instandsetzen', gewerk: 'Karosserie', richtzeit_ah: 2.5, positionstyp: 'Arbeitszeit' },
      { positionsnummer: '0103', bezeichnung: 'Tür vorne lackieren (Neuteil)', gewerk: 'Lackierung', richtzeit_ah: 2.1, lackmaterial_kosten: 95, positionstyp: 'Arbeitszeit' },
      { positionsnummer: '0104', bezeichnung: 'Motorhaube lackieren', gewerk: 'Lackierung', richtzeit_ah: 2.8, lackmaterial_kosten: 120, positionstyp: 'Arbeitszeit' },
      { positionsnummer: '0105', bezeichnung: 'Außenspiegel komplett', gewerk: 'Mechanik', ersatzteil_kosten: 340, positionstyp: 'Ersatzteil' },
    ],
    ClothingOrder: [
      { employee: 'Adrian', item: 'arbeitshose', size: 'L', quantity: 2, reason: 'verschlissen', status: 'eingereicht' },
    ],
    TaskRequest: [
      { employee: 'Pascal', title: 'Kabinenfilter tauschen', planned_date: day(1), planned_start_time: '13:00', estimated_hours: 1, category: 'sonstiges', priority: 'mittel', reason: 'Filter am Limit', status: 'eingereicht' },
    ],
  };
}
