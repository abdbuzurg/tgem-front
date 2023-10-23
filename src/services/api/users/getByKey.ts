import IAPIResposeFormat from "../IAPIResposeFormat"
import axiosClient from "../axiosClient"

export interface UserDataForEdit{
  key: number
  username: string
  permissions: {
    type: string,
    to: string
  }[],
}

export default async function getUserByKey(key: number): Promise<UserDataForEdit> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<UserDataForEdit>>(`/users/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}