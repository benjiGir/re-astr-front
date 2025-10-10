import {createFileRoute} from '@tanstack/react-router'
import authenticatedLayout from "../layouts/AuthenticatedLayout.tsx";

export const Route = createFileRoute('/_authenticated')({
    component: authenticatedLayout,
})

