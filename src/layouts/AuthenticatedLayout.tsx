import {AppShell, NavLink, Stack} from "@mantine/core";
import {Link, Outlet, useRouterState} from "@tanstack/react-router";
import {TanStackRouterDevtools} from "@tanstack/react-router-devtools";
import {IconBuildingStore, IconCategory, IconDashboard, IconSearch, IconUpload} from "@tabler/icons-react";

const AuthenticatedLayout = () => {
    const routerState = useRouterState()
    const currentPath = routerState.location.pathname

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
                    <Link to="/dashboard" style={{textDecoration: 'none', color: 'black'}}>
                        <NavLink
                            label="Dashboard"
                            leftSection={<IconDashboard size={20}/>}
                            active={currentPath === '/dashboard'}
                        />
                    </Link>
                </Stack>
                <Stack gap="xs">
                    <Link to="/upload" style={{textDecoration: 'none', color: 'black'}}>
                        <NavLink
                            label="Upload"
                            leftSection={<IconUpload size={20}/>}
                            active={currentPath === '/upload'}
                        />
                    </Link>
                </Stack>
                <Stack gap="xs">
                    <Link to="/projects" style={{textDecoration: 'none', color: 'black'}}>
                        <NavLink
                            label="Projets & Catégories"
                            leftSection={<IconCategory size={20}/>}
                            active={currentPath === '/projects'}
                        />
                    </Link>

                </Stack>
                <Stack gap="xs">
                    <Link to="/search" style={{textDecoration: 'none', color: 'black'}}>
                        <NavLink
                            label="Recherche"
                            leftSection={<IconSearch size={20}/>}
                            active={currentPath === '/search'}
                        />
                    </Link>

                </Stack>

                {/*{user && (*/}
                {/*    <Button mt="md" color="red" onClick={logout}>*/}
                {/*        Déconnexion*/}
                {/*    </Button>*/}
                {/*)}*/}
            </AppShell.Navbar>


            <AppShell.Main>
                <Outlet/>
                <TanStackRouterDevtools/>
            </AppShell.Main>
        </AppShell>
    )
}

export default AuthenticatedLayout;