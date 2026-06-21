import { useQuery } from '@tanstack/react-query'
import * as categoriesApi from '../services/categories.service'

export const categoryKeys = {
  all: ['categories'] as const,
  detail: (id: string) => ['categories', id] as const,
}

/**
 * Get all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: categoriesApi.getAllCategories,
  })
}

/**
 * Get category by ID
 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesApi.getCategoryById(id),
    enabled: !!id,
  })
}
