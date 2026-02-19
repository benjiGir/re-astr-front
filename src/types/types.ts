export type User = {
    id: string
    email: string
    name: string
    image: string | null | undefined
    emailVerified: boolean
    createdAt: string | Date
    updatedAt: string | Date
}

export type Data<T> = {
    data: T,
    code: number,
    message?: string
}

