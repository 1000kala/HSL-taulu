'use strict';
const $ = (selector) => document.querySelector(selector);
const DEFAULT_STOPS = [{ id: 'HSL:1040129', name: 'Arkadian puisto', code: '' }];
const REFRESH_MS = 30000;
const HELSINKI_ZONE = 'Europe/Helsinki';
const timeFormatter = new Intl.DateTimeFormat('fi-FI', { hour: '2-digit', minute: '2-digit', timeZone: HELSINKI_ZONE });
const dateFormatter = new Intl.DateTimeFormat('fi-FI', { weekday: 'long', day: 'numeric', month: 'long', timeZone: HELSINKI_ZONE });
let saved;
try { saved = JSON.parse(localStorage.getItem('hsl-taulu-settings')); } catch { saved = null; }
const state = {
  stops: Array.isArray(saved?.stops) ? saved.stops.filter(s => /^HSL:\d{5,10}$/.test(s?.id)).slice(0, 8) : DEFAULT_STOPS,
  lines: typeof saved?.lines === 'string' ? saved.lines.slice(0, 100) : '',
  lastSuccess: null,
  requestNumber: 0,
  loading: false,
};

function persist() {
  try { localStorage.setItem('hsl-taulu-settings', JSON.stringify({ stops: state.stops, lines: state.lines })); } catch { /* private browsing */ }
}
function setMessage(message, isError = false) {
  $('#message').textContent = message;
  $('#message').classList.toggle('error', isError);
}
function setStatus(text, type = '') {
  $('#api-status').textContent = text;
  $('#api-status').className = 'status-dot ' + type;
}
function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== '') node.textContent = text;
  return node;
}
function nowClock() {
  const now = new Date();
  $('#clock').textContent = timeFormatter.format(now);
  $('#today').textContent = dateFormatter.format(now).replace(/^./, first => first.toUpperCase());
}
function renderSelectedStops() {
  const target = $('#selected-stops');
  target.replaceChildren();
  if (!state.stops.length) target.append(el('span', 'field-help', 'Ei valittuja pysäkkejä. Hae ja lisää pysäkki.'));
  state.stops.forEach(stop => {
    const chip = el('div', 'stop-chip');
    chip.append(el('span', '', `${stop.name}${stop.code ? ` (${stop.code})` : ''}`));
    const button = el('button', '', '×');
    button.type = 'button';
    button.setAttribute('aria-label', `Poista ${stop.name}`);
    button.addEventListener('click', () => {
      state.stops = state.stops.filter(s => s.id !== stop.id);
      persist();
      renderSelectedStops();
      loadDepartures();
    });
    chip.append(button);
    target.append(chip);
  });
}
function renderDepartures(stops) {
  const target = $('#departures');
  target.replaceChildren();
  const lines = state.lines.split(',').map(s => s.trim().toLocaleLowerCase('fi')).filter(Boolean);
  const all = stops.flatMap(stop => stop.departures.map(dep => ({ ...dep, stop: stop.name, code: stop.code })))
    .filter(dep => lines.length === 0 || lines.includes(dep.line.toLocaleLowerCase('fi')))
    .sort((a, b) => a.departure.localeCompare(b.departure))
    .slice(0, 15);
  if (!all.length) {
    target.append(el('div', 'empty', 'Näillä pysäkeillä ja linjavalinnoilla ei ole tulevia lähtöjä. Kokeile muuta pysäkkiä tai poista linjarajaus.'));
    return;
  }
  const now = Date.now();
  all.forEach(dep => {
    const row = el('div', 'departure');
    const left = el('div', 'dep-left');
    left.append(el('span', 'line-badge', dep.line));
    const details = el('div', 'dep-details');
    details.append(el('div', 'dep-destination', dep.destination));
    details.append(el('div', 'dep-stop', `${dep.stop}${dep.code ? ` · ${dep.code}` : ''} · ${dep.realtime ? 'Reaaliaikaennuste' : 'Aikataulu'}`));
    left.append(details);
    const time = el('div', 'dep-time', timeFormatter.format(new Date(dep.departure)));
    time.title = dep.delayMinutes > 0 ? `${dep.delayMinutes} min myöhässä` : dep.delayMinutes < 0 ? `${Math.abs(dep.delayMinutes)} min etuajassa` : '';
    const mins = Math.max(0, Math.ceil((new Date(dep.departure).getTime() - now) / 60000));
    const remaining = el('div', 'dep-minutes', mins === 0 ? 'Nyt' : String(mins));
    if (mins > 0) remaining.append(el('small', '', 'min'));
    row.append(left, time, remaining);
    target.append(row);
  });
}
async function loadDepartures() {
  const requestNumber = ++state.requestNumber;
  if (!state.stops.length) {
    $('#departures').replaceChildren(el('div', 'empty', 'Lisää ensin pysäkki alla olevalla haulla.'));
    setMessage('Valitse pysäkki, jotta näet lähtöajat.');
    setStatus('Ei pysäkkejä');
    return;
  }
  state.loading = true;
  $('#refresh').disabled = true;
  setMessage('Päivitetään lähtöaikoja…');
  try {
    const ids = state.stops.map(stop => stop.id).join(',');
    const response = await fetch('/api/departures?ids=' + encodeURIComponent(ids), { cache: 'no-store' });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Lähtöaikoja ei saatu.');
    if (requestNumber !== state.requestNumber) return;
    const realStops = body.stops || [];
    for (const stop of realStops) {
      const configured = state.stops.find(s => s.id === stop.id);
      if (configured) { configured.name = stop.name; configured.code = stop.code; }
    }
    persist();
    renderSelectedStops();
    renderDepartures(realStops);
    state.lastSuccess = new Date();
    $('#last-updated').textContent = 'Viimeisin onnistunut päivitys: ' + timeFormatter.format(state.lastSuccess);
    setMessage('Lähdöt haettu Digitransitista. Reaaliaikaisuus riippuu saatavilla olevasta tiedosta.');
    setStatus('Tiedot päivitetty', 'ok');
  } catch (error) {
    if (requestNumber === state.requestNumber) {
      $('#departures').replaceChildren(el('div', 'empty', 'Lähtöaikoja ei voida näyttää juuri nyt.'));
      setMessage('Tietojen ajantasaisuutta ei voida varmistaa. ' + error.message, true);
      setStatus('Yhteysvirhe', 'error');
    }
  } finally {
    if (requestNumber === state.requestNumber) {
      state.loading = false;
      $('#refresh').disabled = false;
    }
  }
}
function renderSearchResults(stops) {
  const target = $('#search-results');
  target.replaceChildren();
  if (!stops.length) { target.append(el('div', 'field-help', 'Pysäkkejä ei löytynyt. Kokeile toista hakua.')); return; }
  stops.forEach(stop => {
    const button = el('button', 'search-result');
    button.type = 'button';
    button.append(el('span', '', stop.name));
    button.append(el('span', 'result-meta', `${stop.code ? stop.code + ' · ' : ''}${stop.id}`));
    button.addEventListener('click', () => {
      if (state.stops.some(s => s.id === stop.id)) { setMessage('Pysäkki on jo valittu.'); return; }
      if (state.stops.length >= 8) { setMessage('Voit valita enintään kahdeksan pysäkkiä.', true); return; }
      state.stops.push(stop);
      persist();
      renderSelectedStops();
      target.replaceChildren();
      $('#stop-search').value = '';
      loadDepartures();
    });
    target.append(button);
  });
}
$('#search-form').addEventListener('submit', async event => {
  event.preventDefault();
  const q = $('#stop-search').value.trim();
  if (q.length < 2) return;
  $('#search-results').replaceChildren(el('div', 'field-help', 'Haetaan pysäkkejä…'));
  try {
    const response = await fetch('/api/search?q=' + encodeURIComponent(q));
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Haku epäonnistui.');
    renderSearchResults(data.stops || []);
  } catch (error) { $('#search-results').replaceChildren(el('div', 'field-help', 'Haku epäonnistui: ' + error.message)); }
});
$('#line-filter').value = state.lines;
$('#line-filter').addEventListener('change', () => {
  state.lines = $('#line-filter').value;
  persist();
  loadDepartures();
});
$('#refresh').addEventListener('click', loadDepartures);

