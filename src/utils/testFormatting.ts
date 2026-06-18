import type { Test } from '../types/api'

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format file size from metadata or return N/A
 */
export function formatSize(test: Test): string {
  const fileSize = test.metadata?.fileSize
  if (fileSize && typeof fileSize === 'number') {
    if (fileSize < 1024) {
      return `${fileSize} B`
    }
    if (fileSize < 1024 * 1024) {
      return `${(fileSize / 1024).toFixed(1)} KB`
    }
    if (fileSize < 1024 * 1024 * 1024) {
      return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
    }
    return `${(fileSize / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }
  return 'N/A'
}
