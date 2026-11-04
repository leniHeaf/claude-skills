// Mitarbeiter-Bereiche und App-Zugriffe
// Jeder Mitarbeiter sieht nur seine zugewiesenen Bereiche

export const EMPLOYEE_AREAS = {
  "Toni": {
    areas: ["betrieb", "kunden", "nachtraege", "qualitaet", "premium", "team", "werkstatt", "geschaeftsleitung"],
    role: "master",
    label: "Geschäftsleitung - Alle Bereiche"
  },
  "Maik": {
    areas: ["betrieb", "kunden", "nachtraege", "qualitaet", "team", "werkstatt"],
    role: "karosserie_lack",
    label: "Karosserie & Lackierung"
  },
  "Marco": {
    areas: ["betrieb", "kunden", "nachtraege", "qualitaet", "team", "werkstatt"],
    role: "karosserie_lack",
    label: "Karosserie & Lackierung"
  },
  "Fanny": {
    areas: ["betrieb", "kunden", "nachtraege", "team", "werkstatt"],
    role: "buerro",
    label: "Büro & Kunden"
  },
  "Pascal": {
    areas: ["betrieb", "kunden", "nachtraege", "qualitaet", "team", "werkstatt"],
    role: "karosserie_lack",
    label: "Karosserie & Lackierung"
  },
  "Adrian": {
    areas: ["betrieb", "kunden", "team", "werkstatt"],
    role: "azubi",
    label: "Azubi - Grundlagen"
  },
  "Lena": {
    areas: ["betrieb", "kunden", "nachtraege", "qualitaet", "premium", "team", "werkstatt", "geschaeftsleitung"],
    role: "master",
    label: "Geschäftsleitung - Alle Bereiche"
  },
  "lena-0705@web.de": {
    areas: ["betrieb", "kunden", "nachtraege", "qualitaet", "premium", "team", "werkstatt", "geschaeftsleitung"],
    role: "master",
    label: "Geschäftsleitung - Alle Bereiche"
  },
  "lscksdesign.taeubert": {
    areas: ["betrieb", "kunden", "team", "werkstatt"],
    role: "mitarbeiter",
    label: "Mitarbeiter - Standard"
  },
  "lackdesign.taeubert": {
    areas: ["betrieb", "kunden", "team", "werkstatt"],
    role: "mitarbeiter",
    label: "Mitarbeiter - Standard"
  },
  "Selina": {
    areas: ["betrieb", "kunden", "werkstatt"],
    role: "buerro",
    label: "Büro - Kalkulation & Bestellung"
  },
  "selina@taeubert-karosserie-lack.de": {
    areas: ["betrieb", "kunden", "werkstatt"],
    role: "buerro",
    label: "Büro - Kalkulation & Bestellung"
  },
  "Fabian": {
    areas: ["betrieb", "kunden", "werkstatt"],
    role: "karosserie_lack",
    label: "Werkstatt - Kostenvoranschläge"
  },
  "fabian@taeubert.gmbh": {
    areas: ["betrieb", "kunden", "werkstatt"],
    role: "karosserie_lack",
    label: "Werkstatt - Kostenvoranschläge"
  },
};

// Seiten-Zuordnung zu Bereichen
export const PAGE_AREA_MAPPING = {
  // BETRIEB
  "/": ["betrieb"],
  "/live": ["betrieb"],
  "/live-dashboard": ["betrieb"],
  "/zeit-board": ["betrieb"],
  "/zeit-korrektur": ["betrieb"],
  "/vehicles": ["betrieb"],
  "/vehicles/:id": ["betrieb"],
  "/vehicles/:id/timeline": ["betrieb"],
  "/tasks": ["betrieb"],
  "/aufgabeneinplanung": ["betrieb"],
  "/calendar": ["betrieb"],
  "/kpi": ["betrieb"],
  "/dat-import": ["betrieb"],
  "/data-import": ["betrieb"],
  "/auftragsverteilung": ["betrieb"],
  "/checklisten": ["betrieb"],
  "/vehicle-history": ["betrieb"],
  "/nachkalkulation": ["betrieb"],
  "/mein-tag": ["betrieb"],
  
  // KUNDEN
  "/crm": ["kunden"],
  "/customer-journey": ["kunden"],
  
  // NACHTRÄGE
  "/nachtraege": ["nachtraege"],
  
  // QUALITÄT
  "/standard": ["qualitaet"],
  "/quality": ["qualitaet"],
  "/errors": ["qualitaet"],
  
  // PREMIUM
  "/handover": ["premium"],
  "/ai-analyse": ["premium"],
  "/ai-assistant": ["premium"],
  
  // GESCHÄFTSLEITUNG (nur für Toni + Lena)
  "/performance": ["geschaeftsleitung"],
  "/performance-hub": ["geschaeftsleitung"],
  "/employees": ["geschaeftsleitung"],
  "/chef": ["geschaeftsleitung"],
  "/berechtigungen": ["geschaeftsleitung"],
  
  // TEAM
  "/team": ["team"],
  "/timetracking": ["team"],
  "/leave": ["team"],
  "/mood": ["team"],
  "/sop": ["team"],
  "/academy": ["team"],
  "/ausbildungsplan": ["team"],
  
  // WERKSTATT
  "/werkstatt": ["werkstatt"],
  "/tagesstart": ["werkstatt"],
  "/materials": ["werkstatt"],
  "/clothing": ["werkstatt"],
  "/tyres": ["werkstatt"],
};

