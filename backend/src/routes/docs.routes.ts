import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openapiDocument } from '../docs/openapi.js';

const docsRoutes = Router();
docsRoutes.get('/openapi.json', (req, res) => {
  // The fixed prefix is supplied by our container reverse proxy, never a host URL.
  const prefix = req.get('X-Forwarded-Prefix') === '/api' ? '/api' : '/';
  res.json({ ...openapiDocument, servers: [{ url: prefix }] });
});
docsRoutes.use('/docs', swaggerUi.serve, swaggerUi.setup(undefined, {
  swaggerOptions: { url: '../openapi.json' },
  customSiteTitle: 'Lounge Booking API',
}));

export { docsRoutes };
