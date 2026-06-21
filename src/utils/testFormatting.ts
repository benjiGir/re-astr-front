import dayjs from 'dayjs'
import type { Test } from '../types/api'

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD')
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
