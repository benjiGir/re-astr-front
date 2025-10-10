import {AppShell} from "@mantine/core";
import {Link, Outlet} from "@tanstack/react-router";
import {TanStackRouterDevtools} from "@tanstack/react-router-devtools";

const AuthenticatedLayout = () => {
    return (

        <AppShell
            padding="md"
            header={{height: 60}}
            navbar={{width: 200, breakpoint: 'sm', collapsed: {mobile: false}}}
        >

            <AppShell.Header p="md">
                ASTR
            </AppShell.Header>


            <AppShell.Navbar p="md">
                <Link to="/dashboard">DashBoard</Link>
                <Link to="/upload">Upload Archive</Link>
                <Link to="/projects">Projets & Catégories </Link>
                <Link to="/search">Recherche</Link>

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