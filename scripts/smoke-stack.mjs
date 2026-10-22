import assert from 'node:assert/strict';

const base = process.env.STACK_URL ?? 'http://127.0.0.1:8080';
async function get(path) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200, `${path}: ${response.status}`);
  return response;
}
const page = await get('/');
const html = await page.text();
assert.match(html, /id="root"/);
const script = html.match(/src="([^"]+\.js)"/);
const stylesheet = html.match(/href="([^"]+\.css)"/);
assert(script && stylesheet, 'Expected Vite build assets in HTML');
assert.match((await get(script[1])).headers.get('content-type'), /javascript/);
assert.match((await get(stylesheet[1])).headers.get('content-type'), /text\/css/);
const health = await get('/api/health');
assert.equal((await health.json()).status, 'ok');
assert(health.headers.get('x-request-id'));
const spec = await (await get('/api/openapi.json')).json();
assert.equal(spec.openapi, '3.0.3');
assert.equal(spec.servers[0].url, '/api');
assert.match(await (await get('/api/docs/')).text(), /swagger-ui/);
assert.match((await get('/api/docs/swagger-ui.css')).headers.get('content-type'), /text\/css/);
assert.match((await get('/api/docs/swagger-ui-bundle.js')).headers.get('content-type'), /javascript/);
for (const code of ['LAX', 'DXB', 'LHR']) {
  const lounges = await (await get(`/api/lounges?airportCode=${code}`)).json();
  assert.equal(lounges.length, 1);
  assert.equal(lounges[0].airportCode, code);
}
console.log('PASS: web app, API proxy, request IDs, Swagger assets/specification, and demo lounges. No bookings created.');
