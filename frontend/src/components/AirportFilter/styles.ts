import { primaryButton, secondaryButton, textInput } from '../../styles/controls';

const airportFilterStyles = {
  form: 'my-9 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6',
  field: 'flex min-w-0 flex-[1_1_260px] flex-col gap-2',
  label: 'text-xs font-semibold uppercase tracking-wider text-muted',
  input: textInput,
  submitButton: primaryButton,
  clearButton: secondaryButton,
};

export { airportFilterStyles };
