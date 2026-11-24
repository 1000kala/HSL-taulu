/** HSL-taulun kolme käyttäjän valitsemaa kohdetta. */
export const FAVORITES = [
  {
    id: 'bus59', label: 'Bussi 59', place: 'Junatie', direction: 'Malminkartanoon',
    stopQuery: 'Junatie', stopName: 'Junatie', stopCode: 'H2179',
    lines: ['59'], headsigns: ['malminkartano', 'sydänpuunpuisto'],
    note: 'Junatie H2179 · Malminkartanon suunta'
  },
  {
    id: 'metro', label: 'Metro M1 / M2', place: 'Sörnäinen', direction: 'Länteen',
    stopQuery: 'Sörnäinen', stopName: 'Sörnäinen',
    lines: ['M1', 'M2'], headsigns: ['kivenlahti', 'tapiola', 'matinkylä', 'ruoholahti'],
    note: 'Sörnäisten metroasema · kohti keskustaa ja Espoota'
  },
  {
    id: 'tram6', label: 'Raitiovaunu 6', place: 'Sörnäinen (M)', direction: 'Molemmat suunnat',
    stopQuery: 'Sörnäinen (M)', stopName: 'Sörnäinen (M)',
    lines: ['6'], headsigns: [],
    note: 'Laituri 12 tarkistamatta · näytetään linja 6 molempiin suuntiin'
  }
];

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const nameMatches = (name, desired) => {
  const value = normalize(name).replace(/\s+/g,' ');
  const target = normalize(desired).replace(/\s+/g,' ');
  return value === target || value === target.replace(' (m)', '') || value === target + ' (m)';
};

/** Choose the platform from stop search without fabricating unverified GTFS IDs.
 * We query departures from every plausible platform; filtering by line/headsign
 * selects the correct direction in the live response.
 */
export function chooseCandidateStops(board, found) {
  if (!Array.isArray(found)) return [];
  const scored = found.filter(stop => stop?.gtfsId && nameMatches(stop.name, board.stopName))
    .map(stop => ({ ...stop, _score: board.stopCode && normalize(stop.code) === normalize(board.stopCode) ? 0 : normalize(stop.name) === normalize(board.stopName) ? 1 : 2 }))
    .sort((a,b) => a._score - b._score);
  if (board.stopCode && scored.some(stop => stop._score === 0)) return scored.filter(stop => stop._score === 0).slice(0,8);
  return scored.slice(0,8);
}

export function selectBoardDepartures(board, stops) {
  const allowedLines = new Set(board.lines.map(line => normalize(line)));
  const allowedHeadsigns = board.headsigns.map(normalize);
  const all = (Array.isArray(stops) ? stops : []).flatMap(stop =>
    (stop.departures || []).map(dep => ({ ...dep, stopName: stop.name, stopCode: stop.code || '' })));
  return all.filter(dep => {
    if (!allowedLines.has(normalize(dep.line))) return false;
    // The API may include a "via" suffix or other service text in the headsign.
    return !allowedHeadsigns.length || allowedHeadsigns.some(headsign => normalize(dep.destination).includes(headsign));
  }).sort((a,b) => a.departure.localeCompare(b.departure)).slice(0,7);
}
