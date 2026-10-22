import { useState } from 'react';

import { BookingForm } from '../BookingForm';

import type { LoungeCardProps } from './types';
import { loungeCardStyles } from './styles';

const currencyFormatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'BRL',
});

function LoungeCard({ lounge }: LoungeCardProps) {
	const [isBookingOpen, setIsBookingOpen] = useState(false);

	return (
		<article className={loungeCardStyles.card}>
			<span className={loungeCardStyles.badge}>{lounge.airportCode}</span>

			<h2 className={loungeCardStyles.title}>{lounge.name}</h2>

			<p className={loungeCardStyles.capacity}>
				Daily capacity: {lounge.capacity} guests
			</p>

			<p className={loungeCardStyles.price}>
				{currencyFormatter.format(Number(lounge.price))}
			</p>

			{isBookingOpen ? (
				<BookingForm
					lounge={lounge}
					onClose={() => setIsBookingOpen(false)}
				/>
			) : (
				<button
					className={loungeCardStyles.bookButton}
					type="button"
					onClick={() => setIsBookingOpen(true)}
				>
					Book lounge
				</button>
			)}
		</article>
	);
}

export { LoungeCard };
