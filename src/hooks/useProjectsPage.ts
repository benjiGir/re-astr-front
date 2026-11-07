import { useDebouncedValue } from '@mantine/hooks'
import { useQuery } from '@tanstack/react-query'
import { useMachine } from '@xstate/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../api/http'
import { useCategoriesResource } from '../api/queries/categories.queries'
import { useProjectsResource } from '../api/queries/projects.queries'
import { allTestsOptions } from '../api/queries/tests.queries'
import type { Category } from '../api/schemas/category.schema'
import type { Project } from '../api/schemas/project.schema'
import type { EntityFormValues } from '../components/ProjectsCategories/EntityFormModal'
import { projectsModalMachine } from '../machines/projectsModalMachine'

export type TabValue = 'projects' | 'categories'
type Entity = Project | Category

const EMPTY_FORM_VALUES: EntityFormValues = { name: '', description: '' }

function deriveFormErrorMessage(error: unknown, t: (key: string) => string): string {
  return error instanceof ApiError ? error.message : t('projectsCategories.formError.generic')
}

function deriveDeleteErrorMessage(error: unknown, t: (key: string) => string): string {
  const hasTests =
    error instanceof ApiError &&
    (error.tag === 'ProjectHasTests' || error.tag === 'CategoryHasTests')
  return hasTests
    ? t('projectsCategories.deleteError.hasTests')
    : t('projectsCategories.deleteError.generic')
}

export function useProjectsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabValue>('projects')
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const [snapshot, send] = useMachine(projectsModalMachine)

  const projects = useProjectsResource()
  const categories = useCategoriesResource()
  const testsQuery = useQuery(allTestsOptions())
  const resource = snapshot.context.entityType === 'category' ? categories : projects

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

  // R1: the machine only holds `targetEntityId` — the entity itself is
  // looked up here from the data React Query already has.
  const targetEntity = useMemo(() => {
    const { targetEntityId, entityType } = snapshot.context
    if (!targetEntityId) return null
    const list = entityType === 'category' ? categories.query.data : projects.query.data
    return list?.find((entity) => entity.id === targetEntityId) ?? null
  }, [snapshot.context, categories.query.data, projects.query.data])

  const modalInitialValues: EntityFormValues = useMemo(
    () =>
      targetEntity
        ? { name: targetEntity.name, description: targetEntity.description ?? '' }
        : EMPTY_FORM_VALUES,
    [targetEntity],
  )

  const isEditing = snapshot.matches('editing')
  const modalTitle = isEditing
    ? snapshot.context.entityType === 'category'
      ? t('projectsCategories.editCategory')
      : t('projectsCategories.editProject')
    : snapshot.context.entityType === 'category'
      ? t('projectsCategories.newCategory')
      : t('projectsCategories.newProject')

  const handleCreate = () => {
    send({ type: 'CREATE', entityType: activeTab === 'categories' ? 'category' : 'project' })
  }

  const handleEdit = (entity: Entity) => {
    send({
      type: 'EDIT',
      entityType: activeTab === 'categories' ? 'category' : 'project',
      entityId: entity.id,
    })
  }

  const handleDeleteProject = (project: Project) => {
    send({ type: 'DELETE', entityType: 'project', entityId: project.id })
  }

  const handleDeleteCategory = (category: Category) => {
    send({ type: 'DELETE', entityType: 'category', entityId: category.id })
  }

  const closeForm = () => send({ type: 'CANCEL' })
  const handleCancelDelete = () => send({ type: 'CANCEL' })

  const handleSubmit = (values: EntityFormValues) => {
    send({ type: 'SUBMIT', values })
    const dto = { name: values.name, description: values.description || undefined }
    const onSuccess = () => send({ type: 'MUTATION_SUCCESS' })
    const onError = (error: unknown) =>
      send({ type: 'MUTATION_ERROR', message: deriveFormErrorMessage(error, t) })

    if (snapshot.context.targetEntityId) {
      resource.update.mutate({ id: snapshot.context.targetEntityId, dto }, { onSuccess, onError })
      return
    }
    if (snapshot.context.entityType === 'category') {
      categories.create.mutate({ ...dto, baseSchema: { fields: [] } }, { onSuccess, onError })
      return
    }
    projects.create.mutate(dto, { onSuccess, onError })
  }

  const handleConfirmDelete = () => {
    send({ type: 'CONFIRM_DELETE' })
    const targetId = snapshot.context.targetEntityId
    if (!targetId) return
    resource.remove.mutate(targetId, {
      onSuccess: () => send({ type: 'MUTATION_SUCCESS' }),
      onError: (error) =>
        send({ type: 'MUTATION_ERROR', message: deriveDeleteErrorMessage(error, t) }),
    })
  }

  const formOpened = snapshot.matches('creating') || snapshot.matches('editing')
  const isSubmitting =
    snapshot.matches({ creating: 'submitting' }) || snapshot.matches({ editing: 'submitting' })
  const deleteModalOpened = snapshot.matches('confirmingDelete')
  const isDeleting = snapshot.matches({ confirmingDelete: 'submitting' })
  const formError = formOpened ? snapshot.context.error : null
  const deleteError = deleteModalOpened ? snapshot.context.error : null

  const isLoading = projects.query.isLoading || categories.query.isLoading
  const isError = projects.query.isError || categories.query.isError

  const deleteConfirmMessage = targetEntity
    ? t('projectsCategories.deleteConfirm', { name: targetEntity.name })
    : ''

  return {
    activeTab,
    setActiveTab,
    search,
    setSearch,
    formOpened,
    closeForm,
    isLoading,
    isError,
    isSubmitting,
    formError,
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
    deleteError,
    deleteModalOpened,
    deleteConfirmMessage,
    isDeleting,
    handleCancelDelete,
    handleConfirmDelete,
  }
}
