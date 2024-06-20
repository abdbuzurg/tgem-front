import fileDownload from "js-file-download"
import { IObject } from "../interfaces/objects"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/object/substation"

export interface ISubstationObjectPaginated {
  objectID: number
  objectDetailedID: number
  name: string
  status: string
  voltageClass: string
  numberOfTransformers: number
  supervisors: string[]
  teams: string[]
}

export interface ISubstationObjectGetAllResponse {
  data: ISubstationObjectPaginated[]
  count: number
  page: number
}

export async function getPaginatedSubstationObjects({ pageParam = 1 }): Promise<ISubstationObjectGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<ISubstationObjectGetAllResponse>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.permission && response.success) { 
    return {...response.data, page: pageParam}
  } else {
    throw new Error(response.error)
  }
}

export interface ISubstationObjectCreate {
  baseInfo: IObject
  detailedInfo: {
    voltageClass: string
    numberOfTransformers: number
  }
  supervisors: number[]
  teams: number[]
}

export async function createSubstationObject(data: ISubstationObjectCreate): Promise<boolean> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<boolean>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function updateSubstationObject(data: ISubstationObjectCreate): Promise<boolean> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<boolean>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function deleteSubstationObject(id: number): Promise<boolean> {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<boolean>>(`${URL}/${id}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function getSubstationTemplateDocument(): Promise<boolean> {
  const response = await axiosClient.get(`${URL}/document/template`, { responseType: "blob" })
  if (response.status == 200) {
    fileDownload(response.data, "Шаблон для импорта объектов - Подстанция.xlsx")
    return true
  } else {
    throw new Error(response.statusText)
  }
}

export async function importSubstation(data: File): Promise<boolean> {
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
