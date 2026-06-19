import { Button, Card, Stack, Text } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { Test } from '../../types/api'
import { ArchiveListItem } from './ArchiveListItem'

interface ArchivesListProps {
  tests: Test[]
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format file size from metadata or return N/A
 */
function formatSize(test: Test): string {
  const fileSize = test.metadata?.fileSize
  if (fileSize && typeof fileSize === 'number') {
    // Convert bytes to appropriate unit
    if (fileSize < 1024) {
      return `${fileSize} B`
    }
    if (fileSize < 1024 * 1024) {
      return `${(fileSize / 1024).toFixed(1)} KB`
    }
    if (fileSize < 1024 * 1024 * 1024) {
      return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
    }
    return `${(fileSize / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }
  return 'N/A'
}

/**
 * Extract category name from metadata or use categoryId
 */
function getCategoryName(test: Test): string {
  return test.metadata?.categoryName || test.categoryId
}

/**
 * Extract test type from metadata or commonData
 */
function getTestType(test: Test): string {
  return test.metadata?.testType || test.commonData?.type || 'Test'
}

export function ArchivesList({ tests }: ArchivesListProps) {
  const { t } = useTranslation()

  if (tests.length === 0) {
    return (
      <Card
        withBorder
        radius="md"
        padding="lg"
        style={{
          borderColor: 'rgba(0, 0, 0, 0.1)',
        }}
      >
        <Stack gap="md">
          <Stack gap={4}>
            <Text size="md" fw={500} c="#0a0a0a">
              {t('dashboard.recentArchives.title')}
            </Text>
            <Text size="md" c="#717182">
              {t('dashboard.recentArchives.noArchives')}
            </Text>
          </Stack>
        </Stack>
      </Card>
    )
  }

  return (
    <Card
      withBorder
      radius="md"
      padding="lg"
      style={{
        borderColor: 'rgba(0, 0, 0, 0.1)',
      }}
    >
      <Stack gap="md">
        {/* Header */}
        <Stack gap={4}>
          <Text size="md" fw={500} c="#0a0a0a">
            {t('dashboard.recentArchives.title')}
          </Text>
          <Text size="md" c="#717182">
            {t('dashboard.recentArchives.description')}
          </Text>
        </Stack>

        {/* Archives list */}
        <Stack gap="md">
          {tests.map((test) => (
            <ArchiveListItem
              key={test.id}
              title={test.name}
              category={getCategoryName(test)}
              testType={getTestType(test)}
              date={formatDate(test.createdAt)}
              size={formatSize(test)}
              status={test.status}
            />
          ))}
        </Stack>

        {/* View all button */}
        <Button
          component={Link}
          to="/archives"
          variant="outline"
          color="gray"
          radius="md"
          style={{
            alignSelf: 'center',
            marginTop: '16px',
          }}
        >
          {t('dashboard.recentArchives.viewAll')}
        </Button>
      </Stack>
    </Card>
  )
}