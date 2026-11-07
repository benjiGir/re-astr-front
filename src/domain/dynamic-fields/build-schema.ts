import { z } from 'zod'
import type {
  BaseSchema,
  CustomFieldsSchema,
  FieldDefinition,
  FieldType,
  FieldValidation,
} from './types'
import { devWarn } from './warn'

/** Piège #7: unbounded `properties` nesting → stack overflow on malformed data. */
export const MAX_DEPTH = 5

/** Piège #1/#2: normalize empty input to `undefined` once, centrally, so no
 * per-type coercion (`Number('') === 0`) can silently corrupt a value —
 * applied *before* `.optional()` sees it, per the correct preprocess order. */
function emptyToUndefined(value: unknown): unknown {
  return value === '' || value === null ? undefined : value
}

const APPLICABLE_VALIDATION_KEYS: Record<FieldType, ReadonlySet<keyof FieldValidation>> = {
  text: new Set(['minLength', 'maxLength', 'pattern', 'enum']),
  email: new Set(['minLength', 'maxLength', 'pattern', 'enum']),
  url: new Set(['minLength', 'maxLength', 'pattern', 'enum']),
  number: new Set(['min', 'max']),
  boolean: new Set(),
  date: new Set(['min', 'max']),
  array: new Set(['minItems', 'maxItems', 'itemType']),
  object: new Set(['properties']),
}

/** Q1: `validation` is a flat bag applicable to any type structurally
 * (`{ type: 'boolean', validation: { minLength: 5 } }` is valid shape-wise).
 * We ignore what doesn't apply to this field's type and warn in DEV. */
function warnIrrelevantValidations(field: FieldDefinition): void {
  if (!field.validation) return
  const applicable = APPLICABLE_VALIDATION_KEYS[field.type]
  for (const key of Object.keys(field.validation)) {
    if (!applicable.has(key as keyof FieldValidation)) {
      devWarn(`field "${field.key}" (${field.type}): validation.${key} is not applicable, ignored`)
    }
  }
}

function buildStringLikeSchema(field: FieldDefinition, base: z.ZodType<string>): z.ZodType {
  const v = field.validation ?? {}
  if (v.enum !== undefined) {
    if (v.enum.length === 0) {
      // Piège #6: z.enum() throws on an empty tuple — fall back to the plain base schema.
      devWarn(`field "${field.key}": validation.enum is empty, falling back to plain string`)
    } else {
      return z.enum(v.enum as [string, ...string[]])
    }
  }

  // `.check()` (not `.min()`/`.max()`/`.regex()`) so this works uniformly on
  // whatever concrete string schema is passed in — z.string(), z.email() and
  // z.url() are different classes and don't share a public min/max/regex-
  // returning supertype, but all accept `.check()`.
  const checks: z.core.$ZodCheck<string>[] = []
  if (typeof v.minLength === 'number') checks.push(z.minLength(v.minLength))
  if (typeof v.maxLength === 'number') checks.push(z.maxLength(v.maxLength))
  if (v.pattern) {
    try {
      checks.push(z.regex(new RegExp(v.pattern)))
    } catch {
      // Piège #8: `pattern` is server-supplied and may not be a valid regex.
      devWarn(`field "${field.key}": invalid regex pattern, ignored`, v.pattern)
    }
  }
  // Piège #3: the empty-input guard must also apply to required fields, not
  // just optional ones — minLength(1) blocks both "" and whitespace-only
  // input (trimmed to "" for `text`) from satisfying a required field.
  if (field.required) checks.push(z.minLength(1))
  return checks.length > 0 ? base.check(...checks) : base
}

function buildNumberSchema(field: FieldDefinition): z.ZodType {
  const { min, max } = field.validation ?? {}
  let schema = z.coerce.number()
  if (typeof min === 'number') schema = schema.min(min)
  if (typeof max === 'number') schema = schema.max(max)
  return schema
}

function buildDateSchema(field: FieldDefinition): z.ZodType {
  // Q3: validation.min/max on a date are assumed to be epoch milliseconds.
  const { min, max } = field.validation ?? {}
  return z.string().refine((value) => {
    const time = new Date(value).getTime()
    if (Number.isNaN(time)) return false
    if (typeof min === 'number' && time < min) return false
    if (typeof max === 'number' && time > max) return false
    return true
  }, 'Invalid date, or outside the allowed range')
}

function buildPrimitiveItemSchema(type: FieldType): z.ZodType {
  switch (type) {
    case 'text':
      return z.string()
    case 'email':
      return z.email()
    case 'url':
      return z.url()
    case 'number':
      return z.coerce.number()
    case 'boolean':
      return z.boolean()
    case 'date':
      return z.string()
    case 'array':
      return z.array(z.unknown())
    case 'object':
      // Q2: itemType is a FieldType, not a FieldDefinition — an array of
      // objects can't describe its items' shape. Real contract limit.
      return z.record(z.string(), z.unknown())
    default:
      return z.unknown()
  }
}

