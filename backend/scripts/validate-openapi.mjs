import SwaggerParser from '@apidevtools/swagger-parser';
import { openapiDocument } from '../dist/docs/openapi.js';

// Run in Node itself: the validator mixes CJS and ESM dependencies that Jest's
// experimental VM loader does not support on our Node 22 runtime.
await SwaggerParser.validate(structuredClone(openapiDocument));
console.log('OpenAPI contract validated.');
