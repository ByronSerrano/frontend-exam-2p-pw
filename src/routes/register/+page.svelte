<script lang="ts">
	import { register } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import type { UserType } from '$lib/types';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let tipo = $state<UserType>('cliente');
	let nombre = $state('');
	let direccion = $state('');
	let telefono = $state('');
	let error = $state('');
	let loading = $state(false);

	// Computed: verificar si se necesitan campos adicionales
	let requiresExtraFields = $derived(tipo === 'cliente');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		// Validación básica
		if (!email || !password || !nombre || !tipo) {
			error = 'Por favor, completa todos los campos requeridos';
			loading = false;
			return;
		}

		if (password !== confirmPassword) {
			error = 'Las contraseñas no coinciden';
			loading = false;
			return;
		}

		if (password.length < 6) {
			error = 'La contraseña debe tener al menos 6 caracteres';
			loading = false;
			return;
		}

		// Validación para cliente
		if (tipo === 'cliente') {
			if (!direccion || !telefono) {
				error = 'Los clientes deben proporcionar dirección y teléfono';
				loading = false;
				return;
			}
		}

		try {
			const userData: any = {
				email,
				password,
				tipo,
				nombre
			};

			// Agregar campos opcionales solo si el usuario es cliente
			if (tipo === 'cliente') {
				userData.direccion = direccion;
				userData.telefono = telefono;
			}

			const response = await register(userData);
			authStore.setAuth(response.data.user, response.data.token);

			// Redirigir al dashboard
			goto('/dashboard');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al registrar usuario';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="text-center text-4xl font-bold text-gray-100">Crear Cuenta</h2>
			<p class="mt-2 text-center text-sm text-gray-400">
				¿Ya tienes una cuenta?
				<a href="/login" class="font-medium text-orange-500 hover:text-orange-400">
					Inicia sesión aquí
				</a>
			</p>
		</div>

		<form class="mt-8 space-y-6" onsubmit={handleSubmit}>
			<div class="space-y-4">
				<div>
					<label for="tipo" class="block text-sm font-medium text-gray-300 mb-2">
						Tipo de usuario *
					</label>
					<select
						id="tipo"
						bind:value={tipo}
						required
						class="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
					>
						<option value="cliente">Cliente</option>
						<option value="vendedor">Vendedor</option>
					</select>
					<p class="mt-1 text-xs text-gray-500">
						{tipo === 'cliente' ? 'Podrás realizar pedidos de artículos' : 'Podrás publicar artículos para vender'}
					</p>
				</div>

				<div>
					<label for="nombre" class="block text-sm font-medium text-gray-300 mb-2">
						Nombre completo *
					</label>
					<input
						id="nombre"
						type="text"
						bind:value={nombre}
						required
						class="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
						placeholder="Juan Pérez"
					/>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-gray-300 mb-2">
						Correo electrónico *
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

				{#if requiresExtraFields}
					<div class="bg-orange-900/20 border border-orange-700 rounded-lg p-4 space-y-4">
						<p class="text-sm text-orange-300 font-medium">
							Información adicional para clientes:
						</p>

						<div>
							<label for="direccion" class="block text-sm font-medium text-gray-300 mb-2">
								Dirección *
							</label>
							<input
								id="direccion"
								type="text"
								bind:value={direccion}
								required={requiresExtraFields}
								class="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
								placeholder="Av. 10 de Agosto y Colón, Quito"
							/>
						</div>

						<div>
							<label for="telefono" class="block text-sm font-medium text-gray-300 mb-2">
								Teléfono *
							</label>
							<input
								id="telefono"
								type="tel"
								bind:value={telefono}
								required={requiresExtraFields}
								class="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
								placeholder="0999888777"
							/>
						</div>
					</div>
				{/if}

				<div>
					<label for="password" class="block text-sm font-medium text-gray-300 mb-2">
						Contraseña *
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						required
						class="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
						placeholder="••••••"
					/>
					<p class="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
				</div>

				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
						Confirmar contraseña *
					</label>
					<input
						id="confirmPassword"
						type="password"
						bind:value={confirmPassword}
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
				{loading ? 'Registrando...' : 'Crear cuenta'}
			</button>
		</form>
	</div>
</div>
