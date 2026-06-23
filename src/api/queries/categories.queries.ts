import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateCategoryDto, UpdateCategoryDto } from '../../types/api'
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

/**
 * Create a category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateCategoryDto) => categoriesApi.createCategory(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

/**
 * Update a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryDto }) =>
      categoriesApi.updateCategory(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

/**
 * Delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

/**
 * Combined query + mutations for managing the categories list
 */
export function useCategoriesResource() {
  return {
    query: useCategories(),
    create: useCreateCategory(),
    update: useUpdateCategory(),
    remove: useDeleteCategory(),
  }
}
