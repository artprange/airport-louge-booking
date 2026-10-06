import { prisma } from '../src/lib/prisma.js';

const lounges = [
	{
		id: '11111111-1111-4111-8111-111111111111',
		name: 'Guarulhos Lounge',
		airportCode: 'GRU',
		capacity: 30,

		price: '150.00',
	},
	{
		id: '22222222-2222-4222-8222-222222222222',
		name: 'Galeão Lounge',
		airportCode: 'GIG',
		capacity: 20,
		price: '120.00',
	},
	{
		id: '33333333-3333-4333-8333-333333333333',
		name: 'Brasília Lounge',
		airportCode: 'BSB',
		capacity: 15,
		price: '100.00',
	},
];

async function main(): Promise<void> {
	await prisma.$transaction(
		lounges.map((lounge) =>
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
