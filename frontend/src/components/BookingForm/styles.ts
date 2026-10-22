const bookingFormStyles = {
	container: 'mt-6 border-t border-slate-200 pt-6',
	title: 'text-lg font-semibold text-slate-950',
	description: 'mt-2 text-sm leading-6 text-slate-500',
	form: 'mt-5 space-y-4',
	field: 'flex flex-col gap-2',
	label: 'text-sm font-medium text-slate-700',
	input:
		'min-h-11 w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-slate-100 disabled:text-slate-500',
	actions: 'flex flex-wrap gap-3 pt-2',
	submitButton:
		'min-h-11 cursor-pointer rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60',
	closeButton:
		'min-h-11 cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60',
	error: 'rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800',
	success:
		'rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900',
	reference: 'mt-2 break-all text-xs',
};

export { bookingFormStyles };
