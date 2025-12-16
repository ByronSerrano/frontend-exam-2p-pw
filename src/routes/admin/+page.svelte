<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { getMyArticles, createArticle, deleteArticle } from '$lib/api/articles';
	import { getVendorOrders } from '$lib/api/orders';
	import Header from '$lib/components/Header.svelte';
	import ArticleForm from '$lib/components/ArticleForm.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import OrderDetail from '$lib/components/OrderDetail.svelte';
	import type { Article, CreateArticleRequest, Order } from '$lib/types';

	let activeTab = $state<'articulos' | 'pedidos'>('articulos');
	let articles = $state<Article[]>([]);
	let orders = $state<Order[]>([]);
	let loading = $state(true);
	let loadingOrders = $state(false);
	let error = $state('');
	let showCreateForm = $state(false);
	let creatingArticle = $state(false);
	let createError = $state('');
	let successMessage = $state('');
	let selectedOrder = $state<Order | null>(null);
	let isModalOpen = $state(false);

	let isAuthenticated = $derived(authStore.isAuthenticated);
	let user = $derived(authStore.user);
	let token = $derived(authStore.token);

	onMount(async () => {
		// Verificar autenticación y tipo de usuario
		if (!isAuthenticated || user?.tipo !== 'vendedor') {
			goto('/login');
			return;
		}

		await loadArticles();
	});

	async function loadArticles() {
		if (!token) return;

		loading = true;
		error = '';

		try {
			articles = await getMyArticles(token);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al cargar artículos';
		} finally {
			loading = false;
		}
	}

	async function loadOrders() {
		if (!token) return;

		loadingOrders = true;
		error = '';

		try {
			orders = await getVendorOrders(token);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al cargar las órdenes';
		} finally {
			loadingOrders = false;
		}
	}

	function openOrderDetail(order: Order) {
		selectedOrder = order;
		isModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
		selectedOrder = null;
	}

	$effect(() => {
		if (activeTab === 'pedidos' && orders.length === 0 && !loadingOrders) {
			loadOrders();
		}
	});

	async function handleCreateArticle(data: CreateArticleRequest) {
		if (!token) return;

		creatingArticle = true;
		createError = '';
		successMessage = '';

		try {
			await createArticle(data, token);
			successMessage = 'Artículo creado exitosamente';
			showCreateForm = false;
			await loadArticles();

			// Limpiar mensaje después de 3 segundos
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		} catch (err) {
			createError = err instanceof Error ? err.message : 'Error al crear el artículo';
		} finally {
			creatingArticle = false;
		}
	}

	async function handleDeleteArticle(articleId: number, articleName: string) {
		if (!token) return;

		const confirmed = confirm(
			`¿Estás seguro de que deseas eliminar "${articleName}"?\n\nEsta acción también eliminará todas las órdenes relacionadas y no se puede deshacer.`
		);

		if (!confirmed) return;

		try {
			const response = await deleteArticle(articleId, token);
			successMessage = response.message;
			await loadArticles();

			// Limpiar mensaje después de 3 segundos
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al eliminar el artículo';
		}
	}

	function getPrecioNumerico(precio: number | string): number {
		return typeof precio === 'string' ? parseFloat(precio) : precio;
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-EC', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="min-h-screen bg-gray-900">
	<Header />

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-100 mb-2">Panel de Administración</h1>
			<p class="text-gray-400">Gestiona tus artículos y pedidos</p>
		</div>

		<!-- Tabs -->
		<div class="mb-6 border-b border-gray-700">
			<nav class="flex gap-6">
				<button
					onclick={() => (activeTab = 'articulos')}
					class="pb-4 px-2 text-sm font-medium transition-colors {activeTab === 'articulos'
						? 'text-orange-500 border-b-2 border-orange-500'
						: 'text-gray-400 hover:text-gray-300'}"
				>
					Mis Artículos
				</button>
				<button
					onclick={() => (activeTab = 'pedidos')}
					class="pb-4 px-2 text-sm font-medium transition-colors {activeTab === 'pedidos'
						? 'text-orange-500 border-b-2 border-orange-500'
						: 'text-gray-400 hover:text-gray-300'}"
				>
					Pedidos
				</button>
			</nav>
		</div>

		<!-- Mensajes -->
		{#if successMessage}
			<div class="mb-6 bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg">
				{successMessage}
			</div>
		{/if}

		{#if error}
			<div class="mb-6 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
				{error}
			</div>
		{/if}

		<!-- Contenido de Artículos -->
		{#if activeTab === 'articulos'}
			<div class="space-y-6">
				<!-- Botón Crear + Formulario -->
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-gray-100">
						Mis Artículos ({articles.length})
					</h2>
					<button
						onclick={() => (showCreateForm = !showCreateForm)}
						class="flex items-center gap-2 px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
								d="M12 4v16m8-8H4"
							/>
						</svg>
						{showCreateForm ? 'Cancelar' : 'Crear artículo'}
					</button>
				</div>

				<!-- Formulario de creación -->
				{#if showCreateForm}
					<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
						<h3 class="text-lg font-semibold text-gray-100 mb-4">Nuevo Artículo</h3>
						<ArticleForm
							onSubmit={handleCreateArticle}
							onCancel={() => {
								showCreateForm = false;
								createError = '';
							}}
							loading={creatingArticle}
							error={createError}
						/>
					</div>
				{/if}

				<!-- Lista de artículos -->
				{#if loading}
					<div class="flex justify-center items-center py-20">
						<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
					</div>
				{:else if articles.length === 0}
					<div class="text-center py-20 bg-gray-800 border border-gray-700 rounded-lg">
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
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
							/>
						</svg>
						<h3 class="text-xl font-medium text-gray-400 mb-2">No tienes artículos publicados</h3>
						<p class="text-gray-500 mb-6">Comienza creando tu primer artículo</p>
						<button
							onclick={() => (showCreateForm = true)}
							class="inline-flex items-center gap-2 px-6 py-3 bg-orange-700 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
									d="M12 4v16m8-8H4"
								/>
							</svg>
							Crear mi primer artículo
						</button>
					</div>
				{:else}
					<div class="grid gap-4">
						{#each articles as article (article.id)}
							{@const precio = getPrecioNumerico(article.precio)}
							<div class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
								<div class="flex justify-between items-start gap-4">
									<div class="flex-1">
										<h3 class="text-xl font-semibold text-gray-100 mb-2">{article.nombre}</h3>
										<p class="text-gray-400 text-sm mb-4">{article.descripcion}</p>

										<div class="flex flex-wrap gap-4 text-sm">
											<div class="flex items-center gap-2">
												<span class="text-gray-500">Precio:</span>
												<span class="text-orange-500 font-semibold text-lg">${precio.toFixed(2)}</span>
											</div>
											<div class="flex items-center gap-2">
												<span class="text-gray-500">Stock:</span>
												<span
													class="px-2 py-1 rounded text-xs font-medium {article.stock === 0
														? 'bg-red-900/50 text-red-300'
														: article.stock <= 10
															? 'bg-yellow-900/50 text-yellow-300'
															: 'bg-green-900/50 text-green-300'}"
												>
													{article.stock} unidades
												</span>
											</div>
											<div class="flex items-center gap-2">
												<span class="text-gray-500">Publicado:</span>
												<span class="text-gray-400">{formatDate(article.createdAt)}</span>
											</div>
										</div>
									</div>

									<!-- Botón eliminar -->
									<button
										onclick={() => handleDeleteArticle(article.id, article.nombre)}
										class="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
										title="Eliminar artículo"
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
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<!-- Contenido de Pedidos -->
			<div class="space-y-6">
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-gray-100">
						Pedidos Recibidos ({orders.length})
					</h2>
				</div>

				{#if loadingOrders}
					<div class="flex justify-center items-center py-20">
						<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
					</div>
				{:else if orders.length === 0}
					<div class="text-center py-20 bg-gray-800 border border-gray-700 rounded-lg">
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
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<h3 class="text-xl font-medium text-gray-400 mb-2">No hay pedidos</h3>
						<p class="text-gray-500">Aún no has recibido ningún pedido para tus artículos</p>
					</div>
				{:else}
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each orders as order (order.id)}
							{@const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total}
							{@const estadoColor =
								order.estado === 'completado'
									? 'bg-green-600'
									: order.estado === 'cancelado'
										? 'bg-red-600'
										: 'bg-yellow-600'}
							<button
								onclick={() => openOrderDetail(order)}
								class="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-gray-600 transition-all cursor-pointer text-left hover:shadow-lg hover:shadow-orange-900/20"
							>
								<div class="flex justify-between items-start mb-3">
									<h3 class="text-lg font-semibold text-gray-100">{order.nombre}</h3>
									<span class="px-2 py-1 text-xs font-semibold text-white rounded-full {estadoColor}">
										{order.estado}
									</span>
								</div>

								<div class="space-y-2 text-sm">
									<div class="flex items-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4 text-gray-500"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
											/>
										</svg>
										<span class="text-gray-400">{order.articulo?.nombre || 'N/A'}</span>
									</div>

									<div class="flex items-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4 text-gray-500"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
											/>
										</svg>
										<span class="text-gray-400">Cantidad: {order.cantidad}</span>
									</div>

									<div class="flex items-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4 text-gray-500"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<span class="text-orange-500 font-semibold">${total.toFixed(2)}</span>
									</div>

									<div class="flex items-center gap-2 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-700">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
										{formatDate(order.createdAt)}
									</div>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</main>

	<!-- Modal con detalle de orden -->
	<Modal isOpen={isModalOpen} onClose={closeModal}>
		{#if selectedOrder}
			<OrderDetail order={selectedOrder} />
		{/if}
	</Modal>
</div>
