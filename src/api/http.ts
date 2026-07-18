import type { ApiErrorBody, ValidationFailedError } from '../types/api'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

/**
 * Thrown for any non-ok response. `tag` mirrors the backend's `_tag`
 * discriminant (e.g. "ProjectNotFound", "ProjectHasTests", "Forbidden") so
 * callers can branch on it; `body` carries the raw error payload for cases
 * with extra fields (ValidationFailed's `errors`, NotFound's `id`, ...).
 * A malformed-payload 400 has no body, so `tag`/`body` are undefined then.
 */
export class ApiError extends Error {
  readonly status: number
  readonly tag?: string
  readonly body?: ApiErrorBody

  constructor(status: number, body?: ApiErrorBody) {
    super(buildMessage(status, body))
    this.name = 'ApiError'
    this.status = status
    this.tag = body?._tag
    this.body = body
  }
}

function buildMessage(status: number, body?: ApiErrorBody): string {
  if (!body) {
    return `Request failed with status ${status}`
  }
  if (body._tag === 'ValidationFailed') {
    const { errors } = body as unknown as ValidationFailedError
    return errors.map((e) => `${e.field}: ${e.message}`).join(', ')
  }
  return body._tag
}

/**
 * Base fetch wrapper with credentials
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    const body = text ? (JSON.parse(text) as ApiErrorBody) : undefined
    throw new ApiError(response.status, body)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}
