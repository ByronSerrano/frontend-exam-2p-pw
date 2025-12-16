import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type {
	Article,
	ArticlesResponse,
	CreateArticleRequest,
	CreateArticleResponse,
	DeleteArticleResponse
} from '$lib/types';

export async function getAllArticles(): Promise<Article[]> {
	const response = await fetch(`${PUBLIC_BACKEND_URL}/articles`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const data: ArticlesResponse = await response.json();

	if (!response.ok) {
		throw new Error(data.message || 'Error al cargar artículos');
	}

	return data.data.articles;
}

export async function getMyArticles(token: string): Promise<Article[]> {
	const response = await fetch(`${PUBLIC_BACKEND_URL}/articles/my-articles`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	const data: ArticlesResponse = await response.json();

	if (!response.ok) {
		throw new Error(data.message || 'Error al cargar tus artículos');
	}

	return data.data.articles;
}

export async function createArticle(
	articleData: CreateArticleRequest,
	token: string
): Promise<CreateArticleResponse> {
	const response = await fetch(`${PUBLIC_BACKEND_URL}/articles`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(articleData)
	});

	const data: CreateArticleResponse = await response.json();

	if (!response.ok) {
		throw new Error(data.message || 'Error al crear el artículo');
	}

	return data;
}

export async function deleteArticle(
	articleId: number,
	token: string
): Promise<DeleteArticleResponse> {
	const response = await fetch(`${PUBLIC_BACKEND_URL}/articles/${articleId}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	const data: DeleteArticleResponse = await response.json();

	if (!response.ok) {
		throw new Error(data.message || 'Error al eliminar el artículo');
	}

	return data;
}
