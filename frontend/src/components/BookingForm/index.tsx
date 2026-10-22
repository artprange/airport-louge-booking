import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBooking } from '../../api/bookings';

import type { BookingFormProps } from './types';
import { bookingFormStyles } from './styles';
import { ApiError } from '../../api/apiError';

const bookingErrorMessages: Record<string, string> = {
	CAPACITY_EXCEEDED:
		'Not enough capacity for this date. Choose another date or fewer guests.',

	INVALID_BOOKING_DATE: 'Choose today or a future date.',

	LOUNGE_NOT_FOUND:
		'This lounge is no longer available. Refresh the lounge list.',

	BOOKING_CONFLICT:
		'Other customers are booking at the same time. Please try again.',

	VALIDATION_ERROR: 'Check your name, date and number of guests.',
};

function getBookingErrorMessage(error: Error): string {
	if (!(error instanceof ApiError)) {
		return 'Connection lost. Your booking could not be confirmed. Check before submitting again.';
	}

	return (
		bookingErrorMessages[error.code] ??
		'Your booking could not be confirmed. Please check before submitting again.'
	);
}

function BookingForm({ lounge, onClose, onPendingChange }: BookingFormProps) {
	const fieldId = useId();
	const confirmationRef = useRef<HTMLDivElement>(null);
	const queryClient = useQueryClient();

	const [customerName, setCustomerName] = useState('');
	const [guests, setGuests] = useState('1');
	const [bookingDate, setBookingDate] = useState('');

	const today = new Date().toISOString().slice(0, 10);

	const mutation = useMutation({
		mutationKey: ['create-booking', lounge.id],
		mutationFn: createBooking,

		retry: false,

		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['bookings'],
			});
		},
		onSettled: () => onPendingChange(false),
	});

	useEffect(() => {
		if (mutation.isSuccess) confirmationRef.current?.focus();
	}, [mutation.isSuccess]);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (mutation.isPending || mutation.isSuccess) {
			return;
		}

		onPendingChange(true);
		mutation.mutate({
			loungeId: lounge.id,
			customerName: customerName.trim(),

			guests: Number(guests),

			bookingDate,
		});
	}

	if (mutation.isSuccess) {
		return (
			<section
				className={bookingFormStyles.container}
				aria-label="Booking confirmation"
			>
				<div
					ref={confirmationRef}
					tabIndex={-1}
					className={bookingFormStyles.success}
					role="status"
				>
					<p>Your booking at {lounge.name} is confirmed.</p>

					<p>
						{mutation.data.guests}{' '}
						{mutation.data.guests === 1 ? 'guest' : 'guests'}
						{' · '}
						{mutation.data.bookingDate}
					</p>

					<p className={bookingFormStyles.reference}>
						Booking reference: {mutation.data.id}
					</p>
				</div>

				<div className={bookingFormStyles.actions}>
					<button
						className={bookingFormStyles.closeButton}
						type="button"
						onClick={onClose}
					>
						Done
					</button>
				</div>
			</section>
		);
	}

	return (
		<section
			className={bookingFormStyles.container}
			aria-labelledby={`${fieldId}-title`}
		>
			<h3
				id={`${fieldId}-title`}
				className={bookingFormStyles.title}
			>
				Book your visit
			</h3>

			<p className={bookingFormStyles.description}>
				Availability is checked when you confirm your booking.
			</p>

			<form
				className={bookingFormStyles.form}
				onSubmit={handleSubmit}
				aria-busy={mutation.isPending}
			>
				<div className={bookingFormStyles.field}>
					<label
						className={bookingFormStyles.label}
						htmlFor={`${fieldId}-name`}
					>
						Full name
					</label>

					<input
						id={`${fieldId}-name`}
						name="customerName"
						type="text"
						autoComplete="name"
						className={bookingFormStyles.input}
						value={customerName}
						onChange={(event) => setCustomerName(event.target.value)}
						minLength={2}
						maxLength={120}
						required
						disabled={mutation.isPending}
					/>
				</div>

				<div className={bookingFormStyles.field}>
					<label
						className={bookingFormStyles.label}
						htmlFor={`${fieldId}-guests`}
					>
						Guests
					</label>

					<input
						id={`${fieldId}-guests`}
						name="guests"
						type="number"
						className={bookingFormStyles.input}
						value={guests}
						onChange={(event) => setGuests(event.target.value)}
						min={1}
						max={lounge.capacity}
						step={1}
						required
						disabled={mutation.isPending}
					/>
				</div>

				<div className={bookingFormStyles.field}>
					<label
						className={bookingFormStyles.label}
						htmlFor={`${fieldId}-date`}
					>
						Visit date
					</label>

					<input
						id={`${fieldId}-date`}
						name="bookingDate"
						type="date"
						className={bookingFormStyles.input}
						value={bookingDate}
						onChange={(event) => setBookingDate(event.target.value)}
						min={today}
						required
						disabled={mutation.isPending}
					/>
				</div>

				{mutation.isError && (
					<p
						className={bookingFormStyles.error}
						role="alert"
					>
						{getBookingErrorMessage(mutation.error)}
					</p>
				)}

				<div className={bookingFormStyles.actions}>
					<button
						className={bookingFormStyles.submitButton}
						type="submit"
						disabled={mutation.isPending}
					>
						{mutation.isPending ? 'Booking...' : 'Confirm booking'}
					</button>

					<button
						className={bookingFormStyles.closeButton}
						type="button"
						onClick={onClose}
						disabled={mutation.isPending}
					>
						Cancel
					</button>
				</div>
			</form>
		</section>
	);
}

export { BookingForm };
