<script lang="ts">
	import type { Order } from '$lib/types';

	interface Props {
		order: Order;
	}

	let { order }: Props = $props();

	let total = $derived(typeof order.total === 'string' ? parseFloat(order.total) : order.total);
	
	let estadoColor = $derived.by(() => {
		if (order.estado === 'completado') return 'bg-green-600';
		if (order.estado === 'cancelado') return 'bg-red-600';
		return 'bg-yellow-600';
	});

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('es-MX', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold text-white">Detalles de la Orden</h2>
		<span class="px-3 py-1 text-sm font-semibold text-white rounded-full {estadoColor}">
			{order.estado.toUpperCase()}
		</span>
	</div>

	<!-- Customer Information -->
	<div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
		<h3 class="text-lg font-semibold text-white mb-3">Información del Cliente</h3>
		<div class="space-y-2">
			<div class="flex">
				<span class="text-gray-400 w-24">Nombre:</span>
				<span class="text-white font-medium">{order.nombre}</span>
			</div>
			<div class="flex">
				<span class="text-gray-400 w-24">Dirección:</span>
				<span class="text-white">{order.direccion || 'No proporcionada'}</span>
			</div>
			<div class="flex">
				<span class="text-gray-400 w-24">Teléfono:</span>
				<span class="text-white">{order.telefono || 'No proporcionado'}</span>
			</div>
		</div>
	</div>

	<!-- Article Information -->
	<div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
		<h3 class="text-lg font-semibold text-white mb-3">Información del Artículo</h3>
		<div class="space-y-2">
			<div class="flex">
				<span class="text-gray-400 w-24">Artículo:</span>
				<span class="text-white font-medium">{order.articulo?.nombre || 'N/A'}</span>
			</div>
			<div class="flex">
				<span class="text-gray-400 w-24">Descripción:</span>
				<span class="text-white">{order.articulo?.descripcion || 'N/A'}</span>
			</div>
			<div class="flex">
				<span class="text-gray-400 w-24">Cantidad:</span>
				<span class="text-white font-medium">{order.cantidad}</span>
			</div>
		</div>
	</div>

	<!-- Order Summary -->
	<div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
		<h3 class="text-lg font-semibold text-white mb-3">Resumen de la Orden</h3>
		<div class="space-y-2">
			<div class="flex">
				<span class="text-gray-400 w-24">Total:</span>
				<span class="text-white font-bold text-xl">${total.toFixed(2)}</span>
			</div>
			<div class="flex">
				<span class="text-gray-400 w-24">Fecha:</span>
				<span class="text-white">{formatDate(order.createdAt)}</span>
			</div>
		</div>
	</div>
</div>
