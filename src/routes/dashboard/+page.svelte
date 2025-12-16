<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { getAllArticles } from '$lib/api/articles';
	import Header from '$lib/components/Header.svelte';
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import type { Article } from '$lib/types';

	let articles = $state<Article[]>([]);
	let loading = $state(true);
	let error = $state('');

	let userType = $derived(authStore.user?.tipo);
	let isAuthenticated = $derived(authStore.isAuthenticated);

	onMount(async () => {
		// Verificar autenticación
		if (!isAuthenticated) {
			goto('/login');
			return;
		}

		// Cargar artículos
		try {
			articles = await getAllArticles();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al cargar artículos';
		} finally {
			loading = false;
		}
	});

	function handleAddToCart(article: Article) {
		cartStore.addItem(article, 1);
	}
</script>

<div class="min-h-screen bg-gray-900">
	<Header />

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-100 mb-2">
				{userType === 'cliente' ? 'Explora nuestros artículos' : 'Catálogo de artículos'}
			</h1>
			<p class="text-gray-400">
				{userType === 'cliente'
					? 'Encuentra lo que necesitas y agrégalo a tu carrito'
					: 'Vista general de todos los artículos disponibles'}
			</p>
		</div>

		{#if loading}
			<div class="flex justify-center items-center py-20">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
			</div>
		{:else if error}
			<div class="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
				{error}
			</div>
		{:else if articles.length === 0}
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
						d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
					/>
				</svg>
				<h3 class="text-xl font-medium text-gray-400 mb-2">No hay artículos disponibles</h3>
				<p class="text-gray-500">
					{userType === 'vendedor'
						? 'Sé el primero en publicar un artículo'
						: 'Vuelve más tarde para ver nuevos productos'}
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each articles as article (article.id)}
					<ArticleCard {article} {userType} onAddToCart={handleAddToCart} />
				{/each}
			</div>

			<div class="mt-8 text-center text-sm text-gray-500">
				Mostrando {articles.length} {articles.length === 1 ? 'artículo' : 'artículos'}
			</div>
		{/if}
	</main>
</div>
