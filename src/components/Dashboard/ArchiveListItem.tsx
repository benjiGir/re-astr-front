import { Badge, Box, Group, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconFile, IconFolder } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import type { TestStatus } from '../../types/api'

interface ArchiveListItemProps {
  title: string
  category: string
  testType: string
  date: string
  size: string
  status: TestStatus
}

const statusConfig: Record<TestStatus, { bg: string; color: string; variant: 'filled' | 'outline' }> = {
  draft: {
    bg: '#eceef2',
    color: '#030213',
    variant: 'filled',
  },
  in_progress: {
    bg: '#030213',
    color: 'white',
    variant: 'filled',
  },
  completed: {
    bg: 'transparent',
    color: '#0a0a0a',
    variant: 'outline',
  },
  failed: {
    bg: '#ff6b6b',
    color: 'white',
    variant: 'filled',
  },
}

export function ArchiveListItem({
  title,
  category,
  testType,
  date,
  size,
  status,
}: ArchiveListItemProps) {
  const { t } = useTranslation()
  const statusStyle = statusConfig[status]

  return (
    <Box
      style={{
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
        padding: '16px',
        minHeight: '78px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      {/* Icon */}
      <ThemeIcon size={32} radius="md" variant="light" color="blue">
        <IconFile size={20} />
      </ThemeIcon>

      {/* Main content */}
      <Stack gap={4} style={{ flex: 1 }}>
        <Text size="md" fw={500} c="#0a0a0a">
          {title}
        </Text>
        <Group gap={8} align="center">
          <IconFolder size={12} color="#717182" />
          <Text size="sm" c="#717182">
            {category}
          </Text>
          <Text size="sm" c="#717182">
            •
          </Text>
          <Text size="sm" c="#717182">
            {testType}
          </Text>
        </Group>
      </Stack>

      {/* Date and size */}
      <Stack gap={0} align="flex-end" style={{ minWidth: '80px' }}>
        <Text size="sm" c="#717182">
          {date}
        </Text>
        <Text size="sm" c="#717182">
          {size}
        </Text>
      </Stack>

      {/* Status badge */}
      <Badge
        variant={statusStyle.variant}
        radius="md"
        style={{
          backgroundColor: statusStyle.bg,
          color: statusStyle.color,
          borderColor: status === 'completed' ? 'rgba(0, 0, 0, 0.1)' : undefined,
        }}
      >
        {t(`status.${status}`)}
      </Badge>
    </Box>
  )
}