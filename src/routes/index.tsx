import { createFileRoute, redirect } from '@tanstack/react-router'
import { userQueryOptions } from '../auth/auth.queries'
import { queryClient } from '../services/queryClient.ts'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const user = await queryClient.ensureQueryData(userQueryOptions)

    throw redirect({
      to: user ? '/dashboard' : '/login',
    })
  },
})
