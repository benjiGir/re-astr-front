import { describe, expect, it } from 'vitest'
import {
  buildCategorySchema,
  buildFieldSchema,
  MAX_DEPTH,
  mergeCategoryFields,
} from './build-schema'
import type { BaseSchema, CustomFieldsSchema, FieldDefinition } from './types'

function field(
  overrides: Partial<FieldDefinition> & Pick<FieldDefinition, 'key' | 'type'>,
): FieldDefinition {
  return { label: overrides.key, required: false, ...overrides }
}

describe('buildFieldSchema — one case per type', () => {
  it('text', () => {
    const schema = buildFieldSchema(field({ key: 'name', type: 'text', required: true }))
    expect(schema.safeParse('hello').success).toBe(true)
    expect(schema.safeParse('').success).toBe(false)
  })

  it('number', () => {
    const schema = buildFieldSchema(field({ key: 'age', type: 'number', required: true }))
    expect(schema.safeParse('42').success).toBe(true)
    expect(schema.safeParse(42).success).toBe(true)
  })

  it('boolean', () => {
    const schema = buildFieldSchema(field({ key: 'active', type: 'boolean', required: true }))
    expect(schema.safeParse(true).success).toBe(true)
    expect(schema.safeParse(undefined).success).toBe(false)
  })

  it('date', () => {
    const schema = buildFieldSchema(field({ key: 'when', type: 'date', required: true }))
    expect(schema.safeParse('2026-01-01').success).toBe(true)
    expect(schema.safeParse('not-a-date').success).toBe(false)
  })

  it('email', () => {
    const schema = buildFieldSchema(field({ key: 'contact', type: 'email', required: true }))
    expect(schema.safeParse('a@b.co').success).toBe(true)
    expect(schema.safeParse('not-an-email').success).toBe(false)
  })

  it('url', () => {
    const schema = buildFieldSchema(field({ key: 'site', type: 'url', required: true }))
    expect(schema.safeParse('https://example.com').success).toBe(true)
    expect(schema.safeParse('not-a-url').success).toBe(false)
  })

  it('array', () => {
    const schema = buildFieldSchema(
      field({ key: 'tags', type: 'array', required: true, validation: { itemType: 'text' } }),
    )
    expect(schema.safeParse(['a', 'b']).success).toBe(true)
    expect(schema.safeParse('not-an-array').success).toBe(false)
  })

  it('object', () => {
    const schema = buildFieldSchema(
      field({
        key: 'meta',
        type: 'object',
        required: true,
        validation: {
          properties: {
            note: field({ key: 'note', type: 'text', required: false }),
          },
        },
      }),
    )
    expect(schema.safeParse({ note: 'hi' }).success).toBe(true)
    expect(schema.safeParse({ note: 123 }).success).toBe(false)
  })
})

describe('required vs optional', () => {
  it('optional field accepts undefined and empty string', () => {
    const schema = buildFieldSchema(field({ key: 'nickname', type: 'text', required: false }))
    expect(schema.safeParse(undefined).success).toBe(true)
    expect(schema.safeParse('').success).toBe(true)
  })

  it('required field rejects undefined and empty string', () => {
    const schema = buildFieldSchema(field({ key: 'name', type: 'text', required: true }))
    expect(schema.safeParse(undefined).success).toBe(false)
    expect(schema.safeParse('').success).toBe(false)
  })
})

describe('piège #1 — empty string on a number field must not become 0', () => {
  it('optional number: "" parses to undefined, not 0', () => {
    const schema = buildFieldSchema(field({ key: 'count', type: 'number', required: false }))
    const result = schema.safeParse('')
    expect(result).toMatchObject({ success: true, data: undefined })
  })

  it('required number: "" fails validation instead of coercing to 0', () => {
    const schema = buildFieldSchema(field({ key: 'count', type: 'number', required: true }))
    expect(schema.safeParse('').success).toBe(false)
  })
})

