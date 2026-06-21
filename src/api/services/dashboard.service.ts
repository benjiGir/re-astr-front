import type { Test } from '../../types/api'
import { getAllProjects } from './projects.service'
import { getAllTests } from './tests.service'

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
  const [tests] = await Promise.all([
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
