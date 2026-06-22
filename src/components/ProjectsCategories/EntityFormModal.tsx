import { Button, Group, Modal, Stack, Textarea, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export interface EntityFormValues {
  name: string
  description: string
}

interface EntityFormModalProps {
  opened: boolean
  title: string
  initialValues: EntityFormValues
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (values: EntityFormValues) => void
}

export function EntityFormModal({
  opened,
  title,
  initialValues,
  isSubmitting,
  onClose,
  onSubmit,
}: EntityFormModalProps) {
  const { t } = useTranslation()
  const form = useForm<EntityFormValues>({
    initialValues,
    validate: {
      name: (value) => (value.trim().length === 0 ? t('common:validation.required') : null),
    },
  })

  useEffect(() => {
    if (opened) {
      form.setValues(initialValues)
    }
  }, [opened, initialValues, form.setValues])

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label={t('projectsCategories.form.name')}
            placeholder={t('projectsCategories.form.namePlaceholder')}
            required
            {...form.getInputProps('name')}
          />
          <Textarea
            label={t('projectsCategories.form.description')}
            placeholder={t('projectsCategories.form.descriptionPlaceholder')}
            minRows={3}
            {...form.getInputProps('description')}
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
