import { StrictMode, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import '@mantine/core/styles.css';
import {routeTree} from "./routeTree.gen"
import {createRouter, RouterProvider} from "@tanstack/react-router";
import {MantineProvider} from "@mantine/core";
import {QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {queryClient} from "./services/queryClient.ts";
import i18n from './i18n/config'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}


const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <Suspense fallback={<div>Loading...</div>}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider>
              <RouterProvider router={router} />
            </MantineProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </Suspense>
      </I18nextProvider>
    </StrictMode>,
  )
}
