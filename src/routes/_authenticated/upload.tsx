import {
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import type { FileWithPath } from '@mantine/dropzone'
import { IconPlus } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { categoriesOptions, categoryOptions } from '../../api/queries/categories.queries'
import { projectsOptions } from '../../api/queries/projects.queries'
import { PRIORITIES, TEST_TYPES } from '../../constants/test-metadata'
import { FileUploadZone } from '../../components/Upload/FileUploadZone'
import { DynamicField } from '../../components/Upload/DynamicField'
import { queryClient } from '../../services/queryClient'

export const Route = createFileRoute('/_authenticated/upload')({
  loader: () =>
    Promise.all([
      queryClient.ensureQueryData(categoriesOptions()),
      queryClient.ensureQueryData(projectsOptions()),
    ]),
  component: UploadPage,
})

interface UploadFormValues {
  name: string
  version: string
  project: string
  category: string
  testType: string
  priority: string
  author: string
  environment: string
  description: string
  prerequisites: string
  expectedResults: string
}

function UploadPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: categories, isLoading: loadingCategories } = useQuery(categoriesOptions())
  const { data: projects, isLoading: loadingProjects } = useQuery(projectsOptions())
  const [files, setFiles] = useState<FileWithPath[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [commonData, setCommonData] = useState<Record<string, any>>({})

  // Fetch selected category details
  const { data: selectedCategory, isLoading: loadingCategory } = useQuery(
    categoryOptions(selectedCategoryId),
  )

  const form = useForm<UploadFormValues>({
    initialValues: {
      name: '',
      version: '',
      project: '',
      category: '',
      testType: '',
      priority: '',
      author: '',
      environment: '',
      description: '',
      prerequisites: '',
      expectedResults: '',
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? t('common:validation.required') : null),
      project: (value) => (value.trim().length === 0 ? t('common:validation.required') : null),
      category: (value) => (value.trim().length === 0 ? t('common:validation.required') : null),
    },
  })

  // Update selected category when form value changes
  useEffect(() => {
    if (form.values.category && form.values.category !== selectedCategoryId) {
      setSelectedCategoryId(form.values.category)
      setCommonData({}) // Reset commonData when category changes
    }
  }, [form.values.category, selectedCategoryId])

  // Initialize commonData with default values when category is loaded
  useEffect(() => {
    if (selectedCategory?.baseSchema?.fields) {
      const initialData: Record<string, any> = {}
      for (const field of selectedCategory.baseSchema.fields) {
        if (field.defaultValue !== undefined) {
          initialData[field.key] = field.defaultValue
        }
      }
      setCommonData(initialData)
    }
  }, [selectedCategory])

  const handleFileDrop = (droppedFiles: FileWithPath[]) => {
    setFiles((prev) => [...prev, ...droppedFiles])
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

  const handleSubmit = (values: UploadFormValues) => {
    console.log('Form values:', values)
    console.log('Files:', files)
    console.log('Tags:', tags)
    console.log('Common Data (from baseSchema):', commonData)

    // TODO: Implement mutation to create test
    // const testData: CreateTestDto = {
    //   projectId: values.project,  // Now using projectId instead of metadata
    //   categoryId: values.category,
    //   name: values.name,
    //   description: values.description,
    //   status: 'draft',
    //   commonData: commonData,
    //   customData: {},
    //   metadata: {
    //     version: values.version,
    //     testType: values.testType,
    //     priority: values.priority,
    //     author: values.author,
    //     environment: values.environment,
    //     prerequisites: values.prerequisites,
    //     expectedResults: values.expectedResults,
    //     tags: tags,
    //     files: files.map(f => f.name),
    //   }
    // }
  }

  // Get test types and priorities from constants with translations
  const testTypes = TEST_TYPES.map((type) => ({
    value: type,
    label: t(`testTypes.${type}`),
  }))

  const priorities = PRIORITIES.map((priority) => ({
    value: priority,
    label: t(`priorities.${priority}`),
  }))

  return (
    <Stack gap="xl" style={{ maxWidth: '896px', margin: '0 auto' }}>
      {/* Header */}
      <Stack gap={4}>
        <Title order={1}>{t('upload.title')}</Title>
        <Text c="#717182" size="md">
          {t('upload.subtitle')}
        </Text>
      </Stack>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Section 1: Fichiers de Tests */}
          <Card withBorder padding="lg" radius="md">
            <Stack gap="md">
              <Stack gap={4}>
                <Text size="md" fw={500} c="#0a0a0a">
                  Fichiers de Tests
                </Text>
                <Text size="md" c="#717182">
                  Uploadez vos documents, scripts de tests et autres fichiers associés
                </Text>
              </Stack>

              <FileUploadZone onDrop={handleFileDrop} />

              {files.length > 0 && (
                <Stack gap="xs">
                  {files.map((file, index) => (
                    <Group
                      key={index}
                      justify="space-between"
                      p="xs"
                      style={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                    >
                      <Text size="sm">{file.name}</Text>
                      <Text size="xs" c="#717182">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </Group>
                  ))}
                </Stack>
              )}
            </Stack>
          </Card>

          {/* Section 2: Informations de Base */}
          <Card withBorder padding="lg" radius="md">
            <Stack gap="md">
              <Text size="md" fw={500} c="#0a0a0a">
                Informations de Base
              </Text>

              <Group grow>
                <TextInput
                  label="Nom de l'Archive"
                  placeholder="Ex: Tests API v2.1"
                  required
                  {...form.getInputProps('name')}
                />
                <TextInput
                  label="Version"
                  placeholder="Ex: 2.1.0"
                  {...form.getInputProps('version')}
                />
              </Group>

              <Group grow>
                <Select
                  label="Projet"
                  placeholder="Sélectionner un projet"
                  data={projects?.map((p) => ({ value: p.id, label: p.name })) || []}
                  required
                  disabled={loadingProjects}
                  {...form.getInputProps('project')}
                />
                <Select
                  label="Catégorie"
                  placeholder="Sélectionner une catégorie"
                  data={categories?.map((c) => ({ value: c.id, label: c.name })) || []}
                  required
                  disabled={loadingCategories}
                  {...form.getInputProps('category')}
                />
              </Group>

              <Group grow>
                <Select
                  label="Type de Test"
                  placeholder="Sélectionner le type"
                  data={testTypes}
                  {...form.getInputProps('testType')}
                />
                <Select
                  label="Priorité"
                  placeholder="Sélectionner la priorité"
                  data={priorities}
                  {...form.getInputProps('priority')}
                />
              </Group>

              <Group grow>
                <TextInput
                  label="Auteur"
                  placeholder="Nom de l'auteur"
                  {...form.getInputProps('author')}
                />
                <TextInput
                  label="Environnement"
                  placeholder="Ex: Production, Staging"
                  {...form.getInputProps('environment')}
                />
              </Group>
            </Stack>
          </Card>

          {/* Section 3: Description et Détails */}
          <Card withBorder padding="lg" radius="md">
            <Stack gap="md">
              <Text size="md" fw={500} c="#0a0a0a">
                Description et Détails
              </Text>

              <Textarea
                label="Description"
                placeholder="Décrivez l'objectif et le contenu de cette archive"
                minRows={3}
                {...form.getInputProps('description')}
              />

              <Textarea
                label="Prérequis"
                placeholder="Listez les prérequis nécessaires"
                minRows={3}
                {...form.getInputProps('prerequisites')}
              />

              <Textarea
                label="Résultats Attendus"
                placeholder="Décrivez les résultats attendus"
                minRows={3}
                {...form.getInputProps('expectedResults')}
              />
            </Stack>
          </Card>

          {/* Section 4: Champs Spécifiques à la Catégorie */}
          {selectedCategory?.baseSchema?.fields &&
            selectedCategory.baseSchema.fields.length > 0 && (
              <Card withBorder padding="lg" radius="md">
                <Stack gap="md">
                  <Stack gap={4}>
                    <Text size="md" fw={500} c="#0a0a0a">
                      Champs Spécifiques
                    </Text>
                    <Text size="md" c="#717182">
                      Champs requis pour la catégorie "{selectedCategory.name}"
                    </Text>
                  </Stack>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    {selectedCategory.baseSchema.fields.map((field) => (
                      <DynamicField
                        key={field.key}
                        field={field}
                        value={commonData[field.key]}
                        onChange={(value) => {
                          setCommonData((prev) => ({
                            ...prev,
                            [field.key]: value,
                          }))
                        }}
                      />
                    ))}
                  </SimpleGrid>
                </Stack>
              </Card>
            )}

          {/* Section 5: Tags */}
          <Card withBorder padding="lg" radius="md">
            <Stack gap="md">
              <Stack gap={4}>
                <Text size="md" fw={500} c="#0a0a0a">
                  Tags
                </Text>
                <Text size="md" c="#717182">
                  Ajoutez des tags pour faciliter la recherche et l'organisation
                </Text>
              </Stack>

              <Group>
                <TextInput
                  placeholder="Ajouter un tag"
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
                <Button onClick={addTag} size="sm" style={{ backgroundColor: '#030213' }}>
                  <IconPlus size={16} />
                </Button>
              </Group>

              {tags.length > 0 && (
                <Group gap="xs">
                  {tags.map((tag) => (
                    <Button key={tag} variant="light" size="xs" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Button>
                  ))}
                </Group>
              )}
            </Stack>
          </Card>

          {/* Actions */}
          <Group justify="flex-end">
            <Button variant="outline" color="gray" onClick={() => navigate({ to: '/dashboard' })}>
              Annuler
            </Button>
            <Button type="submit" style={{ backgroundColor: '#030213' }}>
              Créer l'Archive
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  )
}
