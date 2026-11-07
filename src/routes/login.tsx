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
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { IconAlertCircle } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useSignIn } from '../auth/auth.queries'
import { type SignInDto, SignInDtoSchema } from '../api/schemas/auth.schema'

interface LoginSearch {
  redirect?: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: Signin,
})

function Signin() {
  const { redirect } = Route.useSearch()
  const { mutate: signIn, isPending, error } = useSignIn(redirect)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInDto>({
    resolver: standardSchemaResolver(SignInDtoSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (values: SignInDto) => {
    signIn(values)
  }

  return (
    <Container fluid h="100vh" bg="#E6EEFF">
      <Flex h="100%" justify="center" align="center">
        <Paper shadow="sm" bg="white" p="2rem" style={{ borderRadius: '8px' }}>
          <Stack gap="md">
            <Stack gap="xs">
              <Text size="l" fw={500}>
                Connexion Backoffice
              </Text>
              <Text size="sm">Connectez-vous pour accéder au système de gestion d'archives</Text>
              <form id="formgroup-legend-id" noValidate onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <Alert icon={<IconAlertCircle size={16} />} title="Erreur" color="red">
                    {error.message}
                  </Alert>
                )}
                <Stack gap="md">
                  <TextInput
                    variant="filled"
                    radius="md"
                    label="Email"
                    placeholder="votre@email.com"
                    required
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <PasswordInput
                    variant="filled"
                    radius="md"
                    label="Mot de passe"
                    required
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password')}
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
