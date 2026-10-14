import { z } from 'zod';

const bookingDateSchema = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
	.refine((value) => {
		const date = new Date(`${value}T00:00:00.000Z`);

		return (
			Number.isFinite(date.getTime()) &&
			date.toISOString().slice(0, 10) === value
		);
	}, 'Invalid calendar date')
	.transform((value) => new Date(`${value}T00:00:00.000Z`));

export const createBookingSchema = z.object({
	loungeId: z.string().uuid(),
	customerName: z.string().trim().min(2).max(120),
	guests: z.number().int().positive(),
	bookingDate: bookingDateSchema,
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
