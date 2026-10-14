import { InvalidBookingDateError } from '../errors/invalid-booking-date.error.js';
import { LoungeNotFoundError } from '../errors/lounge-not-found.error.js';
import { BookingRepository } from '../repositories/booking.repository.js';
import { LoungeRepository } from '../repositories/lounge.repository.js';
import type { CreateBookingInput } from '../validators/create-booking.schema.js';

export class BookingService {
	constructor(
		private readonly bookings: BookingRepository,
		private readonly lounges: LoungeRepository,
	) {}

	async create(input: CreateBookingInput) {
		const now = new Date();

		const today = new Date(
			Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
		);

		if (input.bookingDate.getTime() < today.getTime()) {
			throw new InvalidBookingDateError();
		}

		const lounge = await this.lounges.findById(input.loungeId);

		if (!lounge) {
			throw new LoungeNotFoundError();
		}

		return this.bookings.create(input);
	}
}
