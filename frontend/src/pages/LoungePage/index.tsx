import { useCallback, useState } from 'react';
import { AirportFilter } from '../../components/AirportFilter';
import { LoungeRow } from '../../components/LoungeRow';
import { BookingModal } from '../../components/BookingModal';
import { EmptyState, ErrorState, LoadingState } from '../../components/QueryStates';
import { useLounges } from '../../hooks/useLounges';
import type { Lounge } from '../../types/lounge';
import { loungesPageStyles } from './styles';

function LoungesPage() {
  const [airportCode, setAirportCode] = useState('');
  const [selectedLounge, setSelectedLounge] = useState<Lounge | null>(null);
  const query = useLounges(airportCode);
  const closeBooking = useCallback(() => setSelectedLounge(null), []);

  return (
    <main className={loungesPageStyles.container}>
      <div className={loungesPageStyles.nav}>
        <div className={loungesPageStyles.brand}>
          <span className={loungesPageStyles.brandMark} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 12 12 4M4 4h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Lounge Booking
        </div>
        <span className={loungesPageStyles.navNote}>A calmer way to travel</span>
      </div>
      <header className={loungesPageStyles.header}>
        <p className={loungesPageStyles.eyebrow}>Before the journey</p>
        <h1 className={loungesPageStyles.title}>A little calm.<br />Before takeoff.</h1>
        <p className={loungesPageStyles.description}>
          Find a quiet corner before takeoff. Explore airport lounges and book your next visit in a few simple steps.
        </p>
      </header>
      <AirportFilter onApply={setAirportCode} />
      <section aria-label="Search results" aria-busy={query.isFetching}>
        <div className={loungesPageStyles.resultsHeader}>
          <h2 className={loungesPageStyles.resultsTitle}>Explore lounges</h2>
          {query.isSuccess && <p className={loungesPageStyles.resultCount} role="status">
            {query.data.length} {query.data.length === 1 ? 'lounge' : 'lounges'}
            {airportCode ? ` at ${airportCode}` : ' across all airports'}
          </p>}
        </div>
        {query.isPending && <LoadingState />}
        {query.isError && <ErrorState isRetrying={query.isFetching} onRetry={() => { void query.refetch(); }} />}
        {query.isSuccess && (query.data.length === 0 ? <EmptyState /> : <>
          <div className={loungesPageStyles.tableHeader} aria-hidden="true">
            <span>Airport</span><span>Lounge</span><span>Daily capacity</span><span>Price · BRL</span><span />
          </div>
          <ul className={loungesPageStyles.list}>
            {query.data.map((lounge) => <LoungeRow key={lounge.id} lounge={lounge} onBook={setSelectedLounge} />)}
          </ul>
        </>)}
      </section>
      <p className={loungesPageStyles.footer}>
        Prices are in Brazilian reais. Daily capacity is the total guest limit; availability is confirmed when you book.
      </p>
      {selectedLounge && <BookingModal key={selectedLounge.id} lounge={selectedLounge} onClose={closeBooking} />}
    </main>
  );
}

export { LoungesPage };
