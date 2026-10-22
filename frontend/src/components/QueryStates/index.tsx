import type { EmptyStateProps, ErrorStateProps } from './types';
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

function EmptyState({ airportCode, onReset }: EmptyStateProps) {
	return (
		<div className={queryStatesStyles.container} role="status">
			<h3 className={queryStatesStyles.title}>
				{airportCode ? 'No lounges available here yet.' : 'No lounges available yet.'}
			</h3>
			<p className={queryStatesStyles.message}>
				{airportCode
					? `We don't have any lounges registered at ${airportCode} on our platform. Airport search includes destinations worldwide, even where we don't offer lounges yet.`
					: 'No lounges have been registered yet. Please check back soon.'}
			</p>
			{airportCode && (
				<button type="button" className={queryStatesStyles.retryButton} onClick={onReset}>
					Show all lounges
				</button>
			)}
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
