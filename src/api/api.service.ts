import type { Category, Project, Test, TestStatus } from '../types/api'

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
// Projects API
// ============================================

export async function getAllProjects(): Promise<Project[]> {
  return apiFetch<Project[]>('/projects')
}

export async function getProjectById(id: string): Promise<Project> {
  return apiFetch<Project>(`/projects/${id}`)
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
 * Calculate dashboard statistics from tests, projects, and categories
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [tests, projects] = await Promise.all([
    getAllTests(),
    getAllProjects(),
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

  // Active projects (projects that have at least one test)
  const projectsWithTests = new Set(tests.map(test => test.projectId))
  const activeProjects = projectsWithTests.size

  // Calculate total size from test.metadata.fileSize
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
 * Returns 'N/A' if no file sizes are available
 */
function calculateTotalSize(tests: Test[]): string {
  let totalBytes = 0
  let hasAnySize = false

  for (const test of tests) {
    // Try to get fileSize from metadata
    const fileSize = test.metadata?.fileSize
    if (fileSize && typeof fileSize === 'number') {
      totalBytes += fileSize
      hasAnySize = true
    }
  }

  // If no tests have file size data, return N/A
  if (!hasAnySize) {
    return 'N/A'
  }

  // Convert bytes to appropriate unit
  if (totalBytes < 1024) {
    return `${totalBytes} B`
  }
  if (totalBytes < 1024 * 1024) {
    return `${(totalBytes / 1024).toFixed(1)} KB`
  }
  if (totalBytes < 1024 * 1024 * 1024) {
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
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