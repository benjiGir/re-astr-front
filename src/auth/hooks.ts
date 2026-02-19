import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {signInMutation, signOutMutation, userQueryOptions} from "./auth.queries.ts";
import {useNavigate} from "@tanstack/react-router";

export const useCurrentUser = () => {
    const {data, ...rest} = useQuery(userQueryOptions);
    return {user: data, ...rest}
}

export const useSignIn = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        ...signInMutation,
        onSuccess: (response, vars) => {
            const user = response?.data?.user ;
            signInMutation.onSuccess?.(user, vars, {queryClient});
            navigate({to: '/dashboard'});
        }
    })
}

export const useSignOut = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation({
        ...signOutMutation,
        onSuccess: () => {
            signOutMutation.onSuccess?.({queryClient});
            navigate({to: '/login'});
        },
    });
};
