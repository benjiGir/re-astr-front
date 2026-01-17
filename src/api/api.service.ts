import type { Category, Test } from '../types/api'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

/**
 * Base fetch wrapper with credentials
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw error
  }

  return response.json()
}

// ============================================
// Categories API
// ============================================

export async function getAllCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories')
}

export async function getCategoryById(id: string): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`)
}

// ============================================
// Tests API
// ============================================

export async function getAllTests(categoryId?: string): Promise<Test[]> {
  const params = categoryId ? `?categoryId=${categoryId}` : ''
  return apiFetch<Test[]>(`/tests${params}`)
}

export async function getTestById(id: string): Promise<Test> {
  return apiFetch<Test>(`/tests/${id}`)
}

// ============================================
// Dashboard Statistics
// ============================================

export interface DashboardStats {
  totalTests: number
  testsThisMonth: number
  activeProjects: number
  totalSize: string
}

/**
 * Calculate dashboard statistics from tests and categories
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [tests, categories] = await Promise.all([
    getAllTests(),
    getAllCategories(),
  ])

  // Total number of tests
  const totalTests = tests.length

  // Tests created this month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const testsThisMonth = tests.filter(test => {
    const createdAt = new Date(test.createdAt)
    return createdAt >= startOfMonth
  }).length

  // Unique categories (projects)
  const uniqueCategoryIds = new Set(tests.map(test => test.categoryId))
  const activeProjects = uniqueCategoryIds.size

  // Mock total size for now (would need metadata.fileSize in tests)
  // In a real scenario, this would sum up test.metadata?.fileSize
  const totalSize = calculateTotalSize(tests)

  return {
    totalTests,
    testsThisMonth,
    activeProjects,
    totalSize,
  }
}

/**
 * Calculate total size from tests metadata
 * Falls back to mock data if no metadata.fileSize
 */
function calculateTotalSize(tests: Test[]): string {
  let totalBytes = 0

  for (const test of tests) {
    // Try to get fileSize from metadata
    const fileSize = test.metadata?.fileSize
    if (fileSize && typeof fileSize === 'number') {
      totalBytes += fileSize
    } else {
      // Mock: assign random size between 1MB and 5MB per test
      totalBytes += Math.random() * 4 * 1024 * 1024 + 1024 * 1024
    }
  }

  // Convert bytes to GB
  const totalGB = totalBytes / (1024 * 1024 * 1024)
  return `${totalGB.toFixed(1)} GB`
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