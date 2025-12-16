import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { Article, ArticlesResponse } from '$lib/types';

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
