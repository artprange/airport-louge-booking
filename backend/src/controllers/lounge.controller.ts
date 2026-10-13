import type { Request, Response, NextFunction } from 'express';
import { loungeService } from '../container.js';
import { loungeIdParamsSchema } from '../validators/lounge-id.schema.js';

export async function listLounges(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const airportCode =
			typeof req.query.airportCode === 'string'
				? req.query.airportCode
				: undefined;

		const lounges = await loungeService.list(airportCode);

		const response = lounges.map((lounge) => ({
			id: lounge.id,
			name: lounge.name,
			airportCode: lounge.airportCode,
			capacity: lounge.capacity,
			price: lounge.price.toFixed(2),
		}));
		res.status(200).json(response);
	} catch (error: unknown) {
		next(error);
	}
}

export async function getLoungeById(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const { id } = loungeIdParamsSchema.parse(req.params);

		const lounge = await loungeService.getById(id);

		res.status(200).json({
			id: lounge.id,
			name: lounge.name,
			airportCode: lounge.airportCode,
			capacity: lounge.capacity,
			price: lounge.price.toFixed(2),
		});
	} catch (error: unknown) {
		next(error);
	}
}
