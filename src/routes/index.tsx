import {Alert, Button, Container, Flex, Paper, PasswordInput, Stack, Text, TextInput} from "@mantine/core";
import {useForm} from '@mantine/form'
import {createFileRoute, redirect} from "@tanstack/react-router";
import {useAuth} from "../auth/useAuth.ts";
import {useState} from "react";
import {IconAlertCircle} from "@tabler/icons-react";
import {authClient} from "../auth/auth-client.ts";


export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        const session = await authClient.getSession();
        if (session) {
            throw redirect({
                to: '/dashboard',
            })
        }
    },
    component: Signin,
})

function Signin() {
    const {signIn} = useAuth()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        },
        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email '),
            password: (value) => (value.length < 6 ? 'Password need at least 6 characters ' : null),
        },
    })

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true)
        setError('')

        try {
            await signIn({
                email: values.email,
                password: values.password,
                callbackURL: '/dashboard',
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'error signIn')
        } finally {
            setLoading(false)
        }
    }

    return <Container fluid h="100vh" bg="#E6EEFF">
        <Flex
            h="100%"
            justify="center"
            align="center"
        >
            <Paper shadow="sm" bg="white" p="2rem" style={{borderRadius: "8px"}}>
                <Stack gap="md">
                    <Stack gap="xs">
                        <Text size="l" fw={500}>Connexion Backoffice</Text>
                        <Text size="sm">Connectez-vous pour accéder au système de gestion d'archives</Text>
                        <form id="formgroup-legend-id" onSubmit={form.onSubmit(handleSubmit)}>
                            {error && (
                                <Alert icon={<IconAlertCircle size={16}/>} title="Erreur" color="red">
                                    {error}
                                </Alert>
                            )}
                            <Stack gap='md'>
                                <TextInput
                                    variant="filled" radius="md"
                                    label="Email"
                                    placeholder="votre@email.com"
                                    required
                                    {...form.getInputProps('email')}
                                />
                                <PasswordInput variant="filled" radius="md" label="Mot de passe"
                                               required
                                               {...form.getInputProps('password')}
                                               placeholder="••••••••"/>
                                <Button type="submit" bg={"dark"} radius="md" fullWidth={true} loading={loading}>
                                    Se connecter
                                </Button>
                            </Stack>
                        </form>
                    </Stack>
                </Stack>
            </Paper>
        </Flex>
    </Container>
}


