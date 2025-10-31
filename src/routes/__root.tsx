import {createRootRoute} from '@tanstack/react-router'
import PublicLayout from "../layouts/PublicLayout.tsx";



export const Route = createRootRoute(
    {component: PublicLayout})