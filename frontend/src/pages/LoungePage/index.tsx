import { useState } from 'react';

import { AirportFilter } from '../../components/AirportFilter';
import { LoungeCard } from '../../components/LoungeCard';
import {
	EmptyState,
	ErrorState,
	LoadingState,
} from '../../components/QueryStates';

import { useLounges } from '../../hooks/useLounges';
import { loungesPageStyles } from './styles';

function LoungesPage() {
	const [airportCode, setAirportCode] = useState('');

	const query = useLounges(airportCode);

	return (
		<main className={loungesPageStyles.container}>
			<header>
				<h1 className={loungesPageStyles.title}>Find your lounge</h1>

				<p className={loungesPageStyles.description}>
					Check the available lounges and filter by airport.
				</p>
			</header>

			<AirportFilter onApply={setAirportCode} />

			<section
				aria-label="Search results"
				aria-busy={query.isFetching}
			>
				{query.isPending && <LoadingState />}

				{query.isError && (
					<ErrorState
						isRetrying={query.isFetching}
						onRetry={() => {
							void query.refetch();
						}}
					/>
				)}

				{query.isSuccess && (
					<>
						<p
							className={loungesPageStyles.resultCount}
							role="status"
						>
							{query.data.length} {query.data.length === 1 ? 'lounge' : 'lounges'} found
							{airportCode ? ` at ${airportCode}` : ''}.
						</p>

						{query.data.length === 0 ? (
							<EmptyState />
						) : (
							<div className={loungesPageStyles.grid}>
								{query.data.map((lounge) => (
									<LoungeCard
										key={lounge.id}
										lounge={lounge}
									/>
								))}
							</div>
						)}
					</>
				)}
			</section>
		</main>
	);
}

export { LoungesPage };