// Hilfsfunktion: Prüft ob Mitarbeiter Zugriff auf Seite hat
export const hasPageAccess = (employeeName, pagePath) => {
  if (!employeeName) return false;
  
  // 1. Versuche exakte Übereinstimmung
  let employeeConfig = EMPLOYEE_AREAS[employeeName];
  
  // 2. Wenn nicht gefunden, versuche mit Groß-/Kleinschreibung ignorieren
  if (!employeeConfig) {
    const normalizedName = employeeName.toLowerCase();
    const foundKey = Object.keys(EMPLOYEE_AREAS).find(key => key.toLowerCase() === normalizedName);
    if (foundKey) {
      employeeConfig = EMPLOYEE_AREAS[foundKey];
    }
  }
  
  // 3. Versuche Partial Match (z.B. "lscksdesign" für "lscksdesign.taeubert")
  if (!employeeConfig) {
    const foundKey = Object.keys(EMPLOYEE_AREAS).find(key => 
      key.toLowerCase().includes(employeeName.toLowerCase()) || 
      employeeName.toLowerCase().includes(key.toLowerCase())
    );
    if (foundKey) {
      employeeConfig = EMPLOYEE_AREAS[foundKey];
    }
  }
  
  if (!employeeConfig) {
    console.log(`Keine Konfiguration gefunden für: ${employeeName}`);
    console.log(`Verfügbare Benutzer:`, Object.keys(EMPLOYEE_AREAS));
    return false;
  }
  
  const allowedAreas = employeeConfig.areas;
  
  // 4. Pfad-Matching mit Unterstützung für dynamische Routen (:id)
  let pageAreas = PAGE_AREA_MAPPING[pagePath] || [];
  
  // Wenn keine exakte Übereinstimmung, versuche Pattern-Matching für dynamische Routen
  if (pageAreas.length === 0) {
    const dynamicPath = Object.keys(PAGE_AREA_MAPPING).find(path => {
      // Konvertiere Route-Pattern zu Regex (z.B. "/vehicles/:id" -> "^/vehicles/[^/]+$")
      const regexPattern = path.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(pagePath);
    });
    
    if (dynamicPath) {
      pageAreas = PAGE_AREA_MAPPING[dynamicPath];
    }
  }
  
  // DEBUG: Console log für Zugriff
  console.log(`Access check: ${employeeName} -> ${pagePath}`, { 
    employeeConfig, 
    allowedAreas, 
    pageAreas 
  });
  
  // Wenn keine Areas definiert sind, Zugriff GEWÄHREN (für nicht-geschützte Seiten)
  if (pageAreas.length === 0) {
    console.log(`Keine Areas definiert für ${pagePath} -> Zugriff erlaubt`);
    return true;
  }
  
  // 5. Prüfen ob mindestens ein Bereich übereinstimmt
  const hasAccess = pageAreas.some(area => allowedAreas.includes(area));
  console.log(`Access result: ${hasAccess}`);
  return hasAccess;
};

// Hilfsfunktion: Gibt erlaubte Seiten für Mitarbeiter zurück
export const getAllowedPages = (employeeName) => {
  if (!employeeName) return [];
  
  const employeeConfig = EMPLOYEE_AREAS[employeeName];
  if (!employeeConfig) return [];
  
  const allowedAreas = employeeConfig.areas;
  
  return Object.entries(PAGE_AREA_MAPPING)
    .filter(([_, areas]) => areas.some(area => allowedAreas.includes(area)))
    .map(([path, _]) => path);
};

// Hilfsfunktion: Filtert Navigations-Items basierend auf Mitarbeiter
export const filterNavItems = (employeeName, navItems) => {
  if (!employeeName) return [];
  
  const employeeConfig = EMPLOYEE_AREAS[employeeName];
  if (!employeeConfig) return [];
  
  const allowedAreas = employeeConfig.areas;
  
  return navItems.filter(section => {
    // Wenn Section-Label einem Bereich entspricht, prüfen ob erlaubt
    const sectionArea = section.label.toLowerCase().replace("ä", "ae").replace("ü", "ue").replace("ö", "oe");
    
    // Spezialfälle für Section-Labels
    if (sectionArea === "betrieb" || sectionArea === "kunden" || 
        sectionArea === "nachtraege" || sectionArea === "qualitaet" || 
        sectionArea === "premium" || sectionArea === "team" || 
        sectionArea === "werkstatt") {
      return allowedAreas.includes(sectionArea);
    }
    
    // Standard: alle Items anzeigen wenn Bereich nicht gematcht
    return true;
  }).map(section => ({
    ...section,
    items: section.items.filter(item => {
      const itemAreas = PAGE_AREA_MAPPING[item.path] || [];
      return itemAreas.length === 0 || itemAreas.some(area => allowedAreas.includes(area));
    })
  })).filter(section => section.items.length > 0); // Nur Sections mit Items anzeigen
};