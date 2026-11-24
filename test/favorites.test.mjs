import test from 'node:test';
import assert from 'node:assert/strict';
import { FAVORITES, chooseCandidateStops, selectBoardDepartures } from '../favorites.mjs';
import { demoFavorites } from '../demo.mjs';

test('three requested groups are configured and named', () => {
  assert.deepEqual(FAVORITES.map(x => x.id),['bus59','metro','tram6']);
  assert.equal(FAVORITES[0].stopCode,'H2179');
});
test('Junatie prefers confirmed H2179 platform and never guesses an HSL ID', () => {
  const result = chooseCandidateStops(FAVORITES[0],[
    {gtfsId:'HSL:1234567',name:'Junatie',code:'H2180'},
    {gtfsId:'HSL:7654321',name:'Junatie',code:'H2179'},
    {gtfsId:'HSL:9000000',name:'Other',code:'H2179'}
  ]);
  assert.equal(result.length,1);
  assert.equal(result[0].gtfsId,'HSL:7654321');
});
test('selects only bus 59 heading towards Malminkartano', () => {
  const board = FAVORITES[0];
  const stops=[{name:'Junatie',code:'H2179',departures:[
    {line:'59',destination:'Herttoniemi',departure:'2026-11-24T15:05:00.000Z'},
    {line:'59',destination:'Malminkartano via Pasila',departure:'2026-11-24T15:02:00.000Z'},
    {line:'500',destination:'Munkkivuori',departure:'2026-11-24T15:06:00.000Z'},
  ]}];
  const out=selectBoardDepartures(board,stops);
  assert.deepEqual(out.map(d=>d.destination),['Malminkartano via Pasila']);
});
test('selects only westbound M1/M2 metro departures', () => {
  const stops=[{departures:[
    {line:'M1',destination:'Vuosaari',departure:'2026-11-24T15:01:00.000Z'},
    {line:'M1',destination:'Kivenlahti',departure:'2026-11-24T15:02:00.000Z'},
    {line:'M2',destination:'Tapiola',departure:'2026-11-24T15:03:00.000Z'},
    {line:'M2',destination:'Mellunmäki',departure:'2026-11-24T15:04:00.000Z'}]}];
  const out=selectBoardDepartures(FAVORITES[1],stops);
  assert.deepEqual(out.map(d=>d.destination),['Kivenlahti','Tapiola']);
});
test('tram 6 shows only Eiranranta-bound departures', () => {
  const stops=[{departures:[
    {line:'6',destination:'Eiranranta',departure:'2026-11-24T15:02:00.000Z'},
    {line:'6',destination:'Arabia',departure:'2026-11-24T15:03:00.000Z'},
    {line:'7',destination:'Länsisatama',departure:'2026-11-24T15:04:00.000Z'}]}];
  assert.deepEqual(selectBoardDepartures(FAVORITES[2],stops).map(dep=>dep.destination),['Eiranranta']);
});
test('demo outputs coherent groups and is future-dated and not realtime',()=>{
  const now=Date.UTC(2026,10,24,13,0,0);
  const demo=demoFavorites(now);
  assert.equal(demo.length,3);
  assert.deepEqual(demo[1].departures.map(x=>x.line).slice(0,2),['M1','M2']);
  assert.ok(demo.every(b=>b.departures.every(d=>Date.parse(d.departure)>now && d.realtime===false)));
});
