import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { TestStatus } from '../../types/api'
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
  search: (filters?: TestFilters) => ['tests', 'search', filters ?? {}] as const,
  recent: (limit: number) => ['tests', 'recent', { limit }] as const,
}

export function testSearchOptions(filters?: TestFilters) {
  return queryOptions({
    queryKey: testKeys.search(filters),
    queryFn: ({ signal }) => testsApi.searchTests(filters ?? {}, signal),
    placeholderData: keepPreviousData,
  })
}

export function allTestsOptions() {
  return queryOptions({
    queryKey: testKeys.all,
    queryFn: ({ signal }) => testsApi.getAllTests(undefined, signal),
  })
}

export function recentTestsOptions(limit = 4) {
  return queryOptions({
    queryKey: testKeys.recent(limit),
    queryFn: ({ signal }) => testsApi.getRecentTests(limit, signal),
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
