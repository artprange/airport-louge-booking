import express from 'express';

import { loungeRoutes } from './routes/lounge.routes.js';

export const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
	res.status(200).json({
		status: 'ok',
	});
});

app.use('/lounges', loungeRoutes);
