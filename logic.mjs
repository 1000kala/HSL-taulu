/** Helpers are kept free of network and UI dependencies so they are easy to test. */
export function validateStopIds(raw) {
  if (typeof raw !== 'string' || raw.length > 250) throw new Error('Virheellinen pysäkkilista.');
  const ids = [...new Set(raw.split(',').map(id => id.trim().toUpperCase()).filter(Boolean))];
  if (!ids.length || ids.length > 8 || ids.some(id => !/^HSL:[0-9]{5,10}$/.test(id))) {
    throw new Error('Anna 1–8 HSL-pysäkkitunnusta muodossa HSL:1234567.');
  }
  return ids;
}

export function normalizeStops(stops, now = Date.now()) {
  return (Array.isArray(stops) ? stops : []).filter(Boolean).map(stop => {
    const departures = (stop.stoptimesWithoutPatterns || []).flatMap(item => {
      const rawSeconds = item.realtime && Number.isFinite(item.realtimeDeparture)
        ? item.realtimeDeparture : item.scheduledDeparture;
      const timestamp = (Number(item.serviceDay) + Number(rawSeconds)) * 1000;
      const scheduled = (Number(item.serviceDay) + Number(item.scheduledDeparture)) * 1000;
      if (!Number.isFinite(timestamp) || !Number.isFinite(scheduled) || timestamp < now - 15000 || item.realtimeState === 'CANCELED') return [];
      const line = item.trip?.routeShortName || item.trip?.route?.shortName || '?';
      return [{
        line: String(line),
        destination: item.headsign || item.trip?.tripHeadsign || 'Määränpää ei tiedossa',
        departure: new Date(timestamp).toISOString(),
        scheduled: new Date(scheduled).toISOString(),
        realtime: Boolean(item.realtime),
        delayMinutes: Math.round((timestamp - scheduled) / 60000),
      }];
    }).sort((a, b) => a.departure.localeCompare(b.departure));
    return { id: stop.gtfsId, name: stop.name || 'Tuntematon pysäkki', code: stop.code || '', departures };
  });
}
