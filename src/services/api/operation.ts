import { IOperation } from "../interfaces/operation"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/operation"

export interface OperationMutation {
  id: number
  projectID: number
  name: string
  code: string
  costPrime: number
  costWithCustomer: number
  materialID: number
}

export async function createOperation(data: OperationMutation): Promise<IOperation> {
  console.log(data)
  const responseRaw = await axiosClient.post<IAPIResposeFormat<IOperation>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function deleteOperation(key: number) {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<boolean>>(`${URL}/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return response.success
  } else {
    throw new Error(response.error)
  }
}

export async function getAllOperations(): Promise<IOperation[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IOperation[]>>(`${URL}/all`)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface OperationGetAllResponse {
  data: OperationPaginated[]
  count: number
  page: number
}

export interface OperationPaginated {
  id: number
  projectID: number
  name: string
  code: string
  costPrime: number
  costWithCustomer: number
  materialID: number
  materialName: string
}

export interface OperationSearchParameters {
  name: string
  code: string
  materialID: number
}

export async function getPaginatedOperations({pageParam = 1}, searchParameters: OperationSearchParameters): Promise<OperationGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<OperationGetAllResponse>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}&name=${searchParameters.name}&code=${searchParameters.code}&materialID=${searchParameters.materialID}`)
  const responseData = responseRaw.data
  if (responseData.success) {
    return {...responseData.data, page: pageParam}
  } else {
    throw new Error(responseData.error)
  }
}

export async function getOperationByKey(key: number): Promise<IOperation> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IOperation>>(`${URL}/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export default async function updateOperation(data: OperationMutation): Promise<IOperation> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<IOperation>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
