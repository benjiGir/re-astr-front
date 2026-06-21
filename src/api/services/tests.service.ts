import type { Test, TestStatus } from '../../types/api'
import { apiFetch } from '../http'

export async function getAllTests(): Promise<Test[]> {
  return apiFetch<Test[]>('/tests')
}

export interface TestSearchFilters {
  categoryId?: string
  projectId?: string
  status?: TestStatus
  search?: string
}

export async function searchTests(filters: TestSearchFilters): Promise<Test[]> {
  return apiFetch<Test[]>('/tests/search', {
    method: 'POST',
    body: JSON.stringify(filters),
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
