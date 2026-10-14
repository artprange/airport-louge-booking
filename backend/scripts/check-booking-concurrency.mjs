const bookingDate = '2099-12-26';
const loungeId = '33333333-3333-4333-8333-333333333333';

async function reserve(customerName) {
	const response = await fetch('http://localhost:3000/bookings', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			loungeId,
			customerName,
			guests: 10,
			bookingDate,
		}),
	});

	return {
		customerName,
		status: response.status,
		body: await response.json(),
	};
}

const results = await Promise.all([reserve('Arthur'), reserve('Maria')]);

console.dir(results, { depth: null });

const statuses = results.map((result) => result.status).sort();

const rejected = results.find((result) => result.status === 409);

if (
	statuses[0] !== 201 ||
	statuses[1] !== 409 ||
	rejected?.body.error?.code !== 'CAPACITY_EXCEEDED'
) {
	throw new Error('Unexpected result. Check the responses and database.');
}

console.log('OK: one reservation accepted and one rejected.');
