import { IObject } from "../interfaces/objects"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/object"

export interface ObjectCreateShape {
  id: number,
  name: string,
  objectDetailedID: number,
  status: string,
  type: string, 
  model: string,
  amountStores: number,
  amountEntrances: number,
  hasBasement: boolean,
  voltageClass: string,
  nourashes: string,
  ttCoefficient: string,
  amountFeeders: number,
  length: number,
  supervisors: number[]
}

export async function createObject(data: ObjectCreateShape): Promise<any> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<IObject>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function deleteObject(key: number) {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<boolean>>(`${URL}/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return response.success
  } else {
    throw new Error(response.error)
  }
}

export async function getAllObjects(): Promise<IObject[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IObject[]>>(`${URL}/all`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface IObjectPaginated {
  id: number
  name: string
  type: string
  status: string
  supervisors: string[]
}

export interface IObjectGetAllResponse {
  data: IObjectPaginated[]
  count: number
  page: number
}

export async function getPaginatedObjects({ pageParam = 1 }): Promise<IObjectGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IObjectGetAllResponse>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function updateObject(data: IObject): Promise<IObject> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<IObject>>("{URL}/", data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
