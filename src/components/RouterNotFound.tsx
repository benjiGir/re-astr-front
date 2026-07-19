import { Button, Stack, Text, Title } from '@mantine/core'
import { Link } from '@tanstack/react-router'

export function RouterNotFound() {
  return (
    <Stack align="center" justify="center" h="100vh" gap="xs">
      <Title order={1}>404</Title>
      <Text c="#717182">Cette page n'existe pas.</Text>
      <Button component={Link} to="/" mt="md" style={{ backgroundColor: '#030213' }}>
        Retour à l'accueil
      </Button>
    </Stack>
  )
}
