import { Stack, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/archives')({
  component: ArchivesPage,
})

function ArchivesPage() {
  return (
    <Stack gap="xl">
      <Title order={1} size="h2">
        Toutes les Archives
      </Title>
      {/* TODO: Implémenter la liste complète des archives avec filtres et recherche */}
    </Stack>
  )
}