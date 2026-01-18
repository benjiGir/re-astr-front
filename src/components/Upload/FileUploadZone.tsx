import { Group, rem, Text } from '@mantine/core'
import { Dropzone, type FileWithPath } from '@mantine/dropzone'
import { IconUpload, IconX } from '@tabler/icons-react'

interface FileUploadZoneProps {
  onDrop: (files: FileWithPath[]) => void
  maxSize?: number
  accept?: string[]
}

export function FileUploadZone({ onDrop, maxSize = 30 * 1024 ** 2, accept }: FileUploadZoneProps) {
  return (
    <Dropzone
      onDrop={onDrop}
      maxSize={maxSize}
      accept={accept}
      style={{
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderStyle: 'dashed',
        borderWidth: '2px',
        borderRadius: '10px',
        padding: '48px 24px',
        backgroundColor: '#fafafa',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
    >
      <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <IconUpload
            style={{
              width: rem(52),
              height: rem(52),
              color: 'var(--mantine-color-blue-6)',
            }}
            stroke={1.5}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            style={{
              width: rem(52),
              height: rem(52),
              color: 'var(--mantine-color-red-6)',
            }}
            stroke={1.5}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconUpload
            style={{
              width: rem(48),
              height: rem(48),
              color: '#717182',
            }}
            stroke={1.5}
          />
        </Dropzone.Idle>

        <div>
          <Text size="lg" inline c="#0a0a0a">
            Cliquez pour sélectionner des fichiers ou glissez-déposez
          </Text>
          <Text size="sm" c="#717182" inline mt={7}>
            Taille maximale : {(maxSize / 1024 / 1024).toFixed(0)} MB par fichier
          </Text>
        </div>
      </Group>
    </Dropzone>
  )
}
