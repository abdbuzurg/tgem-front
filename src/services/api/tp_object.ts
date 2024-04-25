import { IObject } from "../interfaces/objects"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/object/tp"

export interface ITPObjectPaginated {
  objectID: number
  objectDetailedID: number
  name: string
  status: string
  model: string
  voltageClass: string
  nourashes: string
  supervisors: string[]
}

export interface ITPObjectGetAllResponse {
  data: ITPObjectPaginated[]
  count: number
  page: number
}

export async function getPaginatedTPObjects({ pageParam = 1 }): Promise<ITPObjectGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<ITPObjectGetAllResponse>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface ITPObjectCreate {
  baseInfo: IObject
  detailedInfo: {
    model: string
    voltageClass: string
    nourashes: string
  }
  supervisors: number[]
}

export async function createTPObject(data: ITPObjectCreate): Promise<boolean> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<boolean>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function updateTPObject(data: ITPObjectCreate): Promise<boolean> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<boolean>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function deleteTPObject(id: number): Promise<boolean> {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<boolean>>(`${URL}/${id}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}
