import fileDownload from "js-file-download"
import { IObject } from "../interfaces/objects"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/stvt"

export interface ISTVTObjectPaginated {
  objectID: number
  objectDetailedID: number
  name: string
  status: string
  amountFeeders: number
  voltageClass: string
  ttCoefficient: string
  supervisors: string[]
  teams: string[]
}

export interface ISTVTObjectGetAllResponse {
  data: ISTVTObjectPaginated[]
  count: number
  page: number
}

export async function getPaginatedSTVTObjects({ pageParam = 1 }): Promise<ISTVTObjectGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<ISTVTObjectGetAllResponse>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.permission && response.success) { 
    return {...response.data, page: pageParam}
  } else {
    throw new Error(response.error)
  }
}

export interface ISTVTObjectCreate {
  baseInfo: IObject
  detailedInfo: {
    voltageClass: string
    ttCoefficient: string
  }
  supervisors: number[]
  teams: number[]
}

export async function createSTVTObject(data: ISTVTObjectCreate): Promise<boolean> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<boolean>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function updateSTVTObject(data: ISTVTObjectCreate): Promise<boolean> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<boolean>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function deleteSTVTObject(id: number): Promise<boolean> {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<boolean>>(`${URL}/${id}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function getSTVTTemplateDocument(): Promise<boolean> {
  const response = await axiosClient.get(`${URL}/document/template`, { responseType: "blob" })
  if (response.status == 200) {
    fileDownload(response.data, "Шаблон для импорта объектов - СТВТ.xlsx")
    return true
  } else {
    throw new Error(response.statusText)
  }
}

export async function importSTVT(data: File): Promise<boolean> {
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
