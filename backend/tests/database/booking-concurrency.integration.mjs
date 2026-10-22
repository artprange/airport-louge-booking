import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

// Only fixtures created by this process are removed. Existing bookings are untouched.
process.env.NODE_ENV = 'test';
const { app } = await import('../../dist/app.js');
const { prisma } = await import('../../dist/lib/prisma.js');
const loungeId = randomUUID();
const bookingDate = '2099-12-30';
let server;
let created = false;
try {
  await prisma.lounge.create({ data: {
    id: loungeId, name: `Concurrency test ${loungeId}`, airportCode: 'TST',
    capacity: 15, price: '100.00',
  } });
  created = true;
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const port = server.address().port;
  async function reserve(customerName, guests = 10, date = bookingDate) {
    const response = await fetch(`http://127.0.0.1:${port}/bookings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loungeId, customerName, guests, bookingDate: date }),
    });
    return { status: response.status, body: await response.json() };
  }
  const responses = await Promise.all(Array.from({ length: 6 }, (_, i) => reserve(`Test guest ${i}`)));
  assert.equal(responses.filter(r => r.status === 201).length, 1, JSON.stringify(responses));
  assert.equal(responses.filter(r => r.status === 409 && r.body.error?.code === 'CAPACITY_EXCEEDED').length, 5, JSON.stringify(responses));
  const totals = await prisma.booking.aggregate({
    where: { loungeId, bookingDate: new Date(`${bookingDate}T00:00:00.000Z`) },
    _sum: { guests: true }, _count: { _all: true },
  });
  assert.equal(totals._sum.guests, 10);
  assert.equal(totals._count._all, 1);
  assert.equal((await reserve('Different day', 15, '2099-12-31')).status, 201);
  console.log('PASS: six concurrent HTTP requests, one accepted, five rejected, occupancy 10/15; another day can fill 15/15.');
} finally {
  try {
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    if (created) {
      await prisma.$transaction([
        prisma.booking.deleteMany({ where: { loungeId } }),
        prisma.lounge.delete({ where: { id: loungeId } }),
      ]);
    }
  } finally {
    await prisma.$disconnect();
  }
}
