import { z } from 'zod'

/**
 * D1 = A+B (docs/PLAN.md §2): Zod schemas are the source of types (A), and in
 * DEV a `safeParse` probe logs contract drift without changing runtime
 * behavior (B). The data always passes through unchanged — this must never
 * throw or alter what callers receive, in dev or prod.
 */
export const devCheck = <T extends z.ZodType>(
  schema: T,
  data: unknown,
  label: string,
): T['_output'] => {
  if (import.meta.env.DEV) {
    const result = schema.safeParse(data)
    if (!result.success) {
      console.warn(`[contract drift] ${label}`, z.treeifyError(result.error))
    }
  }
  return data as T['_output']
}
