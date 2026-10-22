import 'dotenv/config';

import { app } from './app.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

// Variáveis de ambiente são strings; convertemos PORT para número.
const port = Number(process.env.PORT ?? 3000);

// Cada condição verifica uma forma diferente de configuração inválida.
if (!Number.isInteger(port) || port < 1 || port > 65535) {
	throw new Error('PORT should be an integer between 1 and 65535');
}

const server = app.listen(port, () => {
	logger.info({ port }, 'API listening');
});

let stopping = false;
function shutdown(signal: string) {
  if (stopping) return;
  stopping = true;
  logger.info({ signal }, 'Shutting down');
  const deadline = setTimeout(() => process.exit(1), 10000);
  deadline.unref();
  server.close(() => {
    void prisma.$disconnect().then(() => {
      clearTimeout(deadline);
      process.exit(0);
    }).catch((err: unknown) => {
      logger.error({ err }, 'Database shutdown failed');
      process.exit(1);
    });
  });
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
