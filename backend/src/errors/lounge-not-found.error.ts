import { AppError } from './app-error.js';

export class LoungeNotFoundError extends AppError {
	constructor() {
		super(404, 'LOUNGE_NOT_FOUND', 'Lounge not found');
	}
}
