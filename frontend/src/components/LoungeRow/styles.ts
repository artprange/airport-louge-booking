import { primaryButton } from '../../styles/controls';

const loungeRowStyles = {
  row: 'grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-5 px-5 py-6 transition-colors hover:bg-canvas/70 sm:px-7 lg:grid-cols-[auto_minmax(0,1fr)_150px_120px_140px] lg:gap-6',
  badge: 'flex size-14 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-brand-soft text-sm font-bold tracking-wider text-brand',
  name: 'text-base font-semibold tracking-tight sm:text-lg',
  detail: 'mt-1 text-sm text-muted',
  capacity: 'col-start-2 text-sm text-muted lg:col-start-auto',
  capacityLabel: 'mr-1 lg:hidden',
  price: 'col-start-2 font-semibold tabular-nums lg:col-start-auto',
  bookButton: `${primaryButton} col-start-2 w-full sm:w-fit lg:col-start-auto lg:w-full`,
};

export { loungeRowStyles };
