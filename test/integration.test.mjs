import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server.mjs';

const originalFetch = globalThis.fetch;
const originalKey = process.env.DIGITRANSIT_API_KEY;
const calls = [];
process.env.DIGITRANSIT_API_KEY = 'fake-test-secret-do-not-publish';
globalThis.fetch = async (url, options) => {
  if (!String(url).startsWith('https://api.digitransit.fi/')) return originalFetch(url, options);
  calls.push({ url, options });
  const body = JSON.parse(options.body);
  if (body.query.includes('SearchStops')) {
    const sample = {
      'Junatie': [{ gtfsId:'HSL:1111111', name:'Junatie', code:'H2180' }],
      'Sörnäinen': [
        { gtfsId:'HSL:2222222', name:'Sörnäinen', code:'M2' },
        { gtfsId:'HSL:3333333', name:'Sörnäinen (M)', code:'H0312' },
      ],
      'Sörnäinen (M)': [{ gtfsId:'HSL:3333333', name:'Sörnäinen (M)', code:'H0312' }]
    };
    const found = sample[body.variables.name] || [{ gtfsId: 'HSL:1040129', name: 'Arkadian puisto', code: '1234' }];
    return new Response(JSON.stringify({ data: { stops: found } }), { status: 200 });
  }
  if (body.variables.ids?.some(id => id !== 'HSL:1040129')) {
    const base = Math.floor(Date.now()/1000) + 400;
    const upcoming = (line, headsign, minutes) => ({
      serviceDay: base - 500,
      scheduledDeparture: 500 + minutes * 60,
      realtimeDeparture: 500 + minutes * 60,
      realtime: true, realtimeState:'UPDATED', headsign,
      trip:{routeShortName:line}
    });
    const sample = {
      'HSL:1111111': { gtfsId:'HSL:1111111',name:'Junatie', code:'H2180',stoptimesWithoutPatterns:[upcoming('59','Malminkartano',4),upcoming('59','Herttoniemi',5)] },
      'HSL:2222222': { gtfsId:'HSL:2222222',name:'Sörnäinen', code:'M2',stoptimesWithoutPatterns:[upcoming('M1','Kivenlahti',2),upcoming('M2','Tapiola',4),upcoming('M1','Vuosaari',3)] },
      'HSL:3333333': { gtfsId:'HSL:3333333',name:'Sörnäinen (M)', code:'H0312',stoptimesWithoutPatterns:[upcoming('6','Eiranranta',3),upcoming('6','Arabia',8)] },
    };
    return new Response(JSON.stringify({ data: { stops: body.variables.ids.map(id=>sample[id]).filter(Boolean) } }),{status:200});
  }
  const nextDeparture = Math.floor(Date.now() / 1000) + 300;
  return new Response(JSON.stringify({ data: { stops: [{ gtfsId: 'HSL:1040129', name: 'Arkadian puisto', code: '1234', stoptimesWithoutPatterns: [{
    serviceDay: nextDeparture - 500, scheduledDeparture: 480, realtimeDeparture: 500, realtime: true, realtimeState: 'UPDATED', headsign: 'Arabia', trip: { routeShortName: '6' }
  }] }] } }), { status: 200 });
};
const server = createApp();
let url;
test.before(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => {
  await new Promise(resolve => server.close(resolve));
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.DIGITRANSIT_API_KEY;
  else process.env.DIGITRANSIT_API_KEY = originalKey;
});

test('searches for stops with a protected server-side subscription key', async () => {
  const response = await originalFetch(url + '/api/search?q=Arkadia');
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.stops[0].name, 'Arkadian puisto');
  assert.equal(calls[0].options.headers['digitransit-subscription-key'], 'fake-test-secret-do-not-publish');
  assert.ok(!JSON.stringify(data).includes('fake-test-secret'));
});

test('fetches and converts a mocked realtime departure', async () => {
  const response = await originalFetch(url + '/api/departures?ids=HSL%3A1040129');
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.stops[0].departures[0].line, '6');
  assert.equal(data.stops[0].departures[0].destination, 'Arabia');
  assert.equal(data.stops[0].departures[0].realtime, true);
  assert.equal(data.stops[0].departures[0].delayMinutes, 0); // 20 seconds rounds to zero
  assert.ok(!JSON.stringify(data).includes('fake-test-secret'));
});


test('live favorites resolve stop IDs and filter correct lines and directions', async () => {
  const response = await originalFetch(url + '/api/favorites');
  assert.equal(response.status,200);
  const data = await response.json();
  assert.equal(data.demo,false);
  assert.deepEqual(data.boards.map(x=>x.id),['bus59','metro','tram6']);
  assert.deepEqual(data.boards[0].departures.map(x=>x.destination),['Malminkartano']);
  assert.deepEqual(data.boards[1].departures.map(x=>x.line),['M1','M2']);
  assert.deepEqual(data.boards[2].departures.map(x=>x.destination),['Eiranranta','Arabia']);
  assert.ok(!JSON.stringify(data).includes('fake-test-secret'));
});
