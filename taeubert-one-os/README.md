# Täubert One OS

Werkstatt-Betriebssystem für Täubert Karosserie & Lack – nachgebaut aus dem Base44-Export
als eigenständige App ohne Base44-Konto oder -Backend.

## Starten

```bash
npm install
npm run dev
```

Dann <http://localhost:5173> öffnen und einen Mitarbeiter auswählen.

Produktions-Build: `npm run build` (Ausgabe in `dist/`, statisch hostbar, z. B. Netlify/Vercel –
für Unterseiten alle Pfade auf `index.html` umleiten).

## Was anders ist als bei Base44

| Bereich | Base44 | Hier |
| --- | --- | --- |
| Datenbank | Base44-Cloud | `localStorage` des Browsers (`src/api/localBackend.js`), beim ersten Start mit Demo-Daten befüllt (`src/api/seedData.js`) |
| Anmeldung | Base44-Login | Mitarbeiter-Auswahl; Bereiche/Rechte weiterhin über `src/lib/employeePermissions.js` |
| Datei-Upload | Base44-Storage | Bilder werden verkleinert und als Data-URL gespeichert |
| KI (Assistent, Schadenanalyse, Fahrzeugschein-Scan …) | Base44 InvokeLLM | Claude-API direkt aus dem Browser, sobald ein API-Key hinterlegt ist (Sidebar → Einstellungen, oder `VITE_ANTHROPIC_API_KEY` in `.env.local`); ohne Key erscheint ein Hinweis |
| E-Mail | Base44 SendEmail / Gmail-Connector | Öffnet das lokale Mailprogramm |
| Backend-Funktionen (`base44/functions`) | Deno-Funktionen | Lokal simuliert; DAT-Schnittstelle und WhatsApp/SMS-Versand sind nicht verbunden |

Die Oberfläche (alle Seiten unter `src/pages`, Komponenten unter `src/components`) ist unverändert
übernommen; der Code spricht weiterhin `base44.entities.X.list/filter/create/update/delete` an,
nur steckt dahinter jetzt der lokale Client.

Die ursprünglichen Entitäts-Schemata, Workflows und Funktionen liegen zur Referenz in `base44/`.

## Wichtig

- Daten liegen nur im jeweiligen Browser. Für mehrere Geräte/Mitarbeiter gleichzeitig muss
  `src/api/localBackend.js` gegen ein echtes Backend (z. B. Supabase) getauscht werden – die
  Schnittstelle ist bewusst gleich geblieben.
- „Einstellungen → Demo-Daten zurücksetzen“ löscht alle lokalen Daten.
