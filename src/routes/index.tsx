import {createFileRoute, redirect} from '@tanstack/react-router'
import AuthService from "../auth/auth.service.ts";


export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        const session = await AuthService.getSession();

        throw redirect({
            to: session?.data ? '/dashboard' : '/login'
        });
    },

})


