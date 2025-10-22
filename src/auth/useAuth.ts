
import {SignInParams, SignUpParams} from "../types/authTypes.ts";
import {AuthService} from "./auth.service.ts";

export const useAuth = () => {

    const signIn = async (params: SignInParams) => {
        return await AuthService.signIn(params)

    }
    const signUp = async (params: SignUpParams) => {
        return await AuthService.signUp(params)
    }

    const signOut = async (callbackURL?: string) => {
        return await AuthService.signOut({callbackURL})
    }

    return {signIn, signUp, signOut}
}
