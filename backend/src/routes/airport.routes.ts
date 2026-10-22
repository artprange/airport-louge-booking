import { Router } from 'express';
import { searchAirports } from '../controllers/airport.controller.js';

const airportRoutes = Router();
airportRoutes.get('/', searchAirports);

export { airportRoutes };
