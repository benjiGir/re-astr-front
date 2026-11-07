import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { devCheck } from '../schemas/_dev'
import type { TestStatus } from '../schemas/test.schema'
import { TestSchema } from '../schemas/test.schema'
import * as testsApi from '../services/tests.service'
import { categoriesOptions } from './categories.queries'
import { projectsOptions } from './projects.queries'

export interface TestFilters {
  categoryId?: string
  projectId?: string
  status?: TestStatus
  search?: string
}

export const testKeys = {
  all: ['tests'] as const,
  detail: (id: string) => ['tests', id] as const,
  search: (filters?: TestFilters) => ['tests', 'search', filters ?? {}] as const,
  recent: (limit: number) => ['tests', 'recent', { limit }] as const,
}

export function testSearchOptions(filters?: TestFilters) {
  return queryOptions({
    queryKey: testKeys.search(filters),
    queryFn: async ({ signal }) =>
      devCheck(
        TestSchema.array(),
        await testsApi.searchTests(filters ?? {}, signal),
        'tests.search',
      ),
    placeholderData: keepPreviousData,
  })
}

export function testOptions(id: string) {
  return queryOptions({
    queryKey: testKeys.detail(id),
    queryFn: async ({ signal }) =>
      devCheck(TestSchema, await testsApi.getTestById(id, signal), 'tests.getById'),
    enabled: !!id,
  })
}

export function allTestsOptions() {
  return queryOptions({
    queryKey: testKeys.all,
    queryFn: async ({ signal }) =>
      devCheck(TestSchema.array(), await testsApi.getAllTests(undefined, signal), 'tests.getAll'),
  })
}

export function recentTestsOptions(limit = 4) {
  return queryOptions({
    queryKey: testKeys.recent(limit),
    queryFn: async ({ signal }) =>
      devCheck(TestSchema.array(), await testsApi.getRecentTests(limit, signal), 'tests.getRecent'),
  })
}

/**
 * Get all tests enriched with project name, category name, and author name
 * for the archive search page
 */
export function useArchiveSearchData(filters?: TestFilters) {
  const testsQuery = useQuery(testSearchOptions(filters))
  const projectsQuery = useQuery(projectsOptions())
  const categoriesQuery = useQuery(categoriesOptions())

  const tests = useMemo(
    () =>
      testsQuery.data?.map((test) => {
        const project = projectsQuery.data?.find((p) => p.id === test.projectId)
        const category = categoriesQuery.data?.find((c) => c.id === test.categoryId)
        return {
          ...test,
          projectName: project?.name || test.projectId,
          categoryName: category?.name || test.categoryId,
          authorName: test.createdByName || test.metadata?.author || test.createdBy,
        }
      }),
    [testsQuery.data, projectsQuery.data, categoriesQuery.data],
  )

  return {
    tests,
    projects: projectsQuery.data,
    categories: categoriesQuery.data,
    isLoading: testsQuery.isPending || projectsQuery.isPending || categoriesQuery.isPending,
    isError: testsQuery.isError || projectsQuery.isError || categoriesQuery.isError,
    error: testsQuery.error || projectsQuery.error || categoriesQuery.error,
  }
}
