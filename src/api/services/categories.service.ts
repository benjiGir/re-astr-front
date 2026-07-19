import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../../types/api'
import { apiFetch } from '../http'

export async function getAllCategories(signal?: AbortSignal): Promise<Category[]> {
  return apiFetch<Category[]>('/categories', { signal })
}

export async function getCategoryById(id: string, signal?: AbortSignal): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, { signal })
}

export async function createCategory(dto: CreateCategoryDto): Promise<Category> {
  return apiFetch<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export async function updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  })
}

export async function deleteCategory(id: string): Promise<void> {
  return apiFetch<void>(`/categories/${id}`, {
    method: 'DELETE',
  })
}
