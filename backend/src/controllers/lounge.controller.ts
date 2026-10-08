import type { Request, Response, NextFunction } from 'express';
import { loungeService } from '../container.js';

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
