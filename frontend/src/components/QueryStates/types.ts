type ErrorStateProps = {
	onRetry: () => void;
	isRetrying: boolean;
};

type EmptyStateProps = {
  airportCode: string;
  onReset: () => void;
};

export type { ErrorStateProps, EmptyStateProps };
