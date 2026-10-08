import type { PrismaClient } from '../generated/prisma/client.js';

export class LoungeRepository {
	constructor(private readonly prisma: PrismaClient) {}

	findMany(airportCode?: string) {
		return this.prisma.lounge.findMany({
			where: airportCode ? { airportCode } : undefined,

			orderBy: {
				name: 'asc',
			},
		});
	}
}
