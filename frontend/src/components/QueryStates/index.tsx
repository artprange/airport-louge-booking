import type { ErrorStateProps } from './types';
import { queryStatesStyles } from './styles';

function LoadingState() {
	return (
		<div className={queryStatesStyles.container}>
			<p
				className={queryStatesStyles.message}
				role="status"
			>
				Loading lounges...
			</p>
		</div>
	);
}

function EmptyState() {
	return (
		<div className={queryStatesStyles.container}>
			<p className={queryStatesStyles.message}>
				No lounges found for this airport.
			</p>
		</div>
	);
}

function ErrorState({ onRetry, isRetrying }: ErrorStateProps) {
	return (
		<div className={queryStatesStyles.container}>
			<p
				className={queryStatesStyles.errorMessage}
				role="alert"
			>
				Unable to load lounges. Please try again.
			</p>

			<button
				className={queryStatesStyles.retryButton}
				type="button"
				onClick={onRetry}
				disabled={isRetrying}
			>
				{isRetrying ? 'Trying...' : 'Try again'}
			</button>
		</div>
	);
}

export { LoadingState, EmptyState, ErrorState };
