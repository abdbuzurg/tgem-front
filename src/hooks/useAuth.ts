import { useContext, useEffect, useState } from "react";
import { AuthContext, IAuthContext } from "../services/context/authContext";
import { useQuery } from "@tanstack/react-query";
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
    enabled: false,
  }) 

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      setIsLoading(false)
      return
    }

    isAuthenticatedQuery.refetch()

  }, [])

  useEffect(() => {
    if (isAuthenticatedQuery.isSuccess && !isAuthenticatedQuery.data.success) {
      localStorage.removeItem("token")
      localStorage.removeItem("username")
      auth.setPermissions([])
      auth.setUsername("")
      navigate("/login")
    }

    setIsLoading(false)
  },[isAuthenticatedQuery.isSuccess])

  return {isLoading: isLoading, auth: auth}
}
