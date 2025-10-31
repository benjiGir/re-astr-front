import {createFileRoute, redirect} from '@tanstack/react-router'
import authenticatedLayout from "../layouts/AuthenticatedLayout.tsx";
import {authClient} from "../auth/auth-client.ts";


export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async ({location}) => {
            const session = await authClient.getSession();
            if (!session) {
                throw redirect({
                    to: '/',
                    search: {
                        redirect: location.href,
                    },
                });
            }

        return { session, user: session.data?.user };
    },
    component: authenticatedLayout,
})

