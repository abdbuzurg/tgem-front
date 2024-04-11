import { Permission } from "../interfaces/permission";
import IAPIResposeFormat from "./IAPIResposeFormat";
import axiosClient from "./axiosClient";

const URL = "/permission"

export async function getPermissionsByRole(roleID: number):Promise<Permission[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<Permission[]>>(`${URL}/role/${roleID}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getPermissionsByRoleName(roleName: string):Promise<Permission[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<Permission[]>>(`${URL}/role/name/${roleName}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function createPermissions(data: Permission[]): Promise<boolean> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<boolean>>(`${URL}/batch`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function getPermissionByResourceURL(resourceURL: string): Promise<boolean> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<boolean>>(`${URL}/role/url/${resourceURL}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
