import {createFileRoute, redirect} from '@tanstack/react-router'
import authenticatedLayout from "../layouts/AuthenticatedLayout.tsx";
import {userQueryOptions} from "../auth/auth.queries.ts";
import {queryClient} from "../services/queryClient.ts";

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async ({location}) => {
        const user = await queryClient.ensureQueryData(userQueryOptions);
        if (!user) {
            throw redirect({
                to: "/login",
                search: {redirect: location.href}
            })
        }
    },
    component: authenticatedLayout,
})
