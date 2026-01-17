import { AppShell, Burger, Group, NavLink, ScrollArea, Text, UnstyledButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconArchive,
  IconCategory,
  IconDashboard,
  IconLogout,
  IconSearch,
  IconUpload,
} from '@tabler/icons-react'
import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import useUserStore from '../stores/userStore.tsx'
import {useSignOut} from "../auth/hooks.ts";


const AuthenticatedLayout = () => {
    const routerState = useRouterState()
    const currentPath = routerState.location.pathname
    const {mutate: signOut, isPending} = useSignOut()
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()

  return (
    <AppShell
      padding="md"
      header={{ height: 64 }}
      navbar={{
        width: 256,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Group gap={8}>
            <IconArchive size={24} />
            <Text fw={600} size="md">
              Système de Gestion d'Archives
            </Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar bg="#fafafa">
        {/* Navbar Header */}
        <AppShell.Section p="md">
          <Group gap={8}>
            <IconArchive size={24} />
            <Text fw={600} size="md">
              Archive Manager
            </Text>
          </Group>
        </AppShell.Section>

        {/* Navbar Main Section (scrollable) */}
        <AppShell.Section grow component={ScrollArea} px="xs">
          <NavLink
            component={Link}
            label="Dashboard"
            to="/dashboard"
            leftSection={<IconDashboard size={16} />}
            active={currentPath === '/dashboard'}
            styles={(theme) => ({
              root: {
                borderRadius: theme.radius.md,
                color: currentPath === '/dashboard' ? '#fff' : '#0a0a0a',
                backgroundColor: currentPath === '/dashboard' ? '#030213' : 'transparent',
                '&:hover': {
                  backgroundColor: currentPath === '/dashboard' ? '#030213' : theme.colors.gray[1],
                },
              },
              label: {
                fontSize: '13.7px',
              },
            })}
          />
          <NavLink
            component={Link}
            label="Upload Archive"
            to="/upload"
            leftSection={<IconUpload size={16} />}
            active={currentPath === '/upload'}
            styles={(theme) => ({
              root: {
                borderRadius: theme.radius.md,
                color: currentPath === '/upload' ? '#fff' : '#0a0a0a',
                backgroundColor: currentPath === '/upload' ? '#030213' : 'transparent',
                '&:hover': {
                  backgroundColor: currentPath === '/upload' ? '#030213' : theme.colors.gray[1],
                },
              },
              label: {
                fontSize: '13.7px',
              },
            })}
          />
          <NavLink
            component={Link}
            label="Projets & Catégories"
            to="/projects"
            leftSection={<IconCategory size={16} />}
            active={currentPath === '/projects'}
            styles={(theme) => ({
              root: {
                borderRadius: theme.radius.md,
                color: currentPath === '/projects' ? '#fff' : '#0a0a0a',
                backgroundColor: currentPath === '/projects' ? '#030213' : 'transparent',
                '&:hover': {
                  backgroundColor: currentPath === '/projects' ? '#030213' : theme.colors.gray[1],
                },
              },
              label: {
                fontSize: '13.7px',
              },
            })}
          />
          <NavLink
            component={Link}
            label="Recherche"
            to="/search"
            leftSection={<IconSearch size={16} />}
            active={currentPath === '/search'}
            styles={(theme) => ({
              root: {
                borderRadius: theme.radius.md,
                color: currentPath === '/search' ? '#fff' : '#0a0a0a',
                backgroundColor: currentPath === '/search' ? '#030213' : 'transparent',
                '&:hover': {
                  backgroundColor: currentPath === '/search' ? '#030213' : theme.colors.gray[1],
                },
              },
              label: {
                fontSize: '13.7px',
              },
            })}
          />
        </AppShell.Section>

        {/* Navbar Footer */}
        <AppShell.Section p="md">
          <UnstyledButton
            onClick={() => {
              signOut().then(() => logout())
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#0a0a0a',
              fontSize: '13.7px',
              fontWeight: 500,
              transition: 'background-color 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e9ecef'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <IconLogout size={16} />
            <span>Déconnexion</span>
          </UnstyledButton>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
        <TanStackRouterDevtools />
      </AppShell.Main>
    </AppShell>
  )
}

export default AuthenticatedLayout
