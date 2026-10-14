import { setTimeout as delay } from 'node:timers/promises';

import { Prisma, type PrismaClient } from '../generated/prisma/client.js';

import { BookingConflictError } from '../errors/booking-conflict.error.js';
import { CapacityExceededError } from '../errors/capacity-exceeded.error.js';
import { InvalidBookingDateError } from '../errors/invalid-booking-date.error.js';
import { LoungeNotFoundError } from '../errors/lounge-not-found.error.js';

import { BookingRepository } from '../repositories/booking.repository.js';
import { LoungeRepository } from '../repositories/lounge.repository.js';

import type { CreateBookingInput } from '../validators/create-booking.schema.js';

const MAX_ATTEMPTS = 3;

function isRetryableTransactionConflict(error: unknown): boolean {
	if (
		error instanceof Prisma.PrismaClientKnownRequestError &&
		error.code === 'P2034'
	) {
		return true;
	}

	// O adapter pg pode expor o conflito diretamente no commit,
	// sem convertê-lo para PrismaClientKnownRequestError.
	if (
		!(error instanceof Error) ||
		error.name !== 'DriverAdapterError' ||
		!('cause' in error)
	) {
		return false;
	}

	const cause = error.cause;

	return (
		typeof cause === 'object' &&
		cause !== null &&
		'kind' in cause &&
		cause.kind === 'TransactionWriteConflict' &&
		'originalCode' in cause &&
		(cause.originalCode === '40001' || cause.originalCode === '40P01')
	);
}

export class BookingService {
	constructor(
		private readonly bookings: BookingRepository,
		private readonly lounges: LoungeRepository,
		private readonly prisma: PrismaClient,
	) {}

	async create(input: CreateBookingInput) {
		const now = new Date();

		const today = new Date(
			Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
		);

		if (input.bookingDate.getTime() < today.getTime()) {
			throw new InvalidBookingDateError();
		}

		for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
			try {
				return await this.prisma.$transaction(
					async (tx) => {
						const lounge = await this.lounges.findById(input.loungeId, tx);

						if (!lounge) {
							throw new LoungeNotFoundError();
						}

						const occupied = await this.bookings.occupiedCapacity(
							tx,
							input.loungeId,
							input.bookingDate,
						);

						if (occupied + input.guests > lounge.capacity) {
							throw new CapacityExceededError();
						}

						return this.bookings.create(tx, input);
					},
					{
						isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
					},
				);
			} catch (error: unknown) {
				const isRetryableConflict = isRetryableTransactionConflict(error);

				if (!isRetryableConflict) {
					throw error;
				}

				if (attempt === MAX_ATTEMPTS) {
					throw new BookingConflictError();
				}

				await delay(50 * attempt + Math.floor(Math.random() * 50));
			}
		}

		throw new BookingConflictError();
	}
}
