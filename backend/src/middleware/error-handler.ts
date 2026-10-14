import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../errors/app-error.js';

export const errorHandler: ErrorRequestHandler = (
	error: unknown,
	_req,
	res,
	next,
): void => {
	if (res.headersSent) {
		next(error);
		return;
	}

	if (error instanceof ZodError) {
		res.status(400).json({
			error: {
				code: 'VALIDATION_ERROR',
				message: 'Invalid request data',
			},
		});

		return;
	}

	if (error instanceof AppError) {
		res.status(error.statusCode).json({
			error: {
				code: error.code,
				message: error.message,
			},
		});

		return;
	}

	if (
		error instanceof SyntaxError &&
		'type' in error &&
		error.type === 'entity.parse.failed'
	) {
		res.status(400).json({
			error: {
				code: 'INVALID_JSON',
				message: 'Request body must contain valid JSON',
			},
		});

		return;
	}

	console.error(error);

	res.status(500).json({
		error: {
			code: 'INTERNAL_SERVER_ERROR',
			message: 'An unexpected error occurred',
		},
	});
};
