import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { SignInDto, SignUpDto } from '../types/api'
import * as authApi from './auth.service'

export const userQueryKey = ['user']

export const userQueryOptions = queryOptions({
  queryKey: userQueryKey,
  queryFn: authApi.getCurrentUser,
})

export function useSignIn(redirectTo?: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (dto: SignInDto) => authApi.signIn(dto),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(userQueryKey, user)
      if (redirectTo) {
        navigate({ href: redirectTo })
      } else {
        navigate({ to: '/dashboard' })
      }
    },
  })
}

export function useSignUp() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (dto: SignUpDto) => authApi.signUp(dto),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(userQueryKey, user)
      navigate({ to: '/dashboard' })
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: userQueryKey })
      navigate({ to: '/login' })
    },
  })
}
