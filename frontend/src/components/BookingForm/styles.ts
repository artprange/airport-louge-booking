import { primaryButton, secondaryButton, textInput } from '../../styles/controls';

const bookingFormStyles = {
  container: '',
  title: 'text-lg font-semibold text-ink',
  description: 'mt-2 text-sm leading-6 text-muted',
  form: 'mt-6 space-y-5',
  field: 'flex flex-col gap-2',
  label: 'text-sm font-medium text-ink',
  input: textInput,
  actions: 'flex flex-wrap gap-3 pt-4',
  submitButton: `${primaryButton} flex-1`,
  closeButton: secondaryButton,
  error: 'rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800',
  success: 'rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-950 focus:outline-none',
  reference: 'mt-3 break-all border-t border-emerald-200 pt-3 font-mono text-xs leading-5',
};

export { bookingFormStyles };
