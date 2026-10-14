import type { PrismaClient } from '../generated/prisma/client.js';
import type { CreateBookingInput } from '../validators/create-booking.schema.js';

export class BookingRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async occupiedCapacity(loungeId: string, bookingDate: Date): Promise<number> {
		const result = await this.prisma.booking.aggregate({
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

	create(input: CreateBookingInput) {
		return this.prisma.booking.create({
			data: input,
		});
	}
}
