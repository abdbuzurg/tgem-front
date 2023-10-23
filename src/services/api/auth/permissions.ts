import IAPIResposeFormat from "../IAPIResposeFormat";
import { USER_PATH } from "../apiPaths";
import axiosClient from "../axiosClient";

export interface UserPermissions {
  resourceName: string
  resourceAction: string
} 

export default async function getPermissions(): Promise<UserPermissions[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<UserPermissions[]>>(`/${USER_PATH}/permissions`)
  const responseData = responseRaw.data
  if (responseData.success) {
    return responseData.data
  } else {
    throw new Error(responseData.error)
  }
}