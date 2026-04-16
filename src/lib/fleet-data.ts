const FLEET_BASE_URL = process.env.FLEET_API_URL || 'https://fleetmind.co';
const CACHE_TTL_MS = 60_000; // 1 minute

let cachedData: { text: string; fetchedAt: number } | null = null;
let cookieHeader: string | null = null;

async function ensureAuth(): Promise<string> {
  if (cookieHeader) return cookieHeader;

  const res = await fetch(`${FLEET_BASE_URL}/api/auth/demo-login`, {
    redirect: 'manual',
  });

  const setCookies = res.headers.getSetCookie?.() ?? [];
  cookieHeader = setCookies.map(c => c.split(';')[0]).join('; ');
  // Follow redirect manually to grab any extra cookies
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get('location');
    if (location) {
      const followRes = await fetch(new URL(location, FLEET_BASE_URL).href, {
        headers: { cookie: cookieHeader },
        redirect: 'manual',
      });
      const moreCookies = followRes.headers.getSetCookie?.() ?? [];
      if (moreCookies.length) {
        cookieHeader += '; ' + moreCookies.map(c => c.split(';')[0]).join('; ');
      }
    }
  }
  return cookieHeader;
}

async function fetchJSON<T>(path: string): Promise<T | null> {
  try {
    const cookie = await ensureAuth();
    const res = await fetch(`${FLEET_BASE_URL}${path}`, {
      headers: { cookie },
    });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

interface Order {
  codiceOrdine: string;
  mittenteNome: string;
  mittenteCitta: string;
  destinatarioNome: string;
  destinatarioCitta: string;
  tipoMerce: string;
  pesoKg: number;
  volumeM3: number;
  urgenza: string;
  stato: string;
  merceRefrigerata: boolean;
  mercePericolosa: boolean;
  trip?: { stato: string; driver?: { nome: string; cognome: string } } | null;
}

interface Driver {
  nome: string;
  cognome: string;
  stato: string;
  tipoPatente?: string;
  cqcScadenza?: string;
  adrPatentino?: boolean;
  oreGuidaOggi?: number;
  oreGuidaSettimana?: number;
}

interface Vehicle {
  targa: string;
  tipo: string;
  marca: string;
  modello: string;
  stato: string;
  portataKg?: number;
  volumeM3?: number;
  classeEuro?: string;
  adr?: boolean;
}

interface Trip {
  codiceViaggio?: string;
  stato: string;
  driver?: { nome: string; cognome: string };
  orders?: { codiceOrdine: string }[];
}

function formatOrders(orders: Order[]): string {
  const byStato: Record<string, number> = {};
  for (const o of orders) {
    byStato[o.stato] = (byStato[o.stato] || 0) + 1;
  }

  let text = `### Ordini (${orders.length} totali)\n`;
  text += `Stato: ${Object.entries(byStato).map(([k, v]) => `${k}: ${v}`).join(', ')}\n\n`;

  for (const o of orders) {
    text += `- **${o.codiceOrdine}** | ${o.mittenteNome} (${o.mittenteCitta}) → ${o.destinatarioNome} (${o.destinatarioCitta})\n`;
    text += `  Merce: ${o.tipoMerce} | ${o.pesoKg}kg, ${o.volumeM3}m³ | Urgenza: ${o.urgenza} | Stato: ${o.stato}`;
    if (o.merceRefrigerata) text += ' | REFRIGERATO';
    if (o.mercePericolosa) text += ' | ADR/PERICOLOSO';
    if (o.trip?.driver) text += ` | Autista: ${o.trip.driver.nome} ${o.trip.driver.cognome}`;
    text += '\n';
  }
  return text;
}

function formatDrivers(drivers: Driver[]): string {
  let text = `### Autisti (${drivers.length} totali)\n`;
  for (const d of drivers) {
    text += `- **${d.nome} ${d.cognome}** | Stato: ${d.stato}`;
    if (d.cqcScadenza) text += ` | CQC scade: ${new Date(d.cqcScadenza).toLocaleDateString('it-IT')}`;
    if (d.adrPatentino) text += ' | ADR: SI';
    text += '\n';
  }
  return text;
}

function formatVehicles(vehicles: Vehicle[]): string {
  let text = `### Mezzi (${vehicles.length} totali)\n`;
  for (const v of vehicles) {
    text += `- **${v.targa}** | ${v.tipo} | ${v.marca} ${v.modello} | Stato: ${v.stato}`;
    if (v.portataKg) text += ` | Portata: ${v.portataKg}kg`;
    if (v.classeEuro) text += ` | Euro ${v.classeEuro}`;
    if (v.adr) text += ' | ADR';
    text += '\n';
  }
  return text;
}

function formatTrips(trips: Trip[]): string {
  let text = `### Viaggi (${trips.length} totali)\n`;
  for (const t of trips) {
    text += `- ${t.codiceViaggio || '(senza codice)'} | Stato: ${t.stato}`;
    if (t.driver) text += ` | Autista: ${t.driver.nome} ${t.driver.cognome}`;
    text += '\n';
  }
  return text;
}

export async function fetchFleetDataContext(): Promise<string> {
  // Return cached if fresh
  if (cachedData && Date.now() - cachedData.fetchedAt < CACHE_TTL_MS) {
    return cachedData.text;
  }

  const [orders, drivers, vehicles, trips] = await Promise.all([
    fetchJSON<Order[]>('/api/orders'),
    fetchJSON<Driver[]>('/api/drivers'),
    fetchJSON<Vehicle[]>('/api/vehicles'),
    fetchJSON<Trip[]>('/api/trips'),
  ]);

  let text = '## DATI LIVE DALLA PIATTAFORMA FLEETMIND\n';
  text += `> Aggiornati al: ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}\n\n`;

  if (orders) text += formatOrders(orders) + '\n';
  else text += '### Ordini: dati non disponibili\n\n';

  if (drivers) text += formatDrivers(drivers) + '\n';
  else text += '### Autisti: dati non disponibili\n\n';

  if (vehicles) text += formatVehicles(vehicles) + '\n';
  else text += '### Mezzi: dati non disponibili\n\n';

  if (trips) text += formatTrips(trips) + '\n';
  else text += '### Viaggi: dati non disponibili\n\n';

  text += '> Usa questi dati per rispondere alle domande dell\'utente sulla situazione attuale della flotta.\n';

  cachedData = { text, fetchedAt: Date.now() };
  return text;
}
