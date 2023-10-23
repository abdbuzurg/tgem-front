import { Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LoadingDots from "./UI/loadingDots";
import Button from "./UI/button";


export default function Layout() {  
  const navigate = useNavigate()
  const {isLoading, auth} = useAuth()

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    navigate(0)
  }

  if (isLoading)
    return( 
      <div className="w-screen h-screen text-center">
        <LoadingDots height={120} width={120}/>
      </div>
    )
  else 
    return ( 
      <>
        <nav className="relative flex w-full justify-normal items-center  bg-gray-800 px-3 py-2 shadow-lg text-gray-400">
          <div className="items-center justify-between w-full">
            <ul className="flex p-0 font-medium space-x-8 items-center">
              <li>
                <Link to="/" className="block text-white bg-transparent p-0 hover:text-gray-400">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/export" className="bloc text-white bg-transparent p-0 hover:text-gray-400">
                  Экспорт
                </Link>
              </li>
              {auth.username == "superadmin" && 
                <li>
                  <Link to="/users" className="block text-white bg-transparent p-0 hover:text-gray-400">
                    Пользователи
                  </Link>
                </li>
              }
              {auth.username == "superadmin" && 
                <li>
                  <Link to="/reference-books" className="block text-white bg-transparent p-0 hover:text-gray-400">
                    Справочник
                  </Link>
                </li>
              }
            </ul>
          </div>
          <div className="flex items-center space-x-4 font-medium">
            <Button onClick={logout}  text="Выход"/> 
            <p className="text-4xl font-bold">ТГЭМ</p>
          </div>
        </nav>
        {auth.hasPermission() 
          ? <Outlet /> 
          : <Navigate to="/permission-denied" />
        }
      </>
    )
}