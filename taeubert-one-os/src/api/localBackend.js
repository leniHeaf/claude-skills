// Lokales Backend – ersetzt das Base44-SDK.
// Alle Entitäten liegen im localStorage des Browsers, die API-Form
// (list / filter / get / create / update / delete / bulkCreate) entspricht der des SDK.
import { buildSeedData } from './seedData';

const DB_PREFIX = 'taeubert_db_';
const SEEDED_KEY = 'taeubert_seeded_v1';
const USER_KEY = 'taeubert_current_user';
const LLM_KEY = 'taeubert_anthropic_key';

const ENTITY_NAMES = [
  'Appointment', 'Ausbildungsplan', 'ClothingOrder', 'Customer', 'CustomerOrder', 'DATImport',
  'EmployeeProfile', 'ErrorReport', 'Handover', 'Kalkulation', 'LeaveRequest', 'Lift', 'Material',
  'MaterialUsage', 'MoodEntry', 'Nachtrag', 'PerformanceScore', 'PurchaseRequest', 'QualityCheck',
  'RentalCar', 'Reparaturposition', 'RolePermission', 'SchadenAufnahme', 'Schadensbericht',
  'Schichtplan', 'Task', 'TaskRequest', 'TimeBooking', 'TimeEntry', 'TyreStorage', 'User', 'Vehicle',
  'VehicleEvent', 'VehiclePhoto', 'WorkDay', 'WorkshopNote', 'ZeitKorrektur',
];

const delay = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

function readTable(name) {
  try {
    return JSON.parse(localStorage.getItem(DB_PREFIX + name) || '[]');
  } catch {
    return [];
  }
}

function writeTable(name, rows) {
  try {
    localStorage.setItem(DB_PREFIX + name, JSON.stringify(rows));
  } catch (e) {
    console.error(`Speichern von ${name} fehlgeschlagen (Speicher voll?)`, e);
    throw new Error('Lokaler Speicher ist voll – bitte alte Fotos/Daten löschen.');
  }
}

function ensureSeeded() {
  try {
    if (localStorage.getItem(SEEDED_KEY)) return;
    const seed = buildSeedData();
    const now = new Date().toISOString();
    for (const [name, rows] of Object.entries(seed)) {
      writeTable(name, rows.map((r) => ({
        id: newId(),
        created_date: r.created_date || now,
        updated_date: now,
        created_by: 'system',
        ...r,
      })));
    }
    localStorage.setItem(SEEDED_KEY, now);
  } catch (e) {
    console.warn('Demo-Daten konnten nicht angelegt werden', e);
  }
}

function compare(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'de', { numeric: true });
}

function sortRows(rows, sort) {
  if (!sort) return rows;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  return [...rows].sort((x, y) => (desc ? -1 : 1) * compare(x[field], y[field]));
}

function matches(row, query) {
  return Object.entries(query || {}).every(([key, cond]) => {
    const value = row[key];
    if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
      if ('$in' in cond) return cond.$in.includes(value);
      if ('$nin' in cond) return !cond.$nin.includes(value);
      if ('$ne' in cond) return value !== cond.$ne;
      if ('$gte' in cond && !(value >= cond.$gte)) return false;
      if ('$lte' in cond && !(value <= cond.$lte)) return false;
      if ('$gt' in cond && !(value > cond.$gt)) return false;
      if ('$lt' in cond && !(value < cond.$lt)) return false;
      return true;
    }
    if (Array.isArray(value) && !Array.isArray(cond)) return value.includes(cond);
    return value === cond;
  });
}

function query(name, filterQuery, sort, limit, skip = 0) {
  ensureSeeded();
  let rows = readTable(name);
  if (filterQuery) rows = rows.filter((r) => matches(r, filterQuery));
  rows = sortRows(rows, sort);
  if (skip) rows = rows.slice(skip);
  if (limit) rows = rows.slice(0, limit);
  return clone(rows);
}

const listeners = {};
function notify(name, event) {
  (listeners[name] || []).forEach((cb) => {
    try { cb(event); } catch (e) { console.error(e); }
  });
}

