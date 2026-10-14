import type { Request, Response, NextFunction } from 'express';

import { bookingService } from '../container.js';
import { createBookingSchema } from '../validators/create-booking.schema.js';

export async function createBooking(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const input = createBookingSchema.parse(req.body);

		const booking = await bookingService.create(input);

		res.status(201).json({
			id: booking.id,
			loungeId: booking.loungeId,
			customerName: booking.customerName,
			guests: booking.guests,
			bookingDate: booking.bookingDate.toISOString().slice(0, 10),
			createdAt: booking.createdAt.toISOString(),
		});
	} catch (error: unknown) {
		next(error);
	}
}
