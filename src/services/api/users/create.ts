import IAPIResposeFormat from "../IAPIResposeFormat"
import axiosClient from "../axiosClient"

export interface CreateUserData {
  username: string
  password: string
  authorization: string[][]
}

export default async function createUser(data: CreateUserData): Promise<boolean> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<string>>("/users/register", data)
  const response = responseRaw.data
  if (response.success) {
    return true
  } else {
    throw new Error(response.error)
  }
}