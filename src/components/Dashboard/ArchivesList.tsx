import { Button, Card, Stack, Text } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import type { Test, TestStatus } from '../../types/api'
import { ArchiveListItem } from './ArchiveListItem'

interface ArchivesListProps {
  tests: Test[]
}

/**
 * Map TestStatus to ArchiveListItem status
 */
function mapTestStatusToArchiveStatus(
  status: TestStatus
): 'active' | 'in_progress' | 'completed' {
  switch (status) {
    case 'in_progress':
      return 'in_progress'
    case 'completed':
      return 'completed'
    case 'draft':
    case 'failed':
    default:
      return 'active'
  }
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
 * Format file size from metadata or return mock
 */
function formatSize(test: Test): string {
  const fileSize = test.metadata?.fileSize
  if (fileSize && typeof fileSize === 'number') {
    const mb = fileSize / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }
  // Mock size
  return `${(Math.random() * 4 + 1).toFixed(1)} MB`
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
              Archives Récentes
            </Text>
            <Text size="md" c="#717182">
              Aucune archive trouvée
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
            Archives Récentes
          </Text>
          <Text size="md" c="#717182">
            Les dernières archives uploadées dans le système
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
              status={mapTestStatusToArchiveStatus(test.status)}
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
          Voir toutes les archives
        </Button>
      </Stack>
    </Card>
  )
}