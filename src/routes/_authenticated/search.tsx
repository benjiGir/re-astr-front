import { Alert, Button, Card, Collapse, Group, Loader, Select, Stack, Text, TextInput, Title } from '@mantine/core'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { IconFilter, IconSearch } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useArchiveSearchData } from '../../api/queries/tests.queries'
import { ArchiveResultsTable } from '../../components/Search/ArchiveResultsTable'
import type { TestStatus } from '../../types/api'

export const Route = createFileRoute('/_authenticated/search')({
  component: SearchPage,
})

const STATUS_OPTIONS: TestStatus[] = ['draft', 'in_progress', 'completed', 'failed', 'archived']

function SearchPage() {
  const { t } = useTranslation()
  const [filtersOpened, { toggle: toggleFilters }] = useDisclosure(false)
  const [query, setQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<TestStatus | null>(null)
  const [debouncedQuery] = useDebouncedValue(query, 300)

  const { tests, projects, categories, isLoading, isError, error } = useArchiveSearchData({
    projectId: projectFilter ?? undefined,
    categoryId: categoryFilter ?? undefined,
    status: statusFilter ?? undefined,
    search: debouncedQuery.trim() || undefined,
  })

  const resetFilters = () => {
    setProjectFilter(null)
    setCategoryFilter(null)
    setStatusFilter(null)
  }

  const filteredTests = tests ?? []

  if (isLoading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="lg" />
      </Stack>
    )
  }

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={1} size="h2">
          {t('search.title')}
        </Title>
        <Text c="#717182">{t('search.subtitle')}</Text>
      </Stack>

      <Card withBorder radius="md" padding="lg" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
        <Stack gap="md">
          <Group align="flex-start">
            <TextInput
              flex={1}
              aria-label={t('search.searchPlaceholder')}
              leftSection={<IconSearch size={16} />}
              placeholder={t('search.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
            <Button
              variant="outline"
              color="gray"
              leftSection={<IconFilter size={16} />}
              onClick={toggleFilters}
            >
              {t('search.filtersButton')}
            </Button>
          </Group>

          <Collapse in={filtersOpened}>
            <Group>
              <Select
                placeholder={t('search.filters.project')}
                label={t('search.filters.project')}
                data={(projects ?? []).map((p) => ({ value: p.id, label: p.name }))}
                value={projectFilter}
                onChange={setProjectFilter}
                clearable
              />
              <Select
                placeholder={t('search.filters.category')}
                label={t('search.filters.category')}
                data={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
                value={categoryFilter}
                onChange={setCategoryFilter}
                clearable
              />
              <Select
                placeholder={t('search.filters.status')}
                label={t('search.filters.status')}
                data={STATUS_OPTIONS.map((s) => ({ value: s, label: t(`status.${s}`) }))}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as TestStatus | null)}
                clearable
              />
              <Button variant="outline" color="gray" onClick={resetFilters} mt={24}>
                {t('search.resetFilters')}
              </Button>
            </Group>
          </Collapse>
        </Stack>
      </Card>

      {isError ? (
        <Alert color="red" title={t('search.error.title')}>
          {error?.message || t('search.error.message')}
        </Alert>
      ) : (
        <Card withBorder radius="md" padding="lg" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
          <Stack gap="md">
            <Text size="sm" c="#717182">
              {t('search.resultsCount', { count: filteredTests.length })}
            </Text>

            {filteredTests.length === 0 ? (
              <Text c="#717182">{t('search.noResults')}</Text>
            ) : (
              <ArchiveResultsTable tests={filteredTests} />
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
