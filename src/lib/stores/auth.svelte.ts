import type { User } from '$lib/types';
import { browser } from '$app/environment';

class AuthStore {
	user = $state<User | null>(null);
	token = $state<string | null>(null);
	isAuthenticated = $derived(this.user !== null && this.token !== null);

	constructor() {
		if (browser) {
			this.loadFromStorage();
		}
	}

	setAuth(user: User, token: string) {
		this.user = user;
		this.token = token;
		if (browser) {
			localStorage.setItem('token', token);
			localStorage.setItem('user', JSON.stringify(user));
		}
	}

	clearAuth() {
		this.user = null;
		this.token = null;
		if (browser) {
			localStorage.removeItem('token');
			localStorage.removeItem('user');
		}
	}

	loadFromStorage() {
		if (!browser) return;

		const token = localStorage.getItem('token');
		const userStr = localStorage.getItem('user');

		if (token && userStr) {
			try {
				this.token = token;
				this.user = JSON.parse(userStr);
			} catch (error) {
				console.error('Error al cargar datos de autenticación:', error);
				this.clearAuth();
			}
		}
	}
}

export const authStore = new AuthStore();
