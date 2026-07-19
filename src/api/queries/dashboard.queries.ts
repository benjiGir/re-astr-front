import { queryOptions, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as dashboardApi from '../services/dashboard.service'
import { categoriesOptions } from './categories.queries'
import { recentTestsOptions } from './tests.queries'

export const dashboardKeys = {
  stats: ['dashboard', 'stats'] as const,
}

export function dashboardStatsOptions() {
  return queryOptions({
    queryKey: dashboardKeys.stats,
    queryFn: ({ signal }) => dashboardApi.getDashboardStats(signal),
  })
}

/**
 * Get all dashboard data (stats + recent tests + categories)
 * This hook combines multiple queries and enriches tests with category names
 */
export function useDashboardData() {
  const statsQuery = useQuery(dashboardStatsOptions())
  const recentTestsQuery = useQuery(recentTestsOptions(4))
  const categoriesQuery = useQuery(categoriesOptions())

  // Enrich tests with category names; memoized so unrelated re-renders don't re-scan the list
  const enrichedTests = useMemo(
    () =>
      recentTestsQuery.data?.map((test) => {
        const category = categoriesQuery.data?.find((c) => c.id === test.categoryId)
        return {
          ...test,
          metadata: {
            ...test.metadata,
            categoryName: category?.name || test.categoryId,
          },
        }
      }),
    [recentTestsQuery.data, categoriesQuery.data],
  )

  return {
    stats: statsQuery.data,
    recentTests: enrichedTests,
    isLoading: statsQuery.isPending || recentTestsQuery.isPending || categoriesQuery.isPending,
    isError: statsQuery.isError || recentTestsQuery.isError || categoriesQuery.isError,
    error: statsQuery.error || recentTestsQuery.error || categoriesQuery.error,
    refetch: () => {
      statsQuery.refetch()
      recentTestsQuery.refetch()
      categoriesQuery.refetch()
    },
  }
}
