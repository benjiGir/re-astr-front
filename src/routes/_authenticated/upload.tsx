import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import type { FileWithPath } from '@mantine/dropzone'
import { IconAlertCircle, IconPlus, IconX } from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMachine } from '@xstate/react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { categoriesOptions, categoryOptions } from '../../api/queries/categories.queries'
import { projectsOptions } from '../../api/queries/projects.queries'
import { testKeys } from '../../api/queries/tests.queries'
import type { CreateTestDto } from '../../api/schemas/test.schema'
import { DynamicField } from '../../components/Upload/DynamicField'
import { FileUploadZone } from '../../components/Upload/FileUploadZone'
import { PRIORITIES, TEST_TYPES } from '../../constants/test-metadata'
import { buildCategorySchema, mergeCategoryFields } from '../../domain/dynamic-fields/build-schema'
import { buildDefaultValues } from '../../domain/dynamic-fields/defaults'
import { MAX_FILE_SIZE, uploadMachine } from '../../machines/uploadMachine'
import { queryClient } from '../../services/queryClient'

export const Route = createFileRoute('/_authenticated/upload')({
  loader: () =>
    Promise.all([
      queryClient.ensureQueryData(categoriesOptions()),
      queryClient.ensureQueryData(projectsOptions()),
    ]),
  component: UploadPage,
})

