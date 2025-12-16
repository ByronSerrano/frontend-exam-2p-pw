<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { createOrder } from '$lib/api/orders';
	import Header from '$lib/components/Header.svelte';
	import type { CreateOrderRequest } from '$lib/types';

	let loading = $state(false);
	let error = $state('');
	let success = $state(false);
	let orderErrors = $state<Record<number, string>>({});

	// Datos del formulario
	let nombre = $state('');
	let direccion = $state('');
	let telefono = $state('');

	let cartItems = $derived(cartStore.items);
	let total = $derived(cartStore.getTotal());
	let isAuthenticated = $derived(authStore.isAuthenticated);
	let user = $derived(authStore.user);

	onMount(() => {
		// Verificar autenticación
		if (!isAuthenticated || user?.tipo !== 'cliente') {
			goto('/login');
			return;
		}

		// Pre-llenar formulario con datos del usuario
		nombre = user?.nombre || '';
		direccion = user?.direccion || '';
		telefono = user?.telefono || '';
	});

	function handleQuantityChange(articleId: number, newQuantity: number) {
		cartStore.updateQuantity(articleId, newQuantity);
	}

	function handleRemoveItem(articleId: number) {
		cartStore.removeItem(articleId);
	}

	async function handleCheckout(e: Event) {
		e.preventDefault();
		error = '';
		success = false;
		orderErrors = {};
		loading = true;

		// Validación
		if (!nombre || !direccion || !telefono) {
			error = 'Por favor, completa todos los campos';
			loading = false;
			return;
		}

		if (cartItems.length === 0) {
			error = 'El carrito está vacío';
			loading = false;
			return;
		}

		try {
			const token = authStore.token;
			if (!token) {
				throw new Error('No hay sesión activa');
			}

			// Crear una orden por cada artículo en el carrito
			const orderPromises = cartItems.map(async (item) => {
				const orderData: CreateOrderRequest = {
					articleId: item.article.id,
					cantidad: item.cantidad,
					nombre,
					direccion,
					telefono
				};

				try {
					await createOrder(orderData, token);
					return { success: true, articleId: item.article.id };
				} catch (err) {
					const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
					orderErrors[item.article.id] = errorMsg;
					return { success: false, articleId: item.article.id, error: errorMsg };
				}
			});

			const results = await Promise.all(orderPromises);
			const failedOrders = results.filter((r) => !r.success);

			if (failedOrders.length === 0) {
				// Todas las órdenes se crearon exitosamente
				success = true;
				cartStore.clearCart();
				setTimeout(() => {
					goto('/dashboard');
				}, 2000);
			} else {
				// Algunas órdenes fallaron
				error = `${failedOrders.length} de ${cartItems.length} órdenes fallaron. Revisa los detalles abajo.`;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al procesar las órdenes';
		} finally {
			loading = false;
		}
	}

	function getPrecioNumerico(precio: number | string): number {
		return typeof precio === 'string' ? parseFloat(precio) : precio;
	}
</script>

<div class="min-h-screen bg-gray-900">
	<Header />

	<main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-100 mb-2">Mi Carrito</h1>
			<p class="text-gray-400">Revisa tus artículos y completa tu pedido</p>
		</div>

		{#if success}
			<div class="bg-green-900/50 border border-green-700 text-green-200 px-6 py-4 rounded-lg mb-6">
				<div class="flex items-center gap-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					<div>
						<p class="font-semibold">¡Pedido realizado exitosamente!</p>
						<p class="text-sm">Serás redirigido al dashboard...</p>
					</div>
				</div>
			</div>
		{/if}

		{#if error}
			<div class="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg mb-6">
				{error}
			</div>
		{/if}

		{#if cartItems.length === 0 && !success}
			<div class="text-center py-20">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-16 w-16 mx-auto text-gray-600 mb-4"
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
				<h3 class="text-xl font-medium text-gray-400 mb-2">Tu carrito está vacío</h3>
				<p class="text-gray-500 mb-6">Agrega algunos artículos para comenzar</p>
				<a
					href="/dashboard"
					class="inline-block px-6 py-3 bg-orange-700 text-white rounded-lg hover:bg-orange-600 transition-colors"
				>
					Ver artículos
				</a>
			</div>
		{:else if !success}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<!-- Lista de artículos -->
				<div class="lg:col-span-2 space-y-4">
					<h2 class="text-xl font-semibold text-gray-100 mb-4">Artículos ({cartItems.length})</h2>

					{#each cartItems as item (item.article.id)}
						{@const precio = getPrecioNumerico(item.article.precio)}
						<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
							<div class="flex gap-4">
								<div class="flex-1">
									<h3 class="text-lg font-semibold text-gray-100 mb-1">{item.article.nombre}</h3>
									<p class="text-sm text-gray-400 mb-2">{item.article.vendedor?.nombre}</p>
									<p class="text-xl font-bold text-orange-500">${precio.toFixed(2)} c/u</p>
								</div>

								<div class="flex items-center gap-4">
									<!-- Control de cantidad -->
									<div class="flex items-center gap-2">
										<label for="cantidad-{item.article.id}" class="text-sm text-gray-400">Cant:</label>
										<input
											id="cantidad-{item.article.id}"
											type="number"
											min="1"
											max={item.article.stock}
											value={item.cantidad}
											onchange={(e) =>
												handleQuantityChange(item.article.id, parseInt(e.currentTarget.value))}
											class="w-20 px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
										/>
										<span class="text-xs text-gray-500">/ {item.article.stock}</span>
									</div>

									<!-- Botón eliminar -->
									<button
										onclick={() => handleRemoveItem(item.article.id)}
										class="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
										title="Eliminar"
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
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</div>
							</div>

							<!-- Subtotal -->
							<div class="mt-4 pt-4 border-t border-gray-700 text-right">
								<span class="text-sm text-gray-400">Subtotal: </span>
								<span class="text-lg font-semibold text-gray-100"
									>${(precio * item.cantidad).toFixed(2)}</span
								>
							</div>

							<!-- Mostrar error específico del artículo -->
							{#if orderErrors[item.article.id]}
								<div class="mt-4 bg-red-900/30 border border-red-700 text-red-300 px-3 py-2 rounded text-sm">
									Error: {orderErrors[item.article.id]}
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Resumen y formulario -->
				<div class="lg:col-span-1">
					<div class="bg-gray-800 border border-gray-700 rounded-lg p-6 sticky top-4">
						<h2 class="text-xl font-semibold text-gray-100 mb-6">Resumen del pedido</h2>

						<!-- Total -->
						<div class="mb-6 pb-6 border-b border-gray-700">
							<div class="flex justify-between items-center mb-2">
								<span class="text-gray-400">Artículos:</span>
								<span class="text-gray-100">{cartStore.getTotalItems()}</span>
							</div>
							<div class="flex justify-between items-center text-xl font-bold">
								<span class="text-gray-100">Total:</span>
								<span class="text-orange-500">${total.toFixed(2)}</span>
							</div>
						</div>

						<!-- Formulario de datos -->
						<form onsubmit={handleCheckout} class="space-y-4">
							<div>
								<label for="nombre" class="block text-sm font-medium text-gray-300 mb-2">
									Nombre completo *
								</label>
								<input
									id="nombre"
									type="text"
									bind:value={nombre}
									required
									class="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
								/>
							</div>

							<div>
								<label for="direccion" class="block text-sm font-medium text-gray-300 mb-2">
									Dirección de entrega *
								</label>
								<textarea
									id="direccion"
									bind:value={direccion}
									required
									rows="2"
									class="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
								></textarea>
							</div>

							<div>
								<label for="telefono" class="block text-sm font-medium text-gray-300 mb-2">
									Teléfono *
								</label>
								<input
									id="telefono"
									type="tel"
									bind:value={telefono}
									required
									class="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
								/>
							</div>

							<button
								type="submit"
								disabled={loading || cartItems.length === 0}
								class="w-full py-3 px-4 bg-orange-700 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-semibold"
							>
								{loading ? 'Procesando...' : 'Realizar pedido'}
							</button>
						</form>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>
