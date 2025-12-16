import type { Article, CartItem } from '$lib/types';
import { browser } from '$app/environment';

const CART_STORAGE_KEY = 'marketplace_cart';

class CartStore {
	items = $state<CartItem[]>([]);

	constructor() {
		if (browser) {
			this.loadFromStorage();
		}
	}

	addItem(article: Article, cantidad: number = 1) {
		const existingItem = this.items.find((item) => item.article.id === article.id);

		if (existingItem) {
			// Si ya existe, actualizar cantidad
			existingItem.cantidad = Math.min(existingItem.cantidad + cantidad, article.stock);
		} else {
			// Agregar nuevo item
			this.items.push({
				article,
				cantidad: Math.min(cantidad, article.stock)
			});
		}

		this.saveToStorage();
	}

	removeItem(articleId: number) {
		this.items = this.items.filter((item) => item.article.id !== articleId);
		this.saveToStorage();
	}

	updateQuantity(articleId: number, cantidad: number) {
		const item = this.items.find((item) => item.article.id === articleId);
		if (item) {
			// Validar que no exceda el stock
			item.cantidad = Math.max(1, Math.min(cantidad, item.article.stock));
			this.saveToStorage();
		}
	}

	clearCart() {
		this.items = [];
		this.saveToStorage();
	}

	getTotalItems() {
		return this.items.reduce((total, item) => total + item.cantidad, 0);
	}

	getTotal() {
		return this.items.reduce((total, item) => {
			const precio = typeof item.article.precio === 'string' 
				? parseFloat(item.article.precio) 
				: item.article.precio;
			return total + precio * item.cantidad;
		}, 0);
	}

	isInCart(articleId: number) {
		return this.items.some((item) => item.article.id === articleId);
	}

	getItemQuantity(articleId: number) {
		const item = this.items.find((item) => item.article.id === articleId);
		return item ? item.cantidad : 0;
	}

	private saveToStorage() {
		if (!browser) return;
		try {
			localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
		} catch (error) {
			console.error('Error al guardar carrito:', error);
		}
	}

	private loadFromStorage() {
		if (!browser) return;
		try {
			const stored = localStorage.getItem(CART_STORAGE_KEY);
			if (stored) {
				this.items = JSON.parse(stored);
			}
		} catch (error) {
			console.error('Error al cargar carrito:', error);
			this.items = [];
		}
	}
}

export const cartStore = new CartStore();
