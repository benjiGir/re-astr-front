import { Alert, Button, Group, Modal, Stack, Textarea, TextInput } from '@mantine/core'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

export interface EntityFormValues {
  name: string
  description: string
}

interface EntityFormModalProps {
  opened: boolean
  title: string
  initialValues: EntityFormValues
  isSubmitting: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: EntityFormValues) => void
}

export function EntityFormModal({
  opened,
  title,
  initialValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: EntityFormModalProps) {
  const { t } = useTranslation()

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, t('common:validation.required')),
        description: z.string(),
      }) satisfies z.ZodType<EntityFormValues>,
    [t],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EntityFormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: initialValues,
  })

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          {error && (
            <Alert color="red" title={t('projectsCategories.error.title')}>
              {error}
            </Alert>
          )}
          <TextInput
            label={t('projectsCategories.form.name')}
            placeholder={t('projectsCategories.form.namePlaceholder')}
            required
            error={errors.name?.message}
            {...register('name')}
          />
          <Textarea
            label={t('projectsCategories.form.description')}
            placeholder={t('projectsCategories.form.descriptionPlaceholder')}
            minRows={3}
            {...register('description')}
          />
          <Group justify="flex-end">
            <Button variant="outline" color="gray" onClick={onClose}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" loading={isSubmitting} style={{ backgroundColor: '#030213' }}>
              {t('common:actions.save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
