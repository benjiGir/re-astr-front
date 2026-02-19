import {QueryClient, queryOptions} from "@tanstack/react-query";
import {getSession, signIn,signOut} from "./auth.service.ts";
import {SignInParams, UserInfo} from "../types/authTypes.ts";
import {Data} from "../types/types.ts";


export const userQueryKey = ['user']

export const userQueryOptions = queryOptions({
    queryKey: userQueryKey,
    queryFn: async () => {
        const session = await getSession();
        return session?.data?.user ?? null
    }
});

export const signInMutation = {
    mutationFn: signIn,
    onSuccess: async (response : Data<UserInfo>, _params: SignInParams, ctx: {
        queryClient: QueryClient
    } | undefined) => {
        await ctx?.queryClient?.setQueryData(userQueryKey, response)
    }
};

export const signOutMutation = {
    mutationFn: signOut,
    onSuccess: async (ctx: {
        queryClient: QueryClient
    } | undefined) => ctx?.queryClient?.removeQueries({queryKey: userQueryKey}),
}
