import type { QueryClient } from '@tanstack/react-query'
import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { devCheck } from '../schemas/_dev'
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../schemas/category.schema'
import { CategorySchema } from '../schemas/category.schema'
import * as categoriesApi from '../services/categories.service'

const REFERENCE_DATA_STALE_TIME = 10 * 60 * 1000

export const categoryKeys = {
  all: ['categories'] as const,
  detail: (id: string) => ['categories', id] as const,
}

export function categoriesOptions() {
  return queryOptions({
    queryKey: categoryKeys.all,
    queryFn: async ({ signal }) =>
      devCheck(
        CategorySchema.array(),
        await categoriesApi.getAllCategories(signal),
        'categories.getAll',
      ),
    staleTime: REFERENCE_DATA_STALE_TIME,
  })
}

export function categoryOptions(id: string) {
  return queryOptions({
    queryKey: categoryKeys.detail(id),
    queryFn: async ({ signal }) =>
      devCheck(
        CategorySchema,
        await categoriesApi.getCategoryById(id, signal),
        'categories.getById',
      ),
    enabled: !!id,
    staleTime: REFERENCE_DATA_STALE_TIME,
  })
}

function invalidateCategories(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: categoryKeys.all })
}

interface CategoriesRollback {
  previous?: Category[]
}

function createCategoryMutation(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (dto: CreateCategoryDto) => categoriesApi.createCategory(dto),
    onMutate: async (dto): Promise<CategoriesRollback> => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.all })
      const previous = queryClient.getQueryData<Category[]>(categoryKeys.all)
      const optimisticCategory: Category = {
        id: `temp-${Date.now()}`,
        name: dto.name,
        description: dto.description,
        baseSchema: dto.baseSchema,
        customFieldsSchema: dto.customFieldsSchema ?? { allowCustomFields: false, fields: [] },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      queryClient.setQueryData<Category[]>(categoryKeys.all, (old) => [
        ...(old ?? []),
        optimisticCategory,
      ])
      return { previous }
    },
    onError: (_error, _dto, context) => {
      if (context?.previous) queryClient.setQueryData(categoryKeys.all, context.previous)
    },
    onSettled: () => invalidateCategories(queryClient),
  })
}

function updateCategoryMutation(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryDto }) =>
      categoriesApi.updateCategory(id, dto),
    onMutate: async ({ id, dto }): Promise<CategoriesRollback> => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.all })
      const previous = queryClient.getQueryData<Category[]>(categoryKeys.all)
      queryClient.setQueryData<Category[]>(categoryKeys.all, (old) =>
        old?.map((category) =>
          category.id === id ? { ...category, ...dto, updatedAt: new Date() } : category,
        ),
      )
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(categoryKeys.all, context.previous)
    },
    onSettled: () => invalidateCategories(queryClient),
  })
}

function deleteCategoryMutation(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onMutate: async (id): Promise<CategoriesRollback> => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.all })
      const previous = queryClient.getQueryData<Category[]>(categoryKeys.all)
      queryClient.setQueryData<Category[]>(categoryKeys.all, (old) =>
        old?.filter((category) => category.id !== id),
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(categoryKeys.all, context.previous)
    },
    onSettled: () => invalidateCategories(queryClient),
  })
}

/**
 * Combined query + mutations for managing the categories list
 */
export function useCategoriesResource() {
  const queryClient = useQueryClient()
  return {
    query: useQuery(categoriesOptions()),
    create: useMutation(createCategoryMutation(queryClient)),
    update: useMutation(updateCategoryMutation(queryClient)),
    remove: useMutation(deleteCategoryMutation(queryClient)),
  }
}