function buildArraySchema(field: FieldDefinition): z.ZodType {
  const { minItems, maxItems, itemType } = field.validation ?? {}
  let schema = z.array(itemType ? buildPrimitiveItemSchema(itemType) : z.unknown())
  if (typeof minItems === 'number') schema = schema.min(minItems)
  if (typeof maxItems === 'number') schema = schema.max(maxItems)
  return schema
}

function buildObjectSchema(field: FieldDefinition, depth: number): z.ZodType {
  const properties = field.validation?.properties
  if (!properties) return z.record(z.string(), z.unknown())

  if (depth >= MAX_DEPTH) {
    devWarn(
      `field "${field.key}": max nesting depth (${MAX_DEPTH}) reached, falling back to unknown`,
    )
    return z.unknown()
  }

  const shape: Record<string, z.ZodType> = {}
  for (const [propKey, subField] of Object.entries(properties)) {
    // Q4: `properties`'s own key and the nested FieldDefinition.key can
    // diverge — the Record key wins, since that's what addresses the value.
    if (subField.key !== propKey) {
      devWarn(
        `field "${field.key}.${propKey}": properties key differs from nested key "${subField.key}", using "${propKey}"`,
      )
    }
    shape[propKey] = buildFieldSchema(subField, depth + 1)
  }
  return z.object(shape)
}

function buildPresentValueSchema(field: FieldDefinition, depth: number): z.ZodType {
  switch (field.type) {
    case 'text':
      return buildStringLikeSchema(field, z.string().trim())
    case 'email':
      return buildStringLikeSchema(field, z.email())
    case 'url':
      return buildStringLikeSchema(field, z.url())
    case 'number':
      return buildNumberSchema(field)
    case 'boolean':
      return z.boolean()
    case 'date':
      return buildDateSchema(field)
    case 'array':
      return buildArraySchema(field)
    case 'object':
      return buildObjectSchema(field, depth)
    default:
      return z.unknown()
  }
}

export function buildFieldSchema(field: FieldDefinition, depth = 0): z.ZodType {
  warnIrrelevantValidations(field)
  const presentSchema = buildPresentValueSchema(field, depth)
  const schema = field.required ? presentSchema : presentSchema.optional()
  return z.preprocess(emptyToUndefined, schema)
}

export function buildCategorySchema(
  fields: FieldDefinition[],
): z.ZodObject<Record<string, z.ZodType>> {
  const shape: Record<string, z.ZodType> = {}
  const seenKeys = new Set<string>()
  for (const field of fields) {
    // Piège #9: duplicate keys within the same field list — last one wins,
    // same as any plain object literal would, just warned in DEV.
    if (seenKeys.has(field.key)) {
      devWarn(`duplicate field key "${field.key}" in category schema, last one wins`)
    }
    seenKeys.add(field.key)
    shape[field.key] = buildFieldSchema(field)
  }
  return z.object(shape)
}

/**
 * Combines a category's fixed `baseSchema.fields` with its
 * `customFieldsSchema.fields`, honoring `allowCustomFields`/`allowedTypes`/
 * `maxCustomFields` and resolving key collisions in favor of the base field
 * (piège #9) — the base structure is what the category is defined by, custom
 * fields are supplementary.
 */
export function mergeCategoryFields(
  base: BaseSchema,
  custom?: CustomFieldsSchema,
): FieldDefinition[] {
  if (!custom?.allowCustomFields) return base.fields

  const baseKeys = new Set(base.fields.map((f) => f.key))
  let customFields = custom.fields

  if (custom.allowedTypes) {
    const allowedTypes = new Set(custom.allowedTypes)
    customFields = customFields.filter((field) => {
      if (allowedTypes.has(field.type)) return true
      devWarn(`custom field "${field.key}": type "${field.type}" not in allowedTypes, dropped`)
      return false
    })
  }

  const deduped: FieldDefinition[] = []
  for (const field of customFields) {
    if (baseKeys.has(field.key)) {
      devWarn(`custom field "${field.key}" collides with a base field, base wins`)
      continue
    }
    deduped.push(field)
  }

  if (typeof custom.maxCustomFields === 'number' && deduped.length > custom.maxCustomFields) {
    devWarn(`custom fields exceed maxCustomFields (${custom.maxCustomFields}), truncated`)
    return [...base.fields, ...deduped.slice(0, custom.maxCustomFields)]
  }

  return [...base.fields, ...deduped]
}
