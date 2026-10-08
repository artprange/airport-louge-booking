import { prisma } from './lib/prisma.js';
import { LoungeRepository } from './repositories/lounge.repository.js';
import { LoungeService } from './services/lounge.service.js';

const loungeRepository = new LoungeRepository(prisma);

export const loungeService = new LoungeService(loungeRepository);
