import { Code, SimpleGrid, Stack, Text } from '@mantine/core'
import type { FieldDefinition } from '../../types/api'
import { formatFieldValue, humanizeKey } from '../../utils/testFormatting'

interface TestDataGridProps {
  fields?: FieldDefinition[]
  data: Record<string, unknown>
}

interface DisplayEntry {
  key: string
  label: string
  field?: FieldDefinition
  value: unknown
}

export function TestDataGrid({ fields, data }: TestDataGridProps) {
  const fieldsByKey = new Map((fields ?? []).map((field) => [field.key, field]))
  const orderedKeys = [
    ...(fields ?? []).map((field) => field.key),
    ...Object.keys(data).filter((key) => !fieldsByKey.has(key)),
  ]

  const entries: DisplayEntry[] = orderedKeys.map((key) => {
    const field = fieldsByKey.get(key)
    return {
      key,
      label: field?.label ?? humanizeKey(key),
      field,
      value: data[key],
    }
  })

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      {entries.map((entry) => {
        const isMultiline = entry.field?.type === 'array' || entry.field?.type === 'object'
        const formatted = formatFieldValue(entry.value, entry.field)

        return (
          <Stack key={entry.key} gap={2}>
            <Text size="xs" c="#717182">
              {entry.label}
            </Text>
            {isMultiline ? (
              <Code block>{formatted}</Code>
            ) : (
              <Text size="sm" fw={500} c="#0a0a0a">
                {formatted}
              </Text>
            )}
          </Stack>
        )
      })}
    </SimpleGrid>
  )
}
