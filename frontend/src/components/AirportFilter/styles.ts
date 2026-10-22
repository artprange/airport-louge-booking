import { primaryButton, secondaryButton, textInput } from '../../styles/controls';

const option = 'flex cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-brand-soft';
const airportFilterStyles = {
  form: 'my-9 flex flex-wrap items-start gap-3 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6',
  field: 'flex min-w-0 flex-[1_1_260px] flex-col gap-2',
  label: 'text-xs font-semibold uppercase tracking-wider text-muted',
  search: 'relative',
  input: textInput,
  dropdown: 'absolute top-full z-20 mt-2 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-xl',
  options: 'max-h-72 overflow-y-auto overscroll-contain',
  option,
  activeOption: `${option} bg-brand-soft`,
  code: 'shrink-0 rounded-md bg-canvas px-2 py-1 text-xs font-bold text-brand',
  optionText: 'min-w-0',
  airportName: 'block text-sm font-medium text-ink',
  location: 'mt-1 block text-xs text-muted',
  status: 'px-4 py-3 text-sm leading-6 text-muted',
  hint: 'text-xs leading-5 text-muted',
  credit: 'text-xs text-muted',
  link: 'rounded underline underline-offset-2 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand',
  error: 'text-sm text-red-800',
  submitButton: `${primaryButton} mt-6`,
  clearButton: `${secondaryButton} mt-6`,
};

export { airportFilterStyles };
