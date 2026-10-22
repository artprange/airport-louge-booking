import type { Request, Response, NextFunction } from 'express';
import { airportService } from '../container.js';
import { airportSearchSchema } from '../validators/airport-search.schema.js';

async function searchAirports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q } = airportSearchSchema.parse(req.query);
    const airports = await airportService.search(q);
    res.status(200).json(airports);
  } catch (error: unknown) {
    next(error);
  }
}

export { searchAirports };
