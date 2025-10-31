import {TanStackRouterDevtools} from "@tanstack/react-router-devtools";
import {Outlet} from "@tanstack/react-router";

const PublicLayout = () => {
    return (
        <>
            <Outlet/>
            <TanStackRouterDevtools/>
        </>
    )
}

export default PublicLayout;