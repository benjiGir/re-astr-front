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
import { IconPlus, IconSearch } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ConfirmDeleteModal } from '../../components/ProjectsCategories/ConfirmDeleteModal'
import { EntityFormModal } from '../../components/ProjectsCategories/EntityFormModal'
import { EntityGrid } from '../../components/ProjectsCategories/EntityGrid'
import { type TabValue, useProjectsPage } from '../../hooks/useProjectsPage'

export const Route = createFileRoute('/_authenticated/projects')({
  component: ProjectsPage,
})

function ProjectsPage() {
  const { t } = useTranslation()
  const {
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
    deleteModalOpened,
    deleteConfirmMessage,
    isDeleting,
    deleteError,
    handleCancelDelete,
    handleConfirmDelete,
  } = useProjectsPage()

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

      {formOpened && (
        <EntityFormModal
          opened={formOpened}
          title={modalTitle}
          initialValues={modalInitialValues}
          isSubmitting={isSubmitting}
          error={formError}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDeleteModal
        opened={deleteModalOpened}
        message={deleteConfirmMessage}
        isDeleting={isDeleting}
        error={deleteError}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </Stack>
  )
}
