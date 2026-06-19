import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '../auth/auth.service.ts'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getSession()

    throw redirect({
      to: session?.data ? '/dashboard' : '/login',
    })
  },
})
