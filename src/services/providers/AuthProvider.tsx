import { useState } from "react";
import { AuthContext } from "../context/authContext";
import { UserPermissions } from "../api/auth/permissions";

interface Props {
  children: React.ReactNode
}

export default function AuthProvider({children}: Props) {
  // const location = useLocation()
  const [username, setUsername] = useState("")
  const [permissions, setPermissions] = useState<UserPermissions[]>([])
  
  const hasPermission = (pathname?: string) => {
    return true
  }

  const clearContext = () => {
    setPermissions([])
    setUsername("")
  }

  return (
    <AuthContext.Provider value={{username, permissions, setUsername, setPermissions, hasPermission, clearContext}}>
      {children}
    </AuthContext.Provider>
  )
}