/**
 * Test metadata constants
 * These are configuration values used across the application
 */

export const TEST_TYPES = ['integration', 'e2e', 'performance', 'security', 'unit'] as const

export const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const

export type TestType = (typeof TEST_TYPES)[number]
export type Priority = (typeof PRIORITIES)[number]