describe('piège #6 — empty enum falls back to plain string instead of throwing', () => {
  it('does not throw building the schema, and validates as a plain string', () => {
    const schema = buildFieldSchema(
      field({ key: 'choice', type: 'text', required: true, validation: { enum: [] } }),
    )
    expect(schema.safeParse('anything').success).toBe(true)
  })
})

describe('piège #8 — invalid regex pattern is ignored, not thrown', () => {
  it('does not throw building the schema, and does not enforce the broken pattern', () => {
    const schema = buildFieldSchema(
      field({
        key: 'code',
        type: 'text',
        required: false,
        validation: { pattern: '(unterminated' },
      }),
    )
    expect(schema.safeParse('anything').success).toBe(true)
  })
})

describe('piège #7 — MAX_DEPTH caps unbounded object nesting', () => {
  function nestedObjectField(depth: number): FieldDefinition {
    if (depth === 0) {
      return field({ key: 'leaf', type: 'text', required: false })
    }
    return field({
      key: `level${depth}`,
      type: 'object',
      required: false,
      validation: { properties: { child: nestedObjectField(depth - 1) } },
    })
  }

  it('falls back to unknown beyond MAX_DEPTH instead of overflowing the stack', () => {
    const deeplyNested = nestedObjectField(MAX_DEPTH + 3)
    expect(() => buildFieldSchema(deeplyNested)).not.toThrow()
    const schema = buildFieldSchema(deeplyNested)
    // Anything parses once the fallback to z.unknown() kicks in.
    expect(schema.safeParse({ anything: 'goes' }).success).toBe(true)
  })
})

describe('buildCategorySchema — duplicate keys', () => {
  it('last field with a given key wins', () => {
    const schema = buildCategorySchema([
      field({ key: 'name', type: 'text', required: true }),
      field({ key: 'name', type: 'number', required: false }),
    ])
    // If "number" won, a string would fail; if "text" won, a string would pass.
    expect(schema.safeParse({ name: 'hello' }).success).toBe(false)
    expect(schema.safeParse({ name: 42 }).success).toBe(true)
  })
})

describe('mergeCategoryFields', () => {
  const base: BaseSchema = {
    fields: [field({ key: 'title', type: 'text', required: true })],
  }

  it('ignores custom fields when allowCustomFields is false', () => {
    const custom: CustomFieldsSchema = {
      allowCustomFields: false,
      fields: [field({ key: 'extra', type: 'text', required: false })],
    }
    expect(mergeCategoryFields(base, custom)).toEqual(base.fields)
  })

  it('drops a custom field that collides with a base field key (base wins)', () => {
    const custom: CustomFieldsSchema = {
      allowCustomFields: true,
      fields: [
        field({ key: 'title', type: 'number', required: false }),
        field({ key: 'extra', type: 'text', required: false }),
      ],
    }
    const merged = mergeCategoryFields(base, custom)
    expect(merged).toHaveLength(2)
    expect(merged.find((f) => f.key === 'title')).toEqual(base.fields[0])
  })

  it('drops custom fields whose type is not in allowedTypes', () => {
    const custom: CustomFieldsSchema = {
      allowCustomFields: true,
      allowedTypes: ['text'],
      fields: [
        field({ key: 'extra', type: 'text', required: false }),
        field({ key: 'blocked', type: 'number', required: false }),
      ],
    }
    const merged = mergeCategoryFields(base, custom)
    expect(merged.map((f) => f.key)).toEqual(['title', 'extra'])
  })

  it('truncates custom fields beyond maxCustomFields', () => {
    const custom: CustomFieldsSchema = {
      allowCustomFields: true,
      maxCustomFields: 1,
      fields: [
        field({ key: 'a', type: 'text', required: false }),
        field({ key: 'b', type: 'text', required: false }),
      ],
    }
    const merged = mergeCategoryFields(base, custom)
    expect(merged.map((f) => f.key)).toEqual(['title', 'a'])
  })
})
