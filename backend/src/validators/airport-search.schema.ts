import { z } from 'zod';

const airportSearchSchema = z.object({
  q: z.string().trim().min(2).max(80).refine((value) =>
    !Array.from(value).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127),
  ),
});

export { airportSearchSchema };
