import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCategoriesResource } from '../api/queries/categories.queries'
import { useProjectsResource } from '../api/queries/projects.queries'
import { useAllTests } from '../api/queries/tests.queries'
import type { EntityFormValues } from '../components/ProjectsCategories/EntityFormModal'
import type { Category, Project } from '../types/api'

export type TabValue = 'projects' | 'categories'
type Entity = Project | Category

const EMPTY_FORM_VALUES: EntityFormValues = { name: '', description: '' }

export function useProjectsPage() {
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

  const isEditing = !!editingEntity
  const modalTitle = isEditing
    ? activeTab === 'projects'
      ? t('projectsCategories.editProject')
      : t('projectsCategories.editCategory')
    : activeTab === 'projects'
      ? t('projectsCategories.newProject')
      : t('projectsCategories.newCategory')

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

  return {
    activeTab,
    setActiveTab,
    search,
    setSearch,
    formOpened,
    openForm,
    closeForm,
    editingEntity,
    isLoading,
    isError,
    isSubmitting,
    filteredProjects,
    filteredCategories,
    projectArchiveCount,
    categoryArchiveCount,
    modalInitialValues,
    modalTitle,
    handleCreate,
    handleEdit,
    handleDeleteProject,
    handleDeleteCategory,
    handleSubmit,
  }
}
