import {createFileRoute} from '@tanstack/react-router'
import {useCurrentUser} from "../../auth/hooks.ts";

export const Route = createFileRoute('/_authenticated/dashboard')({
    component: RouteComponent,
})

function RouteComponent() {
    const {user} = useCurrentUser()

    return <div>Hello "/dashboard" {user?.name}!</div>
}

