import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeStops, validateStopIds } from '../logic.mjs';

test('validates unique HSL stop identifiers', () => {
  assert.deepEqual(validateStopIds(' HSL:1040129,HSL:1040129,hsl:1173434 '), ['HSL:1040129', 'HSL:1173434']);
  assert.throws(() => validateStopIds('HSL:bad'), /pysäkkitunnusta/);
  assert.throws(() => validateStopIds('HSL:1040129,ABC:12345'), /pysäkkitunnusta/);
  assert.throws(() => validateStopIds(''), /pysäkkitunnusta/);
  assert.throws(() => validateStopIds(Array.from({length: 9}, (_, i) => `HSL:${10000+i}`).join(',')), /pysäkkitunnusta/);
});

test('normalizes realtime and scheduled departures and sorts them', () => {
  const serviceDay = 1700000000;
  const now = (serviceDay + 200) * 1000;
  const stops = [{ gtfsId: 'HSL:1234567', name: 'Testipysäkki', code: '1234', stoptimesWithoutPatterns: [
    { serviceDay, scheduledDeparture: 600, realtimeDeparture: 660, realtime: true, realtimeState: 'UPDATED', headsign: 'Keskusta', trip: { routeShortName: '6' } },
    { serviceDay, scheduledDeparture: 400, realtimeDeparture: 0, realtime: false, realtimeState: 'SCHEDULED', headsign: 'Toinen', trip: { routeShortName: '9' } },
    { serviceDay, scheduledDeparture: 300, realtimeDeparture: 300, realtime: true, realtimeState: 'CANCELED', trip: { routeShortName: '2' } },
    { serviceDay, scheduledDeparture: 100, realtimeDeparture: 100, realtime: true, realtimeState: 'SCHEDULED', trip: { routeShortName: '7' } },
  ] }];
  const normalized = normalizeStops(stops, now);
  assert.equal(normalized[0].name, 'Testipysäkki');
  assert.deepEqual(normalized[0].departures.map(d => d.line), ['9', '6']);
  assert.equal(normalized[0].departures[0].realtime, false);
  assert.equal(normalized[0].departures[1].delayMinutes, 1);
  assert.equal(normalized[0].departures[1].destination, 'Keskusta');
});

test('handles missing stops without crashing', () => {
  assert.deepEqual(normalizeStops(null), []);
  assert.deepEqual(normalizeStops([null]), []);
});
