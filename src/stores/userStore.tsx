// import {create} from 'zustand'
// import {User} from "../types/types.ts";
// import {persist} from "zustand/middleware";
//
// interface UserStore {
//     user: User | null;
//     isAuthenticated: boolean
//     setUser: (user: User | null) => void
//     logout: () => void
// }
//
// const useUserStore = create<UserStore>()(
//
//         persist(
//         (set) => ({
//             user: null,
//             isAuthenticated: false,
//
//             setUser: (user: User | null | undefined) => set({user, isAuthenticated: !!user}),
//
//             logout: () => set({user: null, isAuthenticated: false}),
//         }), {
//             name: 'user-storage',
//         }))
//
// export default useUserStore;