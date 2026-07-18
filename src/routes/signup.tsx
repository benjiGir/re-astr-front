import {
  Alert,
  Button,
  Container,
  Flex,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconAlertCircle } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useSignUp } from '../auth/auth.queries'

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutate: signUp, isPending, error } = useSignUp()

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email '),
      password: (value) => (value.length < 6 ? 'Password need at least 6 characters ' : null),
      confirmPassword: (value, values) =>
        value === values.password ? null : "Password don't match. ",
      name: (value) => {
        if (!value || value.trim().length === 0) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        if (value.trim().length > 50) return 'Name must be less than 50 characters'
      },
    },
  })

  const handleSubmit = (values: typeof form.values) => {
    signUp({
      email: values.email,
      password: values.password,
      name: values.name,
    })
  }

  return (
    <Container fluid h="100vh" bg="#E6EEFF">
      <Flex h="100%" justify="center" align="center">
        <Paper shadow="sm" bg="white" p="2rem" style={{ borderRadius: '8px' }}>
          <Stack gap="md">
            <Stack gap="xs">
              <Text size="l" fw={500}>
                Création compte Backoffice
              </Text>
              <Text size="sm">Créer un compte pour accéder au système de gestion d'archives</Text>
              <form id="formgroup-legend-id" onSubmit={form.onSubmit(handleSubmit)}>
                {error && (
                  <Alert icon={<IconAlertCircle size={16} />} title="Erreur" color="red">
                    {error.message}
                  </Alert>
                )}
                <Stack gap="md">
                  <TextInput
                    variant="filled"
                    radius="md"
                    label="Name"
                    placeholder="Your name"
                    required
                    {...form.getInputProps('name')}
                  />
                  <TextInput
                    variant="filled"
                    radius="md"
                    label="Email"
                    placeholder="votre@email.com"
                    required
                    {...form.getInputProps('email')}
                  />
                  <PasswordInput
                    variant="filled"
                    radius="md"
                    label="Mot de passe"
                    required
                    {...form.getInputProps('password')}
                    placeholder="••••••••"
                  />
                  <PasswordInput
                    variant="filled"
                    radius="md"
                    label=" Confirmation mot de passe"
                    required
                    {...form.getInputProps('confirmPassword')}
                    placeholder="••••••••"
                  />
                  <Button
                    type="submit"
                    bg={'dark'}
                    radius="md"
                    fullWidth={true}
                    loading={isPending}
                  >
                    Se connecter
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Stack>
        </Paper>
      </Flex>
    </Container>
  )
}
