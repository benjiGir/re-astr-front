import {StrictMode} from 'react'
import ReactDOM from 'react-dom/client'
import '@mantine/core/styles.css';
import {routeTree} from "./routeTree.gen"
import {createRouter, RouterProvider} from "@tanstack/react-router";
import {MantineProvider} from "@mantine/core";
import {QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {queryClient} from "./services/queryClient.ts";


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
            <QueryClientProvider client={queryClient}>
                <MantineProvider>
                    <RouterProvider router={router}/>
                    <ReactQueryDevtools initialIsOpen={false}/>
                </MantineProvider>
            </QueryClientProvider>
        </StrictMode>,
    )
}