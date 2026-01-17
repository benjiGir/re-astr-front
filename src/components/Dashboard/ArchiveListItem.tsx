import { Badge, Box, Group, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconFile, IconFolder } from '@tabler/icons-react'

type ArchiveStatus = 'active' | 'in_progress' | 'completed'

interface ArchiveListItemProps {
  title: string
  category: string
  testType: string
  date: string
  size: string
  status: ArchiveStatus
}

const statusConfig = {
  active: {
    label: 'Active',
    bg: '#030213',
    color: 'white',
    variant: 'filled' as const,
  },
  in_progress: {
    label: 'En cours',
    bg: '#eceef2',
    color: '#030213',
    variant: 'filled' as const,
  },
  completed: {
    label: 'Terminé',
    bg: 'transparent',
    color: '#0a0a0a',
    variant: 'outline' as const,
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
        {statusStyle.label}
      </Badge>
    </Box>
  )
}