import {
  Alert,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { IconPlus, IconSearch } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import type { TFunction } from 'i18next'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCategoriesResource } from '../../api/queries/categories.queries'
import { useProjectsResource } from '../../api/queries/projects.queries'
import { useAllTests } from '../../api/queries/tests.queries'
import {
  EntityFormModal,
  type EntityFormValues,
} from '../../components/ProjectsCategories/EntityFormModal'
import { EntityGrid } from '../../components/ProjectsCategories/EntityGrid'
import type { Category, Project } from '../../types/api'

export const Route = createFileRoute('/_authenticated/projects')({
  component: ProjectsPage,
})

type TabValue = 'projects' | 'categories'
type Entity = Project | Category

const EMPTY_FORM_VALUES: EntityFormValues = { name: '', description: '' }

function getModalTitle(t: TFunction, activeTab: TabValue, isEditing: boolean): string {
  if (isEditing) {
    return activeTab === 'projects'
      ? t('projectsCategories.editProject')
      : t('projectsCategories.editCategory')
  }
  return activeTab === 'projects'
    ? t('projectsCategories.newProject')
    : t('projectsCategories.newCategory')
}

function ProjectsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabValue>('projects')
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null)

  const projects = useProjectsResource()
  const categories = useCategoriesResource()
  const testsQuery = useAllTests()

  const projectArchiveCount = (id: string) =>
    testsQuery.data?.filter((test) => test.projectId === id).length ?? 0
  const categoryArchiveCount = (id: string) =>
    testsQuery.data?.filter((test) => test.categoryId === id).length ?? 0

  const filteredProjects = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    return (projects.query.data ?? []).filter((project) =>
      project.name.toLowerCase().includes(query),
    )
  }, [projects.query.data, debouncedSearch])

  const filteredCategories = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    return (categories.query.data ?? []).filter((category) =>
      category.name.toLowerCase().includes(query),
    )
  }, [categories.query.data, debouncedSearch])

  const modalInitialValues = useMemo(
    () =>
      editingEntity
        ? { name: editingEntity.name, description: editingEntity.description ?? '' }
        : EMPTY_FORM_VALUES,
    [editingEntity],
  )

  const handleCreate = () => {
    setEditingEntity(null)
    openForm()
  }

  const handleEdit = (entity: Entity) => {
    setEditingEntity(entity)
    openForm()
  }

  const handleDeleteProject = (project: Project) => {
    if (window.confirm(t('projectsCategories.deleteConfirm', { name: project.name }))) {
      projects.remove.mutate(project.id)
    }
  }

  const handleDeleteCategory = (category: Category) => {
    if (window.confirm(t('projectsCategories.deleteConfirm', { name: category.name }))) {
      categories.remove.mutate(category.id)
    }
  }

  const handleSubmitProject = (values: EntityFormValues, entity: Entity | null) => {
    const dto = { name: values.name, description: values.description || undefined }
    if (entity) {
      projects.update.mutate({ id: entity.id, dto }, { onSuccess: closeForm })
      return
    }
    projects.create.mutate(dto, { onSuccess: closeForm })
  }

  const handleSubmitCategory = (values: EntityFormValues, entity: Entity | null) => {
    const dto = { name: values.name, description: values.description || undefined }
    if (entity) {
      categories.update.mutate({ id: entity.id, dto }, { onSuccess: closeForm })
      return
    }
    categories.create.mutate({ ...dto, baseSchema: { fields: [] } }, { onSuccess: closeForm })
  }

  const handleSubmit = (values: EntityFormValues) => {
    const submit = activeTab === 'projects' ? handleSubmitProject : handleSubmitCategory
    submit(values, editingEntity)
  }

  const isSubmitting =
    projects.create.isPending ||
    projects.update.isPending ||
    categories.create.isPending ||
    categories.update.isPending
  const isLoading = projects.query.isLoading || categories.query.isLoading
  const isError = projects.query.isError || categories.query.isError

  if (isLoading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="lg" />
      </Stack>
    )
  }

  if (isError) {
    return (
      <Alert color="red" title={t('projectsCategories.error.title')}>
        {t('projectsCategories.error.message')}
      </Alert>
    )
  }

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={1} size="h2">
          {t('projectsCategories.title')}
        </Title>
        <Text c="#717182">{t('projectsCategories.subtitle')}</Text>
      </Stack>

      <Card withBorder radius="md" padding="lg" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
        <TextInput
          aria-label={t('projectsCategories.searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          placeholder={t('projectsCategories.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      </Card>

      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab((value as TabValue) ?? 'projects')}
        unstyled
      >
        <Group justify="space-between" align="center">
          <Tabs.List
            style={{
              display: 'inline-flex',
              backgroundColor: '#eceef2',
              borderRadius: 8,
              padding: 4,
              gap: 4,
            }}
          >
            <Tabs.Tab
              value="projects"
              style={{
                borderRadius: 6,
                padding: '6px 16px',
                fontSize: '13.7px',
                fontWeight: 500,
                cursor: 'pointer',
                border: 'none',
                transition: 'background-color 0.1s, color 0.1s',
                backgroundColor: activeTab === 'projects' ? '#fff' : 'transparent',
                color: activeTab === 'projects' ? '#0a0a0a' : '#717182',
              }}
            >
              {t('projectsCategories.tabs.projects')}
            </Tabs.Tab>
            <Tabs.Tab
              value="categories"
              style={{
                borderRadius: 6,
                padding: '6px 16px',
                fontSize: '13.7px',
                fontWeight: 500,
                cursor: 'pointer',
                border: 'none',
                transition: 'background-color 0.1s, color 0.1s',
                backgroundColor: activeTab === 'categories' ? '#fff' : 'transparent',
                color: activeTab === 'categories' ? '#0a0a0a' : '#717182',
              }}
            >
              {t('projectsCategories.tabs.categories')}
            </Tabs.Tab>
          </Tabs.List>
          <Button
            leftSection={<IconPlus size={16} />}
            radius="md"
            style={{ backgroundColor: '#030213' }}
            onClick={handleCreate}
          >
            {activeTab === 'projects'
              ? t('projectsCategories.newProject')
              : t('projectsCategories.newCategory')}
          </Button>
        </Group>

        <Tabs.Panel value="projects" pt="md">
          <EntityGrid
            items={filteredProjects}
            emptyMessage={t('projectsCategories.noProjects')}
            archiveCount={projectArchiveCount}
            onEdit={handleEdit}
            onDelete={handleDeleteProject}
          />
        </Tabs.Panel>

        <Tabs.Panel value="categories" pt="md">
          <EntityGrid
            items={filteredCategories}
            emptyMessage={t('projectsCategories.noCategories')}
            archiveCount={categoryArchiveCount}
            onEdit={handleEdit}
            onDelete={handleDeleteCategory}
          />
        </Tabs.Panel>
      </Tabs>

      <EntityFormModal
        opened={formOpened}
        title={getModalTitle(t, activeTab, !!editingEntity)}
        initialValues={modalInitialValues}
        isSubmitting={isSubmitting}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </Stack>
  )
}
