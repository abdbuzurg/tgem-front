import { useContext, useEffect, useState } from "react";
import { AuthContext, IAuthContext } from "../services/context/authContext";
import { useQuery } from "@tanstack/react-query";
import getPermissions, { UserPermissions } from "../services/api/auth/permissions";
import { useNavigate } from "react-router-dom";
import isAuthenticated from "../services/api/auth/isAuthenticated";
import IAPIResposeFormat from "../services/api/IAPIResposeFormat";



export default function useAuth(): {isLoading: boolean, auth:IAuthContext} {
  const auth = useContext(AuthContext)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
 
  const isAuthenticatedQuery = useQuery<IAPIResposeFormat<string>, Error>({
    queryKey: ["is-authenticated"],
    queryFn: isAuthenticated,
    staleTime: 1000 * 3600,
    enabled: false,
  }) 
  

  const permissionQuery = useQuery<UserPermissions[], Error>({
    queryKey: ["permissions"],
    queryFn: () => getPermissions(),
    staleTime: 1000 * 3600,
    enabled: false
  },)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      navigate("/login")
      setIsLoading(false)
      return
    }

    if (isAuthenticatedQuery.isStale) isAuthenticatedQuery.refetch()

    const username = localStorage.getItem("username")
    if (!username) {
      navigate("/login")
      setIsLoading(false)
      return
    } else auth.setUsername(username)

    if (auth.permissions.length == 0) permissionQuery.refetch()
    else setIsLoading(true)
  }, [])

  useEffect(() => {
    if (isAuthenticatedQuery.isSuccess && !isAuthenticatedQuery.data.success) {
      navigate("/login")
      setIsLoading(false)
      localStorage.removeItem("token")
      localStorage.removeItem("username")
      auth.setPermissions([])
      auth.setUsername("")
    }
  },[isAuthenticatedQuery.isSuccess])

  useEffect(() => {
    if (permissionQuery.isSuccess) {
      auth.setPermissions(permissionQuery.data)
      setIsLoading(false)
    }
  }, [permissionQuery.isSuccess])

  return {isLoading: isLoading, auth: auth}
}