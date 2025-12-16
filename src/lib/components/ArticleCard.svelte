<script lang="ts">
	import type { Article, UserType } from '$lib/types';
	import { cartStore } from '$lib/stores/cart.svelte';

	interface Props {
		article: Article;
		userType?: UserType;
		onAddToCart?: (article: Article) => void;
	}

	let { article, userType, onAddToCart }: Props = $props();

	let isOutOfStock = $derived(article.stock === 0);
	let isInCart = $derived(cartStore.isInCart(article.id));
	let stockClass = $derived(
		article.stock === 0
			? 'bg-red-900/50 text-red-300'
			: article.stock <= 10
				? 'bg-yellow-900/50 text-yellow-300'
				: 'bg-green-900/50 text-green-300'
	);

	// Convertir precio a número si llega como string desde el backend
	let precioNumerico = $derived(typeof article.precio === 'string' ? parseFloat(article.precio) : article.precio);

	function handleAddToCart() {
		if (onAddToCart && !isOutOfStock) {
			onAddToCart(article);
		}
	}
</script>

<div class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-orange-600 transition-colors">
	<div class="space-y-4">
		<!-- Título y precio -->
		<div class="flex justify-between items-start">
			<h3 class="text-xl font-semibold text-gray-100">{article.nombre}</h3>
			<span class="text-2xl font-bold text-orange-500">${precioNumerico.toFixed(2)}</span>
		</div>

		<!-- Descripción -->
		<p class="text-gray-400 text-sm line-clamp-3">{article.descripcion}</p>

		<!-- Información del vendedor y stock -->
		<div class="flex items-center justify-between gap-2 pt-2 border-t border-gray-700">
			<div class="flex items-center gap-2 text-sm text-gray-400">
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
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
				<span class="truncate">{article.vendedor?.nombre || 'Vendedor'}</span>
			</div>

			<div class="flex items-center gap-2">
				<span class={`px-2 py-1 rounded text-xs font-medium ${stockClass}`}>
					Stock: {article.stock}
				</span>
			</div>
		</div>

		<!-- Botón de acción (solo para clientes) -->
		{#if userType === 'cliente'}
			<button
				onclick={handleAddToCart}
				disabled={isOutOfStock}
				class="w-full py-2.5 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 {isInCart
					? 'bg-green-700 hover:bg-green-600 text-white'
					: 'bg-orange-700 hover:bg-orange-600 text-white disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed'}"
			>
				{#if isOutOfStock}
					Agotado
				{:else if isInCart}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					Añadido
				{:else}
					Añadir al carrito
				{/if}
			</button>
		{/if}
	</div>
</div>
