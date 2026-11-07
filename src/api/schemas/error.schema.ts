import { z } from 'zod'

// Effect backend errors are `_tag`-discriminated rather than a single generic
// envelope. `_tag` is an unconstrained string (see docs/LEARNINGS.md, D2) —
// no discriminated union is possible here without a stricter back contract.

export const ValidationFieldErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
})
export type ValidationFieldError = z.infer<typeof ValidationFieldErrorSchema>

export const ValidationFailedErrorSchema = z.object({
  _tag: z.literal('ValidationFailed'),
  context: z.string(),
  errors: z.array(ValidationFieldErrorSchema),
})
export type ValidationFailedError = z.infer<typeof ValidationFailedErrorSchema>

export const ApiErrorBodySchema = z
  .object({
    _tag: z.string(),
  })
  .catchall(z.unknown())
export type ApiErrorBody = z.infer<typeof ApiErrorBodySchema>
