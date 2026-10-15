import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../errors/app-error.js';

function hasErrorType(error: unknown, type: string): boolean {
	return error instanceof Error && 'type' in error && error.type === type;
}

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

	let statusCode: number;
	let code: string;
	let message: string;

	if (error instanceof AppError) {
		statusCode = error.statusCode;
		code = error.code;
		message = error.message;
	} else if (error instanceof ZodError) {
		statusCode = 400;
		code = 'VALIDATION_ERROR';
		message = 'Invalid request data';
	} else if (hasErrorType(error, 'entity.parse.failed')) {
		statusCode = 400;
		code = 'INVALID_JSON';
		message = 'Request body must contain valid JSON';
	} else if (hasErrorType(error, 'entity.too.large')) {
		statusCode = 413;
		code = 'PAYLOAD_TOO_LARGE';
		message = 'Request body exceeds the allowed size';
	} else {
		console.error('Unhandled application error:', error);

		statusCode = 500;
		code = 'INTERNAL_SERVER_ERROR';
		message = 'An unexpected error occurred';
	}

	res.status(statusCode).json({
		error: {
			code,
			message,
		},
	});
};
