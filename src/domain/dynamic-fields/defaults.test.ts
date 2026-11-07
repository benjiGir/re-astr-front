import { describe, expect, it } from 'vitest'
import { buildDefaultValues } from './defaults'
import type { FieldDefinition } from './types'

function field(
  overrides: Partial<FieldDefinition> & Pick<FieldDefinition, 'key' | 'type'>,
): FieldDefinition {
  return { label: overrides.key, required: false, ...overrides }
}

describe('buildDefaultValues', () => {
  it('uses defaultValue when it matches the field schema', () => {
    const values = buildDefaultValues([field({ key: 'name', type: 'text', defaultValue: 'Ada' })])
    expect(values).toEqual({ name: 'Ada' })
  })

  it('Q5: falls back to an empty value when defaultValue does not match the field type', () => {
    const values = buildDefaultValues([
      field({ key: 'age', type: 'number', defaultValue: 'not-a-number' }),
    ])
    expect(values).toEqual({ age: undefined })
  })

  it('falls back to an empty value per type when no defaultValue is given', () => {
    const values = buildDefaultValues([
      field({ key: 'name', type: 'text' }),
      field({ key: 'age', type: 'number' }),
      field({ key: 'active', type: 'boolean' }),
      field({ key: 'tags', type: 'array' }),
      field({ key: 'meta', type: 'object' }),
    ])
    expect(values).toEqual({
      name: '',
      age: undefined,
      active: false,
      tags: [],
      meta: {},
    })
  })
})
