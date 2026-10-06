import { useQuery } from '@tanstack/react-query';

interface HealthResponse {
	status: string;
}

async function fetchHealth(): Promise<HealthResponse> {
	const response = await fetch('/api/health');

	if (!response.ok) {
		throw new Error('Não foi possível consultar a API.');
	}

	return response.json();
}

export function App() {
	const healthQuery = useQuery({
		queryKey: ['health'],
		queryFn: fetchHealth,

		retry: false,
	});

	return (
		<main className="container">
			<h1>Reservas de lounges</h1>
			<p>Primeira etapa: verificar a conexão entre frontend e backend.</p>

			<section
				className="card"
				aria-live="polite"
			>
				<h2>Status da API</h2>

				{healthQuery.isPending && <p>Consultando a API...</p>}

				{healthQuery.isError && (
					<>
						<p role="alert">
							Falha na conexão. Confira se o backend está rodando na porta 3000.
						</p>

						<button
							type="button"
							disabled={healthQuery.isFetching}
							onClick={() => {
								void healthQuery.refetch();
							}}
						>
							{healthQuery.isFetching ? 'Consultando...' : 'Tentar novamente'}
						</button>
					</>
				)}

				{healthQuery.isSuccess && (
					<p>
						Resposta recebida: <strong>{healthQuery.data.status}</strong>
					</p>
				)}
			</section>
		</main>
	);
}
