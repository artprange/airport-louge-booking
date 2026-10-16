import type { LoungeCardProps } from './types';
import { loungeCardStyles } from './styles';

const currencyFormatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'BRL',
});

function LoungeCard({ lounge }: LoungeCardProps) {
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
		</article>
	);
}

export { LoungeCard };
