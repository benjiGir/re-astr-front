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
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../../api/queries/categories.queries'
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from '../../api/queries/projects.queries'
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

  const projectsQuery = useProjects()
  const categoriesQuery = useCategories()
  const testsQuery = useAllTests()

  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const projectArchiveCount = (id: string) =>
    testsQuery.data?.filter((test) => test.projectId === id).length ?? 0
  const categoryArchiveCount = (id: string) =>
    testsQuery.data?.filter((test) => test.categoryId === id).length ?? 0

  const filteredProjects = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    return (projectsQuery.data ?? []).filter((project) =>
      project.name.toLowerCase().includes(query),
    )
  }, [projectsQuery.data, debouncedSearch])

  const filteredCategories = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    return (categoriesQuery.data ?? []).filter((category) =>
      category.name.toLowerCase().includes(query),
    )
  }, [categoriesQuery.data, debouncedSearch])

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
      deleteProject.mutate(project.id)
    }
  }

  const handleDeleteCategory = (category: Category) => {
    if (window.confirm(t('projectsCategories.deleteConfirm', { name: category.name }))) {
      deleteCategory.mutate(category.id)
    }
  }

  const handleSubmitProject = (values: EntityFormValues, entity: Entity | null) => {
    const dto = { name: values.name, description: values.description || undefined }
    if (entity) {
      updateProject.mutate({ id: entity.id, dto }, { onSuccess: closeForm })
      return
    }
    createProject.mutate(dto, { onSuccess: closeForm })
  }

  const handleSubmitCategory = (values: EntityFormValues, entity: Entity | null) => {
    const dto = { name: values.name, description: values.description || undefined }
    if (entity) {
      updateCategory.mutate({ id: entity.id, dto }, { onSuccess: closeForm })
      return
    }
    createCategory.mutate({ ...dto, baseSchema: { fields: [] } }, { onSuccess: closeForm })
  }

  const handleSubmit = (values: EntityFormValues) => {
    const submit = activeTab === 'projects' ? handleSubmitProject : handleSubmitCategory
    submit(values, editingEntity)
  }

  const isSubmitting =
    createProject.isPending ||
    updateProject.isPending ||
    createCategory.isPending ||
    updateCategory.isPending
  const isLoading = projectsQuery.isLoading || categoriesQuery.isLoading
  const isError = projectsQuery.isError || categoriesQuery.isError

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

      <Tabs value={activeTab} onChange={(value) => setActiveTab((value as TabValue) ?? 'projects')}>
        <Group justify="space-between" align="center">
          <Tabs.List>
            <Tabs.Tab value="projects">{t('projectsCategories.tabs.projects')}</Tabs.Tab>
            <Tabs.Tab value="categories">{t('projectsCategories.tabs.categories')}</Tabs.Tab>
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
