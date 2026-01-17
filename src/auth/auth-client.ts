import { createAuthClient } from 'better-auth/react'

type BetterAuthClient = ReturnType<typeof createAuthClient>

export const authClient: BetterAuthClient = createAuthClient({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/auth`,
})
