import { Router } from 'express';

import {
	listLounges,
	getLoungeById,
} from '../controllers/lounge.controller.js';

export const loungeRoutes = Router();

loungeRoutes.get('/', listLounges);
loungeRoutes.get('/:id', getLoungeById);