function createEntity(name) {
  return {
    async list(sort, limit, skip) {
      await delay();
      return query(name, null, sort, limit, skip);
    },
    async filter(filterQuery, sort, limit, skip) {
      await delay();
      return query(name, filterQuery, sort, limit, skip);
    },
    async get(id) {
      await delay();
      ensureSeeded();
      const row = readTable(name).find((r) => r.id === id);
      if (!row) {
        const err = new Error(`${name} ${id} nicht gefunden`);
        err.status = 404;
        throw err;
      }
      return clone(row);
    },
    async create(data) {
      await delay();
      ensureSeeded();
      const now = new Date().toISOString();
      const row = {
        ...clone(data),
        id: newId(),
        created_date: now,
        updated_date: now,
        created_by: currentUser()?.email || 'lokal',
      };
      writeTable(name, [...readTable(name), row]);
      notify(name, { type: 'create', id: row.id, data: row });
      return clone(row);
    },
    async bulkCreate(items) {
      const created = [];
      for (const item of items || []) created.push(await this.create(item));
      return created;
    },
    async update(id, data) {
      await delay();
      ensureSeeded();
      const rows = readTable(name);
      const idx = rows.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error(`${name} ${id} nicht gefunden`);
      rows[idx] = { ...rows[idx], ...clone(data), id, updated_date: new Date().toISOString() };
      writeTable(name, rows);
      notify(name, { type: 'update', id, data: rows[idx] });
      return clone(rows[idx]);
    },
    async delete(id) {
      await delay();
      ensureSeeded();
      writeTable(name, readTable(name).filter((r) => r.id !== id));
      notify(name, { type: 'delete', id });
      return { success: true };
    },
    async deleteMany(filterQuery) {
      const remaining = readTable(name).filter((r) => !matches(r, filterQuery));
      writeTable(name, remaining);
      return { success: true };
    },
    subscribe(cb) {
      (listeners[name] ||= []).push(cb);
      return () => { listeners[name] = listeners[name].filter((c) => c !== cb); };
    },
    async schema() {
      return {};
    },
  };
}

// ---------- Auth ----------

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

const auth = {
  async me() {
    await delay(20);
    const user = currentUser();
    if (!user) {
      const err = new Error('Nicht angemeldet');
      err.status = 401;
      throw err;
    }
    return clone(user);
  },
  async isAuthenticated() {
    return !!currentUser();
  },
  async login(user) {
    const full = { id: user.id || newId(), role: 'user', ...user };
    localStorage.setItem(USER_KEY, JSON.stringify(full));
    return full;
  },
  async updateMe(data) {
    const user = { ...currentUser(), ...data };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },
  logout() {
    localStorage.removeItem(USER_KEY);
    window.location.href = '/';
  },
  redirectToLogin() {
    localStorage.removeItem(USER_KEY);
    window.location.href = '/';
  },
};

// ---------- Integrationen ----------

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Bilder vor dem Speichern verkleinern, damit der localStorage nicht sofort voll läuft.
async function compressImage(dataUrl, maxSize = 1280, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function getLlmKey() {
  return import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem(LLM_KEY) || '';
}

// Platzhalter-Antwort passend zum gewünschten JSON-Schema, wenn keine KI konfiguriert ist.
function placeholderFromSchema(schema) {
  if (!schema) return null;
  switch (schema.type) {
    case 'object': {
      const out = {};
      for (const [k, v] of Object.entries(schema.properties || {})) out[k] = placeholderFromSchema(v);
      return out;
    }
    case 'array': return [];
    case 'number':
    case 'integer': return 0;
    case 'boolean': return false;
    default: return schema.enum ? schema.enum[0] : '';
  }
}

const NO_KI_TEXT =
  'KI ist im lokalen Modus nicht verbunden. Hinterlege unter „Einstellungen → KI“ (Sidebar unten) ' +
  'einen Anthropic-API-Key oder setze VITE_ANTHROPIC_API_KEY in .env.local, um echte Antworten zu erhalten.';

async function invokeLLM({ prompt, file_urls, response_json_schema }) {
  const key = getLlmKey();
  if (!key) {
    await delay(400);
    if (response_json_schema) {
      const res = placeholderFromSchema(response_json_schema);
      for (const f of ['zusammenfassung', 'summary', 'antwort', 'answer', 'hinweis', 'besonderheiten']) {
        if (res && f in res && typeof res[f] === 'string') { res[f] = NO_KI_TEXT; break; }
      }
      return res;
    }
    return NO_KI_TEXT;
  }

  const content = [];
  for (const url of file_urls || []) {
    const m = /^data:(image\/(?:png|jpeg|gif|webp));base64,(.*)$/.exec(url || '');
    if (m) content.push({ type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } });
    const pdf = /^data:application\/pdf;base64,(.*)$/.exec(url || '');
    if (pdf) content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf[1] } });
  }
  let text = prompt;
  if (response_json_schema) {
    text += `\n\nAntworte ausschließlich mit gültigem JSON (ohne Markdown), das diesem JSON-Schema entspricht:\n${JSON.stringify(response_json_schema)}`;
  }
  content.push({ type: 'text', text });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content }],
    }),
  });
  if (!res.ok) throw new Error(`KI-Anfrage fehlgeschlagen (${res.status}): ${await res.text()}`);
  const data = await res.json();
  const out = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
  if (!response_json_schema) return out;
  const json = out.slice(out.indexOf('{'), out.lastIndexOf('}') + 1);
  try {
    return JSON.parse(json);
  } catch {
    return placeholderFromSchema(response_json_schema);
  }
}

