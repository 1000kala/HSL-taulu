// Esimerkkitiedot: eivät koskaan vastaa oikeita HSL:n aikatauluja.
import { FAVORITES } from './favorites.mjs';

export const DEMO_STOPS = [
  { id: 'HSL:1040129', name: 'Arkadian puisto (demo)', code: 'ESIM1' },
  { id: 'HSL:9000001', name: 'Hakaniemi (demo)', code: 'ESIM2' },
  { id: 'HSL:9000002', name: 'Keskusta (demo)', code: 'ESIM3' },
];
const ROUTES = [
  { line: '6', destination: 'Arabia', offset: 4 },
  { line: '7', destination: 'Länsiterminaali', offset: 8 },
  { line: '9', destination: 'Pasila', offset: 12 },
  { line: '6', destination: 'Eiranranta', offset: 18 },
  { line: '7', destination: 'Meilahti', offset: 25 },
  { line: '9', destination: 'Jätkäsaari', offset: 33 },
];
const departure = (line, destination, offset, base) => ({
  line, destination,
  departure: new Date(base + offset * 60000).toISOString(),
  scheduled: new Date(base + offset * 60000).toISOString(),
  realtime: false,
  delayMinutes: 0,
});
export function demoFavorites(now = Date.now()) {
  const base = Math.ceil(now / 60000) * 60000;
  const samples = {
    bus59: [
      ['59', 'Malminkartano', 4], ['59', 'Sydänpuunpuisto', 16], ['59', 'Malminkartano', 29],
    ],
    metro: [
      ['M1', 'Kivenlahti', 2], ['M2', 'Tapiola', 6], ['M1', 'Kivenlahti', 10],
      ['M2', 'Tapiola', 14], ['M1', 'Kivenlahti', 18],
    ],
    tram6: [
      ['6', 'Eiranranta', 5], ['6', 'Arabia', 9], ['6', 'Eiranranta', 16],
      ['6', 'Arabia', 21],
    ],
  };
  return FAVORITES.map(board => ({
    id: board.id, label: board.label, place: board.place,
    direction: board.direction, note: board.note,
    departures: samples[board.id].map(([line,destination,offset]) => departure(line,destination,offset,base)),
  }));
}
export function demoStopSearch(query) {
  const needle = query.toLocaleLowerCase('fi');
  return DEMO_STOPS.filter(stop => stop.name.toLocaleLowerCase('fi').includes(needle));
}
export function demoDepartures(ids, now = Date.now()) {
  const base = Math.ceil(now / 60000) * 60000;
  return ids.map((id, index) => {
    const stop = DEMO_STOPS.find(item => item.id === id) || { id, name: 'Valittu pysäkki (demo)', code: '' };
    const departures = ROUTES.map(route => departure(route.line, route.destination, route.offset + index * 2, base));
    return { ...stop, departures };
  });
}
