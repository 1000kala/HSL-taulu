'use strict';
const $ = selector => document.querySelector(selector);
const REFRESH_MS = 30000;
const HELSINKI_ZONE = 'Europe/Helsinki';
const timeFormatter = new Intl.DateTimeFormat('fi-FI', { hour: '2-digit', minute: '2-digit', timeZone: HELSINKI_ZONE });
const dateFormatter = new Intl.DateTimeFormat('fi-FI', { weekday: 'long', day: 'numeric', month: 'long', timeZone: HELSINKI_ZONE });
let currentRequest = 0;
function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== '') node.textContent = text;
  return node;
}
function setStatus(text, type = '') {
  $('#api-status').textContent = text;
  $('#api-status').className = 'status-dot ' + type;
}
function tick() {
  const now = new Date();
  $('#clock').textContent = timeFormatter.format(now);
  $('#today').textContent = dateFormatter.format(now).replace(/^./, first => first.toUpperCase());
}

const QUICK_GROUPS = [
  { id: 'bus59', title: 'Bussi 59', from: 'Junatie', line: '59' },
  { id: 'metro', title: 'Metro M1 / M2', from: 'Sörnäinen', line: 'M1 / M2' },
  { id: 'tram6', title: 'Raitiovaunu 6', from: 'Sörnäinen (M)', line: '6' },
];
function renderNextDepartures(boards) {
  const container = $('#next-departures');
  container.replaceChildren();
  const now = Date.now();
  QUICK_GROUPS.forEach(group => {
    const board = boards.find(item => item.id === group.id);
    const next = (board?.departures || [])
      .filter(item => Number.isFinite(Date.parse(item.departure)) && Date.parse(item.departure) >= now)
      .sort((a, b) => Date.parse(a.departure) - Date.parse(b.departure))[0];
    const card = el('article', 'quick-card quick-' + group.id);
    card.setAttribute('role', 'listitem');
    const header = el('div','quick-card-head');
    header.append(el('span','quick-name',group.title),el('span','quick-line',next?.line || group.line));
    card.append(header, el('div','quick-stop',group.from));
    if (next) {
      const nextTime = Date.parse(next.departure);
      const minutes = Math.max(0, Math.ceil((nextTime - now) / 60000));
      const row = el('div','quick-main');
      const clock = el('time','quick-time',timeFormatter.format(new Date(nextTime)));
      clock.dateTime = next.departure;
      row.append(clock,el('strong','quick-minutes',minutes === 0 ? 'Nyt' : minutes + ' min'));
      card.append(row,el('p','quick-destination','→ ' + next.destination));
    } else {
      card.append(el('div','quick-no-time','—'),
        el('p','quick-destination',board?.warning ? 'Lähtötietoja ei saatu' : board ? 'Ei tulevia lähtöjä' : 'Tietoja odotetaan'));
    }
    container.append(card);
  });
}

function renderBoards(boards) {
  const container = $('#favorite-boards');
  container.replaceChildren();
  if (!boards.length) { container.append(el('div', 'empty', 'Seurattavia linjoja ei ole määritetty.')); return; }
  const now = Date.now();
  boards.forEach(board => {
    const panel = el('section', 'favorite-panel');
    panel.classList.add('mode-' + board.id);
    const header = el('div', 'favorite-heading');
    const titles = el('div', 'favorite-titles');
    titles.append(el('div','favorite-label',board.label),el('div','favorite-detail',`${board.place} · ${board.direction}`));
    header.append(titles,el('span','favorite-count',`${board.departures.length} lähtöä`));
    panel.append(header);
    if (board.warning) panel.append(el('p','favorite-warning',board.warning));
    if (!board.departures.length) {
      panel.append(el('div', 'favorite-empty', 'Ei lähiaikoina lähtöjä tällä linjalla ja tähän suuntaan.'));
    } else {
      board.departures.forEach(dep => {
        const row = el('div','favorite-departure');
        const badge = el('span','favorite-line',dep.line);
        const target = el('div','favorite-destination');
        target.append(el('span','favorite-destination-name',dep.destination),
          el('small','favorite-kind',dep.realtime ? 'Reaaliaikaennuste' : 'Aikataulu'));
        const depTime = el('time','favorite-time',timeFormatter.format(new Date(dep.departure)));
        depTime.dateTime = dep.departure;
        const minutes = Math.max(0,Math.ceil((Date.parse(dep.departure)-now)/60000));
        const inMinutes = el('span','favorite-minutes',minutes === 0 ? 'Nyt' : `${minutes} min`);
        row.append(badge,target,depTime,inMinutes);
        panel.append(row);
      });
    }
    panel.append(el('p','favorite-note',board.note || ''));
    container.append(panel);
  });
}
async function loadFavorites() {
  const request = ++currentRequest;
  $('#refresh').disabled = true;
  $('#message').textContent = 'Päivitetään lähtöaikoja…';
  $('#message').classList.remove('error');
  try {
    const response = await fetch('/api/favorites',{cache:'no-store'});
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Lähtöaikoja ei saatu.');
    if (request !== currentRequest) return;
    const isDemo = body.demo === true;
    $('#demo-banner').hidden = !isDemo;
    renderNextDepartures(body.boards || []);
    renderBoards(body.boards || []);
    const errorCount = (body.boards || []).filter(board => board.warning).length;
    $('#message').textContent = isDemo
      ? 'DEMOTILA: lähtöajat ovat keksittyä esimerkkidataa eivätkä oikeita HSL-lähtöjä.'
      : errorCount ? `${errorCount} linjan haku epäonnistui. Tarkista viestit taulusta.`
        : 'Näytetään Digitransitista saadut lähtöajat.';
    $('#message').classList.toggle('error',!isDemo && errorCount > 0);
    setStatus(isDemo ? 'DEMO · esimerkkidata' : errorCount ? 'Osittainen virhe' : 'Tiedot päivitetty',isDemo ? 'demo' : errorCount ? 'error' : 'ok');
    $('#last-updated').textContent = 'Viimeisin päivitys: ' + timeFormatter.format(new Date());
  } catch (error) {
    if (request !== currentRequest) return;
    renderNextDepartures([]);
    $('#favorite-boards').replaceChildren(el('div','empty','Lähtöaikoja ei voi näyttää.'));
    $('#message').textContent = 'Tietojen ajantasaisuutta ei voida varmistaa: ' + error.message;
    $('#message').classList.add('error');
    setStatus('Yhteysvirhe','error');
  } finally {
    if (request === currentRequest) $('#refresh').disabled = false;
  }
}
$('#refresh').addEventListener('click',loadFavorites);

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
  } catch { $('#weather-description').textContent = 'Säätietoa ei saatavilla'; $('#weather-trend').textContent = '—'; }
}
tick();
loadFavorites();
loadWeather();
setInterval(tick,1000);
setInterval(loadFavorites,REFRESH_MS);
setInterval(loadWeather,15*60*1000);
