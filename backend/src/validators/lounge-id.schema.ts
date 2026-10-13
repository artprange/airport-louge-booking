import { z } from 'zod';

export const loungeIdParamsSchema = z.object({
	id: z.string().uuid(),
});
