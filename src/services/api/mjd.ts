import { IObject } from "../interfaces/objects"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/object/mjd"

export interface IMJDObjectPaginated {
  objectID: number
  objectDetailedID: number
  name: string
  status: string
  model: string
  amountStores: number
  amountEntrances: number
  hasBasement: boolean
  supervisors: string[]
}

export interface IMJDObjectGetAllResponse {
  data: IMJDObjectPaginated[]
  count: number
  page: number
}

export async function getPaginatedMJDObjects({ pageParam = 1 }): Promise<IMJDObjectGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IMJDObjectGetAllResponse>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface IMJDObjectCreate {
  baseInfo: IObject
  detailedInfo: {
    model: string
    amountStores: number
    amountEntrances: number
    hasBasement: boolean,
  }
  supervisors: number[]
}

export async function createMJDObject(data: IMJDObjectCreate): Promise<boolean> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<boolean>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function updateMJDObject(data: IMJDObjectCreate): Promise<boolean> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<boolean>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function deleteMJDObject(id: number): Promise<boolean> {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<boolean>>(`${URL}/${id}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}
