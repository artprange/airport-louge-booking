import { secondaryButton } from '../../styles/controls';

const bookingModalStyles = {
  dialog: 'fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto overscroll-contain rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-stone-950/45 backdrop:backdrop-blur-sm',
  header: 'flex items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-8',
  eyebrow: 'text-xs font-semibold uppercase tracking-wider text-brand',
  title: 'mt-2 text-xl font-semibold tracking-tight',
  description: 'mt-1 text-sm text-muted',
  closeButton: `${secondaryButton} shrink-0 px-3`,
  body: 'p-6 sm:p-8',
};

export { bookingModalStyles };
