type CreateBookingInput = {
	loungeId: string;
	customerName: string;
	guests: number;
	bookingDate: string;
};

type Booking = CreateBookingInput & {
	id: string;
	createdAt: string;
};

export type { CreateBookingInput, Booking };
