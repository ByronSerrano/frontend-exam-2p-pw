import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { LoginCredentials, RegisterData, AuthResponse, ApiError } from '$lib/types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
	const response = await fetch(`${PUBLIC_BACKEND_URL}/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(credentials)
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || 'Error al iniciar sesión');
	}

	return data;
}

export async function register(userData: RegisterData): Promise<AuthResponse> {
	const response = await fetch(`${PUBLIC_BACKEND_URL}/auth/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(userData)
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || 'Error al registrar usuario');
	}

	return data;
}
