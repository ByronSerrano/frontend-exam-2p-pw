<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';

	function handleLogout() {
		authStore.clearAuth();
		goto('/login');
	}

	function handleCart() {
		goto('/carrito');
	}

	function handleAdministrar() {
		goto('/admin');
	}

	let userType = $derived(authStore.user?.tipo);
	let userName = $derived(authStore.user?.nombre);
</script>

<header class="bg-gray-800 border-b border-gray-700">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo/Título -->
			<div class="flex items-center">
				<a href="/dashboard" class="text-2xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
					Marketplace
				</a>
			</div>

			<!-- Botones de navegación -->
			<div class="flex items-center gap-4">
				{#if userName}
					<span class="text-gray-300 text-sm hidden sm:block">
						Hola, <span class="font-medium text-orange-400">{userName}</span>
					</span>
				{/if}

				{#if userType === 'cliente'}
					<!-- Botón Carrito para clientes -->
					<button
						onclick={handleCart}
						class="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors"
						title="Ver carrito"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						<span class="hidden sm:inline">Carrito</span>
					</button>
				{:else if userType === 'vendedor'}
					<!-- Botón Administrar para vendedores -->
					<button
						onclick={handleAdministrar}
						class="flex items-center gap-2 px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-600 transition-colors"
						title="Administrar"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						<span class="hidden sm:inline">Administrar</span>
					</button>
				{/if}

				<!-- Botón Logout -->
				<button
					onclick={handleLogout}
					class="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors"
					title="Cerrar sesión"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
					<span class="hidden sm:inline">Salir</span>
				</button>
			</div>
		</div>
	</div>
</header>
