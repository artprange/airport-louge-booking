import { Router } from 'express';

import { createBooking } from '../controllers/booking.controller.js';

export const bookingRoutes = Router();

bookingRoutes.post('/', createBooking);
