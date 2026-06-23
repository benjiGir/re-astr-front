import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

interface ConfirmDeleteModalProps {
  opened: boolean
  message: string
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDeleteModal({
  opened,
  message,
  isDeleting,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation()

  return (
    <Modal opened={opened} onClose={onCancel} title={t('projectsCategories.deleteConfirmTitle')}>
      <Stack gap="md">
        <Text>{message}</Text>
        <Group justify="flex-end">
          <Button variant="outline" color="gray" onClick={onCancel}>
            {t('common:actions.cancel')}
          </Button>
          <Button color="red" loading={isDeleting} onClick={onConfirm}>
            {t('common:actions.delete')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
