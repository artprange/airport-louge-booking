import type { Booking, CreateBookingInput } from '../types/booking';
import { ApiError } from './apiError';

async function createBooking(input: CreateBookingInput): Promise<Booking> {
	const response = await fetch('/api/bookings', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(input),
	});

	if (!response.ok) {
		const body: unknown = await response.json().catch(() => null);

		let code = 'REQUEST_FAILED';

		if (
			typeof body === 'object' &&
			body !== null &&
			'error' in body &&
			typeof body.error === 'object' &&
			body.error !== null &&
			'code' in body.error &&
			typeof body.error.code === 'string'
		) {
			code = body.error.code;
		}

		throw new ApiError(
			response.status,
			code,
			'Unable to complete the booking.',
		);
	}

	return response.json();
}

export { createBooking };
