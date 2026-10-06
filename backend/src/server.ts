import 'dotenv/config';

import { app } from './app.js';

// Variáveis de ambiente são strings; convertemos PORT para número.
const port = Number(process.env.PORT ?? 3000);

// Cada condição verifica uma forma diferente de configuração inválida.
if (!Number.isInteger(port) || port < 1 || port > 65535) {
	throw new Error('PORT should be an integer between 1 and 65535');
}

app.listen(port, () => {
	console.log(`API running on port ${port}`);
});
