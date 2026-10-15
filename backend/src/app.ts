import express from 'express';

import { loungeRoutes } from './routes/lounge.routes.js';
import { bookingRoutes } from './routes/booking.routes.js';

import { notFoundHandler } from './middleware/not-found-handler.js';
import { errorHandler } from './middleware/error-handler.js';

export const app = express();

app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => {
	res.status(200).json({
		status: 'ok',
	});
});

app.use('/lounges', loungeRoutes);
app.use('/bookings', bookingRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
