import { Card, Loader, Stack, Text } from '@mantine/core'
import type { FieldDefinition } from '../../types/api'
import { TestDataGrid } from './TestDataGrid'

interface TestDataSectionProps {
  title: string
  description?: string
  fields?: FieldDefinition[]
  data: Record<string, unknown>
  isLoading?: boolean
  emptyLabel?: string
}

export function TestDataSection({
  title,
  description,
  fields,
  data,
  isLoading,
  emptyLabel,
}: TestDataSectionProps) {
  const isEmpty = Object.keys(data).length === 0

  return (
    <Card withBorder radius="md" padding="lg" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
      <Stack gap="md">
        <Stack gap={4}>
          <Text size="md" fw={600} c="#0a0a0a">
            {title}
          </Text>
          {description ? (
            <Text size="sm" c="#717182">
              {description}
            </Text>
          ) : null}
        </Stack>
        {isLoading ? (
          <Loader size="sm" />
        ) : isEmpty && emptyLabel ? (
          <Text size="sm" c="#717182">
            {emptyLabel}
          </Text>
        ) : (
          <TestDataGrid fields={fields} data={data} />
        )}
      </Stack>
    </Card>
  )
}
