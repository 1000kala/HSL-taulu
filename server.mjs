import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeStops, validateStopIds } from './logic.mjs';
import { demoStopSearch, demoDepartures, demoFavorites } from './demo.mjs';
import { FAVORITES, chooseCandidateStops, selectBoardDepartures } from './favorites.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(ROOT, 'public');
const DIGITRANSIT_URL = 'https://api.digitransit.fi/routing/v2/hsl/gtfs/v1';

// Local configuration: .env is ignored by Git and never sent to the browser.
function loadEnv() {
  const filename = join(ROOT, '.env');
  if (!existsSync(filename)) return;
  for (const line of readFileSync(filename, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !(match[1] in process.env)) {
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      process.env[match[1]] = value;
    }
  }
}
loadEnv();

function isDemoMode() {
  const key = process.env.DIGITRANSIT_API_KEY?.trim();
  if (process.env.HSL_DEMO_MODE === '1') return true;
  return process.env.HSL_DEMO_MODE !== '0' && (!key || key === 'liitä_oma_avain_tähän');
}

const queryDepartures = `query DepartureBoard($ids: [String]) {
  stops(ids: $ids) {
    gtfsId name code
    stoptimesWithoutPatterns(numberOfDepartures: 60, omitCanceled: true) {
      serviceDay scheduledDeparture realtimeDeparture realtime realtimeState headsign
      trip { routeShortName tripHeadsign }
    }
  }
}`;
const queryStops = `query SearchStops($name: String) {
  stops(name: $name) { gtfsId name code }
}`;

const cache = new Map();
async function apiRequest(query, variables) {
  const key = process.env.DIGITRANSIT_API_KEY;
  if (!key || key === 'liitä_oma_avain_tähän') {
    const error = new Error('Digitransitin API-avain puuttuu. Lisää se paikalliseen .env-tiedostoon ja käynnistä palvelin uudelleen.');
    error.status = 503;
    throw error;
  }
  const response = await fetch(DIGITRANSIT_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'digitransit-subscription-key': key },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    const error = new Error(response.status === 401 || response.status === 403
      ? 'Digitransit hylkäsi API-avaimen tai pyyntömääräraja tuli vastaan. Tarkista avain ja käyttöoikeus.'
      : `Digitransit-palvelun virhe (HTTP ${response.status}).`);
    error.status = 502;
    throw error;
  }
  const data = await response.json();
  if (data.errors?.length) {
    const error = new Error('Digitransit-kysely epäonnistui. Tarkista rajapinnan yhteensopivuus.');
    error.status = 502;
    console.error('Digitransit GraphQL:', data.errors.map(item => item.message).join('; '));
    throw error;
  }
  return data.data;
}

function json(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(JSON.stringify(payload));
}
async function cached(key, lifespan, resolver) {
  const previous = cache.get(key);
  if (previous && Date.now() - previous.at < lifespan) return previous.value;
  const value = await resolver();
  cache.set(key, { value, at: Date.now() });
  if (cache.size > 100) cache.clear();
  return value;
}

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

async function serveStatic(req, res, pathname) {
  let relative;
  try { relative = decodeURIComponent(pathname); } catch { return json(res, 400, { error: 'Virheellinen osoite.' }); }
  if (relative.includes('\0') || relative.includes('\\') || relative.split('/').includes('..')) return json(res, 403, { error: 'Estetty polku.' });
  if (relative === '/') relative = '/index.html';
  const target = normalize(join(PUBLIC, relative.replace(/^\/+/, '')));
  if (!target.startsWith(PUBLIC + sep)) return json(res, 403, { error: 'Estetty polku.' });
  try {
    const file = await stat(target);
    if (!file.isFile()) return json(res, 404, { error: 'Tiedostoa ei löydy.' });
    const body = await readFile(target);
    res.writeHead(200, {
      'content-type': contentTypes[extname(target)] || 'application/octet-stream',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.open-meteo.com; img-src 'self' data:; object-src 'none'; base-uri 'none'",
    });
    res.end(body);
  } catch { json(res, 404, { error: 'Tiedostoa ei löydy.' }); }
}

