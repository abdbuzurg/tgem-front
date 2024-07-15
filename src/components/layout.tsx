import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Button from "./UI/button";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPermissionByResourceURL } from "../services/api/permission";
import {  HOME, LOGIN, PERMISSION_DENIED, REFERENCE_BOOK, REPORT } from "../URLs";
import LoadingDots from "./UI/loadingDots";

export default function Layout() {

  const navigate = useNavigate();
  const location = useLocation();

  const [resourceURL, setResourceURL] = useState("");

  const hasAccessQuery = useQuery<boolean, Error, string>({
    queryKey: [`permission-to-resource-${resourceURL}`, resourceURL],
    queryFn: () => getPermissionByResourceURL(resourceURL),
    enabled: resourceURL !== "",
  });

  useEffect(() => {

    const splitPathName = location.pathname.split("/");
    const neededResource = splitPathName[splitPathName.length - 1];

    setResourceURL(neededResource != "" ? neededResource : "ignore")

  }, [location]);

  useEffect(() => {

    if (hasAccessQuery.isSuccess && !hasAccessQuery.data) {

      navigate(PERMISSION_DENIED);

    }

  }, [hasAccessQuery.data]);

  const logout = () => {
      const loadingToast = toast.loading("Выход.....");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      toast.dismiss(loadingToast);
      toast.success("Операция успешна");
      navigate(LOGIN);
  };

  if (hasAccessQuery.isLoading && resourceURL !== "")
    return (
      <div className="w-screen h-screen text-center">
        <LoadingDots height={120} width={120} />
      </div>
    )
  else
  return (
    <>
      <nav className="relative flex md:flex-row w-full justify-normal md:justify-between md:items-center bg-gray-800 px-3 py-2 shadow-lg text-gray-400">
        <div className="hidden md:block md:items-center md:justify-between md:w-full">
          <ul className="flex p-0 font-medium space-x-8 items-center">
            <li>
              <Link to={`${HOME}`} className="block text-white bg-transparent p-0 hover:text-gray-400">
                Главная
              </Link>
            </li>
            <li>
              <Link to={`${REPORT}`} className="block text-white bg-transparent p-0 hover:text-gray-400">
                Отчет
              </Link>
            </li>
            <li>
              <Link to={`${REFERENCE_BOOK}`} className="block text-white bg-transparent p-0 hover:text-gray-400">
                Справочник
              </Link>
            </li>
          </ul>
        </div>
        <div className="w-full flex items-center md:w-auto justify-between md:justify-normal space-x-4 font-medium ">
          <p className="text-4xl font-bold">ТГЭМ</p>
          <Button onClick={logout} text="Выход" />
        </div>
      </nav>
      <Toaster />
      <Outlet />
    </>
  );
}

