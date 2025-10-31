export interface SignUpParams {
    email: string
    password: string
    name: string
    callbackURL?: string
}

export interface SignInParams {
    email: string
    password: string
    callbackURL?: string
}

export interface SignOutOptions {
    callbackURL?: string
}
