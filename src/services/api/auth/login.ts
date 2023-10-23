import IAPIResposeFormat from "../IAPIResposeFormat"
import { USER_PATH } from "../apiPaths"
import axiosClient from "../axiosClient"

export interface LoginRequestData{
  username: string
  password: string
}

export interface LoginResponseData {
  token: string
}

export default async function loginUser(data: LoginRequestData): Promise<LoginResponseData> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<LoginResponseData>>(`/${USER_PATH}/login`, data)
  const responseData = responseRaw.data
  if (responseData.success) {
    return responseData.data
  } else {
    throw new Error(responseData.error)
  }
}