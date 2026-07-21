import dayjs from 'dayjs'
import type { FieldDefinition, Test } from '../types/api'

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

/**
 * Turn a raw data key (e.g. "expectedResult") into a human-readable label
 * for fields that aren't described by a category schema.
 */
export function humanizeKey(key: string): string {
  const withSpaces = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

/**
 * Render a recorded field value as display text, formatting it according to
 * its schema type when a field definition is available.
 */
export function formatFieldValue(value: unknown, field?: FieldDefinition): string {
  if (value === undefined || value === null || value === '') {
    return '—'
  }

  const type = field?.type
  if (type === 'boolean') {
    return value ? 'Oui' : 'Non'
  }
  if (type === 'date' && (typeof value === 'string' || value instanceof Date)) {
    const parsed = dayjs(value)
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : String(value)
  }
  if (type === 'array' || type === 'object' || typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non'
  }
  return String(value)
}
