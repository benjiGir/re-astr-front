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
import { z } from 'zod'
import { useSignUp } from '../auth/auth.queries'
import { SignUpDtoSchema } from '../api/schemas/auth.schema'

// Signup-only concerns layered on top of the SignUpDto contract: `name` is
// required here (the DTO itself allows it to be omitted) and confirmPassword
// only exists to be checked against password, never sent to the API.
const SignupFormSchema = SignUpDtoSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Password don't match.",
  path: ['confirmPassword'],
})

type SignupFormValues = z.infer<typeof SignupFormSchema>

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutate: signUp, isPending, error } = useSignUp()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: standardSchemaResolver(SignupFormSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', name: '' },
  })

  const onSubmit = (values: SignupFormValues) => {
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
                    label="Name"
                    placeholder="Your name"
                    required
                    error={errors.name?.message}
                    {...register('name')}
                  />
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
                    error={errors.password?.message}
                    {...register('password')}
                    placeholder="••••••••"
                  />
                  <PasswordInput
                    variant="filled"
                    radius="md"
                    label=" Confirmation mot de passe"
                    required
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
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
