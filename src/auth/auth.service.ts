import { ApiError, apiFetch } from '../api/http'
import type { AuthResponse, SignInDto, SignUpDto, User } from '../types/api'

export async function signUp(dto: SignUpDto): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/sign-up/email', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export async function signIn(dto: SignInDto): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/sign-in/email', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export async function signOut(): Promise<void> {
  await apiFetch<{ success: true }>('/auth/sign-out', { method: 'POST' })
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { user } = await apiFetch<AuthResponse>('/auth/get-session')
    return user
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }
    throw error
  }
}
