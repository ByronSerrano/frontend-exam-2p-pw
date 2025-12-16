<script lang="ts">
	import type { CreateArticleRequest } from '$lib/types';

	interface Props {
		onSubmit: (data: CreateArticleRequest) => void;
		onCancel?: () => void;
		loading?: boolean;
		error?: string;
	}

	let { onSubmit, onCancel, loading = false, error = '' }: Props = $props();

	let nombre = $state('');
	let descripcion = $state('');
	let stock = $state(0);
	let precio = $state(0);
	let formError = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();
		formError = '';

		// Validación
		if (!nombre.trim()) {
			formError = 'El nombre del artículo es requerido';
			return;
		}

		if (!descripcion.trim()) {
			formError = 'La descripción del artículo es requerida';
			return;
		}

		if (stock < 0) {
			formError = 'El stock no puede ser negativo';
			return;
		}

		if (precio <= 0) {
			formError = 'El precio debe ser mayor a 0';
			return;
		}

		const articleData: CreateArticleRequest = {
			nombre: nombre.trim(),
			descripcion: descripcion.trim(),
			stock: parseInt(stock.toString()),
			precio: parseFloat(precio.toString())
		};

		onSubmit(articleData);
	}

	function handleCancel() {
		if (onCancel) {
			onCancel();
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<div>
		<label for="nombre" class="block text-sm font-medium text-gray-300 mb-2">
			Nombre del artículo *
		</label>
		<input
			id="nombre"
			type="text"
			bind:value={nombre}
			required
			disabled={loading}
			class="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 disabled:opacity-50"
			placeholder="Ej: Laptop Lenovo Ideapad Gaming 3"
		/>
	</div>

	<div>
		<label for="descripcion" class="block text-sm font-medium text-gray-300 mb-2">
			Descripción *
		</label>
		<textarea
			id="descripcion"
			bind:value={descripcion}
			required
			disabled={loading}
			rows="3"
			class="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 disabled:opacity-50"
			placeholder="Ej: Laptop Lenovo 15.6 pulgadas, 16GB RAM"
		></textarea>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="stock" class="block text-sm font-medium text-gray-300 mb-2"> Stock * </label>
			<input
				id="stock"
				type="number"
				bind:value={stock}
				required
				min="0"
				step="1"
				disabled={loading}
				class="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 disabled:opacity-50"
				placeholder="10"
			/>
		</div>

		<div>
			<label for="precio" class="block text-sm font-medium text-gray-300 mb-2"> Precio ($) * </label>
			<input
				id="precio"
				type="number"
				bind:value={precio}
				required
				min="0.01"
				step="0.01"
				disabled={loading}
				class="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 disabled:opacity-50"
				placeholder="799.99"
			/>
		</div>
	</div>

	{#if formError || error}
		<div class="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
			{formError || error}
		</div>
	{/if}

	<div class="flex gap-3 pt-2">
		<button
			type="submit"
			disabled={loading}
			class="flex-1 py-2.5 px-4 bg-orange-700 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium"
		>
			{loading ? 'Creando...' : 'Crear artículo'}
		</button>

		{#if onCancel}
			<button
				type="button"
				onclick={handleCancel}
				disabled={loading}
				class="px-4 py-2.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
			>
				Cancelar
			</button>
		{/if}
	</div>
</form>
