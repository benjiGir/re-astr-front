import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { categoryOptions } from '../../api/queries/categories.queries'
import { projectOptions } from '../../api/queries/projects.queries'
import { testOptions } from '../../api/queries/tests.queries'
import { TestDataSection } from '../../components/TestDetail/TestDataSection'
import { queryClient } from '../../services/queryClient'
import type { Category, Project, Test } from '../../types/api'
import { formatDate } from '../../utils/testFormatting'
import { getStatusBadgeStyle } from '../../utils/testStatus'

export const Route = createFileRoute('/_authenticated/tests/$testId')({
  loader: ({ params }) => queryClient.ensureQueryData(testOptions(params.testId)),
  component: TestDetailPage,
})

interface InfoEntry {
  key: string
  label: string
  value: string
}

function buildInfoEntries(
  test: Test,
  project: Project | undefined,
  category: Category | undefined,
  t: TFunction,
): InfoEntry[] {
  const entries: InfoEntry[] = [
    {
      key: 'project',
      label: t('testDetail.infoSection.project'),
      value: project?.name ?? test.projectId,
    },
    {
      key: 'category',
      label: t('testDetail.infoSection.category'),
      value: category?.name ?? test.categoryId,
    },
    {
      key: 'author',
      label: t('testDetail.infoSection.author'),
      value: test.createdByName || test.metadata?.author || test.createdBy,
    },
    {
      key: 'createdAt',
      label: t('testDetail.infoSection.createdAt'),
      value: formatDate(test.createdAt),
    },
    {
      key: 'updatedAt',
      label: t('testDetail.infoSection.updatedAt'),
      value: formatDate(test.updatedAt),
    },
  ]

  if (test.completedAt) {
    entries.push({
      key: 'completedAt',
      label: t('testDetail.infoSection.completedAt'),
      value: formatDate(test.completedAt),
    })
  }

  return entries
}

function TestDetailPage() {
  const { testId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const testQuery = useQuery(testOptions(testId))
  const test = testQuery.data

  const categoryQuery = useQuery({
    ...categoryOptions(test?.categoryId ?? ''),
    enabled: !!test?.categoryId,
  })
  const projectQuery = useQuery({
    ...projectOptions(test?.projectId ?? ''),
    enabled: !!test?.projectId,
  })

  if (testQuery.isLoading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="lg" />
      </Stack>
    )
  }

  if (testQuery.isError || !test) {
    return (
      <Alert color="red" title={t('testDetail.error.title')}>
        {testQuery.error?.message || t('testDetail.error.message')}
      </Alert>
    )
  }

  const category = categoryQuery.data
  const statusStyle = getStatusBadgeStyle(test.status)
  const infoEntries = buildInfoEntries(test, projectQuery.data, category, t)

  return (
    <Stack gap="xl" style={{ maxWidth: '896px', margin: '0 auto' }}>
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            leftSection={<IconArrowLeft size={14} />}
            onClick={() => navigate({ to: '/search' })}
            style={{ paddingLeft: 0 }}
          >
            {t('testDetail.back')}
          </Button>
          <Title order={1} size="h2">
            {test.name}
          </Title>
          {test.description ? <Text c="#717182">{test.description}</Text> : null}
        </Stack>
        <Badge
          variant={statusStyle.variant}
          radius="md"
          size="lg"
          style={{
            backgroundColor: statusStyle.bg,
            color: statusStyle.color,
            borderColor: statusStyle.borderColor,
          }}
        >
          {t(`status.${test.status}`)}
        </Badge>
      </Group>

      <Card withBorder radius="md" padding="lg" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
        <Stack gap="md">
          <Text size="md" fw={600} c="#0a0a0a">
            {t('testDetail.infoSection.title')}
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {infoEntries.map((entry) => (
              <Stack key={entry.key} gap={2}>
                <Text size="xs" c="#717182">
                  {entry.label}
                </Text>
                <Text size="sm" fw={500} c="#0a0a0a">
                  {entry.value}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Stack>
      </Card>

      <TestDataSection
        title={t('testDetail.commonDataSection.title')}
        description={t('testDetail.commonDataSection.description')}
        fields={category?.baseSchema?.fields}
        data={test.commonData ?? {}}
        isLoading={categoryQuery.isLoading}
        emptyLabel={t('testDetail.noData')}
      />

      {Object.keys(test.customData ?? {}).length > 0 && (
        <TestDataSection
          title={t('testDetail.customDataSection.title')}
          description={t('testDetail.customDataSection.description')}
          fields={category?.customFieldsSchema?.fields}
          data={test.customData ?? {}}
        />
      )}

      {Object.keys(test.metadata ?? {}).length > 0 && (
        <TestDataSection title={t('testDetail.metadataSection.title')} data={test.metadata ?? {}} />
      )}
    </Stack>
  )
}
