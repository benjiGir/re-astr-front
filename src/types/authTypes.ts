import {User} from "./types.ts";

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

export type SignInResponse = {
    redirect: boolean;
    token: string;
    url: string | undefined;
    user: User;
}

export interface UserInfo {
    token:string;
    user: User
}
