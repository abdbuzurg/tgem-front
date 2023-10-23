import { createContext } from "react";
import { UserPermissions } from "../api/auth/permissions";

export interface IAuthContext {
  username: string
  permissions: UserPermissions[]
  setUsername: (username: string) => void
  setPermissions: (permissions: UserPermissions[]) => void
  hasPermission: (pathname?: string) => boolean
  clearContext: () => void 
}

export const AuthContext = createContext<IAuthContext>({
  permissions: [],
  setPermissions: (permissions: UserPermissions[]) => {},
  username: "",
  setUsername: (username: string) => {},
  hasPermission: (pathname?: string) => false,
  clearContext: () => {}
})