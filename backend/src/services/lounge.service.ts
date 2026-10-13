import { LoungeNotFoundError } from '../errors/lounge-not-found.error.js';
import { LoungeRepository } from '../repositories/lounge.repository.js';

export class LoungeService {
	constructor(private readonly lounges: LoungeRepository) {}

	list(airportCode?: string) {
		const normalizedAirportCode = airportCode?.trim().toUpperCase();

		return this.lounges.findMany(normalizedAirportCode || undefined);
	}

	async getById(id: string) {
		const lounge = await this.lounges.findById(id);

		if (!lounge) {
			throw new LoungeNotFoundError();
		}

		return lounge;
	}
}
