import { ActionIcon, Badge, Card, Group, Stack, Text } from '@mantine/core'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../utils/testFormatting'

interface EntityCardProps {
  name: string
  description?: string
  createdAt: Date
  archiveCount: number
  onEdit: () => void
  onDelete: () => void
}

export function EntityCard({
  name,
  description,
  createdAt,
  archiveCount,
  onEdit,
  onDelete,
}: EntityCardProps) {
  const { t } = useTranslation()

  return (
    <Card withBorder radius="md" padding="lg" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text fw={600} size="md" c="#0a0a0a">
            {name}
          </Text>
          <Group gap={4} wrap="nowrap">
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label={t('common:actions.edit')}
              onClick={onEdit}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              aria-label={t('common:actions.delete')}
              onClick={onDelete}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {description ? (
          <Text size="sm" c="#717182">
            {description}
          </Text>
        ) : null}

        <Group justify="space-between" mt="xs">
          <Stack gap={0}>
            <Text size="xs" c="#717182">
              {t('projectsCategories.archives')}
            </Text>
            <Text size="sm" fw={500} c="#0a0a0a">
              {archiveCount}
            </Text>
          </Stack>
          <Stack gap={0}>
            <Text size="xs" c="#717182">
              {t('projectsCategories.status')}
            </Text>
            <Badge
              variant="filled"
              radius="md"
              style={{ backgroundColor: '#eceef2', color: '#030213' }}
            >
              {t('projectsCategories.statusActive')}
            </Badge>
          </Stack>
          <Stack gap={0}>
            <Text size="xs" c="#717182">
              {t('projectsCategories.createdAt')}
            </Text>
            <Text size="sm" fw={500} c="#0a0a0a">
              {formatDate(createdAt)}
            </Text>
          </Stack>
        </Group>
      </Stack>
    </Card>
  )
}
