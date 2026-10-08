import { LoungeRepository } from '../repositories/lounge.repository.js';

export class LoungeService {
	constructor(private readonly lounges: LoungeRepository) {}

	list(airportCode?: string) {
		const normalizedAirportCode = airportCode?.trim().toUpperCase();

		return this.lounges.findMany(normalizedAirportCode || undefined);
	}
}
