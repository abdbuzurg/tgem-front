import { Outlet, useNavigate } from "react-router-dom";
import Button from "./UI/button";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast/headless";
import { LOGIN } from "../URLs";

export function AdminLayout() {

  const navigate = useNavigate();

  const logout = () => {
    const loadingToast = toast.loading("Выход.....");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    toast.dismiss(loadingToast);
    toast.success("Операция успешна");
    navigate(LOGIN);
  };

  return (
    <>
      <nav className="relative flex md:flex-row w-full justify-normal md:justify-between md:items-center bg-gray-800 px-3 py-2 shadow-lg text-gray-400">
        <div className="w-full flex items-center md:w-auto justify-between md:justify-normal space-x-4 font-medium ">
          <p className="text-4xl font-bold">ТГЭМ</p>
          <Button onClick={logout} text="Выход" />
        </div>
      </nav>
      <Toaster />
      <Outlet />
    </>
  )
}
