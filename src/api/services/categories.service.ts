import type { Category } from '../../types/api'
import { apiFetch } from '../http'

export async function getAllCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories')
}

export async function getCategoryById(id: string): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`)
}
