import type { TestStatus } from '../types/api'

export interface StatusBadgeStyle {
  bg: string
  color: string
  variant: 'filled' | 'outline'
  borderColor?: string
}

const statusConfig: Record<TestStatus, StatusBadgeStyle> = {
  draft: {
    bg: '#eceef2',
    color: '#030213',
    variant: 'filled',
  },
  in_progress: {
    bg: '#030213',
    color: 'white',
    variant: 'filled',
  },
  completed: {
    bg: 'transparent',
    color: '#0a0a0a',
    variant: 'outline',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  failed: {
    bg: '#ff6b6b',
    color: 'white',
    variant: 'filled',
  },
}

export function getStatusBadgeStyle(status: TestStatus): StatusBadgeStyle {
  return statusConfig[status]
}
