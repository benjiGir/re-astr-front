import {createFileRoute, redirect} from '@tanstack/react-router'
import authenticatedLayout from "../layouts/AuthenticatedLayout.tsx";
import AuthService from "../auth/auth.service.ts";


export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async ({location}) => {
            const session = await AuthService.getSession();
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

