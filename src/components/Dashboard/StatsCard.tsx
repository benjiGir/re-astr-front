import { Card, Group, Stack, Text, ThemeIcon } from '@mantine/core'
import type { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: ReactNode
  variant?: 'positive' | 'neutral'
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  variant = 'positive',
}: StatsCardProps) {
  return (
    <Card
      withBorder
      radius="md"
      padding="lg"
      style={{
        borderColor: 'rgba(0, 0, 0, 0.1)',
        height: '150px',
      }}
    >
      <Stack gap="xs" h="100%" justify="space-between">
        {/* Header with title and icon */}
        <Group justify="space-between" align="flex-start">
          <Text size="sm" fw={500} c="#0a0a0a">
            {title}
          </Text>
          <ThemeIcon variant="light" size="sm" color="gray" radius="md">
            {icon}
          </ThemeIcon>
        </Group>

        {/* Main value */}
        <Text size="32px" fw={700} c="#0a0a0a" lh="32px">
          {value}
        </Text>

        {/* Description with variation */}
        <Text size="xs" c={variant === 'positive' ? '#00a63e' : '#717182'} lh="16px">
          {description}
        </Text>
      </Stack>
    </Card>
  )
}
