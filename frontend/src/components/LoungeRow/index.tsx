import type { LoungeRowProps } from './types';
import { loungeRowStyles } from './styles';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'BRL',
});

function LoungeRow({ lounge, onBook }: LoungeRowProps) {
  return (
    <li className={loungeRowStyles.row}>
      <span className={loungeRowStyles.badge}>{lounge.airportCode}</span>
      <div>
        <h3 className={loungeRowStyles.name}>{lounge.name}</h3>
        <p className={loungeRowStyles.detail}>Airport lounge · {lounge.airportCode}</p>
      </div>
      <p className={loungeRowStyles.capacity}>
        <span className={loungeRowStyles.capacityLabel}>Daily capacity:</span>
        {lounge.capacity} guests
      </p>
      <p className={loungeRowStyles.price}>
        {currencyFormatter.format(Number(lounge.price))}
      </p>
      <button className={loungeRowStyles.bookButton} type="button"
        aria-label={`Book ${lounge.name}`} aria-haspopup="dialog"
        onClick={() => onBook(lounge)}>
        Book visit
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 12 12 4M4 4h8v8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </li>
  );
}

export { LoungeRow };
