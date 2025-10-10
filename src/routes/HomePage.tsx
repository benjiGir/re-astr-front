import {AppShell} from "@mantine/core";
import {createFileRoute} from "@tanstack/react-router";


export const Route = createFileRoute('/HomePage')({
    component: HomePage,
})

function HomePage() {
    return <AppShell> </AppShell>
}

