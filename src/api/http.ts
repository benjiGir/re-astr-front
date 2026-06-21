const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

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
    const error = await response.json()
    throw error
  }

  return response.json()
}
