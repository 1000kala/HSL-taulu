import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server.mjs';

const app = createApp();
let origin;
test.before(async () => {
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${app.address().port}`;
});
test.after(async () => { await new Promise(resolve => app.close(resolve)); });

test('serves the home page without dependencies', async () => {
  const response = await fetch(origin + '/');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /html/);
  assert.match(await response.text(), /HSL-taulu/);
});

test('rejects invalid stop ids and reports missing API key', async () => {
  const invalid = await fetch(origin + '/api/departures?ids=unsafe');
  assert.equal(invalid.status, 400);
  assert.match((await invalid.json()).error, /pysäkkitunnusta/);
  const missing = await fetch(origin + '/api/departures?ids=HSL%3A1040129');
  assert.equal(missing.status, 503);
  assert.match((await missing.json()).error, /API-avain/);
});

test('prevents traversal and does not expose the private key file', async () => {
  const response = await fetch(origin + '/.env');
  assert.equal(response.status, 404);
  assert.equal((await fetch(origin + '/api/unknown')).status, 404);
});
