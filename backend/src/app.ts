import express from 'express';

import { loungeRoutes } from './routes/lounge.routes.js';
import { bookingRoutes } from './routes/booking.routes.js';
import { airportRoutes } from './routes/airport.routes.js';
import { docsRoutes } from './routes/docs.routes.js';
import { requestContext } from './middleware/request-context.js';

import { notFoundHandler } from './middleware/not-found-handler.js';
import { errorHandler } from './middleware/error-handler.js';

export const app = express();

app.disable('x-powered-by');
app.use(requestContext);
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => {
	res.status(200).json({
		status: 'ok',
	});
});

app.use('/lounges', loungeRoutes);
app.use('/bookings', bookingRoutes);
app.use('/airports', airportRoutes);
app.use(docsRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
