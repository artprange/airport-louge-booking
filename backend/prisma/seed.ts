import { prisma } from '../src/lib/prisma.js';
import { demoLounges } from './lounge-seed-data.js';

async function main(): Promise<void> {
	await prisma.$transaction(
		demoLounges.map((lounge) =>
			prisma.lounge.upsert({
				where: {
					id: lounge.id,
				},
				update: {
					name: lounge.name,
					airportCode: lounge.airportCode,
					capacity: lounge.capacity,
					price: lounge.price,
				},
				create: lounge,
			}),
		),
	);

	const savedLounges = await prisma.lounge.findMany({
		orderBy: {
			airportCode: 'asc',
		},
	});

	console.table(
		savedLounges.map((lounge) => ({
			id: lounge.id,
			name: lounge.name,
			airportCode: lounge.airportCode,
			capacity: lounge.capacity,
			price: lounge.price.toString(),
		})),
	);
}

main()
	.catch((error: unknown) => {
		console.error('Falha ao executar o seed:', error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
