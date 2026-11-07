import { buildFieldSchema } from './build-schema'
import type { FieldDefinition, FieldType } from './types'
import { devWarn } from './warn'

function emptyValueForType(type: FieldType): unknown {
  switch (type) {
    case 'text':
    case 'email':
    case 'url':
    case 'date':
      return ''
    case 'boolean':
      return false
    case 'array':
      return []
    case 'object':
      return {}
    case 'number':
    default:
      return undefined
  }
}

/**
 * Q5: `defaultValue` is never validated against its field's own type by the
 * contract — a category could ship `{ type: 'number', defaultValue: 'oops' }`.
 * Validate it here against the field's own schema and fall back to an empty
 * value rather than handing RHF a value that fails validation on mount.
 */
export function buildDefaultValues(fields: FieldDefinition[]): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      const result = buildFieldSchema(field).safeParse(field.defaultValue)
      if (result.success) {
        values[field.key] = result.data
        continue
      }
      devWarn(
        `field "${field.key}": defaultValue incompatible with schema, using empty value`,
        result.error.issues,
      )
    }
    values[field.key] = emptyValueForType(field.type)
  }
  return values
}
