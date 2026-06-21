import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { TestStatus } from '../../types/api'
import { useCategories } from './categories.queries'
import { useProjects } from './projects.queries'
import * as testsApi from '../services/tests.service'

export interface TestFilters {
  categoryId?: string
  projectId?: string
  status?: TestStatus
  search?: string
}

export const testKeys = {
  all: ['tests'] as const,
  search: (filters?: TestFilters) => ['tests', 'search', filters ?? {}] as const,
  detail: (id: string) => ['tests', id] as const,
  recent: (limit: number) => ['tests', 'recent', { limit }] as const,
}

/**
 * Search tests (optionally filtered by category, project, status, and/or free text)
 */
export function useTestSearch(filters?: TestFilters) {
  return useQuery({
    queryKey: testKeys.search(filters),
    queryFn: () => testsApi.searchTests(filters ?? {}),
    placeholderData: keepPreviousData,
  })
}

/**
 * Get test by ID
 */
export function useTest(id: string) {
  return useQuery({
    queryKey: testKeys.detail(id),
    queryFn: () => testsApi.getTestById(id),
    enabled: !!id,
  })
}

/**
 * Get recent tests
 */
export function useRecentTests(limit = 4) {
  return useQuery({
    queryKey: testKeys.recent(limit),
    queryFn: () => testsApi.getRecentTests(limit),
  })
}

/**
 * Get all tests enriched with project name, category name, and author name
 * for the archive search page
 */
export function useArchiveSearchData(filters?: TestFilters) {
  const testsQuery = useTestSearch(filters)
  const projectsQuery = useProjects()
  const categoriesQuery = useCategories()

  const tests = testsQuery.data?.map((test) => {
    const project = projectsQuery.data?.find((p) => p.id === test.projectId)
    const category = categoriesQuery.data?.find((c) => c.id === test.categoryId)
    return {
      ...test,
      projectName: project?.name || test.projectId,
      categoryName: category?.name || test.categoryId,
      authorName: test.createdByName || test.metadata?.author || test.createdBy,
    }
  })

  return {
    tests,
    projects: projectsQuery.data,
    categories: categoriesQuery.data,
    isLoading: testsQuery.isPending || projectsQuery.isPending || categoriesQuery.isPending,
    isError: testsQuery.isError || projectsQuery.isError || categoriesQuery.isError,
    error: testsQuery.error || projectsQuery.error || categoriesQuery.error,
  }
}
