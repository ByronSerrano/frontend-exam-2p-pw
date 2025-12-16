export type UserType = 'cliente' | 'vendedor';

export interface User {
	id: number;
	email: string;
	tipo: UserType;
	nombre: string;
	direccion?: string;
	telefono?: string;
	createdAt: string;
	updatedAt: string;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterData {
	email: string;
	password: string;
	tipo: UserType;
	nombre: string;
	direccion?: string;
	telefono?: string;
}

export interface AuthResponse {
	success: boolean;
	message: string;
	data: {
		user: User;
		token: string;
	};
}

export interface ApiError {
	success: false;
	message: string;
	error?: string;
}

export interface Article {
	id: number;
	nombre: string;
	descripcion: string;
	stock: number;
	precio: number;
	vendedorId: number;
	createdAt: string;
	updatedAt: string;
	vendedor?: {
		id: number;
		nombre: string;
		email: string;
	};
}

export interface ArticlesResponse {
	success: boolean;
	message: string;
	data: {
		articles: Article[];
	};
}
