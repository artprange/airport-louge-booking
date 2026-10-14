import type { Prisma, PrismaClient } from '../generated/prisma/client.js';

type DbClient = PrismaClient | Prisma.TransactionClient;

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

	findById(id: string, db: DbClient = this.prisma) {
		return db.lounge.findUnique({
			where: {
				id,
			},
		});
	}
}
