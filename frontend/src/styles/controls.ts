// Shared interaction styles keep focus, disabled and hover states consistent.
const primaryButton =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50';
const secondaryButton =
  'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50';
const textInput =
  'min-h-12 w-full min-w-0 rounded-xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:bg-canvas disabled:text-muted';

export { primaryButton, secondaryButton, textInput };
