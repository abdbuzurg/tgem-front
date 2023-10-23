import { useContext, useEffect, useState } from "react"
import Input from "../components/UI/Input"
import Button from "../components/UI/button"
import { useMutation, useQuery } from "@tanstack/react-query"
import loginUser from "../services/api/auth/login"
import { useNavigate } from "react-router-dom"
import getPermissions, { UserPermissions } from "../services/api/auth/permissions"
import { AuthContext } from "../services/context/authContext"

export default function Login() {
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)

  useEffect(() => {
    authContext.clearContext()
  }, [])

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  const permissionQuery = useQuery<UserPermissions[], Error>({
    queryKey: ["permissions"],
    queryFn: () => getPermissions(),
    enabled: false,
    staleTime: 1000 * 3600
  })

  const loginMutation = useMutation({ mutationFn: loginUser }) 
  const login = () => {
    loginMutation.mutate(loginData, {
      onSuccess: (data, _, __) => {
        localStorage.setItem("token", data.toString())
        localStorage.setItem("username", loginData.username)
        authContext.setUsername(loginData.username)
        permissionQuery.refetch()
      }
    })
  }

  useEffect(() => {
    if (permissionQuery.isSuccess) {
      authContext.setPermissions(permissionQuery.data)
      navigate("/")
    }
  }, [permissionQuery.data])

  return (
    <div className="h-screen w-screen bg-gray-800">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 flex flex-col items-center justify-evenly">
        <div className="bg-white p-4 rounded text-gray-800">
          <p className="font-bold text-4xl mb-4 text-center">ТГЭМ</p>
          <div className="basis-1 w-[350px]">
            <div className="flex flex-col justify-start mb-4">
              <label className="inline-block font-bold text-l mb-2">Имя пользователя</label>
              <Input
                type="text" 
                name="username"
                value={loginData.username} 
                onChange={(e) => setLoginData({...loginData, [e.target.name]: e.target.value})} 
              />
            </div>
            <div className="flex flex-col justify-start mb-3">
              <label className="inline-block font-bold text-l mb-2">Пароль</label>
              <Input 
                type="password"
                name="password" 
                value={loginData.password} 
                onChange={(e) => setLoginData({...loginData, [e.target.name]: e.target.value})} 
              />
            </div>
            <div className="flex justify-center">
              <Button onClick={login} text="Войти"/>
            </div>
            <span className="flex justify-center">
              {/* {loginMutation.isLoading && <Loading height={40} />}
              {loginMutation.isError && <CustomError message={loginMutation.error.message}/>} */}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}