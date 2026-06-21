import { useQuery } from '@tanstack/react-query'
import { useCategories } from './categories.queries'
import * as dashboardApi from '../services/dashboard.service'
import { useRecentTests } from './tests.queries'

export const dashboardKeys = {
  stats: ['dashboard', 'stats'] as const,
}

/**
 * Get dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: dashboardApi.getDashboardStats,
  })
}

/**
 * Get all dashboard data (stats + recent tests + categories)
 * This hook combines multiple queries and enriches tests with category names
 */
export function useDashboardData() {
  const statsQuery = useDashboardStats()
  const recentTestsQuery = useRecentTests(4)
  const categoriesQuery = useCategories()

  // Enrich tests with category names
  const enrichedTests = recentTestsQuery.data?.map((test) => {
    const category = categoriesQuery.data?.find((c) => c.id === test.categoryId)
    return {
      ...test,
      metadata: {
        ...test.metadata,
        categoryName: category?.name || test.categoryId,
      },
    }
  })

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
