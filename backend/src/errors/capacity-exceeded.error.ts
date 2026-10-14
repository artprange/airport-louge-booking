import { AppError } from './app-error.js';

export class CapacityExceededError extends AppError {
	constructor() {
		super(409, 'CAPACITY_EXCEEDED', 'Lounge capacity exceeded');
	}
}
