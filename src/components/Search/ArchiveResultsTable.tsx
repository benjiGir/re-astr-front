import { ActionIcon, Badge, Group, Stack, Table, Text } from '@mantine/core'
import { IconDownload, IconEye } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import type { Test } from '../../types/api'
import { formatDate, formatSize } from '../../utils/testFormatting'
import { getStatusBadgeStyle } from '../../utils/testStatus'

export type ArchiveSearchResult = Test & {
  projectName: string
  categoryName: string
  authorName: string
}

interface ArchiveResultsTableProps {
  tests: ArchiveSearchResult[]
}

export function ArchiveResultsTable({ tests }: ArchiveResultsTableProps) {
  const { t } = useTranslation()

  return (
    <Table verticalSpacing="md" highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{t('search.table.archive')}</Table.Th>
          <Table.Th>{t('search.table.project')}</Table.Th>
          <Table.Th>{t('search.table.category')}</Table.Th>
          <Table.Th>{t('search.table.author')}</Table.Th>
          <Table.Th>{t('search.table.date')}</Table.Th>
          <Table.Th>{t('search.table.status')}</Table.Th>
          <Table.Th>{t('search.table.actions')}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {tests.map((test) => {
          const statusStyle = getStatusBadgeStyle(test.status)
          const version = test.metadata?.version
          return (
            <Table.Tr key={test.id}>
              <Table.Td>
                <Stack gap={2}>
                  <Text size="sm" fw={500} c="#0a0a0a">
                    {test.name}
                  </Text>
                  <Text size="xs" c="#717182">
                    {version ? `${version} • ` : ''}
                    {formatSize(test)}
                  </Text>
                </Stack>
              </Table.Td>
              <Table.Td>{test.projectName}</Table.Td>
              <Table.Td>{test.categoryName}</Table.Td>
              <Table.Td>{test.authorName}</Table.Td>
              <Table.Td>{formatDate(test.createdAt)}</Table.Td>
              <Table.Td>
                <Badge
                  variant={statusStyle.variant}
                  radius="md"
                  style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    borderColor: statusStyle.borderColor,
                  }}
                >
                  {t(`status.${test.status}`)}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap={4}>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label={t('search.table.view')}
                    disabled
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label={t('search.table.download')}
                    disabled
                  >
                    <IconDownload size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}
