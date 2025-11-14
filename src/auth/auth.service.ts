import {SignInParams, SignOutOptions, SignUpParams} from "../types/authTypes.ts";
import {authClient} from "./auth-client.ts";



export const signUp= async(params: SignUpParams)=> {
        try {
            return authClient.signUp.email(
                {
                    email: params.email,
                    password: params.password,
                    name: params.name,
                },
                {
                    onSuccess: () => {
                        if (params.callbackURL) {
                            window.location.href = params.callbackURL
                        }
                    },
                    onError: (ctx) => {
                        throw new Error(ctx.error.message || "Error during signUp")
                    }
                }
            )

        } catch (error) {
            console.error("error sign up:", error)
            throw error
        }
    }

export const signIn= async(params: SignInParams)=> {

        try {
            return authClient.signIn.email({
                email: params.email,
                password: params.password,
            }, {
                onSuccess: () => {
                    if (params.callbackURL) {
                        window.location.href = params.callbackURL
                    }

                },
                onError: (ctx) => {
                    throw new Error(ctx.error.message || "Error during signIn")
                }
            })

        } catch (err) {
            console.error("Error sign in ", err);
            throw err;
        }
    }

export const signOut = async(options?: SignOutOptions)=> {
        try {
            return  authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        if (options?.callbackURL) {
                            window.location.href = options.callbackURL
                        } else {
                            window.location.href = "/login"
                        }
                    },
                    onError: (ctx) => {
                        console.error("error during signOut:", ctx.error)
                    }
                }
            })

        } catch (error) {
            console.error("error sign out:", error)
            throw error
        }
    }

export const  getSession= async ()=> {
        try {
           return  authClient.getSession()


        } catch (error) {
            console.error("error get session:", error)
            return null
        }
    }


export const  isAuthenticated= async(): Promise<boolean> =>{
        const session = await getSession()
        return !!session?.data?.session
    }





