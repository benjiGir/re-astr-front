import { Button, Stack, Text, Title } from '@mantine/core'
import type { ErrorComponentProps } from '@tanstack/react-router'

export function RouterErrorBoundary({ error, reset }: ErrorComponentProps) {
  return (
    <Stack align="center" justify="center" h="100vh" gap="xs">
      <Title order={1}>Une erreur est survenue</Title>
      <Text c="#717182">{error.message}</Text>
      <Button mt="md" style={{ backgroundColor: '#030213' }} onClick={reset}>
        Réessayer
      </Button>
    </Stack>
  )
}
