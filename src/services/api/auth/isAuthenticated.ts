import IAPIResposeFormat from "../IAPIResposeFormat"
import { USER_PATH } from "../apiPaths"
import axiosClient from "../axiosClient"

export default async function isAuthenticated(): Promise<IAPIResposeFormat<string>> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string>>(`/${USER_PATH}/is-authenticated`)
  const responseData = responseRaw.data
  return responseData
}