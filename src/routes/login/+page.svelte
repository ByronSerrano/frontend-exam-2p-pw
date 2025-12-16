<script lang="ts">
	import { login } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		// Validación básica
		if (!email || !password) {
			error = 'Por favor, completa todos los campos';
			loading = false;
			return;
		}

		if (password.length < 6) {
			error = 'La contraseña debe tener al menos 6 caracteres';
			loading = false;
			return;
		}

		try {
			const response = await login({ email, password });
			authStore.setAuth(response.data.user, response.data.token);
			
			// Redirigir al dashboard
			goto('/dashboard');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al iniciar sesión';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-900 flex items-center justify-center px-4">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="text-center text-4xl font-bold text-gray-100">Iniciar Sesión</h2>
			<p class="mt-2 text-center text-sm text-gray-400">
				¿No tienes una cuenta?
				<a href="/register" class="font-medium text-orange-500 hover:text-orange-400">
					Regístrate aquí
				</a>
			</p>
		</div>

		<form class="mt-8 space-y-6" onsubmit={handleSubmit}>
			<div class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-300 mb-2">
						Correo electrónico
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						class="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
						placeholder="tu@email.com"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-300 mb-2">
						Contraseña
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						required
						class="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
						placeholder="••••••"
					/>
				</div>
			</div>

			{#if error}
				<div class="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
					{error}
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-orange-700 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
			</button>
		</form>
	</div>
</div>
