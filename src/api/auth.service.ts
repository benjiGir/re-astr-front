import {SignInParams, SignOutOptions, SignUpParams} from "../types/authTypes.ts";
import {authClient} from "../auth/auth-client.ts";

export class AuthService {
    static async signUp(params: SignUpParams) {
        try {
            return await authClient.signUp.email(
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

    static async signIn(params: SignInParams) {
        try {
            return await authClient.signIn.email({
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

    static async signOut(options?: SignOutOptions) {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        if (options?.callbackURL) {
                            window.location.href = options.callbackURL
                        } else {
                            window.location.href = "/loginpage"
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

    static async getSession() {
        try {
            return await authClient.getSession()
        } catch (error) {
            console.error("error get session:", error)
            return null
        }
    }


    static async isAuthenticated(): Promise<boolean> {
        const session = await this.getSession()
        return !!session?.data?.session
    }

}