const integrations = {
  Core: {
    async UploadFile({ file }) {
      let url = await fileToDataUrl(file);
      if (file.type?.startsWith('image/') && file.type !== 'image/gif') url = await compressImage(url);
      return { file_url: url };
    },
    InvokeLLM: invokeLLM,
    async SendEmail({ to, subject, body }) {
      // Kein Mailserver lokal – stattdessen Mailprogramm öffnen.
      const href = `mailto:${encodeURIComponent(to || '')}?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent((body || '').replace(/<[^>]+>/g, ''))}`;
      window.open(href, '_blank');
      return { success: true };
    },
    async ExtractDataFromUploadedFile({ file_url, json_schema }) {
      const output = await invokeLLM({
        prompt: 'Extrahiere die Daten aus der angehängten Datei.',
        file_urls: [file_url],
        response_json_schema: json_schema,
      });
      return { status: 'success', output };
    },
    async GenerateImage() {
      return { url: '' };
    },
  },
};

// ---------- Backend-Funktionen ----------

const functions = {
  async invoke(name, payload = {}) {
    await delay(200);
    switch (name) {
      case 'getCustomerRecommendations':
        return { data: { recommendations: [], success: true } };
      case 'extractFahrzeugschein': {
        const data = await invokeLLM({
          prompt: 'Lies diesen deutschen Fahrzeugschein (Zulassungsbescheinigung Teil I) aus.',
          file_urls: [payload.fileUrl],
          response_json_schema: {
            type: 'object',
            properties: {
              license_plate: { type: 'string' }, make: { type: 'string' }, model: { type: 'string' },
              vin: { type: 'string' }, hsn: { type: 'string' }, tsn: { type: 'string' },
              erstzulassung: { type: 'string' }, customer_name: { type: 'string' },
            },
          },
        });
        return { data: { success: true, data } };
      }
      case 'syncVehicleFromTask':
        return { data: { success: true } };
      case 'sendCustomerNotification':
      case 'sendVehicleNotification':
      case 'sendMaterialOrderEmail':
        return { data: { success: true, message: 'Im lokalen Modus simuliert – keine Nachricht versendet.' } };
      case 'datApiIntegration':
        return { data: { success: false, error: 'DAT-Schnittstelle ist im lokalen Modus nicht verbunden.' } };
      default:
        return { data: { success: false, error: `Funktion ${name} ist lokal nicht verfügbar.` } };
    }
  },
};

const users = {
  async inviteUser(email, role) {
    return entities.User.create({ email, role: role || 'user', full_name: email.split('@')[0] });
  },
};

const entities = Object.fromEntries(ENTITY_NAMES.map((n) => [n, createEntity(n)]));

export function createLocalClient() {
  ensureSeeded();
  return {
    entities: new Proxy(entities, {
      get(target, prop) {
        if (typeof prop === 'string' && !(prop in target)) target[prop] = createEntity(prop);
        return target[prop];
      },
    }),
    auth,
    integrations,
    functions,
    users,
    asServiceRole: { entities },
  };
}

export function resetLocalData() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(DB_PREFIX) || k === SEEDED_KEY)
    .forEach((k) => localStorage.removeItem(k));
}

export function setLlmKey(key) {
  if (key) localStorage.setItem(LLM_KEY, key);
  else localStorage.removeItem(LLM_KEY);
}

export { getLlmKey };
