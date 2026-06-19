import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const PublicLayout = () => {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}

export default PublicLayout
