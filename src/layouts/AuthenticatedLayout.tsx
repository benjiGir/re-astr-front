import {AppShell, Button, NavLink, Stack} from "@mantine/core";
import {Link, Outlet, useRouterState} from "@tanstack/react-router";
import {TanStackRouterDevtools} from "@tanstack/react-router-devtools";
import {IconBuildingStore, IconCategory, IconDashboard, IconSearch, IconUpload} from "@tabler/icons-react";
import useUserStore from "../stores/userStore.tsx";
import AuthService from "../auth/auth.service.ts";

const AuthenticatedLayout = () => {
    const routerState = useRouterState()
    const currentPath = routerState.location.pathname
    const {logout} = useUserStore()

    return (
        <AppShell
            padding="md"
            header={{height: 60}}
            navbar={{width: 200, breakpoint: 'sm', collapsed: {mobile: false}}}
        >

            <AppShell.Header p="md" fw={500} style={{
                display: 'flex',
                alignItems: "center",
                justifyContent: "flex-start",
                gap: '0.5rem'
            }}>
                <IconBuildingStore/> Archive Manager
            </AppShell.Header>


            <AppShell.Navbar p="md">
                <Stack gap="xs">
                    <NavLink
                        component={Link}
                        label="Dashboard"
                        to="/dashboard"
                        leftSection={<IconDashboard size={20}/>}
                        active={currentPath === '/dashboard'}
                    />

                </Stack>
                <Stack gap="xs">
                    <NavLink
                        component={Link}
                        label="Upload"
                        to="/upload"
                        leftSection={<IconUpload size={20}/>}
                        active={currentPath === '/upload'}
                    />
                </Stack>
                <Stack gap="xs">
                    <NavLink
                        component={Link}
                        label="Projets & Catégories"
                        to="/projects"
                        leftSection={<IconCategory size={20}/>}
                        active={currentPath === '/projects'}
                    />
                </Stack>
                <Stack gap="xs">
                    <NavLink
                        component={Link}
                        label="Recherche"
                        to="/search"
                        leftSection={<IconSearch size={20}/>}
                        active={currentPath === '/search'}
                    />
                </Stack>

                <Button mt="md" color="red" onClick={() => {
                    AuthService.signOut().then(() => logout())
                }}>
                    Déconnexion
                </Button>

            </AppShell.Navbar>


            <AppShell.Main>
                <Outlet/>
                <TanStackRouterDevtools/>
            </AppShell.Main>
        </AppShell>
    )
}

export default AuthenticatedLayout;