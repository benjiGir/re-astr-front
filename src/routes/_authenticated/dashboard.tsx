import { Alert, Button, Group, Loader, SimpleGrid, Stack, Title } from '@mantine/core'
import {
  IconArchive,
  IconChartBar,
  IconCloudUpload,
  IconFolder,
  IconPlus,
} from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useDashboardData } from '../../api/queries/dashboard.queries'
import { ArchivesList } from '../../components/Dashboard/ArchivesList'
import { StatsCard } from '../../components/Dashboard/StatsCard'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation()
  const { stats, recentTests, isLoading, isError, error } = useDashboardData()

  if (isLoading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="lg" />
      </Stack>
    )
  }

  if (isError) {
    return (
      <Alert color="red" title={t('dashboard.error.title')}>
        {error?.message || t('dashboard.error.message')}
      </Alert>
    )
  }

  if (!stats || !recentTests) {
    return null
  }

  return (
    <Stack gap="xl">
      {/* Header with title and action button */}
      <Group justify="space-between" align="center">
        <Title order={1} size="h2">
          {t('dashboard.title')}
        </Title>
        <Button
          component={Link}
          to="/upload"
          leftSection={<IconPlus size={16} />}
          radius="md"
          color="dark"
          style={{
            backgroundColor: '#030213',
          }}
        >
          {t('dashboard.newArchive')}
        </Button>
      </Group>

      {/* Stats Cards Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <StatsCard
          title={t('dashboard.stats.totalArchives.title')}
          value={stats.totalTests}
          icon={<IconArchive size={16} />}
          variant="positive"
        />
        <StatsCard
          title={t('dashboard.stats.uploadsThisMonth.title')}
          value={stats.testsThisMonth}
          icon={<IconCloudUpload size={16} />}
          variant="positive"
        />
        <StatsCard
          title={t('dashboard.stats.activeProjects.title')}
          value={stats.activeProjects}
          icon={<IconFolder size={16} />}
          variant="positive"
        />
        <StatsCard
          title={t('dashboard.stats.totalSize.title')}
          value={stats.totalSize}
          icon={<IconChartBar size={16} />}
          variant="positive"
        />
      </SimpleGrid>

      {/* Recent Archives List */}
      <ArchivesList tests={recentTests} />
    </Stack>
  )
}