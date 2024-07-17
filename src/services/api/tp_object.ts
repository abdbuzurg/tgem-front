import fileDownload from "js-file-download"
import { IObject } from "../interfaces/objects"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/tp"

export interface ITPObjectPaginated {
  objectID: number
  objectDetailedID: number
  name: string
  status: string
  model: string
  voltageClass: string
  nourashes: string
  supervisors: string[]
  teams: string[]
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
    return {...response.data, page: pageParam}
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
  teams: number[]
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

export async function getTPTemplateDocument(): Promise<boolean> {
  const response = await axiosClient.get(`${URL}/document/template`, { responseType: "blob" })
  if (response.status == 200) {
    fileDownload(response.data, "Шаблон для импорта объектов - ТП.xlsx")
    return true
  } else {
    throw new Error(response.statusText)
  }
}

export async function importTP(data: File): Promise<boolean> {
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

export async function getAllTPs(): Promise<IObject[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IObject[]>>(`${URL}/`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
