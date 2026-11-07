import { z } from 'zod'

/**
 * Structural mirror of the back's `FieldDefinition`/`FieldValidation` contract
 * (Effect Schema, `re-astr-back/src/domain/schema/CategoryFields.ts`). Pulled
 * forward from Phase 2 because `Category` (Phase 1) already embeds it.
 *
 * `FieldValidation.properties` and `FieldDefinition.validation` are mutually
 * recursive, so — like the back does with `Schema.Struct.Type` — the types
 * are declared as independent interfaces first and the schemas annotated
 * with `z.ZodType<...>` second. Deriving one from the other via `z.infer`
 * circularly fails to compile.
 */
export const FieldTypeSchema = z.enum([
  'text',
  'number',
  'boolean',
  'date',
  'email',
  'url',
  'array',
  'object',
])
export type FieldType = z.infer<typeof FieldTypeSchema>

export interface FieldValidation {
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  enum?: string[]
  minItems?: number
  maxItems?: number
  itemType?: FieldType
  properties?: Record<string, FieldDefinition>
}

export interface FieldDefinition {
  key: string
  label: string
  type: FieldType
  required: boolean
  validation?: FieldValidation
  defaultValue?: unknown
}

export const FieldValidationSchema: z.ZodType<FieldValidation> = z.lazy(() =>
  z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    enum: z.array(z.string()).optional(),
    minItems: z.number().optional(),
    maxItems: z.number().optional(),
    itemType: FieldTypeSchema.optional(),
    properties: z.record(z.string(), FieldDefinitionSchema).optional(),
  }),
)

export const FieldDefinitionSchema: z.ZodType<FieldDefinition> = z.lazy(() =>
  z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    type: FieldTypeSchema,
    required: z.boolean(),
    validation: FieldValidationSchema.optional(),
    defaultValue: z.unknown().optional(),
  }),
)

export const BaseSchemaSchema = z.object({
  fields: z.array(FieldDefinitionSchema),
})
export type BaseSchema = z.infer<typeof BaseSchemaSchema>

export const CustomFieldsSchemaSchema = z.object({
  allowCustomFields: z.boolean(),
  maxCustomFields: z.number().positive().optional(),
  allowedTypes: z.array(FieldTypeSchema).optional(),
  fields: z.array(FieldDefinitionSchema),
})
export type CustomFieldsSchema = z.infer<typeof CustomFieldsSchemaSchema>
