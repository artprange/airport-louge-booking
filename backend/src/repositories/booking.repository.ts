import type { PrismaClient } from '../generated/prisma/client.js';
import type { CreateBookingInput } from '../validators/create-booking.schema.js';

export class BookingRepository {
	constructor(private readonly prisma: PrismaClient) {}

	create(input: CreateBookingInput) {
		return this.prisma.booking.create({
			data: input,
		});
	}
}
