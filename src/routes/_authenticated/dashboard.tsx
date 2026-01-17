import { Alert, Button, Group, Loader, SimpleGrid, Stack, Title } from '@mantine/core'
import {
  IconArchive,
  IconChartBar,
  IconCloudUpload,
  IconFolder,
  IconPlus,
} from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useDashboardData } from '../../api/queries'
import { ArchivesList } from '../../components/Dashboard/ArchivesList'
import { StatsCard } from '../../components/Dashboard/StatsCard'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
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
      <Alert color="red" title="Erreur">
        {error?.message || 'Une erreur est survenue lors du chargement des données'}
      </Alert>
    )
  }

  if (!stats || !recentTests) {
    return null
  }

  // Calculate variations (mock for now - would need historical data)
  const statsVariations = {
    totalTests: '+12% vs mois dernier',
    testsThisMonth: '+8% vs mois dernier',
    activeProjects: '+2 nouveaux projets',
    totalSize: '+15% vs mois dernier',
  }

  return (
    <Stack gap="xl">
      {/* Header with title and action button */}
      <Group justify="space-between" align="center">
        <Title order={1} size="h2">
          Dashboard
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
          Nouvelle Archive
        </Button>
      </Group>

      {/* Stats Cards Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <StatsCard
          title="Total des Archives"
          value={stats.totalTests}
          description={statsVariations.totalTests}
          icon={<IconArchive size={16} />}
          variant="positive"
        />
        <StatsCard
          title="Uploads ce mois"
          value={stats.testsThisMonth}
          description={statsVariations.testsThisMonth}
          icon={<IconCloudUpload size={16} />}
          variant="positive"
        />
        <StatsCard
          title="Projets Actifs"
          value={stats.activeProjects}
          description={statsVariations.activeProjects}
          icon={<IconFolder size={16} />}
          variant="positive"
        />
        <StatsCard
          title="Taille Totale"
          value={stats.totalSize}
          description={statsVariations.totalSize}
          icon={<IconChartBar size={16} />}
          variant="positive"
        />
      </SimpleGrid>

      {/* Recent Archives List */}
      <ArchivesList tests={recentTests} />
    </Stack>
  )
}