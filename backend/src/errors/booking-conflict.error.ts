import { AppError } from './app-error.js';

export class BookingConflictError extends AppError {
	constructor() {
		super(
			409,
			'BOOKING_CONFLICT',
			'Booking could not be completed due to concurrent requests. Please try again.',
		);
	}
}
