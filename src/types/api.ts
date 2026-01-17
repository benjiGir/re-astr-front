// Types from API Contracts Documentation
// Based on /Users/benji/Developer/re-astr/docs/API_CONTRACTS.md

// ============================================
// Authentication Types
// ============================================

export type UserRole = 'user' | 'contributor' | 'archivist' | 'master'

export interface User {
  id: string
  email: string
  name?: string
  emailVerified: boolean
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  expiresAt: Date
  token: string
  ipAddress?: string
  userAgent?: string
}

export interface AuthResponse {
  user: User
  session: Session
}

// ============================================
// Schema Types
// ============================================

export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'url'
  | 'array'
  | 'object'

export interface FieldValidation {
  // For number
  min?: number
  max?: number

  // For text/email/url
  minLength?: number
  maxLength?: number
  pattern?: string
  enum?: string[]

  // For array
  minItems?: number
  maxItems?: number
  itemType?: FieldType

  // For object
  properties?: Record<string, FieldDefinition>
}

export interface FieldDefinition {
  key: string
  label: string
  type: FieldType
  required: boolean
  validation?: FieldValidation
  defaultValue?: any
}

export interface BaseSchema {
  fields: FieldDefinition[]
}

export interface CustomFieldsSchema {
  allowCustomFields: boolean
  maxCustomFields?: number
  allowedTypes?: FieldType[]
  fields: FieldDefinition[]
}

// ============================================
// Category Types
// ============================================

export interface Category {
  id: string
  name: string
  description?: string
  baseSchema: BaseSchema
  customFieldsSchema: CustomFieldsSchema
  createdAt: Date
  updatedAt: Date
}

export interface CreateCategoryDto {
  name: string
  description?: string
  baseSchema: BaseSchema
  customFieldsSchema?: CustomFieldsSchema
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
  baseSchema?: BaseSchema
  customFieldsSchema?: CustomFieldsSchema
}

// ============================================
// Test Types
// ============================================

export type TestStatus = 'draft' | 'in_progress' | 'completed' | 'failed'

export interface Test {
  id: string
  categoryId: string
  name: string
  description?: string
  status: TestStatus
  commonData: Record<string, any>
  customData: Record<string, any>
  metadata?: Record<string, any>
  createdBy: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface CreateTestDto {
  categoryId: string
  name: string
  description?: string
  status?: TestStatus
  commonData: Record<string, any>
  customData?: Record<string, any>
  metadata?: Record<string, any>
}

export interface UpdateTestDto {
  name?: string
  description?: string
  status?: TestStatus
  commonData?: Record<string, any>
  customData?: Record<string, any>
  metadata?: Record<string, any>
}

// ============================================
// Error Types
// ============================================

export interface ErrorResponse {
  statusCode: number
  message: string | string[]
  error?: string
}