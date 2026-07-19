import type { Test, TestStatus } from '../../types/api'
import { apiFetch } from '../http'

export async function getAllTests(categoryId?: string, signal?: AbortSignal): Promise<Test[]> {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''
  return apiFetch<Test[]>(`/tests${query}`, { signal })
}

export interface TestSearchFilters {
  categoryId?: string
  projectId?: string
  status?: TestStatus
  search?: string
}

/**
 * The backend only supports filtering by categoryId (GET /tests?categoryId=),
 * so projectId/status/search are applied client-side on top of that result.
 */
export async function searchTests(
  filters: TestSearchFilters,
  signal?: AbortSignal,
): Promise<Test[]> {
  const tests = await getAllTests(filters.categoryId, signal)

  return tests.filter((test) => {
    if (filters.projectId && test.projectId !== filters.projectId) {
      return false
    }
    if (filters.status && test.status !== filters.status) {
      return false
    }
    if (filters.search) {
      const query = filters.search.toLowerCase()
      const matchesName = test.name.toLowerCase().includes(query)
      const matchesDescription = test.description?.toLowerCase().includes(query)
      if (!matchesName && !matchesDescription) {
        return false
      }
    }
    return true
  })
}

export async function getTestById(id: string, signal?: AbortSignal): Promise<Test> {
  return apiFetch<Test>(`/tests/${id}`, { signal })
}

/**
 * Get recent tests sorted by creation date
 */
export async function getRecentTests(limit = 4, signal?: AbortSignal): Promise<Test[]> {
  const tests = await getAllTests(undefined, signal)

  return tests
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}