const WEATHER_CODES = new Map([[0,'Selkeää'],[1,'Enimmäkseen selkeää'],[2,'Puolipilvistä'],[3,'Pilvistä'],[45,'Sumua'],[48,'Sumua'],[51,'Tihkusadetta'],[53,'Tihkusadetta'],[55,'Tihkusadetta'],[61,'Vesisadetta'],[63,'Vesisadetta'],[65,'Runsasta sadetta'],[71,'Lumisadetta'],[73,'Lumisadetta'],[75,'Runsasta lumisadetta'],[80,'Sadekuuroja'],[81,'Sadekuuroja'],[82,'Sadekuuroja'],[95,'Ukkosta']]);
async function loadWeather() {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=60.1699&longitude=24.9384&current=temperature_2m,weather_code&hourly=temperature_2m&timezone=Europe%2FHelsinki&forecast_days=2';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Säätieto ei ole saatavilla');
    const result = await response.json();
    const temperature = result.current?.temperature_2m;
    if (!Number.isFinite(temperature)) throw new Error('Lämpötila puuttuu');
    $('#temperature').replaceChildren(document.createTextNode(String(Math.round(temperature))), el('span', '', '°'));
    const code = result.current.weather_code;
    $('#weather-description').textContent = WEATHER_CODES.get(code) || 'Säätieto';
    $('#weather-symbol').textContent = [0,1].includes(code) ? '☀' : [2,3].includes(code) ? '☁' : [71,73,75].includes(code) ? '❄' : '☂';
    const currentHour = result.current.time?.slice(0, 13);
    const i = result.hourly?.time?.findIndex(value => value.slice(0, 13) === currentHour);
    const later = i >= 0 ? result.hourly.temperature_2m[i + 3] : null;
    const difference = Number.isFinite(later) ? later - temperature : null;
    $('#weather-trend').textContent = difference === null ? '—' : Math.abs(difference) < 0.5 ? '→ Vakaa' : difference > 0 ? '↗ Lämpenee' : '↘ Viilenee';
  } catch {
    $('#weather-description').textContent = 'Säätietoa ei saatavilla';
    $('#weather-trend').textContent = '—';
  }
}
renderSelectedStops();
nowClock();
loadDepartures();
loadWeather();
setInterval(nowClock, 1000);
setInterval(loadDepartures, REFRESH_MS);
setInterval(loadWeather, 15 * 60 * 1000);
