import IAPIResposeFormat from "../IAPIResposeFormat"
import axiosClient from "../axiosClient"

export interface UpdateUserData {
  key: number
  username: string
  password: string
  authorization: string[][]
}

export default async function updateUser(data: UpdateUserData): Promise<boolean> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<string>>("/users/with-permissions", data)
  const response = responseRaw.data
  if (response.success) {
    return true
  } else {
    throw new Error(response.error)
  }
}