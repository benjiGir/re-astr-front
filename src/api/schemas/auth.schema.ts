import { z } from 'zod'

export const UserRoleSchema = z.enum(['user', 'contributor', 'archivist', 'master'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().optional(),
  emailVerified: z.boolean(),
  role: UserRoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof UserSchema>

export const SessionSchema = z.object({
  id: z.string(),
  expiresAt: z.coerce.date(),
  token: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
})
export type Session = z.infer<typeof SessionSchema>

export const AuthResponseSchema = z.object({
  user: UserSchema,
  session: SessionSchema,
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>

export const SignUpDtoSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .optional(),
})
export type SignUpDto = z.infer<typeof SignUpDtoSchema>

export const SignInDtoSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
export type SignInDto = z.infer<typeof SignInDtoSchema>
