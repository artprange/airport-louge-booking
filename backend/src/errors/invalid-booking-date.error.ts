import { AppError } from './app-error.js';

export class InvalidBookingDateError extends AppError {
	constructor() {
		super(422, 'INVALID_BOOKING_DATE', 'Booking date cannot be in the past');
	}
}
