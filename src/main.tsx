import {StrictMode} from 'react'
import ReactDOM from 'react-dom/client'
import '@mantine/core/styles.css';
import {routeTree} from "./routeTree.gen"
import {createRouter, RouterProvider} from "@tanstack/react-router";
import {MantineProvider} from "@mantine/core";


const router = createRouter({routeTree});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <MantineProvider>
                <RouterProvider router={router}/>
            </MantineProvider>
        </StrictMode>,
    )
}