import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { CreateOrderRequest, OrderResponse, OrdersListResponse, Order } from '$lib/types';

export async function createOrder(
	orderData: CreateOrderRequest,
	token: string
): Promise<OrderResponse> {
	const response = await fetch(`${PUBLIC_BACKEND_URL}/orders`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(orderData)
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || 'Error al crear la orden');
	}

	return data;
}

export async function getVendorOrders(token: string): Promise<Order[]> {
	const response = await fetch(`${PUBLIC_BACKEND_URL}/orders/vendor-orders`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	const data: OrdersListResponse = await response.json();

	if (!response.ok) {
		throw new Error(data.message || 'Error al obtener las órdenes');
	}

	return data.data.orders;
}
