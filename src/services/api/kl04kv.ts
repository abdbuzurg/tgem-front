import fileDownload from "js-file-download"
import { IObject } from "../interfaces/objects"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/object/kl04kv"

export interface IKL04KVObjectPaginated {
  objectID: number
  objectDetailedID: number
  name: string
  status: string
  length: number
  nourashes: string
  supervisors: string[]
  teams: string[]
}

export interface IKL04KVObjectGetAllResponse {
  data: IKL04KVObjectPaginated[]
  count: number
  page: number
}

export async function getPaginatedKL04KVObjects({ pageParam = 1 }): Promise<IKL04KVObjectGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IKL04KVObjectGetAllResponse>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return {...response.data, page: pageParam}
  } else {
    throw new Error(response.error)
  }
}

export interface IKL04KVObjectCreate {
  baseInfo: IObject
  detailedInfo: {
    length: number
    nourashes: string
  }
  supervisors: number[]
  teams: number[]
}

export async function createKL04KVObject(data: IKL04KVObjectCreate): Promise<boolean> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<boolean>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function updateKL04KVObject(data: IKL04KVObjectCreate): Promise<boolean> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<boolean>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function deleteKL04KVObject(id: number): Promise<boolean> {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<boolean>>(`${URL}/${id}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function getKL04KVTemplateDocument(): Promise<boolean> {
  const response = await axiosClient.get(`${URL}/document/template`, { responseType: "blob" })
  if (response.status == 200) {
    fileDownload(response.data, "Шаблон для импорта объектов - КЛ 04 КВ.xlsx")
    return true
  } else {
    throw new Error(response.statusText)
  }
}

export async function importKL04KV(data: File): Promise<boolean> {
  const formData = new FormData()
  formData.append("file", data)
  const responseRaw = await axiosClient.post(`${URL}/document/import`, formData, {
    headers: {
      "Content-Type": `multipart/form-data; boundary=WebAppBoundary`,
    }
  })
  if (responseRaw.status == 200) {
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}