const uploadMetaSchema = z.object({
  name: z.string().trim().min(1),
  version: z.string().optional(),
  project: z.uuid(),
  category: z.uuid(),
  testType: z.enum(TEST_TYPES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  author: z.string().optional(),
  environment: z.string().optional(),
  description: z.string().optional(),
  prerequisites: z.string().optional(),
  expectedResults: z.string().optional(),
})
type UploadMetaValues = z.infer<typeof uploadMetaSchema>

function buildCreateTestInput(
  meta: UploadMetaValues,
  dynamicValues: Record<string, unknown>,
  tags: string[],
  files: File[],
): CreateTestDto {
  return {
    projectId: meta.project,
    categoryId: meta.category,
    name: meta.name,
    description: meta.description || undefined,
    status: 'draft',
    commonData: dynamicValues,
    customData: {},
    metadata: {
      version: meta.version || undefined,
      testType: meta.testType,
      priority: meta.priority,
      author: meta.author || undefined,
      environment: meta.environment || undefined,
      prerequisites: meta.prerequisites || undefined,
      expectedResults: meta.expectedResults || undefined,
      tags,
      files: files.map((file) => file.name),
    },
  }
}

function UploadPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const reactQueryClient = useQueryClient()
  const [snapshot, send] = useMachine(uploadMachine)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const { data: categories, isLoading: loadingCategories } = useQuery(categoriesOptions())
  const { data: projects, isLoading: loadingProjects } = useQuery(projectsOptions())

  const selectedCategoryId = snapshot.context.selectedCategoryId
  const { data: selectedCategory, isLoading: loadingCategory } = useQuery(
    categoryOptions(selectedCategoryId ?? ''),
  )

  const metaForm = useForm<UploadMetaValues>({
    resolver: standardSchemaResolver(uploadMetaSchema),
    defaultValues: {
      name: '',
      version: '',
      project: '',
      category: '',
      author: '',
      environment: '',
      description: '',
      prerequisites: '',
      expectedResults: '',
    },
  })

  // Piège #4 (docs/PLAN.md §2.3): memoized in two stages so identity only
  // changes when the category's data actually changes, not on every render.
  const categoryFields = useMemo(
    () =>
      mergeCategoryFields(
        selectedCategory?.baseSchema ?? { fields: [] },
        selectedCategory?.customFieldsSchema,
      ),
    [selectedCategory],
  )
  const dynamicSchema = useMemo(() => buildCategorySchema(categoryFields), [categoryFields])

  const dynamicForm = useForm<Record<string, unknown>>({
    resolver: standardSchemaResolver(dynamicSchema),
    defaultValues: buildDefaultValues(categoryFields),
  })

  // Piège #5: reset (not just swap the resolver) when the category changes,
  // so values from the previous category don't leak into the new one.
  useEffect(() => {
    dynamicForm.reset(buildDefaultValues(categoryFields))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFields])

  useEffect(() => {
    if (snapshot.matches('success') && snapshot.context.createdTestId) {
      reactQueryClient.invalidateQueries({ queryKey: testKeys.all })
      navigate({ to: '/tests/$testId', params: { testId: snapshot.context.createdTestId } })
    }
  }, [snapshot, reactQueryClient, navigate])

  const handleFileDrop = (dropped: FileWithPath[]) => {
    send({ type: 'FILES_SELECTED', files: [...snapshot.context.files, ...dropped] })
  }

  const removeFile = (file: File) => {
    send({ type: 'FILES_SELECTED', files: snapshot.context.files.filter((f) => f !== file) })
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const onSubmit = metaForm.handleSubmit(async (meta) => {
    await dynamicForm.handleSubmit((dynamicValues) => {
      send({
        type: 'SUBMIT',
        input: buildCreateTestInput(meta, dynamicValues, tags, snapshot.context.files),
      })
    })()
  })

  const testTypes = TEST_TYPES.map((type) => ({ value: type, label: t(`testTypes.${type}`) }))
  const priorities = PRIORITIES.map((priority) => ({
    value: priority,
    label: t(`priorities.${priority}`),
  }))

  const isSubmitReady = snapshot.matches({ collecting: 'fillingDynamicFields' })
  const isSubmitting = snapshot.matches('submitting')
  const submitFailed = snapshot.matches('submitFailed')
  const fileIssues = snapshot.context.issues.filter((issue) => issue.path === 'files')

  return (
    <Stack gap="xl" style={{ maxWidth: '896px', margin: '0 auto' }}>
      <Stack gap={4}>
        <Title order={1}>{t('upload.title')}</Title>
        <Text c="#717182" size="md">
          {t('upload.subtitle')}
        </Text>
      </Stack>

      <form onSubmit={onSubmit} noValidate>
        <Stack gap="lg">
          <Card withBorder padding="lg" radius="md">
            <Stack gap="md">
              <Stack gap={4}>
                <Text size="md" fw={500} c="#0a0a0a">
                  {t('upload.filesSection.title')}
                </Text>
                <Text size="md" c="#717182">
                  {t('upload.filesSection.description')}
                </Text>
              </Stack>

              <FileUploadZone onDrop={handleFileDrop} maxSize={MAX_FILE_SIZE} />

              {fileIssues.length > 0 && (
                <Alert color="red" icon={<IconAlertCircle size={16} />}>
                  {fileIssues.map((issue) => issue.message).join(' ')}
                </Alert>
              )}

              {snapshot.context.files.length > 0 && (
                <Stack gap="xs">
                  {snapshot.context.files.map((file) => (
                    <Group
                      key={`${file.name}-${file.size}`}
                      justify="space-between"
                      p="xs"
                      style={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                    >
                      <Text size="sm">{file.name}</Text>
                      <Group gap="xs">
                        <Text size="xs" c="#717182">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          type="button"
                          aria-label={t('upload.filesSection.removeFile')}
                          onClick={() => removeFile(file)}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              )}
            </Stack>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Stack gap="md">
              <Text size="md" fw={500} c="#0a0a0a">
                {t('upload.basicInfoSection.title')}
              </Text>

              <Group grow>
                <TextInput
                  label={t('upload.basicInfoSection.name')}
                  placeholder={t('upload.basicInfoSection.namePlaceholder')}
                  required
                  error={metaForm.formState.errors.name?.message}
                  {...metaForm.register('name')}
                />
                <TextInput
                  label={t('upload.basicInfoSection.version')}
                  placeholder={t('upload.basicInfoSection.versionPlaceholder')}
                  {...metaForm.register('version')}
                />
              </Group>

              <Group grow>
                <Controller
                  control={metaForm.control}
                  name="project"
                  render={({ field, fieldState }) => (
                    <Select
                      label={t('upload.basicInfoSection.project')}
                      placeholder={t('upload.basicInfoSection.projectPlaceholder')}
                      data={projects?.map((p) => ({ value: p.id, label: p.name })) ?? []}
                      required
                      disabled={loadingProjects}
                      error={fieldState.error?.message}
                      value={field.value || null}
                      onChange={(value) => {
                        field.onChange(value ?? '')
                        if (value) send({ type: 'PROJECT_SELECTED', projectId: value })
                      }}
                    />
                  )}
                />
                <Controller
                  control={metaForm.control}
                  name="category"
                  render={({ field, fieldState }) => (
                    <Select
                      label={t('upload.basicInfoSection.category')}
                      placeholder={t('upload.basicInfoSection.categoryPlaceholder')}
                      data={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
                      required
                      disabled={loadingCategories}
                      error={fieldState.error?.message}
                      value={field.value || null}
                      onChange={(value) => {
                        field.onChange(value ?? '')
                        if (value) send({ type: 'CATEGORY_SELECTED', categoryId: value })
                      }}
                    />
                  )}
                />
              </Group>

              <Group grow>
                <Controller
                  control={metaForm.control}
                  name="testType"
                  render={({ field }) => (
                    <Select
                      label={t('upload.basicInfoSection.testType')}
                      placeholder={t('upload.basicInfoSection.testTypePlaceholder')}
                      data={testTypes}
                      value={field.value ?? null}
                      onChange={(value) => field.onChange(value ?? undefined)}
                    />
                  )}
                />
                <Controller
                  control={metaForm.control}
                  name="priority"
                  render={({ field }) => (
                    <Select
                      label={t('upload.basicInfoSection.priority')}
                      placeholder={t('upload.basicInfoSection.priorityPlaceholder')}
                      data={priorities}
                      value={field.value ?? null}
                      onChange={(value) => field.onChange(value ?? undefined)}
                    />
                  )}
                />
              </Group>

              <Group grow>
                <TextInput
                  label={t('upload.basicInfoSection.author')}
                  placeholder={t('upload.basicInfoSection.authorPlaceholder')}
                  {...metaForm.register('author')}
                />
                <TextInput
                  label={t('upload.basicInfoSection.environment')}
                  placeholder={t('upload.basicInfoSection.environmentPlaceholder')}
                  {...metaForm.register('environment')}
                />
              </Group>
            </Stack>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Stack gap="md">
              <Text size="md" fw={500} c="#0a0a0a">
                {t('upload.detailsSection.title')}
              </Text>

              <Textarea
                label={t('upload.detailsSection.description')}
                placeholder={t('upload.detailsSection.descriptionPlaceholder')}
                minRows={3}
                {...metaForm.register('description')}
              />
              <Textarea
                label={t('upload.detailsSection.prerequisites')}
                placeholder={t('upload.detailsSection.prerequisitesPlaceholder')}
                minRows={3}
                {...metaForm.register('prerequisites')}
              />
              <Textarea
                label={t('upload.detailsSection.expectedResults')}
                placeholder={t('upload.detailsSection.expectedResultsPlaceholder')}
                minRows={3}
                {...metaForm.register('expectedResults')}
              />
            </Stack>
          </Card>

          {categoryFields.length > 0 && (
            <Card withBorder padding="lg" radius="md">
              <Stack gap="md">
                <Stack gap={4}>
                  <Text size="md" fw={500} c="#0a0a0a">
                    {t('upload.specificFieldsSection.title')}
                  </Text>
                  <Text size="md" c="#717182">
                    {t('upload.specificFieldsSection.description', {
                      categoryName: selectedCategory?.name,
                    })}
                  </Text>
                </Stack>

                {loadingCategory ? (
                  <Loader size="sm" />
                ) : (
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    {categoryFields.map((field) => (
                      <Controller
                        key={field.key}
                        control={dynamicForm.control}
                        name={field.key}
                        render={({ field: rhfField, fieldState }) => (
                          <DynamicField
                            field={field}
                            value={rhfField.value}
                            onChange={rhfField.onChange}
                            error={fieldState.error?.message}
                          />
                        )}
                      />
                    ))}
                  </SimpleGrid>
                )}
              </Stack>
            </Card>
          )}

          <Card withBorder padding="lg" radius="md">
            <Stack gap="md">
              <Stack gap={4}>
                <Text size="md" fw={500} c="#0a0a0a">
                  {t('upload.tagsSection.title')}
                </Text>
                <Text size="md" c="#717182">
                  {t('upload.tagsSection.description')}
                </Text>
              </Stack>

              <Group>
                <TextInput
                  placeholder={t('upload.tagsSection.placeholder')}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  size="sm"
                  style={{ backgroundColor: '#030213' }}
                >
                  <IconPlus size={16} />
                </Button>
              </Group>

              {tags.length > 0 && (
                <Group gap="xs">
                  {tags.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="light"
                      size="xs"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Button>
                  ))}
                </Group>
              )}
            </Stack>
          </Card>

          {submitFailed && (
            <Alert
              color="red"
              icon={<IconAlertCircle size={16} />}
              title={t('upload.submitError.title')}
            >
              <Stack gap="sm">
                <Text size="sm">{t('upload.submitError.message')}</Text>
                <Group>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    color="red"
                    disabled={snapshot.context.retries >= 3}
                    onClick={() => send({ type: 'RETRY' })}
                  >
                    {t('common:actions.retry')}
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="subtle"
                    color="gray"
                    onClick={() => send({ type: 'CANCEL' })}
                  >
                    {t('common:actions.cancel')}
                  </Button>
                </Group>
              </Stack>
            </Alert>
          )}

          <Group justify="flex-end">
            <Button
              type="button"
              variant="outline"
              color="gray"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              {t('upload.actions.cancel')}
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!isSubmitReady}
              style={{ backgroundColor: '#030213' }}
            >
              {t('upload.actions.submit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  )
}
