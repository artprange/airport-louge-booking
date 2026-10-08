import { Router } from 'express';

import { listLounges } from '../controllers/lounge.controller.js';

export const loungeRoutes = Router();

loungeRoutes.get('/', listLounges);
