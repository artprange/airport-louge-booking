import { prisma } from './lib/prisma.js';

import { LoungeRepository } from './repositories/lounge.repository.js';
import { BookingRepository } from './repositories/booking.repository.js';

import { LoungeService } from './services/lounge.service.js';
import { BookingService } from './services/booking.service.js';
import { AirportRepository } from './repositories/airport.repository.js';
import { AirportService } from './services/airport.service.js';

export const airportService = new AirportService(new AirportRepository());

const loungeRepository = new LoungeRepository(prisma);

const bookingRepository = new BookingRepository();

export const loungeService = new LoungeService(loungeRepository);

export const bookingService = new BookingService(
	bookingRepository,
	loungeRepository,
	prisma,
);
