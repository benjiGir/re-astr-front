import {create} from 'zustand'
import AuthService from "../auth/auth.service.ts";
import {User} from "../types/types.ts";

interface UserStore {
    user: User | null | undefined;
    isLoading: boolean,
    error: Error | null
    setUser: (user: User | null | undefined) => void
    logout: () => void
}

const useUserStore = create<UserStore>((set) => ({
    user: null,
    isLoading: false,
    error: null,

    fetchUser: async () => {
        set({isLoading: true, error: null});
        try {
            const res = await AuthService.getSession();
            set({user: res?.data?.user, isLoading: false});
        } catch (err) {
            const error = err instanceof Error
                ? err
                : new Error(String(err));
            set({error, isLoading: false});
        }
    },

    setUser: (user: User | null | undefined) => set({user}),

    logout: () => set({user: null, error: null}),
}));

export default useUserStore;