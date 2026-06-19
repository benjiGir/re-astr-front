import { useQuery } from '@tanstack/react-query'
import * as api from './api.service'

// ============================================
// Query Keys
// ============================================

export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
  },
  tests: {
    all: ['tests'] as const,
    list: (filters?: { categoryId?: string; projectId?: string }) =>
      filters ? ['tests', filters] as const : ['tests'] as const,
    detail: (id: string) => ['tests', id] as const,
    recent: (limit: number) => ['tests', 'recent', { limit }] as const,
  },
  categories: {
    all: ['categories'] as const,
    detail: (id: string) => ['categories', id] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
  },
}

// ============================================
// Project Queries
// ============================================

/**
 * Get all projects
 */
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: api.getAllProjects,
  })
}

/**
 * Get project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => api.getProjectById(id),
    enabled: !!id,
  })
}

// ============================================
// Category Queries
// ============================================

/**
 * Get all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: api.getAllCategories,
  })
}

/**
 * Get category by ID
 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => api.getCategoryById(id),
    enabled: !!id,
  })
}

// ============================================
// Test Queries
// ============================================

/**
 * Get all tests (optionally filtered by category and/or project)
 */
export function useTests(filters?: { categoryId?: string; projectId?: string }) {
  return useQuery({
    queryKey: queryKeys.tests.list(filters),
    queryFn: () => api.getAllTests(filters),
  })
}

/**
 * Get test by ID
 */
export function useTest(id: string) {
  return useQuery({
    queryKey: queryKeys.tests.detail(id),
    queryFn: () => api.getTestById(id),
    enabled: !!id,
  })
}

/**
 * Get recent tests
 */
export function useRecentTests(limit = 4) {
  return useQuery({
    queryKey: queryKeys.tests.recent(limit),
    queryFn: () => api.getRecentTests(limit),
  })
}

// ============================================
// Dashboard Queries
// ============================================

/**
 * Get dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: api.getDashboardStats,
  })
}

// ============================================
// Combined Dashboard Query
// ============================================

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