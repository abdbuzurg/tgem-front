import IUser from "../interfaces/users";
import IAPIResposeFormat from "./IAPIResposeFormat";
import axiosClient from "./axiosClient";
import { ENTRY_LIMIT } from "./constants"

const URL = "/user"

export interface UserView {
  username: string
  workerName: string
  workerMobileNumber: string
  workerJobTitle: string
  roleName: string
}

export interface UserPaginated {
  data: UserView[]
  count: number
  page: number
}

export async function getPaginatedUser({ pageParam = 1}): Promise<UserPaginated> {
  const responseraw = await axiosClient.get<IAPIResposeFormat<UserPaginated>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseraw.data
  if (response.success && response.permission) {
    return {...response.data, page: pageParam}
  } else {
    throw new Error(response.error)
  }
}

export interface NewUserData {
  userData: IUser,
  projects: number[]
}

export async function createUser(data: NewUserData):Promise<boolean> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<boolean>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}
