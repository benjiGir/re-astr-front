import { z } from 'zod'
import { BaseSchemaSchema, CustomFieldsSchemaSchema } from '../../domain/dynamic-fields/types'

export const CategorySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  baseSchema: BaseSchemaSchema,
  customFieldsSchema: CustomFieldsSchemaSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Category = z.infer<typeof CategorySchema>

export const CreateCategoryDtoSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  baseSchema: BaseSchemaSchema,
  customFieldsSchema: CustomFieldsSchemaSchema.optional(),
})
export type CreateCategoryDto = z.infer<typeof CreateCategoryDtoSchema>

export const UpdateCategoryDtoSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  baseSchema: BaseSchemaSchema.optional(),
  customFieldsSchema: CustomFieldsSchemaSchema.optional(),
})
export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDtoSchema>