export function createApp() {
  return http.createServer(async (req, res) => {
    let url;
    try { url = new URL(req.url, 'http://localhost'); } catch { return json(res, 400, { error: 'Virheellinen osoite.' }); }
    if (req.method !== 'GET') return json(res, 405, { error: 'Vain GET-pyynnöt ovat sallittuja.' });
    try {
      if (url.pathname === '/api/status') {
        return json(res, 200, { configured: Boolean(process.env.DIGITRANSIT_API_KEY && process.env.DIGITRANSIT_API_KEY !== 'liitä_oma_avain_tähän'), demo: isDemoMode(), serverTime: new Date().toISOString() });
      }
      if (url.pathname === '/api/favorites') {
        if (isDemoMode()) return json(res, 200, { demo: true, updatedAt: new Date().toISOString(), boards: demoFavorites() });
        const boards = await Promise.all(FAVORITES.map(async board => {
          try {
            const results = await cached('favorites:search:' + board.id, 60000, async () => {
              const response = await apiRequest(queryStops, { name: board.stopQuery });
              return response?.stops ?? [];
            });
            const matches = chooseCandidateStops(board, results);
            if (!matches.length) return { ...board, departures: [], warning: 'Pysäkkiä ei löytynyt Digitransitista. Tarkista pysäkki HSL:n reittioppaasta.' };
            const ids = matches.map(stop => stop.gtfsId);
            const stops = await cached('favorites:departures:' + ids.join(','), 15000, async () => {
              const response = await apiRequest(queryDepartures, { ids });
              return response?.stops ?? [];
            });
            return { id: board.id, label: board.label, place: board.place, direction: board.direction, note: board.note,
              departures: selectBoardDepartures(board, normalizeStops(stops)) };
          } catch(error) {
            return { id: board.id, label: board.label, place: board.place, direction: board.direction, note: board.note, departures: [], warning: error.message };
          }
        }));
        return json(res, 200, { demo: false, updatedAt: new Date().toISOString(), boards });
      }
      if (url.pathname === '/api/departures') {
        const ids = validateStopIds(url.searchParams.get('ids'));
        if (isDemoMode()) return json(res, 200, { demo: true, updatedAt: new Date().toISOString(), stops: demoDepartures(ids) });
        const key = 'departures:' + ids.join(',');
        const stops = await cached(key, 15000, async () => {
          const response = await apiRequest(queryDepartures, { ids });
          return response?.stops ?? [];
        });
        return json(res, 200, { updatedAt: new Date().toISOString(), stops: normalizeStops(stops) });
      }
      if (url.pathname === '/api/search') {
        const name = (url.searchParams.get('q') || '').trim();
        if (name.length < 2 || name.length > 80) return json(res, 400, { error: 'Kirjoita vähintään kaksi merkkiä.' });
        if (isDemoMode()) return json(res, 200, { demo: true, stops: demoStopSearch(name) });
        const stops = await cached('search:' + name.toLocaleLowerCase('fi'), 60000, async () => {
          const response = await apiRequest(queryStops, { name });
          return response?.stops ?? [];
        });
        const unique = [...new Map(stops.filter(s => s?.gtfsId).map(s => [s.gtfsId, s])).values()];
        return json(res, 200, { stops: unique.slice(0, 30).map(s => ({ id: s.gtfsId, name: s.name, code: s.code || '' })) });
      }
      if (url.pathname.startsWith('/api/')) return json(res, 404, { error: 'Rajapintaa ei löydy.' });
      return await serveStatic(req, res, url.pathname);
    } catch (error) {
      console.error('HSL-taulun pyyntö epäonnistui:', error.message);
      return json(res, error.status || (error.message?.includes('pysäkkilista') || error.message?.includes('pysäkkitunnusta') ? 400 : 502), { error: error.message || 'Tuntematon virhe.' });
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '127.0.0.1';
  createApp().listen(port, host, () => console.log(`HSL-taulu: http://${host}:${port}`));
}
