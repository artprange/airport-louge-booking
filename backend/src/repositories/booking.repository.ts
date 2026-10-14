import type { Prisma, PrismaClient } from '../generated/prisma/client.js';

import type { CreateBookingInput } from '../validators/create-booking.schema.js';

export class BookingRepository {
	async occupiedCapacity(
		db: Prisma.TransactionClient,
		loungeId: string,
		bookingDate: Date,
	): Promise<number> {
		const result = await db.booking.aggregate({
			where: {
				loungeId,
				bookingDate,
			},
			_sum: {
				guests: true,
			},
		});

		return result._sum.guests ?? 0;
	}

	create(db: Prisma.TransactionClient, input: CreateBookingInput) {
		return db.booking.create({
			data: input,
		});
	}
}
