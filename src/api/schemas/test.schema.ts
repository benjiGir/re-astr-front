import { z } from 'zod'

export const TestStatusSchema = z.enum(['draft', 'in_progress', 'completed', 'failed', 'archived'])
export type TestStatus = z.infer<typeof TestStatusSchema>

// commonData/customData/metadata are untyped bags (category-defined shape,
// see Phase 2) — z.any() here mirrors the original `Record<string, any>`
// exactly, deliberately, rather than `unknown` which would force casts at
// every existing call site for a contract this phase doesn't harden.
export const TestSchema = z.object({
  id: z.uuid(),
  projectId: z.uuid(),
  categoryId: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  status: TestStatusSchema,
  commonData: z.record(z.string(), z.any()),
  customData: z.record(z.string(), z.any()),
  metadata: z.record(z.string(), z.any()).optional(),
  createdBy: z.uuid(),
  createdByName: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  completedAt: z.coerce.date().optional(),
})
export type Test = z.infer<typeof TestSchema>

export const CreateTestDtoSchema = z.object({
  projectId: z.uuid(),
  categoryId: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'completed', 'failed']).optional(),
  commonData: z.record(z.string(), z.any()),
  customData: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})
export type CreateTestDto = z.infer<typeof CreateTestDtoSchema>

export const UpdateTestDtoSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: TestStatusSchema.optional(),
  commonData: z.record(z.string(), z.any()).optional(),
  customData: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})
export type UpdateTestDto = z.infer<typeof UpdateTestDtoSchema>
