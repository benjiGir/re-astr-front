import {Button, Container, Flex, Paper, PasswordInput, Stack, Text, TextInput} from "@mantine/core";
import {createFileRoute} from "@tanstack/react-router";

export const Route = createFileRoute('/loginpage')({
    component: loginpage,
})

function loginpage() {
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
                        <form id="formgroup-legend-id">
                            <Stack gap='md'>
                                <TextInput variant="filled" radius="md" label="Email" placeholder="Email"/>
                                <PasswordInput variant="filled" radius="md" label="Mot de passe"
                                               placeholder="••••••••"/>
                                <Button type="submit" bg={"dark"} radius="md" fullWidth={true}>
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


