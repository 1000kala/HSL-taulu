import test from 'node:test';
import assert from 'node:assert/strict';
import { demoStopSearch, demoDepartures } from '../demo.mjs';

test('demo stop search has clearly labeled results', () => {
  const found = demoStopSearch('hakaniemi');
  assert.equal(found.length, 1);
  assert.match(found[0].name, /demo/);
  assert.match(found[0].id, /^HSL:\d+$/);
});

test('demo departures are in the future and contain multiple lines', () => {
  const now = Date.UTC(2026, 10, 24, 11, 0, 0);
  const stops = demoDepartures(['HSL:1040129', 'HSL:9000001'], now);
  assert.equal(stops.length, 2);
  assert.ok(stops.every(stop => stop.departures.length >= 2));
  assert.ok(stops.every(stop => stop.departures.every(dep => Date.parse(dep.departure) > now)));
  assert.ok(new Set(stops[0].departures.map(dep => dep.line)).size > 1);
  assert.ok(stops[0].departures.every(dep => dep.realtime === false));
});
