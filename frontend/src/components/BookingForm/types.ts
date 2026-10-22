import type { Lounge } from '../../types/lounge';

type BookingFormProps = {
	lounge: Lounge;
	onClose: () => void;
	onPendingChange: (pending: boolean) => void;
};

export type { BookingFormProps };
