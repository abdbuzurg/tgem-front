import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"

const URL = "/role"

export async function getAllRoles(): Promise<IRole[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IRole[]>>(`${URL}/all`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function createRole(data: IRole):Promise<IRole> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<IRole>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
