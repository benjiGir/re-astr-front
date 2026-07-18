import type { Test, TestStatus } from '../../types/api'
import { apiFetch } from '../http'

export async function getAllTests(categoryId?: string): Promise<Test[]> {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''
  return apiFetch<Test[]>(`/tests${query}`)
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
export async function searchTests(filters: TestSearchFilters): Promise<Test[]> {
  const tests = await getAllTests(filters.categoryId)

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

export async function getTestById(id: string): Promise<Test> {
  return apiFetch<Test>(`/tests/${id}`)
}

/**
 * Get recent tests sorted by creation date
 */
export async function getRecentTests(limit = 4): Promise<Test[]> {
  const tests = await getAllTests()

  return tests
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}
